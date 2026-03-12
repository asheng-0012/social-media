import Comment from '../models/Comment.js';
import OpenAI from 'openai';

// ── Simple built-in profanity filter (no package needed) ──────────────────
const PROFANITY_LIST = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
    'piss', 'cock', 'pussy', 'faggot', 'nigger', 'nigga', 'whore',
    'slut', 'retard', 'motherfucker', 'fucker', 'ass', 'damn', 'crap',
];

const normaliseLeet = (text) =>
    text.toLowerCase()
        .replace(/@/g, 'a').replace(/3/g, 'e').replace(/1/g, 'i')
        .replace(/0/g, 'o').replace(/\$/g, 's').replace(/5/g, 's')
        .replace(/\+/g, 't').replace(/[^a-z\s]/g, '');

const isLocallyFlagged = (text) => {
    const cleaned = normaliseLeet(text);
    return PROFANITY_LIST.some(word => {
        const re = new RegExp(`\\b${word}\\b`, 'i');
        return re.test(cleaned);
    });
};

// ── OpenAI Moderation (lazy-init so env vars are read at call time) ────────
let _openai = null;
const getOpenAI = () => {
    if (_openai) return _openai;
    const key = process.env.OPENAI_API_KEY;
    if (key && !key.startsWith('your-openai')) {
        _openai = new OpenAI({ apiKey: key });
    }
    return _openai;
};

// ── Main moderation function ───────────────────────────────────────────────
const moderateContent = async (text) => {
    // 1. Local word list (instant, zero API calls)
    if (isLocallyFlagged(text)) {
        console.log('[Moderation] Local filter flagged comment');
        return { flagged: true, categories: 'profanity / offensive language' };
    }

    // 2. OpenAI Moderation API (hate, harassment, violence, etc.)
    const openai = getOpenAI();
    if (!openai) {
        console.log('[Moderation] No OpenAI key — skipping API check');
        return { flagged: false };
    }
    try {
        const response = await openai.moderations.create({
            model: 'omni-moderation-latest',
            input: text,
        });
        const result = response.results[0];
        console.log('[Moderation] OpenAI flagged:', result.flagged);
        if (result.flagged) {
            const cats = Object.entries(result.categories)
                .filter(([, v]) => v)
                .map(([k]) => k.replace(/\//g, ' / '))
                .join(', ');
            return { flagged: true, categories: cats };
        }
        return { flagged: false };
    } catch (err) {
        console.error('[Moderation] OpenAI error:', err.message);
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
