const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Employment = require('../models/Employment');
const Notification = require('../models/Notification');
const Deadline = require('../models/Deadline');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');
const meetingService = require('../meetings/services/meetingService');
const { computeScheduleWindow } = require('../meetings/lib/meetingTime');

// ─── Middleware: ensure only recruiters access these handlers ───
const requireRecruiter = (req, res) => {
  if (!req.user || req.user.role !== 'recruiter') {
    res.status(403).json({ message: 'Access denied. Recruiter account required.' });
    return false;
  }
  return true;
};

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════

const getDashboard = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const recruiterId = req.user.id;

    const [totalOpportunities, activeOpportunities, totalApplicants, scheduledInterviews] = await Promise.all([
      Opportunity.countDocuments({ recruiter: recruiterId }),
      Opportunity.countDocuments({ recruiter: recruiterId, status: 'active' }),
      Application.countDocuments({ recruiter: recruiterId }),
      Interview.countDocuments({ recruiter: recruiterId, status: 'scheduled', date: { $gte: new Date() } })
    ]);

    const recentApplications = await Application.find({ recruiter: recruiterId })
      .populate('student', 'name email profilePicture department session')
      .populate('opportunity', 'title type')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const upcomingInterviews = await Interview.find({
      recruiter: recruiterId,
      status: 'scheduled',
      date: { $gte: new Date() }
    })
      .populate('student', 'name email profilePicture')
      .populate('opportunity', 'title')
      .sort({ date: 1, time: 1 })
      .limit(5)
      .lean();

    const recentNotifications = await Notification.find({ user: recruiterId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      stats: {
        totalOpportunities,
        activeOpportunities,
        totalApplicants,
        scheduledInterviews
      },
      recentApplications,
      upcomingInterviews,
      recentNotifications
    });
  } catch (error) {
    console.error('Recruiter dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════

const getProfile = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Get recruiter profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const allowedFields = [
      'name', 'bio', 'profilePicture', 'companyName', 'designation',
      'industryType', 'companyWebsite', 'companyAddress'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// COMPANY PROFILE
// ═══════════════════════════════════════════════════════

const getCompanyProfile = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const user = await User.findById(req.user.id)
      .select('name email companyName designation industryType companyWebsite companyAddress companyLogo officeAddress companyDescription phoneNumber contactPerson verificationStatus status')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const activeJobs = await Opportunity.countDocuments({ recruiter: req.user.id, status: 'active' });

    res.json({ ...user, contactPerson: user.contactPerson || user.name, activeJobs });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ message: 'Failed to fetch company profile', error: error.message });
  }
};

const updateCompanyProfile = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { companyName, industryType, companyWebsite, officeAddress, companyDescription, phoneNumber, contactPerson } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ message: 'Company name is required' });
    }
    if (!industryType || !industryType.trim()) {
      return res.status(400).json({ message: 'Industry type is required' });
    }
    if (!companyDescription || !companyDescription.trim()) {
      return res.status(400).json({ message: 'Company description is required' });
    }
    if (companyDescription.length > 1000) {
      return res.status(400).json({ message: 'Company description must be 1000 characters or less' });
    }
    if (companyWebsite && companyWebsite.trim()) {
      try { new URL(companyWebsite); }
      catch { return res.status(400).json({ message: 'Invalid website URL' }); }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        companyName: companyName.trim(),
        industryType: industryType.trim(),
        companyWebsite: companyWebsite ? companyWebsite.trim() : '',
        officeAddress: officeAddress ? officeAddress.trim() : '',
        companyDescription: companyDescription.trim(),
        phoneNumber: phoneNumber ? phoneNumber.trim() : '',
        contactPerson: contactPerson ? contactPerson.trim() : ''
      },
      { new: true, runValidators: true }
    ).select('name email companyName designation industryType companyWebsite companyAddress companyLogo officeAddress companyDescription phoneNumber contactPerson verificationStatus status');

    if (!user) return res.status(404).json({ message: 'User not found' });

    await Notification.create({
      user: req.user.id,
      title: 'Company Profile Updated',
      message: 'Your company profile has been updated successfully.',
      type: 'system'
    });

    const activeJobs = await Opportunity.countDocuments({ recruiter: req.user.id, status: 'active' });

    res.json({ message: 'Company profile updated successfully', user: { ...user.toObject(), activeJobs } });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({ message: 'Failed to update company profile', error: error.message });
  }
};

const uploadCompanyLogo = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    const result = await uploadToCloudinary(req.file, 'frontx/company-logos');

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { companyLogo: result.secure_url },
      { new: true }
    ).select('companyLogo');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Logo uploaded successfully', companyLogo: user.companyLogo });
  } catch (error) {
    console.error('Upload company logo error:', error);
    res.status(500).json({ message: 'Failed to upload logo' });
  }
};

