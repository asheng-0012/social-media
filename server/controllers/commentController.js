import Comment from '../models/Comment.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Simple built-in profanity filter (no package needed) ──────────────────
const PROFANITY_LIST = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
    'piss', 'cock', 'pussy', 'faggot', 'nigger', 'nigga', 'whore',
    'slut', 'retard', 'motherfucker', 'fucker', 'damn', 'crap',
];

const normaliseLeet = (text) =>
    text.toLowerCase()
        .replace(/@/g, 'a').replace(/3/g, 'e').replace(/1/g, 'i')
        .replace(/0/g, 'o').replace(/\$/g, 's').replace(/5/g, 's')
        .replace(/\+/g, 't').replace(/[^a-z\s]/g, '');

const isLocallyFlagged = (text) => {
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
        const prompt = `You are a content moderator. Analyse the following comment and respond with ONLY a JSON object in this exact format: {"flagged": true/false, "reason": "brief reason or empty string"}. Flag it if it contains hate speech, harassment, threats of violence, self-harm encouragement, or sexual content directed at a person. Be strict but fair.\n\nComment: "${text}"`;

        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();
        console.log('[Moderation] Gemini raw response:', raw);

        // Extract JSON from potential markdown code block
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
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
