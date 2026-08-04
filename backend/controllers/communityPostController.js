const CommunityPost = require('../models/CommunityPost');
const CommunityComment = require('../models/CommunityComment');
const CommunityReaction = require('../models/CommunityReaction');
const SavedPost = require('../models/SavedPost');
const Draft = require('../models/Draft');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

// @desc    Create community post
// @route   POST /api/community-posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const {
      content, category, isAnonymous, title, tags, allowComments,
      pollOptions, imageUrl, documentUrl, documentName
    } = req.body;

    let finalImageUrl = imageUrl || null;
    let finalDocumentUrl = documentUrl || null;
    let finalDocumentName = documentName || null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const result = await uploadToCloudinary(req.files.image[0], 'community_posts');
        finalImageUrl = result.secure_url;
      }
      if (req.files.document && req.files.document[0]) {
        const result = await uploadToCloudinary(req.files.document[0], 'community_documents');
        finalDocumentUrl = result.secure_url;
        finalDocumentName = req.files.document[0].originalname;
      }
    }

    const user = await User.findById(req.user.id);

    let finalIsAnonymous = isAnonymous === 'true' || isAnonymous === true;
    if (user.role === 'alumni') {
      finalIsAnonymous = false;
    }

    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
    const parsedPollOptions = typeof pollOptions === 'string' ? JSON.parse(pollOptions) : (pollOptions || []);
    const finalAllowComments = allowComments === 'true' || allowComments === true || allowComments === undefined;

    const postData = {
      originalAuthor: req.user.id,
      role: user.role,
      isAnonymous: finalIsAnonymous,
      title: title || '',
      content,
      category,
      tags: parsedTags,
      allowComments: finalAllowComments,
      imageUrl: finalImageUrl,
      documentUrl: finalDocumentUrl,
      documentName: finalDocumentName
    };

    if (parsedPollOptions.length > 0) {
      postData.poll = {
        options: parsedPollOptions.map(text => ({ text, votes: [] })),
        expiresAt: null
      };
    }

    const post = await CommunityPost.create(postData);
    await post.populate('originalAuthor', 'name profilePicture department role');

    let socketPayload = post.toObject();
    if (socketPayload.isAnonymous) {
      delete socketPayload.originalAuthor;
      socketPayload.authorRole = socketPayload.role;
    } else {
      socketPayload.authorRole = socketPayload.role;
    }

    if (req.app.get('io')) {
      req.app.get('io').emit('new_community_post', socketPayload);
    }

    // Delete draft if exists
    await Draft.deleteOne({ user: req.user.id });

    if (!finalIsAnonymous) {
      const activity = await Activity.create({
        user: req.user.id,
        title: 'published a new community post.',
        type: 'community',
        color: 'bg-blue-100 text-blue-600',
        relatedId: post._id,
        isGlobal: true
      });
      await activity.populate('user', 'name profilePicture');
      if (req.app.get('io')) {
        req.app.get('io').emit('new_global_activity', activity);
      }
    }

    const io = req.app.get('io');
    if (io) {
      const { recalculateProgress } = require('../utils/progressCalculator');
      await recalculateProgress(req.user.id);
      io.emit('progress_updated', { userId: req.user.id });
    }

    res.status(201).json(socketPayload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all community posts
// @route   GET /api/community-posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate('originalAuthor', 'name profilePicture department role')
      .sort({ createdAt: -1 });

    const formattedPosts = await Promise.all(posts.map(async (post) => {
      const reactions = await CommunityReaction.find({ post: post._id });

      let userReaction = null;
      const reactionCounts = { Like: 0, Love: 0, Support: 0, Insightful: 0 };

      reactions.forEach(reaction => {
        if (reactionCounts[reaction.type] !== undefined) {
          reactionCounts[reaction.type]++;
        }
        if (reaction.user.toString() === req.user.id.toString()) {
          userReaction = reaction.type;
        }
      });

      const totalReactions = reactions.length;
      const commentsCount = await CommunityComment.countDocuments({ post: post._id });
      const isSaved = await SavedPost.exists({ post: post._id, user: req.user.id });

      const rawComments = await CommunityComment.find({ post: post._id })
        .populate('originalAuthor', 'name profilePicture department role')
        .sort({ createdAt: 1 });

      const safeComments = rawComments.map(c => {
        const commentObj = c.toObject();
        if (commentObj.isAnonymous) delete commentObj.originalAuthor;
        return commentObj;
      });

      const postObj = post.toObject();
      if (postObj.isAnonymous) delete postObj.originalAuthor;

      const pollData = postObj.poll?.options ? {
        options: postObj.poll.options.map(opt => ({
          _id: opt._id,
          text: opt.text,
          count: opt.votes?.length || 0,
          voted: opt.votes?.some(v => v.toString() === req.user.id.toString()) || false
        })),
        totalVotes: postObj.poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0),
        expiresAt: postObj.poll.expiresAt
      } : null;

      return {
        _id: postObj._id,
        title: postObj.title,
        content: postObj.content,
        imageUrl: postObj.imageUrl,
        documentUrl: postObj.documentUrl,
        documentName: postObj.documentName,
        category: postObj.category,
        tags: postObj.tags,
        allowComments: postObj.allowComments,
        poll: pollData,
        resolvedStatus: postObj.resolvedStatus,
        createdAt: postObj.createdAt,
        isCreator: post.originalAuthor && post.originalAuthor._id.toString() === req.user.id.toString(),
        authorRole: postObj.role,
        isAnonymous: postObj.isAnonymous,
        originalAuthor: postObj.originalAuthor,
        totalReactions,
        reactionCounts,
        userReaction,
        commentsCount,
        isSaved: !!isSaved,
        comments: safeComments
      };
    }));

    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    React to a post