const removeCompanyLogo = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const user = await User.findById(req.user.id).select('companyLogo');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.companyLogo && user.companyLogo.includes('res.cloudinary.com')) {
      await deleteFromCloudinary(user.companyLogo);
    }

    await User.findByIdAndUpdate(req.user.id, { companyLogo: '' });

    res.json({ message: 'Logo removed successfully' });
  } catch (error) {
    console.error('Remove company logo error:', error);
    res.status(500).json({ message: 'Failed to remove logo' });
  }
};

// ═══════════════════════════════════════════════════════
// OPPORTUNITIES
// ═══════════════════════════════════════════════════════

const getOpportunities = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { status, search, page = 1, limit = 20 } = req.query;
    const query = { recruiter: req.user.id, createdByRole: 'recruiter' };

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Opportunity.countDocuments(query)
    ]);

    res.json({
      opportunities,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ message: 'Failed to fetch opportunities', error: error.message });
  }
};

const getOpportunityById = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const opportunity = await Opportunity.findOne({ _id: req.params.id, recruiter: req.user.id, createdByRole: 'recruiter' }).lean();
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    res.json(opportunity);
  } catch (error) {
    console.error('Get opportunity error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch opportunity', error: error.message });
  }
};

const createOpportunity = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const recruiter = await User.findById(req.user.id).select('companyName companyName');
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    const {
      title, opportunityType, department, location, employmentMode,
      vacancies, salary, deadline, joiningDate, description, eligibility,
      skills, documents
    } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!opportunityType) return res.status(400).json({ message: 'Opportunity type is required' });

    const opportunity = await Opportunity.create({
      recruiter: req.user.id,
      companyId: req.user.id,
      companyName: recruiter.companyName || recruiter.name || 'Unknown',
      title: title.trim(),
      opportunityType,
      department: department || '',
      location: location || '',
      employmentMode: employmentMode || 'On-site',
      vacancies: vacancies || 1,
      salary: salary || { min: 0, max: 0, currency: 'BDT' },
      deadline: deadline || undefined,
      joiningDate: joiningDate || undefined,
      description: description || {},
      eligibility: eligibility || {},
      skills: skills || [],
      documents: documents || [],
      applicationMethod: 'Inside FrontX',
      visibility: ['student', 'alumni'],
      status: 'pending',
      createdByRole: 'recruiter',
      submittedAt: new Date()
    });

    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length > 0) {
      const adminNotifs = admins.map(a => ({
        user: a._id,
        senderUserId: req.user.id,
        title: 'New Opportunity Submitted',
        message: `${recruiter.companyName || 'A recruiter'} submitted "${title.trim()}" for approval.`,
        type: 'opportunity',
        relatedId: opportunity._id
      }));
      await Notification.insertMany(adminNotifs);
    }

    res.status(201).json(opportunity);
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOpportunity = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const opportunity = await Opportunity.findOne({ _id: req.params.id, recruiter: req.user.id, createdByRole: 'recruiter' });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    const allowedUpdates = [
      'title', 'opportunityType', 'department', 'location', 'employmentMode',
      'vacancies', 'salary', 'deadline', 'joiningDate', 'description',
      'eligibility', 'skills', 'documents', 'status'
    ];

    const prevStatus = opportunity.status;

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        opportunity[field] = req.body[field];
      }
    });

    await opportunity.save();

    if (opportunity.status === 'closed' && prevStatus !== 'closed') {
      await Notification.create({
        user: req.user.id,
        title: 'Opportunity Closed',
        message: `"${opportunity.title}" has been closed. It will no longer accept new applications.`,
        type: 'opportunity',
        relatedId: opportunity._id
      });

      const applicants = await Application.find({ opportunity: opportunity._id, status: { $ne: 'withdrawn' } }).select('student');
      const studentIds = [...new Set(applicants.map(a => a.student?.toString()).filter(Boolean))];
      if (studentIds.length > 0) {
        const notifs = studentIds.map(sId => ({
          user: sId,
          senderUserId: req.user.id,
          title: 'Opportunity Closed',
          message: `The opportunity "${opportunity.title}" at ${opportunity.companyName || 'the company'} has been closed.`,
          type: 'opportunity',
          relatedId: opportunity._id
        }));
        await Notification.insertMany(notifs);
      }
    }

    res.json(opportunity);
  } catch (error) {
    console.error('Update opportunity error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to update opportunity', error: error.message });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const opportunity = await Opportunity.findOneAndDelete({ _id: req.params.id, recruiter: req.user.id, createdByRole: 'recruiter' });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    const applicants = await Application.find({ opportunity: req.params.id }).select('student');
    const studentIds = [...new Set(applicants.map(a => a.student?.toString()).filter(Boolean))];

    await Application.deleteMany({ opportunity: req.params.id });

    if (studentIds.length > 0) {
      const notifs = studentIds.map(sId => ({
        user: sId,
        senderUserId: req.user.id,
        title: 'Opportunity Removed',
        message: `The opportunity "${opportunity.title}" at ${opportunity.companyName || 'the company'} has been removed. Your application is no longer active.`,
        type: 'opportunity',
        relatedId: opportunity._id
      }));
      await Notification.insertMany(notifs);
    }

    res.json({ message: 'Opportunity deleted' });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to delete opportunity', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// OPPORTUNITY REQUESTS (Approval Workflow)
