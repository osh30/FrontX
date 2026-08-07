const AdminResource = require('../models/AdminResource');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

const getAdminResources = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [resources, total] = await Promise.all([
      AdminResource.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AdminResource.countDocuments(query)
    ]);

    res.json({
      success: true,
      resources,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get admin resources error:', error);
    res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
  }
};

const getPublicResources = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    let query = { status: 'published', visibility: 'public' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [resources, total] = await Promise.all([
      AdminResource.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AdminResource.countDocuments(query)
    ]);

    res.json({
      success: true,
      resources,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get public resources error:', error);
    res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
  }
};

const getMyResources = async (req, res) => {
  try {
    const resources = await AdminResource.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, resources });
  } catch (error) {
    console.error('Get my resources error:', error);
    res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
  }
};

const createResource = async (req, res) => {
  try {
    let { title, category, shortDescription, description, department, tags } = req.body;

    if (!title || !category || !shortDescription || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let pdfUrl = req.body.pdfUrl;
    const files = req.files || {};
    if (files.pdf && files.pdf[0]) {
      const result = await uploadToCloudinary(files.pdf[0], 'admin_resources');
      pdfUrl = result.secure_url;
    }

    if (!pdfUrl) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    let coverImage = req.body.coverImage || '';
    if (files.coverImage && files.coverImage[0]) {
      const result = await uploadToCloudinary(files.coverImage[0], 'admin_resources/covers');
      coverImage = result.secure_url;
    }

    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch { tags = []; }
    }

    const isAlumni = req.user.role === 'alumni';

    const resource = await AdminResource.create({
      title: title.trim(),
      category,
      shortDescription: shortDescription.trim(),
      description,
      department: department || 'Educational Technology and Engineering',
      pdfUrl,
      coverImage,
      tags: tags || [],
      uploadedBy: req.user.id,
      uploadedByRole: isAlumni ? 'alumni' : 'admin'
    });

    const io = req.app.get('io');
    if (io) io.emit('new_resource', { resourceId: resource._id });

    res.status(201).json({ success: true, resource });
  } catch (error) {
    console.error('Create admin resource error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ message: 'Failed to create resource', error: error.message });
  }
};

const updateResource = async (req, res) => {
  try {
    const { title, category, shortDescription, description, department, pdfUrl, coverImage, tags, visibility, status } = req.body;

    const resource = await AdminResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }

    if (title !== undefined) resource.title = title.trim();
    if (category !== undefined) resource.category = category;
    if (shortDescription !== undefined) resource.shortDescription = shortDescription.trim();
    if (description !== undefined) resource.description = description;
    if (department !== undefined) resource.department = department;
    if (pdfUrl !== undefined) resource.pdfUrl = pdfUrl;
    if (coverImage !== undefined) resource.coverImage = coverImage;
    if (tags !== undefined) resource.tags = tags;
    if (visibility !== undefined) resource.visibility = visibility;
    if (status !== undefined) resource.status = status;

    await resource.save();

    const io = req.app.get('io');
    if (io) io.emit('resource:updated', { resourceId: resource._id });

    res.json({ success: true, resource });
  } catch (error) {
    console.error('Update admin resource error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ message: 'Failed to update resource', error: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await AdminResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await Promise.all([
      deleteFromCloudinary(resource.pdfUrl),
      deleteFromCloudinary(resource.coverImage)
    ]);

    await AdminResource.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) io.emit('resource:deleted', { resourceId: req.params.id });

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete admin resource error:', error);
    res.status(500).json({ message: 'Failed to delete resource', error: error.message });
  }
};

const addAttachmentFlag = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace(/\/upload\//, '/upload/fl_attachment/');
};

const downloadResource = async (req, res) => {
  try {
    const resource = await AdminResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    resource.downloadsCount += 1;
    await resource.save();

    const downloadUrl = addAttachmentFlag(resource.pdfUrl);

    res.json({ success: true, downloadsCount: resource.downloadsCount, pdfUrl: resource.pdfUrl, downloadUrl });
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({ message: 'Failed to process download', error: error.message });
  }
};

module.exports = {
  getAdminResources,
  getPublicResources,
  getMyResources,
  createResource,
  updateResource,
  deleteResource,
  downloadResource
};
