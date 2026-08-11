const Job = require('../models/Job');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const StudyPlanner = require('../models/StudyPlanner');
const { syncPlannerWeekStatuses } = require('./studyPlannerController');

const OPPORTUNITY_TO_JOB_TYPE = {
  'Government Job': 'full-time',
  'Private Job': 'full-time',
  'Internship': 'internship',
  'Remote Job': 'remote',
  'Part-Time Job': 'part-time',
  'Scholarship': 'full-time',
  'Competition': 'full-time',
};

// @desc    Get all jobs (merges Job model + published Opportunity records:
//          admin-created 'active' opportunities + recruiter-created 'approved' opportunities)
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userRole = req.user?.role || null;

    // Check if student's career access is restricted due to missed Study Planner note deadline
    if (req.user && req.user.id) {
      const planner = await StudyPlanner.findOne({ userId: req.user.id });
      if (planner) {
        const { careerAccessRestricted, restrictionMessage } = await syncPlannerWeekStatuses(planner, req.user.id);
        if (careerAccessRestricted) {
          return res.json({
            jobs: [],
            total: 0,
            page: 1,
            pages: 0,
            careerAccessRestricted: true,
            restrictionMessage
          });
        }
      }
    }

    // Build query for Job model
    let query = { isActive: true };


    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Fetch from Job model
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email profile')
      .sort('-createdAt')
      .lean();

    // Fetch published opportunities from the Opportunity model that haven't been synced:
    //   - Admin-posted (Flow 1) -> status 'active'
    //   - Recruiter-posted (Flow 2) -> status 'approved'
    let adminOpps = [];
    try {
      const conditions = [
        {
          $or: [
            { createdByRole: 'admin', status: 'active' },
            { createdByRole: 'recruiter', status: 'approved' }
          ]
        }
      ];

      if (userRole) {
        conditions.push({ visibility: { $in: [userRole] } });
      }

      if (req.query.jobType) {
        const reverseTypeMap = {
          'full-time': ['Government Job', 'Private Job', 'Scholarship', 'Competition'],
          'part-time': ['Part-Time Job'],
          'internship': ['Internship'],
          'remote': ['Remote Job'],
          'hybrid': [],
        };
        const allowedTypes = reverseTypeMap[req.query.jobType] || [];
        if (allowedTypes.length > 0) {
          conditions.push({ opportunityType: { $in: allowedTypes } });
        }
      }
      if (req.query.search) {
        conditions.push({
          $or: [
            { title: { $regex: req.query.search, $options: 'i' } },
            { companyName: { $regex: req.query.search, $options: 'i' } }
          ]
        });
      }

      const syncedOppIds = jobs
        .filter(j => j.linkedOpportunityId)
        .map(j => j.linkedOpportunityId.toString());

      if (syncedOppIds.length > 0) {
        conditions.push({ _id: { $nin: syncedOppIds } });
      }

      const oppQuery = conditions.length === 1 ? conditions[0] : { $and: conditions };

      const rawOpps = await Opportunity.find(oppQuery)
        .populate('recruiter', 'name email profilePicture companyName companyWebsite')
        .sort({ createdAt: -1 })
        .lean();

      // Convert Opportunity records to Job-shaped objects for frontend compatibility
      adminOpps = rawOpps.map(opp => ({
        _id: opp._id,
        title: opp.title,
        company: opp.companyName || 'Admin Posted',
        description: opp.description?.about || '',
        requirements: opp.skills || [],
        location: opp.location || '',
        salaryRange: {
          min: opp.salary?.min || 0,
          max: opp.salary?.max || 0,
          currency: opp.salary?.currency || 'BDT',
        },
        jobType: OPPORTUNITY_TO_JOB_TYPE[opp.opportunityType] || 'full-time',
        experienceLevel: 'entry',
        postedBy: opp.recruiter || opp.companyId,
        deadline: opp.deadline || null,
        isActive: true,
        linkedOpportunityId: opp._id,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
      }));
    } catch (oppErr) {
      console.error('Admin opportunity fallback query failed (non-blocking):', oppErr.message);
    }

    // Merge both sources
    const allJobs = [...jobs, ...adminOpps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination to merged results
    const total = allJobs.length;
    const paginatedJobs = allJobs.slice(skip, skip + limit);

    res.json({
      success: true,
      jobs: paginatedJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch opportunities', error: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profile')
      .populate('applications.student', 'name email profile');

    // Fallback: check Opportunity model if not found in Job
    if (!job) {
      try {
        const opp = await Opportunity.findById(req.params.id)
          .populate('recruiter', 'name email profilePicture')
          .lean();
        if (opp) {
          job = {
            _id: opp._id,
            title: opp.title,
            company: opp.companyName || 'Admin Posted',
            description: opp.description?.about || '',
            requirements: opp.skills || [],
            location: opp.location || '',
            salaryRange: { min: opp.salary?.min || 0, max: opp.salary?.max || 0, currency: opp.salary?.currency || 'BDT' },
            jobType: OPPORTUNITY_TO_JOB_TYPE[opp.opportunityType] || 'full-time',
            experienceLevel: 'entry',
            postedBy: opp.recruiter || opp.companyId,
            deadline: opp.deadline || null,
            isActive: true,
            applications: [],
            createdAt: opp.createdAt,
          };
        }
      } catch (oppErr) {
        // ignore fallback error
      }
    }

    if (!job) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Get job by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch opportunity', error: error.message });
  }
};