// ═══════════════════════════════════════════════════════

const getOpportunityRequests = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { status, page = 1, limit = 20 } = req.query;
    const query = { recruiter: req.user.id, createdByRole: 'recruiter' };

    if (status && status !== 'all') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(query).sort({ submittedAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Opportunity.countDocuments(query)
    ]);

    res.json({
      opportunities,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get opportunity requests error:', error);
    res.status(500).json({ message: 'Failed to fetch opportunity requests', error: error.message });
  }
};

const resubmitOpportunity = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const recruiter = await User.findById(req.user.id).select('companyName name');
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    const opportunity = await Opportunity.findOne({ _id: req.params.id, recruiter: req.user.id, createdByRole: 'recruiter' });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    if (opportunity.status !== 'rejected') {
      return res.status(400).json({ message: 'Only rejected opportunities can be resubmitted' });
    }

    const allowedUpdates = [
      'title', 'opportunityType', 'department', 'location', 'employmentMode',
      'vacancies', 'salary', 'deadline', 'joiningDate', 'description',
      'eligibility', 'skills', 'documents'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        opportunity[field] = req.body[field];
      }
    });

    opportunity.status = 'pending';
    opportunity.submittedAt = new Date();
    opportunity.rejectionReason = '';

    await opportunity.save();

    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length > 0) {
      const adminNotifs = admins.map(a => ({
        user: a._id,
        senderUserId: req.user.id,
        title: 'Opportunity Resubmitted',
        message: `${recruiter.companyName || recruiter.name || 'A recruiter'} resubmitted "${opportunity.title}" for re-approval.`,
        type: 'opportunity',
        relatedId: opportunity._id
      }));
      await Notification.insertMany(adminNotifs);
    }

    res.json(opportunity);
  } catch (error) {
    console.error('Resubmit opportunity error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to resubmit opportunity', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// APPLICANTS
// ═══════════════════════════════════════════════════════

const getApplicants = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { status, opportunity, search, department, graduationYear, cgpa, skills, dateFrom, dateTo, sort = 'newest', page = 1, limit = 20 } = req.query;
    const query = { recruiter: req.user.id };

    if (status && status !== 'all') query.status = status;
    if (opportunity) query.opportunity = opportunity;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    // Student-based filters
    const studentQuery = {};
    if (search) {
      studentQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) studentQuery.department = { $regex: department, $options: 'i' };
    if (graduationYear) studentQuery.graduationYear = graduationYear;
    if (cgpa) studentQuery['academicInfo.cgpa'] = { $gte: parseFloat(cgpa) };
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      studentQuery.skills = { $in: skillArr };
    }

    if (Object.keys(studentQuery).length > 0) {
      const students = await User.find({ ...studentQuery, role: { $in: ['student', 'alumni'] } }).select('_id').lean();
      query.student = { $in: students.map(s => s._id) };
    }

    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, name: { 'student.name': 1 } };
    const sortOption = sortMap[sort] || sortMap.newest;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('student', 'name email profilePicture department graduationYear session studentId bio skills githubLink portfolioLink resumeUrl projects certificates')
        .populate('opportunity', 'title opportunityType companyName location employmentMode')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(query)
    ]);

    res.json({
      applicants: applications,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get applicants error:', error);
    res.status(500).json({ message: 'Failed to fetch applicants', error: error.message });
  }
};

const getApplicantById = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const application = await Application.findOne({ _id: req.params.id, recruiter: req.user.id })
      .populate('student', 'name email profilePicture department graduationYear session studentId bio skills githubLink portfolioLink resumeUrl projects certificates interests careerInterest')
      .populate('opportunity', 'title opportunityType companyName location employmentMode salary deadline skills')
      .lean();

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const interviewFilter = [{ application: application._id }];
    if (application.student) {
      interviewFilter.push({ recruiter: req.user.id, student: application.student });
    }
    const interviews = await Interview.find({ $or: interviewFilter })
      .sort({ date: 1, time: 1 })
      .lean();

    res.json({ ...application, interviews });
  } catch (error) {
    console.error('Get applicant by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch applicant', error: error.message });
  }
};