// @route   PUT /api/community-posts/:id/react
// @access  Private
const reactToPost = async (req, res) => {
  try {
    const { type } = req.body;

    if (!['Like', 'Love', 'Support', 'Insightful'].includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    const existingReaction = await CommunityReaction.findOne({ post: req.params.id, user: req.user.id });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await CommunityReaction.findByIdAndDelete(existingReaction._id);
        if (req.app.get('io')) req.app.get('io').emit('community_post_updated');
        return res.json({ message: 'Reaction removed', userReaction: null });
      } else {
        existingReaction.type = type;
        await existingReaction.save();
        if (req.app.get('io')) req.app.get('io').emit('community_post_updated');
        return res.json({ message: 'Reaction updated', userReaction: type });
      }
    } else {
      await CommunityReaction.create({ post: req.params.id, user: req.user.id, type });
      if (req.app.get('io')) req.app.get('io').emit('community_post_updated');
      res.json({ message: 'Reaction added', userReaction: type });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Comment on a post
// @route   POST /api/community-posts/:id/comments
// @access  Private
const commentPost = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    const user = await User.findById(req.user.id);

    let finalIsAnonymous = isAnonymous === true;
    if (user.role === 'alumni') {
      finalIsAnonymous = false;
    }

    const comment = await CommunityComment.create({
      post: req.params.id,
      originalAuthor: req.user.id,
      role: user.role,
      isAnonymous: finalIsAnonymous,
      content
    });

    await comment.populate('originalAuthor', 'name profilePicture department role');

    let socketPayload = comment.toObject();
    if (socketPayload.isAnonymous) {
      delete socketPayload.originalAuthor;
    }

    if (req.app.get('io')) {
      req.app.get('io').emit('new_community_comment', { postId: req.params.id, comment: socketPayload });
    }

    res.status(201).json(socketPayload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Save or Unsave a post
// @route   PUT /api/community-posts/:id/save
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
// @route   PUT /api/community-posts/:id/resolve
// @access  Private
const resolvePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.originalAuthor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only the creator can resolve this post' });
    }

    post.resolvedStatus = true;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Save draft
// @route   PUT /api/community-posts/draft
// @access  Private
const saveDraft = async (req, res) => {
  try {
    const { title, content, category, tags, isAnonymous, allowComments, imageUrl, documentUrl, documentName, pollOptions } = req.body;

    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
    const parsedPollOptions = typeof pollOptions === 'string' ? JSON.parse(pollOptions) : (pollOptions || []);

    const draft = await Draft.findOneAndUpdate(
      { user: req.user.id },
      {
        user: req.user.id,
        title: title || '',
        content: content || '',
        category: category || 'General Discussion',
        tags: parsedTags,
        isAnonymous: isAnonymous === 'true' || isAnonymous === true,
        allowComments: allowComments !== 'false' && allowComments !== false,
        imageUrl: imageUrl || null,
        documentUrl: documentUrl || null,
        documentName: documentName || null,
        pollOptions: parsedPollOptions,
        status: 'draft'
      },
      { upsert: true, new: true }
    );

    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get draft
// @route   GET /api/community-posts/draft
// @access  Private
const getDraft = async (req, res) => {
  try {
    const draft = await Draft.findOne({ user: req.user.id, status: 'draft' });
    res.json(draft || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete draft
// @route   DELETE /api/community-posts/draft
// @access  Private
const deleteDraft = async (req, res) => {
  try {
    await Draft.deleteOne({ user: req.user.id });
    res.json({ message: 'Draft deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/community-posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.originalAuthor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Promise.all([
      CommunityComment.deleteMany({ post: req.params.id }),
      CommunityReaction.deleteMany({ post: req.params.id }),
      SavedPost.deleteMany({ post: req.params.id }),
      CommunityPost.findByIdAndDelete(req.params.id)
    ]);

    if (req.app.get('io')) {
      req.app.get('io').emit('community_post_deleted', { postId: req.params.id });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Upload file (image or document)
// @route   POST /api/community-posts/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    const folder = req.body.type === 'document' ? 'community_documents' : 'community_posts';
    const result = await uploadToCloudinary(req.file, folder);
    res.json({
      url: result.secure_url,
      name: req.file.originalname,
      type: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Vote on a poll
// @route   POST /api/community-posts/:id/vote
// @access  Private
const votePoll = async (req, res) => {
  try {
    const { optionId } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.poll) return res.status(400).json({ message: 'No poll on this post' });

    const option = post.poll.options.id(optionId);
    if (!option) return res.status(404).json({ message: 'Option not found' });

    const alreadyVoted = post.poll.options.some(o =>
      o.votes.some(v => v.toString() === req.user.id.toString())
    );

    if (alreadyVoted) {
      // Remove previous vote
      post.poll.options.forEach(o => {
        o.votes = o.votes.filter(v => v.toString() !== req.user.id.toString());
      });
    }

    option.votes.push(req.user.id);
    await post.save();

    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get trending topics (categories with most posts)
// @route   GET /api/community-posts/trending-topics
// @access  Private
const getTrendingTopics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const topics = await CommunityPost.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$category', count: { $sum: 1 }, lastPost: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    res.json(topics.map(t => ({ category: t._id, count: t.count, lastPost: t.lastPost })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get most active alumni in community
// @route   GET /api/community-posts/active-alumni
// @access  Private
const getActiveAlumni = async (req, res) => {
  try {
    const alumni = await CommunityPost.aggregate([
      { $match: { role: 'alumni', isAnonymous: false } },
      { $group: { _id: '$originalAuthor', postCount: { $sum: 1 }, lastPost: { $max: '$createdAt' } } },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: '$_id', name: '$user.name', profilePicture: '$user.profilePicture', department: '$user.department', postCount: 1, lastPost: 1 } }
    ]);
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get suggested discussions (random posts not by current user)
// @route   GET /api/community-posts/suggested
// @access  Private
const getSuggestedDiscussions = async (req, res) => {
  try {
    const count = await CommunityPost.countDocuments({ originalAuthor: { $ne: req.user.id } });
    const skip = Math.max(0, Math.floor(Math.random() * Math.max(count - 3, 0)));
    const posts = await CommunityPost.find({ originalAuthor: { $ne: req.user.id } })
      .populate('originalAuthor', 'name profilePicture department role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(3)
      .lean();

    const result = posts.map(p => ({
      _id: p._id,
      content: p.content?.substring(0, 120) + (p.content?.length > 120 ? '...' : ''),
      category: p.category,
      authorName: p.isAnonymous ? 'Anonymous' : p.originalAuthor?.name || 'Unknown',
      authorAvatar: !p.isAnonymous && p.originalAuthor?.profilePicture ? p.originalAuthor.profilePicture : null,
      createdAt: p.createdAt
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get community announcements (recent alumni posts)
// @route   GET /api/community-posts/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ role: 'alumni', isAnonymous: false })
      .populate('originalAuthor', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const result = posts.map(p => ({
      _id: p._id,
      title: p.content?.substring(0, 80) + (p.content?.length > 80 ? '...' : ''),
      category: p.category,
      authorName: p.originalAuthor?.name || 'Alumni',
      createdAt: p.createdAt
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  reactToPost,
  commentPost,
  savePost,
  resolvePost,
  deletePost,
  saveDraft,
  getDraft,
  deleteDraft,
  uploadFile,
  votePoll,
  getTrendingTopics,
  getActiveAlumni,
  getSuggestedDiscussions,
  getAnnouncements
};
