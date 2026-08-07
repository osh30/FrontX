const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const BlogBookmark = require('../models/BlogBookmark');
const BlogLike = require('../models/BlogLike');
const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

const BLOG_CATEGORIES = [
  'Study Tips', 'Career', 'Internship', 'Research', 'Programming',
  'AI', 'Scholarship', 'Productivity', 'University Life',
  'Project Showcase', 'Success Story', 'Events', 'Technology', 'Others'
];

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sectionText = (s) => {
  switch (s.type) {
    case 'heading': return `${s.heading || ''}`;
    case 'paragraph': return `${s.text || ''}`;
    case 'image': return `${s.caption || ''}`;
    case 'quote': return `${s.quote || ''} ${s.source || ''}`;
    case 'tip': return `${s.tip || ''}`;
    case 'facts': return (s.facts || []).join(' ');
    case 'checklist':
    case 'numberedSteps': return (s.items || []).join(' ');
    case 'timeline': return (s.timeline || []).map(t => `${t.title} ${t.description}`).join(' ');
    case 'comparisonTable': return `${(s.headers || []).join(' ')} ${(s.rows || []).flat().join(' ')}`;
    case 'faq': return (s.qa || []).map(q => `${q.question} ${q.answer}`).join(' ');
    default: return '';
  }
};

const sectionsToText = (sections = []) =>
  sections.map(sectionText).filter(Boolean).join(' ');