const updateApplicantStatus = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { status, notes } = req.body;
    const application = await Application.findOne({ _id: req.params.id, recruiter: req.user.id })
      .populate('opportunity', 'title');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    if (status === 'reviewed') application.reviewedAt = new Date();

    await application.save();

    const oppTitle = application.opportunity?.title || 'the opportunity';
    const recruiterName = (await User.findById(req.user.id).select('companyName name').lean())?.companyName || 'The recruiter';

    if (status === 'shortlisted') {
      await Notification.create({
        user: application.student,
        senderUserId: req.user.id,
        title: 'Congratulations! You\'ve been shortlisted',
        message: `You have been shortlisted for "${oppTitle}" by ${recruiterName}. The recruiter will contact you soon.`,
        type: 'application',
        relatedId: application._id
      });
    } else if (status === 'rejected') {
      await Notification.create({
        user: application.student,
        senderUserId: req.user.id,
        title: 'Application Update',
        message: `Your application for "${oppTitle}" by ${recruiterName} was not selected at this time.`,
        type: 'application',
        relatedId: application._id
      });
    } else if (status === 'accepted') {
      await Notification.create({
        user: application.student,
        senderUserId: req.user.id,
        title: 'Congratulations! You\'ve been hired',
        message: `Your application for "${oppTitle}" by ${recruiterName} has been accepted!`,
        type: 'application',
        relatedId: application._id
      });

      const oppDoc = await Opportunity.findById(application.opportunity).lean().catch(() => null);
      await Employment.create({
        student: application.student,
        recruiter: req.user.id,
        opportunity: application.opportunity || undefined,
        application: application._id,
        companyName: oppDoc?.companyName || recruiterName,
        position: oppDoc?.title || oppTitle,
        salary: oppDoc?.salary?.max || 0,
        salaryCurrency: oppDoc?.salary?.currency || 'BDT',
        employmentType: oppDoc?.opportunityType === 'Internship' ? 'Internship'
          : oppDoc?.opportunityType === 'Part-Time Job' ? 'Part-Time'
          : oppDoc?.opportunityType === 'Remote Job' ? 'Remote'
          : 'Full-Time',
        joiningDate: oppDoc?.joiningDate || undefined,
        workLocation: oppDoc?.location || ''
      }).catch(err => console.error('Failed to create employment record:', err.message));
    }

    const populated = await Application.findById(application._id)
      .populate('student', 'name email profilePicture department graduationYear session studentId bio skills githubLink portfolioLink resumeUrl projects certificates')
      .populate('opportunity', 'title opportunityType companyName location employmentMode')
      .lean();

    res.json(populated);
  } catch (error) {
    console.error('Update applicant status error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid application ID format' });
    }
    res.status(500).json({ message: 'Failed to update applicant status', error: error.message });
  }
};

