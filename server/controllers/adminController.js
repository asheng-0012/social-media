import User from '../models/User.js';
import Post from '../models/Post.js';
import Story from '../models/Story.js';

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
    try {
        const [userCount, postCount, storyCount] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Story.countDocuments(),
        ]);
        res.json({ success: true, stats: { userCount, postCount, storyCount } });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/users?page=1&limit=20&search=
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = search
            ? {
                  $or: [
                      { full_name: new RegExp(search, 'i') },
                      { username: new RegExp(search, 'i') },
                      { email: new RegExp(search, 'i') },
                  ],
              }
            : {};

        const [users, total] = await Promise.all([
            User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(query),
        ]);

        res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await Post.deleteMany({ user: id });
        await Story.deleteMany({ user: id });
        // Remove from other users' followers/following/connections
        await User.updateMany(
            { $or: [{ followers: id }, { following: id }, { connections: id }] },
            { $pull: { followers: id, following: id, connections: id } }
        );
        await User.findByIdAndDelete(id);
        res.json({ success: true, message: 'User and their content deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/posts?page=1&limit=20
export const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'full_name username profile_picture'),
            Post.countDocuments(),
        ]);

        res.json({ success: true, posts, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/posts/:id
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await Post.findByIdAndDelete(id);
        res.json({ success: true, message: 'Post deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/stories?page=1&limit=20
export const getAllStories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [stories, total] = await Promise.all([
            Story.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'full_name username profile_picture'),
            Story.countDocuments(),
        ]);

        res.json({ success: true, stories, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/stories/:id
export const deleteStory = async (req, res) => {
    try {
        const { id } = req.params;
        await Story.findByIdAndDelete(id);
        res.json({ success: true, message: 'Story deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
