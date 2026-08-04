const AnonymousPost = require('../models/AnonymousPost');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const SavedPost = require('../models/SavedPost');
const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

// @desc    Create anonymous post
// @route   POST /api/anonymous-posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, category } = req.body;
    let imageUrl = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'anonymous_posts');
      imageUrl = result.secure_url;
    }

    const user = await User.findById(req.user.id);

    const post = await AnonymousPost.create({
      user: req.user.id,
      role: user.role,
      content,
      category,
      imageUrl
    });

    if (req.app.get('io')) {
      req.app.get('io').emit('new_post', post);
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all posts (with likes, comments, saved status)
// @route   GET /api/anonymous-posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const posts = await AnonymousPost.find().sort({ createdAt: -1 });

    const formattedPosts = await Promise.all(posts.map(async (post) => {
      const likesCount = await Like.countDocuments({ post: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      const isLiked = await Like.exists({ post: post._id, user: req.user.id });
      const isSaved = await SavedPost.exists({ post: post._id, user: req.user.id });

      const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 });

      return {
        _id: post._id,
        content: post.content,
        imageUrl: post.imageUrl,
        category: post.category,
        resolvedStatus: post.resolvedStatus,
        createdAt: post.createdAt,
        isCreator: post.user.toString() === req.user.id.toString(),
        authorRole: post.role,
        likesCount,
        commentsCount,
        isLiked: !!isLiked,
        isSaved: !!isSaved,
        comments: comments.map(c => ({
          _id: c._id,
          content: c.content,
          role: c.role,
          createdAt: c.createdAt
        }))
      };
    }));

    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Like or Unlike a post
// @route   PUT /api/anonymous-posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const existingLike = await Like.findOne({ post: req.params.id, user: req.user.id });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      if (req.app.get('io')) req.app.get('io').emit('post_updated');
      res.json({ message: 'Post unliked', liked: false });
    } else {
      await Like.create({ post: req.params.id, user: req.user.id });
      if (req.app.get('io')) req.app.get('io').emit('post_updated');
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Comment on a post
// @route   POST /api/anonymous-posts/:id/comments
// @access  Private
const commentPost = async (req, res) => {
  try {
    const { content } = req.body;
    const user = await User.findById(req.user.id);

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user.id,
      role: user.role,
      content
    });

    if (req.app.get('io')) req.app.get('io').emit('new_comment');

    res.status(201).json({
      _id: comment._id,
      content: comment.content,
      role: comment.role,
      createdAt: comment.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Save or Unsave a post
// @route   PUT /api/anonymous-posts/:id/save
// @access  Private
const savePost = async (req, res) => {
  try {
    const existingSave = await SavedPost.findOne({ post: req.params.id, user: req.user.id });

    if (existingSave) {
      await SavedPost.findByIdAndDelete(existingSave._id);
      res.json({ message: 'Post unsaved', saved: false });
    } else {
      await SavedPost.create({ post: req.params.id, user: req.user.id });
      res.json({ message: 'Post saved', saved: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Mark post as resolved
// @route   PUT /api/anonymous-posts/:id/resolve
// @access  Private
const resolvePost = async (req, res) => {
  try {
    const post = await AnonymousPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only the creator can resolve this post' });
    }

    post.resolvedStatus = true;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  commentPost,
  savePost,
  resolvePost
};