// @desc    Create job
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, company, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Missing required field: title' });
    }
    if (!company || !company.trim()) {
      return res.status(400).json({ message: 'Missing required field: company' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Missing required field: description' });
    }

    const job = await Job.create({
      ...req.body,
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      postedBy: req.user.id
    });
    
    if (req.app.get('io')) {
      req.app.get('io').emit('new_job', job);
    }
    
    const activity = await Activity.create({
      user: req.user.id,
      title: `posted a new career opportunity: ${job.title}`,
      type: 'career',
      color: 'bg-green-100 text-green-600',
      relatedId: job._id,
      isGlobal: true
    });
    await activity.populate('user', 'name profilePicture');
    if (req.app.get('io')) {
      req.app.get('io').emit('new_global_activity', activity);
    }
    
    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Create job error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid data format', error: error.message });
    }
    res.status(500).json({ message: 'Failed to create opportunity', error: error.message });
  }
};

// @desc    Apply for job
// @route   POST /api/jobs/:id/apply
const applyForJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    // If not found by ID, check if it's an Opportunity ID with a linked Job
    if (!job) {
      const opp = await Opportunity.findById(req.params.id);
      if (opp) {
        job = await Job.findOne({ linkedOpportunityId: opp._id });
      }
    }

    if (!job) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    const alreadyApplied = job.applications.find(
      app => app.student.toString() === req.user.id
    );
    
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this opportunity' });
    }
    
    job.applications.push({
      student: req.user.id,
      coverLetter: req.body.coverLetter,
      resume: req.body.resume
    });
    
    await job.save();
    
    await Notification.create({
      user: job.postedBy,
      senderUserId: req.user.id,
      title: 'New Job Application',
      message: `${req.user.name} applied for ${job.title}`,
      type: 'application',
      relatedId: job._id
    });
    
    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply for job error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
};

// @desc    Get my applications
// @route   GET /api/jobs/my-applications
const getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({
      'applications.student': req.user.id
    }).populate('postedBy', 'name email');
    
    const applications = jobs.map(job => {
      const application = job.applications.find(
        app => app.student.toString() === req.user.id
      );
      return {
        job: {
          id: job._id,
          title: job.title,
          company: job.company
        },
        linkedOpportunityId: job.linkedOpportunityId || null,
        status: application.status,
        appliedAt: application.appliedAt
      };
    });
    
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  applyForJob,
  getMyApplications
};
