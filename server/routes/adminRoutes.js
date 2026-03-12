import express from 'express';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminAuth.js';
import {
    getAdminStats,
    getAllUsers,
    deleteUser,
    getAllPosts,
    deletePost,
    getAllStories,
    deleteStory,
    getReports,
    dismissReport,
} from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.use(protect, adminOnly);

adminRouter.get('/stats', getAdminStats);

adminRouter.get('/users', getAllUsers);
adminRouter.delete('/users/:id', deleteUser);

adminRouter.get('/posts', getAllPosts);
adminRouter.delete('/posts/:id', deletePost);

adminRouter.get('/stories', getAllStories);
adminRouter.delete('/stories/:id', deleteStory);

adminRouter.get('/reports', getReports);
adminRouter.delete('/reports/:id', dismissReport);

export default adminRouter;

