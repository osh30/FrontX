const Opportunity = require('../models/Opportunity');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');

const OPPORTUNITY_TO_JOB_TYPE = {
  'Government Job': 'full-time',
  'Private Job': 'full-time',
  'Internship': 'internship',
  'Scholarship': 'full-time',
  'Competition': 'full-time',
};

const buildJobFromOpportunity = (opp, userId) => ({
  title: opp.title?.trim() || '',
  company: opp.companyName || 'Admin Posted',
  opportunityType: opp.opportunityType || 'Private Job',
  applicationUrl: opp.applicationUrl || '',
  eligibility: opp.eligibility?.experienceRequired || '',
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
  postedBy: userId,
  deadline: opp.deadline || undefined,
  isActive: opp.status !== 'closed',
  linkedOpportunityId: opp._id,
});

const migrateOldAdminOpps = async (adminId) => {
  try {
    await Opportunity.updateMany(
      { recruiter: adminId, createdByRole: { $ne: 'admin' } },
      { $set: { createdByRole: 'admin', visibility: ['student', 'alumni'] } }
    );
  } catch (err) {
    console.error('Migration of old admin opps failed (non-blocking):', err.message);
  }
};

const getOpportunities = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, status } = req.query;

    // Migrate any old docs that belong to this admin but lack createdByRole
    await migrateOldAdminOpps(req.user.id);

    let query = { createdByRole: 'admin' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }
    if (type && type !== 'All') {
      query.opportunityType = type;
    }
    if (status === 'Active') {
      query.status = 'active';
    } else if (status === 'Expired') {
      query.deadline = { $lt: new Date() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .populate('recruiter', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Opportunity.countDocuments(query),
    ]);

    // Map fields for admin frontend compatibility
    const mapped = opportunities.map(opp => ({
      ...opp,
      type: opp.opportunityType,
      organization: opp.companyName,
      description: opp.description?.about || '',
      eligibility: opp.eligibility?.experienceRequired || '',
      applyLink: opp.applicationUrl || '',
      attachment: opp.documents?.[0]?.url || '',
    }));

    res.json({
      opportunities: mapped,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Admin get opportunities error:', error);
    res.status(500).json({ message: 'Failed to fetch opportunities', error: error.message });
  }
};

const createOpportunity = async (req, res) => {
  try {
    const { type, title, organization, description, eligibility, deadline, applyLink, attachment, featured } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Missing required field: title' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Missing required field: type' });
    }

    const typeMap = {
      'Government Job': 'Government Job',
      'Private Job': 'Private Job',
      'Scholarship': 'Scholarship',
      'Competition': 'Competition',
    };

    const opportunity = await Opportunity.create({
      recruiter: req.user.id,
      companyId: req.user.id,
      companyName: organization || 'Admin Posted',
      title: title.trim(),
      opportunityType: typeMap[type] || type,
      description: { about: description || '' },
      eligibility: eligibility ? { experienceRequired: eligibility } : {},
      deadline: deadline || undefined,
      applicationUrl: applyLink || '',
      documents: attachment ? [{ name: 'Attachment', url: attachment, type: 'attachment' }] : [],
      status: 'active',
      visibility: ['student', 'alumni'],
      createdByRole: 'admin',
      featured: !!featured,
    });

    // Sync to Job model so students/alumni see it via /api/jobs
    try {
      const jobData = buildJobFromOpportunity(opportunity, req.user.id);
      await Job.create(jobData);
    } catch (jobErr) {
      console.error('Job model sync failed (non-blocking):', jobErr.message);
    }

    // Notify all students and alumni
    try {
      const typeLabels = {
        'Government Job': 'Government Job',
        'Private Job': 'Job Opportunity',
        'Scholarship': 'Scholarship',
        'Competition': 'Competition',
      };
      const typeLabel = typeLabels[type] || 'Opportunity';
      const eligibleUsers = await User.find({ role: { $in: ['student', 'alumni'] } }).select('_id');

      if (eligibleUsers.length > 0) {
        const notifications = eligibleUsers.map(u => ({
          user: u._id,
          title: `New ${typeLabel} Posted by Admin`,
          message: `An admin has posted a ${type}: ${title.trim()}. Check it out!`,
          type: 'job',
          relatedId: opportunity._id,
        }));
        await Notification.insertMany(notifications, { ordered: false });
      }
    } catch (notifErr) {
      console.error('Notification creation failed (non-blocking):', notifErr.message);
    }

    res.status(201).json(opportunity);
  } catch (error) {
    console.error('Admin create opportunity error:', error);
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

const updateOpportunity = async (req, res) => {
  try {
    const { type, title, organization, description, eligibility, deadline, applyLink, attachment, featured, isActive } = req.body;

    // Fetch the document first so we can fix old format issues before saving
    let opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    // Fix old documents that may have string visibility or missing createdByRole
    if (typeof opportunity.visibility === 'string') {
      opportunity.visibility = ['student', 'alumni'];
    }
    if (!opportunity.createdByRole) {
      opportunity.createdByRole = 'admin';
    }

    // Map frontend field names to model field names
    if (type !== undefined) {
      const typeMap = { 'Government Job': 'Government Job', 'Private Job': 'Private Job', 'Scholarship': 'Scholarship', 'Competition': 'Competition' };
      opportunity.opportunityType = typeMap[type] || type;
    }
    if (title !== undefined) opportunity.title = title;
    if (organization !== undefined) opportunity.companyName = organization || 'Admin Posted';
    if (description !== undefined) opportunity.description = { about: description || '' };
    if (eligibility !== undefined) opportunity.eligibility = { experienceRequired: eligibility };
    if (deadline !== undefined) opportunity.deadline = deadline || undefined;
    if (applyLink !== undefined) opportunity.applicationUrl = applyLink || '';
    if (attachment !== undefined) {
      opportunity.documents = attachment ? [{ name: 'Attachment', url: attachment, type: 'attachment' }] : [];
    }
    if (featured !== undefined) opportunity.featured = featured;
    if (isActive !== undefined) opportunity.status = isActive ? 'active' : 'closed';

    await opportunity.save();

    // Sync update to linked Job model
    try {
      const jobUpdates = {};
      if (title !== undefined) jobUpdates.title = title.trim();
      if (organization !== undefined) jobUpdates.company = organization || 'Admin Posted';
      if (description !== undefined) jobUpdates.description = description || '';
      if (deadline !== undefined) jobUpdates.deadline = deadline || undefined;
      if (isActive !== undefined) jobUpdates.isActive = !!isActive;
      if (type !== undefined) {
        jobUpdates.jobType = OPPORTUNITY_TO_JOB_TYPE[opportunity.opportunityType] || 'full-time';
      }

      if (Object.keys(jobUpdates).length > 0) {
        await Job.findOneAndUpdate(
          { linkedOpportunityId: opportunity._id },
          jobUpdates,
          { new: true }
        );
      }
    } catch (jobErr) {
      console.error('Job model sync update failed (non-blocking):', jobErr.message);
    }

    // Return mapped fields for admin frontend compatibility
    const mapped = {
      ...opportunity.toObject(),
      type: opportunity.opportunityType,
      organization: opportunity.companyName,
      description: opportunity.description?.about || '',
    };

    res.json(mapped);
  } catch (error) {
    console.error('Admin update opportunity error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ message: 'Failed to update opportunity', error: error.message });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    // Delete linked Job record
    try {
      await Job.findOneAndDelete({ linkedOpportunityId: opportunity._id });
    } catch (jobErr) {
      console.error('Job model sync delete failed (non-blocking):', jobErr.message);
    }

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Admin delete opportunity error:', error);
    res.status(500).json({ message: 'Failed to delete opportunity', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// OPPORTUNITY REQUESTS (Approval Workflow)
// ═══════════════════════════════════════════════════════

const getPendingOpportunities = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { status: 'pending', createdByRole: 'recruiter' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .populate('recruiter', 'name email companyName companyLogo')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Opportunity.countDocuments(query),
    ]);

    res.json({
      opportunities,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get pending opportunities error:', error);
    res.status(500).json({ message: 'Failed to fetch pending opportunities', error: error.message });
  }
};

const getOpportunityRequestById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('recruiter', 'name email companyName companyLogo')
      .lean();
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(opportunity);
  } catch (error) {
    console.error('Get opportunity request error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch opportunity', error: error.message });
  }
};

const approveOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate('recruiter', 'name email companyName');
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    if (opportunity.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve opportunity with status: ${opportunity.status}` });
    }

    const recruiter = opportunity.recruiter || {};
    const companyName = opportunity.companyName || recruiter.companyName || recruiter.name || 'A company';

    opportunity.status = 'approved';
    await opportunity.save();

    // Sync to Job model so students/alumni can see it
    try {
      const typeMap = {
        'Government Job': 'full-time', 'Private Job': 'full-time', 'Internship': 'internship',
        'Remote Job': 'remote', 'Part-Time Job': 'part-time', 'Scholarship': 'full-time', 'Competition': 'full-time'
      };
      await Job.create({
        title: opportunity.title,
        company: companyName,
        description: opportunity.description?.about || '',
        requirements: opportunity.skills || [],
        location: opportunity.location || '',
        salaryRange: { min: opportunity.salary?.min || 0, max: opportunity.salary?.max || 0, currency: 'BDT' },
        jobType: typeMap[opportunity.opportunityType] || 'full-time',
        experienceLevel: 'entry',
        postedBy: recruiter._id || opportunity.recruiter,
        deadline: opportunity.deadline || undefined,
        isActive: true,
        linkedOpportunityId: opportunity._id
      });
    } catch (jobErr) {
      console.error('Job model sync failed (non-blocking):', jobErr.message);
    }

    // Notify eligible students and alumni
    try {
      const visArray = opportunity.visibility || ['student', 'alumni'];
      const roleFilter = visArray.filter(r => ['student', 'alumni'].includes(r));
      if (roleFilter.length > 0) {
        const eligibleUsers = await User.find({ role: { $in: roleFilter } }).select('_id');
        const typeLabels = {
          'Government Job': 'Government Job', 'Private Job': 'Job Opportunity',
          'Internship': 'Internship Opportunity', 'Remote Job': 'Remote Job Opportunity',
          'Part-Time Job': 'Part-Time Job', 'Scholarship': 'Scholarship Opportunity',
          'Competition': 'Competition'
        };
        const typeLabel = typeLabels[opportunity.opportunityType] || 'Opportunity';

        if (eligibleUsers.length > 0) {
          const notifications = eligibleUsers.map(u => ({
            user: u._id,
            title: `New ${typeLabel} Posted`,
            message: `${companyName} has posted a ${opportunity.opportunityType}: ${opportunity.title}`,
            type: 'job',
            relatedId: opportunity._id
          }));
          await Notification.insertMany(notifications, { ordered: false });
        }
      }
    } catch (notifErr) {
      console.error('Notification creation failed (non-blocking):', notifErr.message);
    }

    // Notify the recruiter that their opportunity was approved
    try {
      await Notification.create({
        user: recruiter._id || opportunity.recruiter,
        title: 'Opportunity Approved',
        message: `Your opportunity "${opportunity.title}" has been approved and published successfully.`,
        type: 'job',
        relatedId: opportunity._id
      });
    } catch (notifErr) {
      console.error('Recruiter notification failed (non-blocking):', notifErr.message);
    }

    res.json({ message: 'Opportunity approved successfully', opportunity });
  } catch (error) {
    console.error('Approve opportunity error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to approve opportunity', error: error.message });
  }
};

const rejectOpportunity = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const opportunity = await Opportunity.findById(req.params.id).populate('recruiter', 'name email');
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    if (opportunity.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject opportunity with status: ${opportunity.status}` });
    }

    opportunity.status = 'rejected';
    opportunity.rejectionReason = rejectionReason.trim();
    await opportunity.save();

    // Notify the recruiter
    try {
      await Notification.create({
        user: opportunity.recruiter?._id || opportunity.recruiter,
        title: 'Opportunity Rejected',
        message: `Your opportunity request "${opportunity.title}" has been rejected. Please review the feedback and resubmit.\n\nReason: ${rejectionReason.trim()}`,
        type: 'job',
        relatedId: opportunity._id
      });
    } catch (notifErr) {
      console.error('Recruiter notification failed (non-blocking):', notifErr.message);
    }

    res.json({ message: 'Opportunity rejected', opportunity });
  } catch (error) {
    console.error('Reject opportunity error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to reject opportunity', error: error.message });
  }
};

module.exports = { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity, getPendingOpportunities, getOpportunityRequestById, approveOpportunity, rejectOpportunity };
