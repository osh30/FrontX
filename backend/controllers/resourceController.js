const Resource = require('../models/Resource');
const ResourceBookmark = require('../models/ResourceBookmark');
const ResourceInteraction = require('../models/ResourceInteraction');
const ResourceRating = require('../models/ResourceRating');
const User = require('../models/User');
const Activity = require('../models/Activity');

const getResources = async (req, res) => {
  try {
    const { category, search, tags, fileType, sort, page = 1, limit = 20 } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
    if (tags) query.tags = { $in: tags.split(',') };
    if (fileType) query.fileType = fileType;

    let sortObj = { isFeatured: -1, createdAt: -1 };
    if (sort === 'most-downloaded') sortObj = { downloads: -1 };
    else if (sort === 'most-viewed') sortObj = { views: -1 };
    else if (sort === 'highest-rated') sortObj = { averageRating: -1, ratingCount: -1 };
    else if (sort === 'oldest') sortObj = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate('alumniId', 'name profilePicture department')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Resource.countDocuments(query)
    ]);

    const resourceIds = resources.map(r => r._id);
    const [bookmarks, interactions, ratings] = await Promise.all([
      ResourceBookmark.find({ user: req.user.id, resource: { $in: resourceIds } }).lean(),
      ResourceInteraction.find({ user: req.user.id, resource: { $in: resourceIds } }).lean(),
      ResourceRating.find({ user: req.user.id, resource: { $in: resourceIds } }).lean()
    ]);

    const bookmarkSet = new Set(bookmarks.map(b => b.resource.toString()));
    const interactionMap = {};
    interactions.forEach(i => { interactionMap[i.resource.toString()] = i; });
    const ratingMap = {};
    ratings.forEach(r => { ratingMap[r.resource.toString()] = r; });

    const enriched = resources.map(r => {
      const id = r._id.toString();
      const isRecentlyUpdated = new Date(r.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return {
        ...r,
        isBookmarked: bookmarkSet.has(id),
        userRating: ratingMap[id] ? ratingMap[id].rating : null,
        userProgress: interactionMap[id] ? interactionMap[id].readingProgress : 0,
        isRecentlyUpdated
      };
    });

    res.json({ resources: enriched, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('alumniId', 'name profilePicture department bio careerInterest')
      .lean();

    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const [bookmark, interaction, userRating] = await Promise.all([
      ResourceBookmark.findOne({ user: req.user.id, resource: req.params.id }).lean(),
      ResourceInteraction.findOneAndUpdate(
        { user: req.user.id, resource: req.params.id },
        { $setOnInsert: { viewedAt: new Date() }, $set: { viewedAt: new Date() } },
        { upsert: true, new: true }
      ).lean(),
      ResourceRating.findOne({ user: req.user.id, resource: req.params.id }).lean()
    ]);

    await Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const io = req.app.get('io');
    if (io) io.emit('resource_viewed', { resourceId: req.params.id, userId: req.user.id });

    const isRecentlyUpdated = new Date(resource.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    res.json({
      ...resource,
      isBookmarked: !!bookmark,
      userProgress: interaction?.readingProgress || 0,
      userRating: userRating?.rating || null,
      isRecentlyUpdated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createResource = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can upload resources.' });
    }

    const { title, description, category, targetAudience, tags, uploadType, externalLink, readingTime, whyUse, isFeatured } = req.body;

    let fileUrl = null, fileType = null, fileSize = null;
    if (uploadType === 'File' && req.file) {
      const ext = req.file.originalname.split('.').pop().toLowerCase();
      fileType = ext === 'pdf' ? 'PDF' : ext === 'doc' || ext === 'docx' ? 'DOCX' : ext === 'ppt' || ext === 'pptx' ? 'PPT' : ext === 'xls' || ext === 'xlsx' ? 'XLSX' : ext === 'zip' ? 'ZIP' : ext.toUpperCase();
      fileSize = req.file.size ? `${(req.file.size / (1024 * 1024)).toFixed(1)} MB` : null;
      const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
      const result = await uploadToCloudinary(req.file, 'frontx/resources');
      fileUrl = result.secure_url;
    }

    const resource = await Resource.create({
      title, description, category,
      targetAudience: targetAudience ? (Array.isArray(targetAudience) ? targetAudience : JSON.parse(targetAudience)) : [],
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      uploadType, fileUrl, fileType, fileSize, externalLink, readingTime, whyUse,
      isFeatured: isFeatured === true || isFeatured === 'true',
      alumniId: req.user.id
    });

    const populated = await Resource.findById(resource._id).populate('alumniId', 'name profilePicture department').lean();

    await Activity.create({
      user: req.user.id,
      title: `shared a resource: ${title}`,
      type: 'career',
      color: 'bg-blue-100 text-blue-600',
      relatedId: resource._id,
      isGlobal: true
    });

    const io = req.app.get('io');
    if (io) io.emit('new_resource', populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const trackDownload = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    await ResourceInteraction.findOneAndUpdate(
      { user: req.user.id, resource: req.params.id },
      { $set: { downloadedAt: new Date() } },
      { upsert: true }
    );

    const io = req.app.get('io');
    if (io) io.emit('resource_downloaded', { resourceId: req.params.id, userId: req.user.id, downloads: resource.downloads });

    res.json({ downloads: resource.downloads });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const existing = await ResourceBookmark.findOne({ user: req.user.id, resource: req.params.id });
    if (existing) {
      await existing.deleteOne();
      await Resource.findByIdAndUpdate(req.params.id, { $inc: { bookmarks: -1 } });
      const io = req.app.get('io');
      if (io) io.emit('resource_bookmarked', { resourceId: req.params.id, userId: req.user.id, bookmarked: false });
      return res.json({ bookmarked: false });
    }
    await ResourceBookmark.create({ user: req.user.id, resource: req.params.id });
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { bookmarks: 1 } });
    const io = req.app.get('io');
    if (io) io.emit('resource_bookmarked', { resourceId: req.params.id, userId: req.user.id, bookmarked: true });
    res.json({ bookmarked: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rateResource = async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    await ResourceRating.findOneAndUpdate(
      { user: req.user.id, resource: req.params.id },
      { $set: { rating, review: review || '' } },
      { upsert: true }
    );

    const stats = await ResourceRating.aggregate([
      { $match: { resource: require('mongoose').Types.ObjectId.createFromHexString(req.params.id) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const avg = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : rating;
    const count = stats.length > 0 ? stats[0].count : 1;

    await Resource.findByIdAndUpdate(req.params.id, { averageRating: avg, ratingCount: count });

    const io = req.app.get('io');
    if (io) io.emit('resource_rated', { resourceId: req.params.id, userId: req.user.id, averageRating: avg, ratingCount: count });

    res.json({ averageRating: avg, ratingCount: count, userRating: rating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateReadingProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    if (progress === undefined || progress < 0 || progress > 100) return res.status(400).json({ message: 'Progress must be between 0 and 100' });

    const interaction = await ResourceInteraction.findOneAndUpdate(
      { user: req.user.id, resource: req.params.id },
      { $set: { readingProgress: progress } },
      { upsert: true, new: true }
    );

    res.json({ readingProgress: interaction.readingProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getContinueReading = async (req, res) => {
  try {
    const interactions = await ResourceInteraction.find({
      user: req.user.id,
      readingProgress: { $gt: 0, $lt: 100 }
    }).populate({
      path: 'resource',
      populate: { path: 'alumniId', select: 'name profilePicture department' }
    }).sort({ updatedAt: -1 }).limit(10).lean();

    const resourceIds = interactions.map(i => i.resource._id);
    const bookmarks = await ResourceBookmark.find({ user: req.user.id, resource: { $in: resourceIds } }).lean();
    const bookmarkSet = new Set(bookmarks.map(b => b.resource.toString()));

    const resources = interactions.map(i => ({
      ...i.resource,
      userProgress: i.readingProgress,
      isBookmarked: bookmarkSet.has(i.resource._id.toString())
    }));

    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSavedResources = async (req, res) => {
  try {
    const bookmarks = await ResourceBookmark.find({ user: req.user.id })
      .populate({
        path: 'resource',
        populate: { path: 'alumniId', select: 'name profilePicture department' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const resources = bookmarks.filter(b => b.resource).map(b => ({
      ...b.resource,
      isBookmarked: true
    }));

    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecommended = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const dept = user?.department || '';
    const interests = user?.interests || [];

    const downloaded = await ResourceInteraction.find({ user: req.user.id, downloadedAt: { $ne: null } }).select('resource').lean();
    const downloadedIds = downloaded.map(d => d.resource);

    const tagsFromInterests = interests.map(i => new RegExp(i, 'i'));

    let recommended = await Resource.find({
      _id: { $nin: downloadedIds },
      $or: [
        { category: { $regex: dept, $options: 'i' } },
        { tags: { $in: tagsFromInterests } },
        { targetAudience: { $regex: dept, $options: 'i' } }
      ]
    })
      .populate('alumniId', 'name profilePicture department')
      .sort({ averageRating: -1, downloads: -1 })
      .limit(10)
      .lean();

    if (recommended.length < 5) {
      const fallback = await Resource.find({ _id: { $nin: [...downloadedIds, ...recommended.map(r => r._id)] } })
        .populate('alumniId', 'name profilePicture department')
        .sort({ views: -1 })
        .limit(10 - recommended.length)
        .lean();
      recommended = [...recommended, ...fallback];
    }

    const resourceIds = recommended.map(r => r._id);
    const bookmarks = await ResourceBookmark.find({ user: req.user.id, resource: { $in: resourceIds } }).lean();
    const bookmarkSet = new Set(bookmarks.map(b => b.resource.toString()));

    res.json(recommended.map(r => ({ ...r, isBookmarked: bookmarkSet.has(r._id.toString()) })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTrending = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const resources = await Resource.find({ createdAt: { $gte: sevenDaysAgo } })
      .populate('alumniId', 'name profilePicture department')
      .sort({ views: -1, downloads: -1 })
      .limit(10)
      .lean();

    const resourceIds = resources.map(r => r._id);
    const bookmarks = await ResourceBookmark.find({ user: req.user.id, resource: { $in: resourceIds } }).lean();
    const bookmarkSet = new Set(bookmarks.map(b => b.resource.toString()));

    res.json(resources.map(r => ({ ...r, isBookmarked: bookmarkSet.has(r._id.toString()) })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecentlyUploaded = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('alumniId', 'name profilePicture department')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const resourceIds = resources.map(r => r._id);
    const bookmarks = await ResourceBookmark.find({ user: req.user.id, resource: { $in: resourceIds } }).lean();
    const bookmarkSet = new Set(bookmarks.map(b => b.resource.toString()));

    res.json(resources.map(r => ({ ...r, isBookmarked: bookmarkSet.has(r._id.toString()) })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMostDownloaded = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('alumniId', 'name profilePicture department')
      .sort({ downloads: -1 })
      .limit(10)
      .lean();

    const resourceIds = resources.map(r => r._id);
    const bookmarks = await ResourceBookmark.find({ user: req.user.id, resource: { $in: resourceIds } }).lean();
    const bookmarkSet = new Set(bookmarks.map(b => b.resource.toString()));

    res.json(resources.map(r => ({ ...r, isBookmarked: bookmarkSet.has(r._id.toString()) })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const shareResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, { $inc: { shareCount: 1 } }, { new: true });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const io = req.app.get('io');
    if (io) io.emit('resource_shared', { resourceId: req.params.id, userId: req.user.id, shareCount: resource.shareCount });

    res.json({ shareCount: resource.shareCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.alumniId.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const { title, description, category, targetAudience, tags, readingTime, whyUse, isFeatured } = req.body;
    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (category !== undefined) resource.category = category;
    if (targetAudience !== undefined) resource.targetAudience = Array.isArray(targetAudience) ? targetAudience : JSON.parse(targetAudience);
    if (tags !== undefined) resource.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (readingTime !== undefined) resource.readingTime = readingTime;
    if (whyUse !== undefined) resource.whyUse = whyUse;
    if (isFeatured !== undefined) resource.isFeatured = isFeatured === true || isFeatured === 'true';

    await resource.save();

    const populated = await Resource.findById(resource._id).populate('alumniId', 'name profilePicture department').lean();
    const io = req.app.get('io');
    if (io) io.emit('resource:updated', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.alumniId.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Not authorized' });

    await Promise.all([
      ResourceBookmark.deleteMany({ resource: req.params.id }),
      ResourceInteraction.deleteMany({ resource: req.params.id }),
      ResourceRating.deleteMany({ resource: req.params.id }),
      resource.deleteOne()
    ]);

    const io = req.app.get('io');
    if (io) io.emit('resource:deleted', { resourceId: req.params.id });

    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  trackDownload,
  toggleBookmark,
  rateResource,
  updateReadingProgress,
  getContinueReading,
  getSavedResources,
  getRecommended,
  getTrending,
  getRecentlyUploaded,
  getMostDownloaded,
  shareResource,
  updateResource,
  deleteResource
};
