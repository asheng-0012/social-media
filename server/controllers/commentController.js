import Comment from '../models/Comment.js';

// ── Simple built-in profanity + threat filter (no package needed) ─────────
const PROFANITY_LIST = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
    'piss', 'cock', 'pussy', 'faggot', 'nigger', 'nigga', 'whore',
    'slut', 'retard', 'motherfucker', 'fucker', 'damn', 'crap',
];

const THREAT_PATTERNS = [
    // Direct threats
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
    // Dehumanizing / hate speech
    /don'?t\s+deserve\s+to\s+(live|exist|be\s+here|breathe)/i,
    /\b(should|shouldn'?t)\s+(be\s+alive|exist)\b/i,
    /\bwaste\s+of\s+(space|life|oxygen|air)\b/i,
    /\b(subhuman|vermin|parasite|filth|scum)\b/i,
    /\b(worthless|pathetic)\s+(piece\s+of\s+)?(shit|trash|garbage|human)\b/i,
    /\bpeople?\s+like\s+you\s+(don'?t\s+deserve|should\s+(die|not\s+exist))/i,
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

// ── Perspective API (Google Jigsaw - completely free) ────────────────────
const callPerspectiveAPI = async (text) => {
    const key = process.env.PERSPECTIVE_API_KEY;
    if (!key || key.startsWith('your-perspective')) return null;

    const res = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            comment: { text: text },
            languages: ['en'],
            requestedAttributes: { TOXICITY: {} }
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Perspective API HTTP ${res.status}: ${err}`);
    }

    const json = await res.json();
    const score = json.attributeScores?.TOXICITY?.summaryScore?.value || 0;
    
    console.log('[Moderation] Perspective API Toxicity Score:', score);
    
    // A score of 0.70 or higher is generally considered toxic/harmful
    if (score >= 0.70) {
        return { flagged: true, categories: 'toxic content' };
    }
    return { flagged: false };
};



// ── Main moderation function ───────────────────────────────────────────────
const moderateContent = async (text) => {
    // 1. Try Perspective API first (free, catches toxicity/hate)
    try {
        const result = await callPerspectiveAPI(text);
        if (result !== null) {
            if (result.flagged) {
                console.log('[Moderation] Perspective API flagged comment:', result.categories);
                return { flagged: true, categories: result.categories, detectedBy: 'perspective' };
            }
            console.log('[Moderation] Perspective API approved comment');
            return { flagged: false, detectedBy: 'perspective' };
        }
    } catch (err) {
        console.error('[Moderation] Perspective API error, using local filter:', err.message);
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
    const keyLoaded = !!process.env.PERSPECTIVE_API_KEY;
    let aiAnswer = null;
    let aiError = null;
    try {
        // Just calling it here to expose the raw output
        const key = process.env.PERSPECTIVE_API_KEY;
        if (key && !key.startsWith('your-perspective')) {
            const result = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment: { text: text },
                    languages: ['en'],
                    requestedAttributes: { TOXICITY: {} }
                }),
            });
            if (result.ok) {
                const j = await result.json();
                aiAnswer = j.attributeScores?.TOXICITY?.summaryScore?.value;
            } else {
                aiError = await result.text();
            }
        }
    } catch (e) {
        aiError = e.message;
    }
    const moderation = await moderateContent(text);
    res.json({ text, keyLoaded, aiAnswer, aiError, moderation });
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