const getShortlisted = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const applications = await Application.find({ recruiter: req.user.id, status: 'shortlisted' })
      .populate('student', 'name email profilePicture department graduationYear session bio skills githubLink portfolioLink resumeUrl')
      .populate('opportunity', 'title opportunityType companyName location')
      .sort({ createdAt: -1 })
      .lean();

    res.json(applications);
  } catch (error) {
    console.error('Get shortlisted error:', error);
    res.status(500).json({ message: 'Failed to fetch shortlisted applicants', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// INTERVIEWS
// ═══════════════════════════════════════════════════════

const getInterviews = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { status, page = 1, limit = 20 } = req.query;
    const query = { recruiter: req.user.id };

    if (status && status !== 'all') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [interviews, total, stats] = await Promise.all([
      Interview.find(query)
        .populate('student', 'name email profilePicture department graduationYear')
        .populate('opportunity', 'title opportunityType companyName')
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Interview.countDocuments(query),
      Interview.aggregate([
        { $match: { recruiter: req.user.id } },
        {
          $facet: {
            scheduled: [{ $match: { status: 'scheduled' } }, { $count: 'count' }],
            today: [{ $match: { date: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'cancelled' } } }, { $count: 'count' }],
            completed: [{ $match: { status: 'completed' } }, { $count: 'count' }],
            cancelled: [{ $match: { status: 'cancelled' } }, { $count: 'count' }]
          }
        }
      ])
    ]);

    const statDocs = stats[0] || {};
    res.json({
      interviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats: {
        scheduled: statDocs.scheduled?.[0]?.count || 0,
        today: statDocs.today?.[0]?.count || 0,
        completed: statDocs.completed?.[0]?.count || 0,
        cancelled: statDocs.cancelled?.[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ message: 'Failed to fetch interviews', error: error.message });
  }
};

const scheduleInterview = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const {
      studentId, opportunityId, applicationId,
      title, date, time, duration, interviewType, meetingType, platform, meetingLink,
      interviewLocation, panelMembers, notes
    } = req.body;

    const recruiter = await User.findById(req.user.id).select('companyName name').lean();
    const companyName = recruiter?.companyName || recruiter?.name || 'Company';

    const effectiveMeetingType = meetingType === 'frontx' ? 'frontx' : 'external';
    const isOnline = (interviewType || 'Online') === 'Online';
    const effectivePlatform = effectiveMeetingType === 'frontx' ? 'FrontX Video' : (platform || 'Google Meet');
    const effectiveMeetingLink = effectiveMeetingType === 'frontx' ? '' : (meetingLink || '');

    if (effectiveMeetingType === 'external' && isOnline && !effectiveMeetingLink) {
      return res.status(400).json({ message: 'Meeting link is required for external online interviews.' });
    }

    const interview = await Interview.create({
      recruiter: req.user.id,
      student: studentId,
      opportunity: opportunityId || undefined,
      application: applicationId || undefined,
      companyId: req.user.id,
      companyName,
      title,
      date,
      time,
      duration: duration || 30,
      interviewType: interviewType || 'Online',
      meetingType: effectiveMeetingType,
      platform: effectivePlatform,
      meetingLink: effectiveMeetingLink,
      interviewLocation: interviewLocation || '',
      panelMembers: panelMembers || [],
      notes: notes || ''
    });

    const schedule = computeScheduleWindow({ date, time, duration });

    if (effectiveMeetingType === 'frontx') {
      try {
        const roomId = await meetingService.createFrontxMeeting({
          hostId: req.user.id,
          hostName: companyName || 'Recruiter',
          hostRole: 'recruiter',
          title,
          meetingType: 'interview',
          duration: duration || 30,
          startTime: schedule ? schedule.start : date,
          scheduleStart: schedule ? schedule.start : null,
          scheduleEnd: schedule ? schedule.end : null,
          participantIds: [req.user.id, studentId],
          linkedId: interview._id
        });
        interview.roomId = roomId;
        if (schedule && schedule.start) {
          interview.scheduleStart = schedule.start;
          interview.scheduleEnd = schedule.end;
        }
        await interview.save();
      } catch (err) {
        console.warn(`[recruiter] FrontX room creation deferred for interview ${interview._id}: ${err.message}`);
      }
    }

    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, { status: 'interview' }).catch(() => {});
    }

    const calendarDeadlineTitle = `Interview: ${title} - ${companyName}`;
    const calendarDetails = interviewType === 'Online'
      ? `Online (${effectivePlatform})${effectiveMeetingLink ? ' - ' + effectiveMeetingLink : ''}`
      : `Offline${interviewLocation ? ' - ' + interviewLocation : ''}`;

    const [studentDeadline, recruiterDeadline] = await Promise.all([
      Deadline.create({
        user: studentId,
        title: calendarDeadlineTitle,
        date: new Date(date),
        type: 'career',
        relatedId: interview._id
      }),
      Deadline.create({
        user: req.user.id,
        title: calendarDeadlineTitle,
        date: new Date(date),
        type: 'career',
        relatedId: interview._id
      })
    ]);

    interview.calendarEventId = studentDeadline._id.toString();
    await interview.save();

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const positionTitle = title.replace(/^Interview:\s*/i, '');
    const meetingDetailsLine = interviewType === 'Online'
      ? effectiveMeetingType === 'frontx'
        ? '\nMeeting: FrontX Live Video'
        : effectiveMeetingLink ? `\nMeeting Link: ${effectiveMeetingLink}` : ''
      : interviewLocation ? `\nOffice Address: ${interviewLocation}` : '';
    const interviewMessage = `Congratulations! You have been invited for an interview.\n\nCompany: ${companyName}\nPosition: ${positionTitle}\nDate: ${formattedDate}\nTime: ${time}\nMode: ${interviewType}${meetingDetailsLine}`;

    const notification = await Notification.create({
      user: studentId,
      senderUserId: req.user.id,
      title: 'Interview Scheduled',
      message: interviewMessage,
      type: 'application',
      relatedId: interview._id
    });

    const io = req.app.get('io');
    if (io) {
      io.to(studentId.toString()).emit('notification:new', {
        _id: notification._id,
        user: studentId,
        senderUserId: req.user.id,
        title: 'Interview Scheduled',
        message: interviewMessage,
        type: 'application',
        relatedId: interview._id,
        isRead: false,
        createdAt: new Date()
      });
    }

    const populated = await Interview.findById(interview._id)
      .populate('student', 'name email profilePicture department')
      .populate('opportunity', 'title opportunityType')
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const rescheduleInterview = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const interview = await Interview.findOne({ _id: req.params.id, recruiter: req.user.id })
      .populate('opportunity', 'title opportunityType');
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const { date, time, duration, meetingType, platform, meetingLink, interviewLocation, notes } = req.body;

    interview.previousDate = interview.date;
    interview.previousTime = interview.time;
    if (date) interview.date = date;
    if (time) interview.time = time;
    if (duration) interview.duration = duration;
    if (meetingType === 'frontx') {
      interview.meetingType = 'frontx';
      interview.platform = 'FrontX Video';
      interview.meetingLink = '';
    } else if (meetingType === 'external') {
      interview.meetingType = 'external';
      if (platform) interview.platform = platform;
      if (meetingLink !== undefined) interview.meetingLink = meetingLink;
    } else {
      if (platform) interview.platform = platform;
      if (meetingLink !== undefined) interview.meetingLink = meetingLink;
    }
    if (interviewLocation !== undefined) interview.interviewLocation = interviewLocation;
    if (notes !== undefined) interview.notes = notes;
    interview.status = 'rescheduled';

    await interview.save();

    const schedule = computeScheduleWindow({ date: interview.date, time: interview.time, duration: interview.duration });
    if (schedule && schedule.start) {
      interview.scheduleStart = schedule.start;
      interview.scheduleEnd = schedule.end;
      await interview.save();
    }

    if (interview.meetingType === 'frontx') {
      const Meeting = require('../models/Meeting');
      if (interview.roomId) {
        await Meeting.updateOne(
          { roomId: interview.roomId },
          {
            $set: {
              startTime: schedule ? schedule.start : interview.date,
              scheduleStart: schedule ? schedule.start : null,
              scheduleEnd: schedule ? schedule.end : null,
              duration: Number(interview.duration) || 30,
              status: 'scheduled',
            },
          },
        ).catch(() => {});
      } else {
        try {
          const roomId = await meetingService.createFrontxMeeting({
            hostId: req.user.id,
            hostName: 'Recruiter',
            hostRole: 'recruiter',
            title: interview.title,
            meetingType: 'interview',
            duration: interview.duration || 30,
            startTime: schedule ? schedule.start : interview.date,
            scheduleStart: schedule ? schedule.start : null,
            scheduleEnd: schedule ? schedule.end : null,
            participantIds: [req.user.id, interview.student],
            linkedId: interview._id
          });
          interview.roomId = roomId;
          if (schedule && schedule.start) {
            interview.scheduleStart = schedule.start;
            interview.scheduleEnd = schedule.end;
          }
          await interview.save();
        } catch (err) {
          console.warn(`[recruiter] FrontX room creation deferred for interview ${interview._id}: ${err.message}`);
        }
      }
    }

    if (interview.calendarEventId) {
      const newDate = date || interview.date;
      await Deadline.updateMany(
        { relatedId: interview._id, type: 'career' },
        { date: new Date(newDate), title: `Interview: ${interview.title} - (Rescheduled)` }
      ).catch(() => {});
    }

    const recruiter = await User.findById(req.user.id).select('companyName name').lean();
    const companyName = recruiter?.companyName || recruiter?.name || 'Company';

    const formattedDate = new Date(interview.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    await Notification.create({
      user: interview.student,
      senderUserId: req.user.id,
      title: 'Interview Rescheduled',
      message: `Your interview schedule has been updated.\n\nCompany: ${companyName}\nPosition: ${interview.title}\nNew Date: ${formattedDate}\nNew Time: ${interview.time}\nType: ${interview.interviewType}`,
      type: 'application',
      relatedId: interview._id
    });

    const populated = await Interview.findById(interview._id)
      .populate('student', 'name email profilePicture department')
      .populate('opportunity', 'title opportunityType')
      .lean();

    res.json(populated);
  } catch (error) {
    console.error('Reschedule interview error:', error);
    res.status(500).json({ message: 'Failed to reschedule interview', error: error.message });
  }
};

