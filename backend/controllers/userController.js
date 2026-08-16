const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');
const { recalculateProgress } = require('../utils/progressCalculator');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // Update fields based on what was sent
      user.name = req.body.name || user.name;
      user.department = req.body.department || user.department;
      user.session = req.body.session || user.session;
      user.studentId = req.body.studentId || user.studentId;
      user.graduationYear = req.body.graduationYear || user.graduationYear;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.careerInterest = req.body.careerInterest !== undefined ? req.body.careerInterest : user.careerInterest;
      user.interests = req.body.interests || user.interests;
      user.githubLink = req.body.githubLink !== undefined ? req.body.githubLink : user.githubLink;
      user.portfolioLink = req.body.portfolioLink !== undefined ? req.body.portfolioLink : user.portfolioLink;
      
      // Clean up string _id created by frontend for new items so Mongoose creates ObjectIds
      const cleanIds = (arr) => arr?.map(item => {
        if (item._id && typeof item._id === 'string' && !item._id.match(/^[0-9a-fA-F]{24}$/)) {
          const { _id, ...rest } = item;
          return rest;
        }
        return item;
      });

      // Update arrays completely
      if (req.body.projects) user.projects = cleanIds(req.body.projects);
      if (req.body.research) user.research = cleanIds(req.body.research);
      if (req.body.certificates) user.certificates = cleanIds(req.body.certificates);
      
      // Keep existing avatar/resume if not explicitly provided
      if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;
      if (req.body.resumeUrl !== undefined) user.resumeUrl = req.body.resumeUrl;

      const updatedUser = await user.save();
      
      if (req.app.get('io') && updatedUser.role === 'student') {
        req.app.get('io').emit('student_updated');
      }

      await recalculateProgress(req.user.id);
      const io = req.app.get('io');
      if (io) {
        io.emit('progress_updated', { userId: req.user.id });
        io.emit('profile_updated', { userId: updatedUser._id });
      }

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload file to Cloudinary
// @route   POST /api/users/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    
    // Determine folder based on file type or fieldname
    const folder = 'frontx/' + (req.body.folder || 'misc');
    
    const result = await uploadToCloudinary(req.file, folder);
    
    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload file', error: error.message });
  }
};

