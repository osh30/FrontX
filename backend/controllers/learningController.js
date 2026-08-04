const RecommendedLearning = require('../models/RecommendedLearning');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

// Get all recommended learning items
exports.getLearnings = async (req, res) => {
  try {
    const { type, search } = req.query;
    
    let query = {};
    if (type && type !== 'All') {
      query.type = type;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const learnings = await RecommendedLearning.find(query)
      .populate('adminId', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(learnings);
  } catch (error) {
    console.error("Error fetching recommended learning:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single learning item by ID
exports.getLearning = async (req, res) => {
  try {
    const learning = await RecommendedLearning.findById(req.params.id)
      .populate('adminId', 'name profilePicture department')
      .lean();
    if (!learning) {
      return res.status(404).json({ message: "Learning content not found" });
    }
    res.json(learning);
  } catch (error) {
    console.error("Error fetching learning:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new recommended learning item
exports.createLearning = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Only administrators can publish recommended learning." });
    }

    const { title, description, type, externalLink, tags } = req.body;
    let fileUrl = null;
    let coverImage = null;

    // Handle multiple file uploads if sent (coverImage and fileUrl)
    // If sent using upload.fields([{name: 'coverImage'}, {name: 'file'}])
    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        const result = await uploadToCloudinary(req.files.coverImage[0], 'learning_covers');
        coverImage = result.secure_url;
      }
      if (req.files.file && req.files.file.length > 0) {
        const result = await uploadToCloudinary(req.files.file[0], 'learning_files');
        fileUrl = result.secure_url;
      }
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(t => t.trim());
      }
    }

    const newLearning = new RecommendedLearning({
      title,
      description,
      type,
      externalLink: externalLink || null,
      fileUrl,
      coverImage,
      tags: parsedTags,
      adminId: req.user.id
    });

    const savedLearning = await newLearning.save();
    await savedLearning.populate('adminId', 'name profilePicture');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('new_learning', savedLearning);
    }

    res.status(201).json(savedLearning);
  } catch (error) {
    console.error("Error creating recommended learning:", error);
    res.status(500).json({ message: "Failed to create recommended learning" });
  }
};