const cancelInterview = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const interview = await Interview.findOne({ _id: req.params.id, recruiter: req.user.id });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const { cancelReason } = req.body;

    interview.status = 'cancelled';
    interview.cancelReason = cancelReason || '';
    await interview.save();

    if (interview.calendarEventId) {
      await Deadline.deleteMany({ relatedId: interview._id, type: 'career' }).catch(() => {});
    }

    const recruiter = await User.findById(req.user.id).select('companyName name').lean();
    const companyName = recruiter?.companyName || recruiter?.name || 'Company';

    await Notification.create({
      user: interview.student,
      senderUserId: req.user.id,
      title: 'Interview Cancelled',
      message: `Your interview "${interview.title}" with ${companyName} has been cancelled.${cancelReason ? `\n\nReason: ${cancelReason}` : ''}`,
      type: 'application',
      relatedId: interview._id
    });

    const populated = await Interview.findById(interview._id)
      .populate('student', 'name email profilePicture department')
      .populate('opportunity', 'title opportunityType')
      .lean();

    res.json(populated);
  } catch (error) {
    console.error('Cancel interview error:', error);
    res.status(500).json({ message: 'Failed to cancel interview', error: error.message });
  }
};

const completeInterview = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const interview = await Interview.findOne({ _id: req.params.id, recruiter: req.user.id });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const { feedback, rating } = req.body;

    interview.status = 'completed';
    if (feedback !== undefined) interview.feedback = feedback;
    if (rating !== undefined) interview.rating = rating;
    await interview.save();

    if (interview.calendarEventId) {
      await Deadline.deleteMany({ relatedId: interview._id, type: 'career' }).catch(() => {});
    }

    const recruiter = await User.findById(req.user.id).select('companyName name').lean();
    const companyName = recruiter?.companyName || recruiter?.name || 'Company';

    await Notification.create({
      user: interview.student,
      senderUserId: req.user.id,
      title: 'Interview Completed',
      message: `Your interview "${interview.title}" with ${companyName} has been marked as completed.\n\nYou can check your application status for further updates.`,
      type: 'application',
      relatedId: interview._id
    });

    const populated = await Interview.findById(interview._id)
      .populate('student', 'name email profilePicture department')
      .populate('opportunity', 'title opportunityType')
      .lean();

    res.json(populated);
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ message: 'Failed to complete interview', error: error.message });
  }
};

const getInterviewById = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const interview = await Interview.findOne({ _id: req.params.id, recruiter: req.user.id })
      .populate('student', 'name email profilePicture department graduationYear session studentId')
      .populate('opportunity', 'title opportunityType companyName location')
      .populate('application', 'coverLetter resumeUrl status')
      .lean();

    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    res.json(interview);
  } catch (error) {
    console.error('Get interview by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid interview ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch interview', error: error.message });
  }
};

