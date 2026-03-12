import Comment from '../models/Comment.js';
import OpenAI from 'openai';

// OpenAI client (only if key is set)
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

// Moderate content using OpenAI's free moderation API
const moderateContent = async (text) => {
    if (!openai) return { flagged: false };
    try {
        const response = await openai.moderations.create({
            model: 'omni-moderation-latest',
            input: text,
        });
        const result = response.results[0];
        if (result.flagged) {
            const flaggedCategories = Object.entries(result.categories)
                .filter(([, v]) => v)
                .map(([k]) => k.replace(/\//g, ' / '))
                .join(', ');
            return { flagged: true, categories: flaggedCategories };
        }
        return { flagged: false };
    } catch (err) {
        console.error('OpenAI moderation error:', err.message);
        return { flagged: false }; // fail open — don't block comments if API is down
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