// @desc    Remove profile picture
// @route   DELETE /api/users/profile-picture
// @access  Private
const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldUrl = user.profilePicture;
    user.profilePicture = '';
    await user.save();

    // Delete from Cloudinary in background
    if (oldUrl) {
      deleteFromCloudinary(oldUrl).catch(err => console.error('Cloudinary delete error:', err));
    }

    if (req.app.get('io')) {
      req.app.get('io').emit('profile_updated', { userId: user._id });
      if (user.role === 'student') {
        req.app.get('io').emit('student_updated');
      }
    }

    res.json({ success: true, message: 'Profile picture removed', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all mentors (Alumni)
// @route   GET /api/users/mentors
// @access  Private
const getMentors = async (req, res) => {
  try {
    const { search, department, graduationYear, page = 1, limit = 10 } = req.query;

    const query = { role: 'alumni' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { careerInterest: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { interests: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    if (graduationYear) {
      query.graduationYear = graduationYear;
    }

    const total = await User.countDocuments(query);
    const mentors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const rawDepartments = await User.distinct('department', { role: 'alumni', department: { $ne: null, $ne: '' } });
    const departments = rawDepartments.filter(d => d !== 'CS' && d !== 'EEE' && d !== 'CSE' && d !== 'Computer Science');

    res.json({
      mentors,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      departments: departments.sort()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all connected recruiters
// @route   GET /api/users/recruiters
// @access  Private
const getRecruiters = async (req, res) => {
  try {
    let recruiters = await User.find({ role: 'recruiter' }).select('-password').lean();

    // If no recruiters found in DB, ensure real recruiters exist
    if (!recruiters || recruiters.length === 0) {
      try {
        const ensureRealRecruiters = require('../scripts/ensureRealRecruiters');
        if (typeof ensureRealRecruiters === 'function') {
          await ensureRealRecruiters();
        }
      } catch (e) {
        console.error('Ensure recruiters error:', e.message);
      }
      recruiters = await User.find({ role: 'recruiter' }).select('-password').lean();
    }

    const Opportunity = require('../models/Opportunity');

    // Auto-seed ShopUp opportunities if missing in DB
    const shopUpCount = await Opportunity.countDocuments({ companyName: /ShopUp/i });
    if (shopUpCount === 0) {
      try {
        const seedShopUpOpportunities = require('../scripts/seedShopUpOpportunities');
        if (typeof seedShopUpOpportunities === 'function') {
          await seedShopUpOpportunities();
        }
      } catch (e) {
        console.error('Seed ShopUp error:', e.message);
      }
    }

    const enrichedRecruiters = await Promise.all(recruiters.map(async (r) => {
      const opportunities = await Opportunity.find({
        $or: [
          { recruiter: r._id },
          { companyName: { $regex: new RegExp(`^${(r.companyName || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
        ]
      }).select('title opportunityType type location category deadline status companyName').lean();

      const mappedOpps = opportunities.map(o => ({
        ...o,
        type: o.type || o.opportunityType
      }));

      return {
        ...r,
        activeJobsCount: mappedOpps.length,
        opportunities: mappedOpps
      };
    }));

    res.json(enrichedRecruiters);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ message: 'Invalid password input' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password against the existing bcrypt hash
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the current password' });
    }

    // Password strength validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.'
      });
    }

    // Assign the plaintext new password; the pre-save hook hashes it with bcrypt
    // and permanently replaces the stored hash in MongoDB.
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Soft-delete account (mark as inactive)
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password confirmation is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password. Account not deleted.' });
    }

    user.isActive = false;
    user.status = 'suspended';
    user.deletedAt = new Date();
    await user.save();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update theme preference
// @route   PUT /api/users/theme
// @access  Private
const updateTheme = async (req, res) => {
  try {
    const { themePreference } = req.body;
    
    if (!['light', 'dark', 'system'].includes(themePreference)) {
      return res.status(400).json({ message: 'Invalid theme preference' });
    }

    const user = await User.findById(req.user.id);
    if (user) {
      user.themePreference = themePreference;
      await user.save();
      res.json({ themePreference: user.themePreference });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send email / message inquiry to a recruiter
// @route   POST /api/users/send-recruiter-email
// @access  Private
const sendRecruiterEmail = async (req, res) => {
  try {
    const { recruiterEmail, recruiterId, subject, message } = req.body;
    if (!recruiterEmail || !subject || !message) {
      return res.status(400).json({ message: 'Recruiter email, subject, and message are required.' });
    }

    const Notification = require('../models/Notification');
    const recruiter = await User.findOne({
      $or: [
        { email: recruiterEmail.toLowerCase() },
        { _id: recruiterId && recruiterId.match(/^[0-9a-fA-F]{24}$/) ? recruiterId : null }
      ].filter(Boolean)
    });

    // Notify recruiter inside FrontX platform
    if (recruiter) {
      await Notification.create({
        user: recruiter._id,
        senderUserId: req.user._id || req.user.id,
        title: `New Student Inquiry: ${subject}`,
        message: `Student ${req.user.name || 'A student'} (${req.user.email}) sent: "${message.substring(0, 150)}..."`,
        type: 'opportunity',
        relatedId: req.user._id || req.user.id
      });
    }

    // Send email via nodemailer if SMTP config exists
    try {
      const nodemailer = require('nodemailer');
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: `"FrontX Platform" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: recruiterEmail,
          replyTo: req.user.email,
          subject: subject,
          text: `From Student: ${req.user.name} (${req.user.email})\n\nMessage:\n${message}\n\nSent via FrontX Platform`
        });
      }
    } catch (emailErr) {
      console.log('SMTP send note (non-blocking):', emailErr.message);
    }

    res.json({ success: true, message: `Email inquiry successfully sent to ${recruiterEmail}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadFile,
  removeProfilePicture,
  getMentors,
  getStudents,
  getRecruiters,
  getUserById,
  changePassword,
  deleteAccount,
  sendRecruiterEmail
};