const deleteInterview = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const interview = await Interview.findOneAndDelete({ _id: req.params.id, recruiter: req.user.id });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    if (interview.calendarEventId) {
      await Deadline.deleteMany({ relatedId: interview._id, type: 'career' }).catch(() => {});
    }

    if (interview.student) {
      await Notification.create({
        user: interview.student,
        senderUserId: req.user.id,
        title: 'Interview Cancelled',
        message: `Your interview for "${interview.title || 'a position'}" has been cancelled by the recruiter.`,
        type: 'interview',
        relatedId: interview._id
      });
    }

    res.json({ message: 'Interview deleted' });
  } catch (error) {
    console.error('Delete interview error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid interview ID format' });
    }
    res.status(500).json({ message: 'Failed to delete interview', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════

const getNotifications = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { filter, search, page = 1, limit = 50 } = req.query;
    const query = { user: req.user.id };

    if (filter && filter !== 'all') {
      if (filter === 'unread') {
        query.isRead = false;
      } else {
        query.type = filter;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query)
    ]);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    res.json({ notifications, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isRead: true, readAt: Date.now() } },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    console.error('Mark notification error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: Date.now() } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

const deleteAllReadNotifications = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    await Notification.deleteMany({ user: req.user.id, isRead: true });

    res.json({ message: 'All read notifications deleted' });
  } catch (error) {
    console.error('Delete all read notifications error:', error);
    res.status(500).json({ message: 'Failed to delete read notifications', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════

const getAnalytics = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const recruiterId = req.user.id;

    const [
      totalOpportunities, activeOpportunities, totalApplications,
      shortlistedCount, acceptedCount, rejectedCount,
      upcomingInterviews, completedInterviews
    ] = await Promise.all([
      Opportunity.countDocuments({ recruiter: recruiterId }),
      Opportunity.countDocuments({ recruiter: recruiterId, status: 'active' }),
      Application.countDocuments({ recruiter: recruiterId }),
      Application.countDocuments({ recruiter: recruiterId, status: 'shortlisted' }),
      Application.countDocuments({ recruiter: recruiterId, status: 'accepted' }),
      Application.countDocuments({ recruiter: recruiterId, status: 'rejected' }),
      Interview.countDocuments({ recruiter: recruiterId, status: 'scheduled', date: { $gte: new Date() } }),
      Interview.countDocuments({ recruiter: recruiterId, status: 'completed' })
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentApplications, topOpportunities] = await Promise.all([
      Application.countDocuments({ recruiter: recruiterId, createdAt: { $gte: thirtyDaysAgo } }),
      Opportunity.find({ recruiter: recruiterId })
        .sort({ applicationCount: -1 })
        .limit(5)
        .select('title applicationCount status')
        .lean()
    ]);

    res.json({
      stats: {
        totalOpportunities,
        activeOpportunities,
        totalApplications,
        shortlistedCount,
        acceptedCount,
        rejectedCount,
        upcomingInterviews,
        completedInterviews,
        recentApplications
      },
      topOpportunities
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// TALENT SEARCH
// ═══════════════════════════════════════════════════════

const searchCandidates = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const {
      search, department, session, graduationYear, minCgpa,
      skills, hasResume, hasPortfolio, hasGithub, hasLinkedin,
      hasCertificates, hasProjects, hasExperience,
      language, availability,
      sort = 'newest', page = 1, limit = 20
    } = req.query;

    const query = { role: { $in: ['student', 'alumni'] } };

    // Privacy: hide students who disabled recruiter visibility
    query.recruiterVisible = { $ne: false };

    // Keyword search
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: regex }, { email: regex }, { department: regex },
        { bio: regex }, { careerInterest: regex }
      ];
    }

    // Academic filters
    if (department) query.department = { $regex: department, $options: 'i' };
    if (session) query.session = { $regex: session, $options: 'i' };
    if (graduationYear) query.graduationYear = graduationYear;
    if (minCgpa) query['academicInfo.cgpa'] = { $gte: parseFloat(minCgpa) };

    // Skills filter (multi-match)
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillArr.length > 0) {
        query.skills = { $in: skillArr.map(s => new RegExp(s, 'i')) };
      }
    }

    // Professional filters
    if (hasResume === 'true') query.resumeUrl = { $ne: '' };
    if (hasResume === 'false') query.$or = [{ resumeUrl: '' }, { resumeUrl: { $exists: false } }];
    if (hasPortfolio === 'true') query.portfolioLink = { $ne: '' };
    if (hasPortfolio === 'false') query.$and = query.$and || [];
    if (hasGithub === 'true') query.githubLink = { $ne: '' };
    if (hasLinkedin === 'true') query.linkedinLink = { $ne: '' };
    if (hasCertificates === 'true') query['certificates.0'] = { $exists: true };
    if (hasProjects === 'true') query['projects.0'] = { $exists: true };
    if (hasExperience === 'true') query['experience.0'] = { $exists: true };

    // Language filter
    if (language) {
      const langArr = language.split(',').map(l => l.trim()).filter(Boolean);
      if (langArr.length > 0) {
        query.languages = { $in: langArr.map(l => new RegExp(l, 'i')) };
      }
    }

    // Availability filter
    if (availability) {
      const availArr = availability.split(',').map(a => a.trim()).filter(Boolean);
      if (availArr.length > 0) {
        query.interests = { $in: availArr.map(a => new RegExp(a, 'i')) };
      }
    }

    // Sort
    const sortMap = {
      cgpahigh: { 'academicInfo.cgpa': -1 },
      newest: { graduationYear: -1 },
      skills: { skills: -1 },
      active: { lastActiveAt: -1 },
      name: { name: 1 }
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const selectFields = 'name email profilePicture department graduationYear session bio skills githubLink portfolioLink resumeUrl linkedinLink projects certificates interests careerInterest academicInfo lastActiveAt languages experience';

    const [candidates, total] = await Promise.all([
      User.find(query)
        .select(selectFields)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      candidates,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Search candidates error:', error);
    res.status(500).json({ message: 'Failed to search candidates', error: error.message });
  }
};

const getCandidateById = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const candidate = await User.findOne({
      _id: req.params.id,
      role: { $in: ['student', 'alumni'] },
      recruiterVisible: { $ne: false }
    })
      .select('name email profilePicture department graduationYear session studentId bio skills githubLink portfolioLink resumeUrl linkedinLink projects certificates interests careerInterest academicInfo lastActiveAt languages experience')
      .lean();

    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    // Increment profile views
    await User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } });

    res.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid candidate ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch candidate', error: error.message });
  }
};

