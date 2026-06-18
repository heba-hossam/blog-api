const Post = require('../models/Post');

/**
 * @desc    Get all blog posts (paginated)
 * @route   GET /posts
 * @access  Public
 */
const getAllPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .populate('author', 'name email')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single post by ID
 * @route   GET /posts/:id
 * @access  Public
 */
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    res.status(200).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new post
 * @route   POST /posts
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = await Post.create({ title, content, author: req.user._id });
    await post.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a post (owner only)
 * @route   PUT /posts/:id
 * @access  Private
 */
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Ownership check
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only update your own posts.',
      });
    }

    const { title, content } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();
    await post.populate('author', 'name email');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a post (owner only)
 * @route   DELETE /posts/:id
 * @access  Private
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Ownership check
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only delete your own posts.',
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };
