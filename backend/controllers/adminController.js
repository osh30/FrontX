const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');
const CommunityComment = require('../models/CommunityComment');
const CommunityReaction = require('../models/CommunityReaction');
const SavedPost = require('../models/SavedPost');
const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const BlogLike = require('../models/BlogLike');
const BlogBookmark = require('../models/BlogBookmark');
const Resource = require('../models/Resource');

const getStats = async (req, res) => {
  try {
    const [totalStudents, totalAlumni, totalAdmins, totalBlogs, totalPosts, totalResources] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ role: 'admin' }),
      Blog.countDocuments(),
      CommunityPost.countDocuments(),
      Resource.countDocuments(),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      newStudents30d,
      newAlumni30d,
      newPosts30d,
      newBlogs30d,
      postsLast7d,
      blogsLast7d,
      totalComments,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: 'alumni', createdAt: { $gte: thirtyDaysAgo } }),
      CommunityPost.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Blog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      CommunityPost.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Blog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      CommunityComment.countDocuments(),
    ]);

    const recentUsers = await User.find()
      .select('name email role department createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      users: { total: totalStudents + totalAlumni + totalAdmins, students: totalStudents, alumni: totalAlumni, admins: totalAdmins },
      content: { blogs: totalBlogs, posts: totalPosts, resources: totalResources, comments: totalComments },
      growth: {
        newStudents30d,
        newAlumni30d,
        newPosts30d,
        newBlogs30d,
        postsLast7d,
        blogsLast7d,
      },
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCommunityPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      CommunityPost.find(query)
        .populate('originalAuthor', 'name profilePicture department role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CommunityPost.countDocuments(query),
    ]);

    const enriched = await Promise.all(posts.map(async (post) => {
      const [comments, reactions] = await Promise.all([
        CommunityComment.find({ post: post._id })
          .populate('originalAuthor', 'name profilePicture department role')
          .sort({ createdAt: 1 })
          .lean(),
        CommunityReaction.find({ post: post._id }).lean(),
      ]);

      return {
        ...post,
        authorName: post.isAnonymous ? 'Anonymous' : post.originalAuthor?.name || 'Unknown',
        authorAvatar: !post.isAnonymous ? post.originalAuthor?.profilePicture : null,
        authorDepartment: !post.isAnonymous ? post.originalAuthor?.department : null,
        commentCount: comments.length,
        reactionCount: reactions.length,
        comments: comments.map(c => ({
          ...c,
          authorName: c.isAnonymous ? 'Anonymous' : c.originalAuthor?.name || 'Unknown',
          authorAvatar: !c.isAnonymous ? c.originalAuthor?.profilePicture : null,
        })),
      };
    }));

    res.json({ posts: enriched, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminDeletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await Promise.all([
      CommunityComment.deleteMany({ post: req.params.id }),
      CommunityReaction.deleteMany({ post: req.params.id }),
      SavedPost.deleteMany({ post: req.params.id }),
      CommunityPost.findByIdAndDelete(req.params.id),
    ]);

    if (req.app.get('io')) {
      req.app.get('io').emit('community_post_deleted', { postId: req.params.id });
    }

    res.json({ message: 'Post deleted by admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminDeleteComment = async (req, res) => {
  try {
    const comment = await CommunityComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await CommunityComment.findByIdAndDelete(req.params.commentId);

    if (req.app.get('io')) {
      req.app.get('io').emit('community_comment_deleted', {
        postId: comment.post.toString(),
        commentId: comment._id.toString(),
      });
    }

    res.json({ message: 'Comment deleted by admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'All') {
      query.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminDeleteUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin users' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminUpdateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'alumni', 'recruiter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStats,
  getCommunityPosts,
  adminDeletePost,
  adminDeleteComment,
  getAllUsers,
  adminDeleteUser,
  adminUpdateUserRole,
};
