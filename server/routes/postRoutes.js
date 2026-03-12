import express from 'express';
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';
import { addPost, getFeedPosts, likePost, deletePost } from '../controllers/postController.js';
import { addComment, getComments, deleteComment } from '../controllers/commentController.js';

const postRouter = express.Router()

postRouter.post('/add', upload.array('images', 4), protect, addPost)
postRouter.get('/feed', protect, getFeedPosts)
postRouter.post('/like', protect, likePost)
postRouter.delete('/:id', protect, deletePost)

postRouter.get('/:id/comments', protect, getComments)
postRouter.post('/:id/comments', protect, addComment)
postRouter.delete('/comments/:id', protect, deleteComment)

export default postRouter
