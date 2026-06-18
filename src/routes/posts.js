const express = require('express');
const router = express.Router();

const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postsController');
const { protect } = require('../middlewares/auth');
const { validate, createPostSchema, updatePostSchema } = require('../validators/schemas');

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes
router.post('/', protect, validate(createPostSchema), createPost);
router.put('/:id', protect, validate(updatePostSchema), updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