const sectionsToHtml = (sections = []) => {
  if (!Array.isArray(sections) || sections.length === 0) return '';
  return sections.map((s) => {
    switch (s.type) {
      case 'heading': {
        const tag = `h${Math.min(Math.max(s.level || 2, 1), 4)}`;
        return `<${tag}>${escapeHtml(s.heading)}</${tag}>`;
      }
      case 'paragraph':
        return `<p>${escapeHtml(s.text)}</p>`;
      case 'image':
        return s.imageUrl
          ? `<figure><img src="${escapeHtml(s.imageUrl)}" alt="${escapeHtml(s.alt || s.caption || '')}" />${s.caption ? `<figcaption>${escapeHtml(s.caption)}</figcaption>` : ''}</figure>`
          : '';
      case 'quote':
        return s.quote
          ? `<blockquote><p>${escapeHtml(s.quote)}</p>${s.source ? `<cite>${escapeHtml(s.source)}</cite>` : ''}</blockquote>`
          : '';
      case 'tip':
        return s.tip ? `<div class="tip">${escapeHtml(s.tip)}</div>` : '';
      case 'facts':
        return `<ul class="facts">${(s.facts || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`;
      case 'checklist':
      case 'numberedSteps': {
        const tag = s.type === 'checklist' ? 'ul' : 'ol';
        return `<${tag} class="${s.type}">${(s.items || []).map(i => `<li>${escapeHtml(i)}</li>`).join('')}</${tag}>`;
      }
      case 'timeline':
        return `<ul class="timeline">${(s.timeline || []).map(t => `<li><strong>${escapeHtml(t.title)}</strong>${t.description ? ` — ${escapeHtml(t.description)}` : ''}</li>`).join('')}</ul>`;
      case 'comparisonTable':
        return `<table><thead><tr>${(s.headers || []).map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${(s.rows || []).map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'faq':
        return `<div class="faq-list">${(s.qa || []).map(q => `<details><summary>${escapeHtml(q.question)}</summary><p>${escapeHtml(q.answer)}</p></details>`).join('')}</div>`;
      case 'divider':
        return '<hr />';
      default:
        return '';
    }
  }).join('\n');
};

const calcReadingTime = (sections, content = '') => {
  let text = content ? content.replace(/<[^>]*>/g, '') : '';
  const sectionWordCount = sectionsToText(sections || []).split(/\s+/).filter(Boolean).length;
  const words = text.split(/\s+/).filter(Boolean).length + sectionWordCount;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
};

const getBlogs = async (req, res) => {
  try {
    const { category, authorRole, search, sort, tag, page = 1, limit = 12 } = req.query;
    let query = {};

    if (!req.user || req.user.role !== 'admin') {
      query.status = { $ne: 'draft' };
    }
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

    let sortObj = { featured: -1, isPinned: -1, createdAt: -1 };
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

const getAdminBlogs = async (req, res) => {
  try {
    const { category, search, status, page = 1, limit = 12 } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status === 'published' ? { $ne: 'draft' } : 'draft';
    }
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total, countDoc] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name profilePicture department role')
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(query),
      Blog.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, published: { $sum: { $cond: [{ $ne: ['$status', 'draft'] }, 1, 0] } }, drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } }, featured: { $sum: { $cond: ['$featured', 1, 0] } } } }
      ])
    ]);

    const counts = countDoc[0] || { total: 0, published: 0, drafts: 0, featured: 0 };

    res.json({ blogs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), categories: BLOG_CATEGORIES, counts });
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
    if (blog.status === 'draft' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Blog not found' });
    }

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

    const {
      title, summary, content, contentJson, coverImage, heroImage, category, tags,
      subtitle, sections, featured, status
    } = req.body;

    const parsedSections = Array.isArray(sections) ? sections : (sections ? JSON.parse(sections) : []);
    const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];
    const finalStatus = status === 'draft' ? 'draft' : 'published';
    const parsedContentJson = Array.isArray(contentJson) ? contentJson : null;

    const blog = await Blog.create({
      title,
      subtitle: subtitle || '',
      summary,
      content: content || (parsedSections.length ? sectionsToHtml(parsedSections) : ''),
      contentJson: parsedContentJson,
      sections: parsedSections,
      coverImage: coverImage || null,
      heroImage: heroImage || coverImage || null,
      category,
      tags: parsedTags,
      featured: !!featured,
      status: finalStatus,
      publishedAt: finalStatus === 'published' ? new Date() : null,
      author: req.user.id,
      authorRole: user.role,
      department: user.department || '',
      readingTime: calcReadingTime(parsedSections, content)
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

    const {
      title, summary, content, contentJson, coverImage, heroImage, category, tags,
      subtitle, sections, featured, status, isPinned
    } = req.body;

    if (title !== undefined) blog.title = title;
    if (subtitle !== undefined) blog.subtitle = subtitle;
    if (summary !== undefined) blog.summary = summary;

    if (contentJson !== undefined) {
      blog.contentJson = Array.isArray(contentJson) ? contentJson : null;
    }

    if (sections !== undefined) {
      const parsedSections = Array.isArray(sections) ? sections : JSON.parse(sections);
      blog.sections = parsedSections;
      if (contentJson === undefined) {
        blog.content = parsedSections.length ? sectionsToHtml(parsedSections) : (content || '');
        blog.readingTime = calcReadingTime(parsedSections, content);
      }
    } else if (content !== undefined) {
      blog.content = content;
      blog.readingTime = calcReadingTime(blog.sections, content);
    }

    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (heroImage !== undefined) blog.heroImage = heroImage;
    if (category !== undefined) blog.category = category;
    if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (featured !== undefined) blog.featured = !!featured;
    if (isPinned !== undefined) blog.isPinned = !!isPinned;

    if (status !== undefined && blog.status !== status) {
      blog.status = status === 'draft' ? 'draft' : 'published';
      if (blog.status === 'published' && !blog.publishedAt) blog.publishedAt = new Date();
    }

    await blog.save();
    const populated = await Blog.findById(blog._id).populate('author', 'name profilePicture department').lean();

    const io = req.app.get('io');
    if (io) io.emit('blog:updated', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setBlogStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const { status } = req.body;
    if (status !== 'draft' && status !== 'published') {
      return res.status(400).json({ message: 'Invalid status' });
    }

    blog.status = status;
    if (status === 'published' && !blog.publishedAt) blog.publishedAt = new Date();
    if (status === 'draft') blog.publishedAt = null;
    await blog.save();

    const populated = await Blog.findById(blog._id).populate('author', 'name profilePicture department').lean();

    const io = req.app.get('io');
    if (io) io.emit('blog:updated', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }
    const result = await uploadToCloudinary(req.file, 'frontx/blogs');
    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
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
      status: { $ne: 'draft' },
      $or: [{ category: blog.category }, { tags: { $in: blog.tags } }]
    })
      .populate('author', 'name profilePicture department')
      .sort({ featured: -1, likeCount: -1, views: -1 })
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
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

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
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  setBlogStatus,
  uploadBlogImage,
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
