import Comment from '../models/Comment.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Simple built-in profanity + threat filter (no package needed) ─────────
const PROFANITY_LIST = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
    'piss', 'cock', 'pussy', 'faggot', 'nigger', 'nigga', 'whore',
    'slut', 'retard', 'motherfucker', 'fucker', 'damn', 'crap',
];

// Common violent / harmful phrases that AI models often treat as casual speech
const THREAT_PATTERNS = [
    /\bkill\s+you\b/i,
    /\bkill\s+your(self|selves)?\b/i,
    /\bi('ll|[ ]+will|[ ]+am going to|[ ]+gonna)\s+(kill|murder|hurt|stab|shoot|destroy|beat)\b/i,
    /\byou\s+should\s+(die|kill yourself|hurt yourself)\b/i,
    /\bgo\s+die\b/i,
    /\bkys\b/i,
    /\bslit\s+your\b/i,
    /\bhang\s+your(self)?\b/i,
    /\bkill\s+(myself|himself|herself|themselves)\b/i,
    /\bwant\s+to\s+(kill|murder|hurt|harm)\b/i,
];

const normaliseLeet = (text) =>
    text.toLowerCase()
        .replace(/@/g, 'a').replace(/3/g, 'e').replace(/1/g, 'i')
        .replace(/0/g, 'o').replace(/\$/g, 's').replace(/5/g, 's')
        .replace(/\+/g, 't').replace(/[^a-z\s]/g, '');

const isLocallyFlagged = (text) => {
    // Check threat patterns on original text (keep punctuation for regex accuracy)
    if (THREAT_PATTERNS.some(re => re.test(text))) return true;
    // Check profanity on normalised text
    const cleaned = normaliseLeet(text);
    return PROFANITY_LIST.some(word => new RegExp(`\\b${word}\\b`, 'i').test(cleaned));
};

// ── Gemini AI Moderation (lazy-init) ─────────────────────────────────────
let _gemini = null;
const getGemini = () => {
    if (_gemini) return _gemini;
    const key = process.env.GEMINI_API_KEY;
    if (key && !key.startsWith('your-gemini')) {
        const genAI = new GoogleGenerativeAI(key);
        _gemini = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('[Moderation] ✅ Gemini client initialised');
    } else {
        console.log('[Moderation] ⚠️  No valid GEMINI_API_KEY found');
    }
    return _gemini;
};

// ── Main moderation function ───────────────────────────────────────────────
const moderateContent = async (text) => {
    // 1. Local word list (instant, zero API calls)
    if (isLocallyFlagged(text)) {
        console.log('[Moderation] Local filter flagged comment');
        return { flagged: true, categories: 'profanity / offensive language' };
    }

    // 2. Gemini AI (hate speech, harassment, threats, etc.)
    const model = getGemini();
    if (!model) return { flagged: false };

    try {
        console.log('[Moderation] Calling Gemini API...');
        const prompt = `You are a strict content safety moderator for a social media platform. Your job is to flag harmful comments.

Flag the comment as harmful (flagged: true) if it contains ANY of the following:
- Direct threats of violence: e.g. "I want to kill you", "I will hurt you", "I'll murder you"
- Encouragement of self-harm or suicide: e.g. "kill yourself", "you should die"
- Hate speech targeting race, religion, gender, sexuality, disability
- Sexual harassment or explicit sexual content directed at someone
- Severe bullying or personal attacks meant to cause emotional harm

Respond with ONLY valid JSON, no explanation, no markdown:
{"flagged": true, "reason": "brief reason"}
or
{"flagged": false, "reason": ""}

Comment to analyse: "${text}"`;

        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();
        console.log('[Moderation] Gemini raw response:', raw);

        const jsonMatch = raw.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
            console.error('[Moderation] Could not parse Gemini response');
            return { flagged: false };
        }

        const parsed = JSON.parse(jsonMatch[0]);
        console.log('[Moderation] Gemini flagged:', parsed.flagged, '| reason:', parsed.reason);
        if (parsed.flagged) {
            return { flagged: true, categories: parsed.reason || 'harmful content' };
        }
        return { flagged: false };
    } catch (err) {
        console.error('[Moderation] Gemini error:', err.message);
        return { flagged: false };
    }
};

// GET /api/post/moderation-test  ← DEBUG endpoint (remove in production)
export const testModeration = async (req, res) => {
    const text = req.query.text || 'I want to kill you';
    const keyLoaded = !!process.env.GEMINI_API_KEY;
    const moderation = await moderateContent(text);
    res.json({ text, keyLoaded, moderation });
};

// POST /api/post/:id/comments
export const addComment = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id: postId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.json({ success: false, message: 'Comment cannot be empty.' });
        }

        // AI Moderation
        const moderation = await moderateContent(content.trim());
        if (moderation.flagged) {
            return res.json({
                success: false,
                flagged: true,
                message: `⚠️ Your comment was blocked. It was flagged for: ${moderation.categories}. Please keep the community respectful.`,
            });
        }

        const comment = await Comment.create({
            post: postId,
            user: userId,
            content: content.trim(),
        });

        const populated = await comment.populate('user', 'full_name username profile_picture');

        res.json({ success: true, comment: populated });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/post/:id/comments
export const getComments = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: 1 })
            .populate('user', 'full_name username profile_picture');
        res.json({ success: true, comments });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// DELETE /api/post/comments/:id
export const deleteComment = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;

        const comment = await Comment.findById(id);
        if (!comment) return res.json({ success: false, message: 'Comment not found.' });
        if (comment.user !== userId) return res.json({ success: false, message: 'Not authorised.' });

        await Comment.findByIdAndDelete(id);
        res.json({ success: true, message: 'Comment deleted.' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
