const CollaborationPost = require('../models/CollaborationPost');
const CollaborationApplication = require('../models/CollaborationApplication');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Activity = require('../models/Activity');
const Deadline = require('../models/Deadline');
const Notification = require('../models/Notification');

// @desc    Check whether a collaboration post's application deadline has passed
const isDeadlinePassed = (post) =>
  !!post && !!post.deadline && new Date(post.deadline) < new Date();

// @desc    Create a new collaboration post
// @route   POST /api/collaboration
// @access  Private (Alumni only)
const generateResearchId = () => {
  const prefix = 'RES';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const createPost = async (req, res) => {
  try {
    const { 
      title, type, domain, overview, whyItMatters, 
      responsibilities, requiredSkills, experienceLevel, 
      studentCount, duration, outcomes, benefits, deadline 
    } = req.body;
    
    // Validate user is alumni
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can create collaboration posts.' });
    }

    let researchId;
    let isUnique = false;
    while (!isUnique) {
      researchId = generateResearchId();
      const existing = await CollaborationPost.findOne({ researchId });
      if (!existing) isUnique = true;
    }

    const post = new CollaborationPost({
      researchId,
      alumni: req.user.id,
      title,
      type,
      domain,
      overview,
      whyItMatters,
      responsibilities,
      requiredSkills,
      experienceLevel,
      studentCount,
      duration,
      outcomes,
      benefits,
      deadline
    });

    await post.save();

    const populated = await CollaborationPost.findById(post._id)
      .populate('alumni', 'name department profilePicture');

    // Create Global Activity
    const activity = await Activity.create({
      user: req.user.id,
      title: `published a new research collaboration: ${title}`,
      type: 'collaboration',
      color: 'bg-purple-100 text-purple-600',
      relatedId: post._id,
      isGlobal: true
    });
    await activity.populate('user', 'name profilePicture');
    
    const io = req.app.get('io');
    if (io) {
      io.emit('new_global_activity', activity);
      // Emit to all connected clients so students see new research in real-time
      io.emit('research:new', populated.toObject());
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all active collaboration posts
// @route   GET /api/collaboration
// @access  Private
const getPosts = async (req, res) => {
  try {
    try {
      const count = await CollaborationPost.countDocuments();
      if (count < 10) {
        const seed10 = require('../scripts/seed7AlumniCollaborations');
        if (typeof seed10 === 'function') await seed10();
      }
    } catch (e) {
      console.error('Auto-seed 7 collaborations error:', e.message);
    }

    const posts = await CollaborationPost.find({ status: 'active' })
      .populate('alumni', 'name department profilePicture bio session')
      .sort({ createdAt: -1 });
    
    // Optionally calculate applicant count for each post
    const postsWithCount = await Promise.all(posts.map(async (post) => {
      const count = await CollaborationApplication.countDocuments({ post: post._id });
      return { ...post.toObject(), applicantCount: count, isExpired: isDeadlinePassed(post) };
    }));

    res.json(postsWithCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get posts created by logged-in alumni
// @route   GET /api/collaboration/alumni
// @access  Private (Alumni only)
const getAlumniPosts = async (req, res) => {
  try {
    const posts = await CollaborationPost.find({ alumni: req.user.id })
      .sort({ createdAt: -1 });

    const postsWithCount = await Promise.all(posts.map(async (post) => {
      const count = await CollaborationApplication.countDocuments({ post: post._id });
      return { ...post.toObject(), applicantCount: count, isExpired: isDeadlinePassed(post) };
    }));

    res.json(postsWithCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single collaboration post by ID
// @route   GET /api/collaboration/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await CollaborationPost.findById(req.params.id)
      .populate('alumni', 'name department profilePicture bio session email graduationYear careerInterest interests');

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const applicantCount = await CollaborationApplication.countDocuments({ post: post._id, status: 'pending' });

    res.json({ ...post.toObject(), applicantCount, isExpired: isDeadlinePassed(post) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a collaboration post
// @route   PUT /api/collaboration/:id
// @access  Private (Alumni owner only)
const updatePost = async (req, res) => {
  try {
    const post = await CollaborationPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.alumni.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post.' });
    }

    const { 
      title, type, domain, overview, whyItMatters, 
      responsibilities, requiredSkills, experienceLevel, 
      studentCount, duration, outcomes, benefits, deadline, status 
    } = req.body;

    if (title !== undefined) post.title = title;
    if (type !== undefined) post.type = type;
    if (domain !== undefined) post.domain = domain;
    if (overview !== undefined) post.overview = overview;
    if (whyItMatters !== undefined) post.whyItMatters = whyItMatters;
    if (responsibilities !== undefined) post.responsibilities = responsibilities;
    if (requiredSkills !== undefined) post.requiredSkills = requiredSkills;
    if (experienceLevel !== undefined) post.experienceLevel = experienceLevel;
    if (studentCount !== undefined) post.studentCount = studentCount;
    if (duration !== undefined) post.duration = duration;
    if (outcomes !== undefined) post.outcomes = outcomes;
    if (benefits !== undefined) post.benefits = benefits;
    if (deadline !== undefined) post.deadline = deadline;
    if (status !== undefined) post.status = status;

    await post.save();

    const populated = await CollaborationPost.findById(post._id)
      .populate('alumni', 'name department profilePicture');

    const io = req.app.get('io');
    if (io) {
      io.emit('research:updated', populated.toObject());
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a collaboration post
// @route   DELETE /api/collaboration/:id
// @access  Private (Alumni owner only)
const deletePost = async (req, res) => {
  try {
    const post = await CollaborationPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.alumni.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

    // Delete all applications for this post
    await CollaborationApplication.deleteMany({ post: post._id });

    await CollaborationPost.findByIdAndDelete(post._id);

    const io = req.app.get('io');
    if (io) {
      io.emit('research:deleted', { postId: req.params.id });
    }

    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Apply for a collaboration post
// @route   POST /api/collaboration/:id/apply
// @access  Private (Student only)
const applyForPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { motivation, relevantSkills, githubLink, portfolioLink, cvUrl, weeklyAvailability } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply.' });
    }

    const post = await CollaborationPost.findById(postId);
    if (!post || post.status !== 'active') {
      return res.status(404).json({ message: 'Post not found or closed.' });
    }

    // Enforce the real collaboration deadline from MongoDB.
    // Never trust the client to check the date — block expired posts here.
    if (isDeadlinePassed(post)) {
      return res.status(400).json({
        message: 'Applications are closed. The deadline for this collaboration has passed.',
        code: 'APPLICATION_CLOSED'
      });
    }

    // Check if already applied
    const existing = await CollaborationApplication.findOne({ post: postId, student: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this collaboration.' });
    }

    const application = new CollaborationApplication({
      post: postId,
      student: req.user.id,
      alumni: post.alumni,
      motivation,
      relevantSkills,
      githubLink,
      portfolioLink,
      cvUrl,
      weeklyAvailability
    });

    await application.save();

    await Activity.create({
      user: req.user.id,
      title: `Applied for research collaboration: ${post.title}`,
      type: 'collaboration',
      color: 'bg-blue-100 text-blue-600'
    });

    // Notify the alumni via Notification + Socket.io
    const alumniUser = await User.findById(post.alumni);
    if (alumniUser) {
      const notification = await Notification.create({
        user: post.alumni,
        senderUserId: req.user.id,
        title: 'New Research Application',
        message: `${user.name} applied for "${post.title}"`,
        type: 'application',
        relatedId: application._id
      });

      const io = req.app.get('io');
      if (io) {
        io.to(post.alumni.toString()).emit('new_notification');
        io.to(post.alumni.toString()).emit('application:received', {
          applicationId: application._id,
          postId: post._id,
          postTitle: post.title,
          studentName: user.name
        });
      }
    }

    const populatedApp = await CollaborationApplication.findById(application._id)
      .populate('student', 'name email department profilePicture')
      .populate('post', 'title researchId');

    res.status(201).json(populatedApp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get applications for a post (for alumni)
// @route   GET /api/collaboration/:id/applications
// @access  Private (Alumni only)
const getPostApplications = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await CollaborationPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    
    if (post.alumni.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications.' });
    }

    const applications = await CollaborationApplication.find({ post: postId })
      .populate('student', 'name department session profilePicture skills interests bio')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Check if current student has already applied for a post
// @route   GET /api/collaboration/:id/my-application
// @access  Private (Student only)
const getMyApplication = async (req, res) => {
  try {
    const application = await CollaborationApplication.findOne({
      post: req.params.id,
      student: req.user.id
    });
    res.json({ hasApplied: !!application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/collaboration/applications/:appId/status
// @access  Private (Alumni only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    const application = await CollaborationApplication.findById(appId).populate('alumni', 'name');
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (application.alumni._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    application.status = status;
    await application.save();

    const post = await CollaborationPost.findById(application.post);
    let message = '';
    let title = '';

    if (status === 'accepted') {
      title = 'Research Application Accepted!';
      message = `Congratulations!\n\nYou have been selected for the research collaboration:\n${post.title}\n\nMentor:\n${application.alumni.name || 'Your Mentor'}`;
    } else if (status === 'rejected') {
      title = 'Application Declined';
      message = `Your application for the research collaboration "${post.title}" was declined. Keep applying for other opportunities!`;
    }

    if (title && message) {
      await Notification.create({
        user: application.student,
        title,
        message,
        type: 'application',
        relatedId: application.post
      });
      
      // Emit socket notification and application update
      if (req.app.get('io')) {
        const io = req.app.get('io');
        io.to(application.student.toString()).emit('new_notification');
        io.to(application.student.toString()).emit('application:updated', {
          applicationId: application._id,
          postId: application.post,
          postTitle: post.title,
          status: application.status,
          title,
          message
        });
      }
    }

    if (status === 'accepted') {
      await Activity.create({
        user: application.alumni._id,
        title: `Accepted student for research: ${post.title}`,
        type: 'collaboration',
        color: 'bg-green-100 text-green-600'
      });
      await Activity.create({
        user: application.student,
        title: `Selected for research: ${post.title}`,
        type: 'collaboration',
        color: 'bg-green-100 text-green-600'
      });

      const { recalculateProgress } = require('../utils/progressCalculator');
      await recalculateProgress(application.student);
      if (req.app.get('io')) {
        req.app.get('io').emit('progress_updated', { userId: application.student });
      }
    }

    res.json({ message: `Application ${status} successfully.`, application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getAlumniPosts,
  getPostById,
  updatePost,
  deletePost,
  applyForPost,
  getPostApplications,
  getMyApplication,
  updateApplicationStatus
};
