import Comment from '../models/Comment.js';

// ── Simple built-in profanity + threat filter (no package needed) ─────────
const PROFANITY_LIST = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
    'piss', 'cock', 'pussy', 'faggot', 'nigger', 'nigga', 'whore',
    'slut', 'retard', 'motherfucker', 'fucker', 'damn', 'crap',
];

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
    if (THREAT_PATTERNS.some(re => re.test(text))) return true;
    const cleaned = normaliseLeet(text);
    return PROFANITY_LIST.some(word => new RegExp(`\\b${word}\\b`, 'i').test(cleaned));
};

// ── Gemini via direct REST fetch (no npm package — works everywhere) ───────
const callGemini = async (text) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.startsWith('your-gemini')) return null;

    const prompt = `You are a content safety filter for a social media app. Answer with ONLY "YES" or "NO".

Does this comment contain ANY of the following?
- A threat of violence or death (e.g. "I want to kill you", "I'll hurt you", "I'll murder you")
- Encouragement of self-harm or suicide (e.g. "kill yourself", "go die", "kys")
- Hate speech based on race, religion, gender, or sexuality
- Sexual harassment
- Severe bullying or personal attacks

Comment: "${text}"

Answer (YES or NO only):`;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            }),
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini HTTP ${res.status}: ${err}`);
    }

    const json = await res.json();
    const answer = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';
    console.log('[Moderation] Gemini REST answer:', answer);
    return answer;
};



// ── Main moderation function ───────────────────────────────────────────────
const moderateContent = async (text) => {
    // 1. Try Gemini AI first via REST (primary detector)
    try {
        const answer = await callGemini(text);
        if (answer !== null) {
            if (answer.startsWith('YES')) {
                console.log('[Moderation] Gemini flagged comment');
                return { flagged: true, categories: 'harmful content', detectedBy: 'gemini' };
            }
            console.log('[Moderation] Gemini approved comment');
            return { flagged: false, detectedBy: 'gemini' };
        }
    } catch (err) {
        console.error('[Moderation] Gemini REST error, using local filter:', err.message);
    }

    // 2. Fallback: local threat patterns + profanity
    if (THREAT_PATTERNS.some(re => re.test(text))) {
        return { flagged: true, categories: 'threatening / harmful language', detectedBy: 'local' };
    }
    const cleaned = normaliseLeet(text);
    if (PROFANITY_LIST.some(word => new RegExp(`\\b${word}\\b`, 'i').test(cleaned))) {
        return { flagged: true, categories: 'profanity / offensive language', detectedBy: 'local' };
    }
    return { flagged: false, detectedBy: 'local' };
};







// GET /api/post/moderation-test  ← DEBUG endpoint
export const testModeration = async (req, res) => {
    const text = req.query.text || 'I want to kill you';
    const keyLoaded = !!process.env.GEMINI_API_KEY;
    let geminiAnswer = null;
    let geminiError = null;
    try {
        geminiAnswer = await callGemini(text);
    } catch (e) {
        geminiError = e.message;
    }
    const moderation = await moderateContent(text);
    res.json({ text, keyLoaded, geminiAnswer, geminiError, moderation });
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
                detectedBy: moderation.detectedBy,
                message: `Your comment was blocked. It was flagged for: ${moderation.categories}.`,
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