const saveCandidate = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { candidateId, notes } = req.body;
    if (!candidateId) return res.status(400).json({ message: 'Candidate ID is required' });

    const recruiter = await User.findById(req.user.id);
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    if (!recruiter.savedCandidates) recruiter.savedCandidates = [];
    const alreadySaved = recruiter.savedCandidates.find(
      s => s.candidate.toString() === candidateId
    );

    if (alreadySaved) {
      if (notes !== undefined) alreadySaved.notes = notes;
      await recruiter.save();
    } else {
      recruiter.savedCandidates.push({ candidate: candidateId, notes: notes || '' });
      await recruiter.save();
    }

    res.json({ message: 'Candidate saved' });
  } catch (error) {
    console.error('Save candidate error:', error);
    res.status(500).json({ message: 'Failed to save candidate', error: error.message });
  }
};

const getSavedCandidates = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const recruiter = await User.findById(req.user.id)
      .select('savedCandidates')
      .populate('savedCandidates.candidate', 'name email profilePicture department graduationYear skills githubLink portfolioLink resumeUrl')
      .lean();

    res.json(recruiter?.savedCandidates || []);
  } catch (error) {
    console.error('Get saved candidates error:', error);
    res.status(500).json({ message: 'Failed to fetch saved candidates', error: error.message });
  }
};

const inviteCandidate = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { candidateId, opportunityId, message } = req.body;
    if (!candidateId) return res.status(400).json({ message: 'Candidate ID is required' });

    const candidate = await User.findById(candidateId).select('name');
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const recruiter = await User.findById(req.user.id).select('companyName name');
    const company = recruiter?.companyName || recruiter?.name || 'A company';

    let oppTitle = 'an opportunity';
    if (opportunityId) {
      const opp = await Opportunity.findById(opportunityId).select('title');
      if (opp) oppTitle = `"${opp.title}"`;
    }

    await Notification.create({
      user: candidateId,
      senderUserId: req.user.id,
      title: 'You\'ve been invited to apply!',
      message: message || `${company} has invited you to apply for ${oppTitle}. Check it out!`,
      type: 'job',
      relatedId: opportunityId || req.user.id
    });

    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Invite candidate error:', error);
    res.status(500).json({ message: 'Failed to send invitation', error: error.message });
  }
};

const messageCandidate = async (req, res) => {
  try {
    if (!requireRecruiter(req, res)) return;

    const { candidateId, message } = req.body;
    if (!candidateId || !message) return res.status(400).json({ message: 'Candidate ID and message are required' });

    const recruiter = await User.findById(req.user.id).select('companyName name');
    const company = recruiter?.companyName || recruiter?.name || 'A recruiter';

    await Notification.create({
      user: candidateId,
      senderUserId: req.user.id,
      title: `Message from ${company}`,
      message: message,
      type: 'message',
      relatedId: req.user.id
    });

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Message candidate error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  removeCompanyLogo,
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getApplicants,
  getApplicantById,
  updateApplicantStatus,
  getShortlisted,
  getInterviews,
  getInterviewById,
  scheduleInterview,
  rescheduleInterview,
  cancelInterview,
  completeInterview,
  deleteInterview,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getAnalytics,
  searchCandidates,
  getCandidateById,
  saveCandidate,
  getSavedCandidates,
  inviteCandidate,
  messageCandidate,
  getOpportunityRequests,
  resubmitOpportunity
};
