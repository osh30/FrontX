const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const BlogBookmark = require('../models/BlogBookmark');
const BlogLike = require('../models/BlogLike');
const User = require('../models/User');

const BLOG_CATEGORIES = [
  'Study Tips', 'Career', 'Internship', 'Research', 'Programming',
  'AI', 'Scholarship', 'Productivity', 'University Life',
  'Project Showcase', 'Success Story', 'Events', 'Technology', 'Others'
];

const calcReadingTime = (content) => {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
};

const getBlogs = async (req, res) => {
  try {
    const { category, authorRole, search, sort, tag, page = 1, limit = 12 } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (authorRole && authorRole !== 'All') query.authorRole = authorRole;
    if (tag) query.tags = { $in: tag.split(',').map(t => new RegExp(t.trim(), 'i')) };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj = { isPinned: -1, createdAt: -1 };
    if (sort === 'popular') sortObj = { isPinned: -1, likeCount: -1 };
    if (sort === 'most-liked') sortObj = { likeCount: -1 };
    if (sort === 'most-viewed') sortObj = { views: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name profilePicture department')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(query)
    ]);

    let bookmarks = [];
    let likes = [];
    if (req.user) {
      const blogIds = blogs.map(b => b._id);
      [bookmarks, likes] = await Promise.all([
        BlogBookmark.find({ user: req.user.id, blog: { $in: blogIds } }).lean(),
        BlogLike.find({ user: req.user.id, blog: { $in: blogIds } }).lean()
      ]);
    }

    const bookmarkSet = new Set(bookmarks.map(b => b.blog.toString()));
    const likeSet = new Set(likes.map(l => l.blog.toString()));

    const enriched = blogs.map(b => ({
      ...b,
      isBookmarked: bookmarkSet.has(b._id.toString()),
      isLiked: likeSet.has(b._id.toString())
    }));

    res.json({ blogs: enriched, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), categories: BLOG_CATEGORIES });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name profilePicture department bio role')
      .lean();

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    let isBookmarked = false;
    let isLiked = false;
    if (req.user) {
      const [bookmark, like] = await Promise.all([
        BlogBookmark.findOne({ user: req.user.id, blog: req.params.id }).lean(),
        BlogLike.findOne({ user: req.user.id, blog: req.params.id }).lean()
      ]);
      isBookmarked = !!bookmark;
      isLiked = !!like;
    }

    res.json({ ...blog, views: blog.views + 1, isBookmarked, isLiked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { title, summary, content, coverImage, category, tags } = req.body;

    const blog = await Blog.create({
      title,
      summary,
      content,
      coverImage: coverImage || null,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      author: req.user.id,
      authorRole: user.role,
      department: user.department || '',
      readingTime: calcReadingTime(content)
    });

    const populated = await Blog.findById(blog._id)
      .populate('author', 'name profilePicture department')
      .lean();

    const io = req.app.get('io');
    if (io) io.emit('new_blog', populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, summary, content, coverImage, category, tags } = req.body;
    if (title !== undefined) blog.title = title;
    if (summary !== undefined) blog.summary = summary;
    if (content !== undefined) {
      blog.content = content;
      blog.readingTime = calcReadingTime(content);
    }
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (category !== undefined) blog.category = category;
    if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : JSON.parse(tags);

    await blog.save();
    const populated = await Blog.findById(blog._id).populate('author', 'name profilePicture department').lean();

    const io = req.app.get('io');
    if (io) io.emit('blog:updated', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Promise.all([
      BlogComment.deleteMany({ blog: req.params.id }),
      BlogBookmark.deleteMany({ blog: req.params.id }),
      BlogLike.deleteMany({ blog: req.params.id }),
      blog.deleteOne()
    ]);

    const io = req.app.get('io');
    if (io) io.emit('blog:deleted', { blogId: req.params.id });

    res.json({ message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const existing = await BlogLike.findOne({ user: req.user.id, blog: req.params.id });
    if (existing) {
      await existing.deleteOne();
      await Blog.findByIdAndUpdate(req.params.id, { $inc: { likeCount: -1 } });
      return res.json({ liked: false, likeCount: Math.max(0, (await Blog.findById(req.params.id)).likeCount) });
    }
    await BlogLike.create({ user: req.user.id, blog: req.params.id });
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { likeCount: 1 } });
    const updated = await Blog.findById(req.params.id);
    res.json({ liked: true, likeCount: updated.likeCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const existing = await BlogBookmark.findOne({ user: req.user.id, blog: req.params.id });
    if (existing) {
      await existing.deleteOne();
      await Blog.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: -1 } });
      return res.json({ bookmarked: false });
    }
    await BlogBookmark.create({ user: req.user.id, blog: req.params.id });
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: 1 } });
    res.json({ bookmarked: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const shareBlog = async (req, res) => {
  try {
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { shareCount: 1 } });
    const updated = await Blog.findById(req.params.id);
    res.json({ shareCount: updated.shareCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSavedBlogs = async (req, res) => {
  try {
    const bookmarks = await BlogBookmark.find({ user: req.user.id })
      .populate({ path: 'blog', populate: { path: 'author', select: 'name profilePicture department' } })
      .sort({ createdAt: -1 })
      .lean();

    const blogs = bookmarks.filter(b => b.blog).map(b => ({ ...b.blog, isBookmarked: true }));
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecommendedBlogs = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const recommended = await Blog.find({
      _id: { $ne: blog._id },
      $or: [{ category: blog.category }, { tags: { $in: blog.tags } }]
    })
      .populate('author', 'name profilePicture department')
      .sort({ likeCount: -1, views: -1 })
      .limit(6)
      .lean();

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { content, parentComment } = req.body;
    const comment = await BlogComment.create({
      blog: req.params.id,
      author: req.user.id,
      authorRole: user.role,
      content,
      parentComment: parentComment || null
    });

    await Blog.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });

    const populated = await BlogComment.findById(comment._id)
      .populate('author', 'name profilePicture department')
      .lean();

    const io = req.app.get('io');
    if (io) io.emit('blog:new_comment', { blogId: req.params.id, comment: populated });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await BlogComment.find({ blog: req.params.id, parentComment: null })
      .populate('author', 'name profilePicture department')
      .sort({ createdAt: -1 })
      .lean();

    const commentIds = comments.map(c => c._id);
    const replies = await BlogComment.find({ parentComment: { $in: commentIds } })
      .populate('author', 'name profilePicture department')
      .sort({ createdAt: 1 })
      .lean();

    const commentMap = {};
    comments.forEach(c => { commentMap[c._id.toString()] = { ...c, replies: [] }; });
    replies.forEach(r => {
      const parentId = r.parentComment.toString();
      if (commentMap[parentId]) commentMap[parentId].replies.push(r);
    });

    res.json(Object.values(commentMap));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await BlogComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    comment.content = req.body.content;
    await comment.save();
    const populated = await BlogComment.findById(comment._id).populate('author', 'name profilePicture department').lean();
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await BlogComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const replyCount = await BlogComment.countDocuments({ parentComment: comment._id });
    await BlogComment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();
    await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentCount: -(1 + replyCount) } });

    const io = req.app.get('io');
    if (io) io.emit('blog:comment_deleted', { blogId: comment.blog, commentId: comment._id });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleCommentLike = async (req, res) => {
  try {
    const comment = await BlogComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const idx = comment.likes.indexOf(req.user.id);
    if (idx > -1) {
      comment.likes.splice(idx, 1);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push(req.user.id);
      comment.likeCount += 1;
    }
    await comment.save();
    res.json({ liked: idx === -1, likeCount: comment.likeCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  toggleBookmark,
  shareBlog,
  getSavedBlogs,
  getRecommendedBlogs,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike
};
