const express = require('express');
const router = express.Router();
const { optionalAuth, protect, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../middleware/uploadMiddleware');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Job = require('../models/Job');

const RECRUITER_POPULATE =
  'name email profilePicture companyName companyLogo companyWebsite industryType officeAddress verificationStatus designation';

// @desc    Get full opportunity details by ID
// @route   GET /api/opportunities/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    let opp = await Opportunity.findById(req.params.id)
      .populate('recruiter', RECRUITER_POPULATE)
      .lean();

    if (!opp) {
      const job = await Job.findById(req.params.id).lean();
      if (job && job.linkedOpportunityId) {
        opp = await Opportunity.findById(job.linkedOpportunityId)
          .populate('recruiter', RECRUITER_POPULATE)
          .lean();
      }
    }

    if (!opp) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json({ success: true, opportunity: opp });
  } catch (error) {
    console.error('Get opportunity details error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid opportunity ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch opportunity', error: error.message });
  }
});

// @desc    Get current user's applications
// @route   GET /api/opportunities/my-applications
// @access  Student / Alumni
router.get('/my-applications/me', protect, authorize('student', 'alumni'), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('opportunity', 'title companyName opportunityType location employmentMode salary deadline status')
      .populate('recruiter', 'companyName companyLogo')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// @desc    Apply for an opportunity (multipart: text fields + PDF uploads)
// @route   POST /api/opportunities/:id/apply
// @access  Student / Alumni
router.post('/:id/apply',
  protect,
  authorize('student', 'alumni'),
  upload.fields([
    { name: 'resumeFile', maxCount: 1 },
    { name: 'transcriptFile', maxCount: 1 },
    { name: 'certificates', maxCount: 10 },
    { name: 'portfolioFile', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const oppId = req.params.id;
      console.log(`[APPLY] Incoming ID from frontend: ${oppId}`);

      let opp = await Opportunity.findById(oppId);
      console.log(`[APPLY] Direct Opportunity.findById result:`, opp ? `Found (${opp._id})` : 'null');

      if (!opp) {
        console.log(`[APPLY] Trying Job.findById fallback...`);
        const job = await Job.findById(oppId).lean();
        console.log(`[APPLY] Job.findById result:`, job ? `Found (${job._id}), linkedOpportunityId: ${job.linkedOpportunityId}` : 'null');
        if (job && job.linkedOpportunityId) {
          opp = await Opportunity.findById(job.linkedOpportunityId);
          console.log(`[APPLY] Fallback Opportunity.findById result:`, opp ? `Found (${opp._id})` : 'null');
        }
      }

      if (!opp) {
        console.error(`[APPLY] Opportunity not found for ID: ${oppId}`);
        return res.status(404).json({ message: 'Opportunity not found' });
      }
      if (opp.status !== 'approved') {
        return res.status(400).json({ message: 'This opportunity is not accepting applications' });
      }
      if (opp.deadline && new Date(opp.deadline) < new Date()) {
        return res.status(400).json({ message: 'Application deadline has passed' });
      }

      const existing = await Application.findOne({
        opportunity: opp._id,
        student: req.user.id
      });
      if (existing) {
        return res.status(400).json({ message: 'You have already applied for this opportunity' });
      }

      if (!req.files?.resumeFile?.[0]) {
        return res.status(400).json({ message: 'Resume / CV is required' });
      }

      const uploadFile = async (file, folder) => {
        if (!file) return null;
        const result = await uploadToCloudinary(file, folder);
        return { url: result.secure_url, publicId: result.public_id };
      };

      const [resumeFile, transcriptFile, portfolioFile] = await Promise.all([
        uploadFile(req.files?.resumeFile?.[0], 'frontx/applications/resumes'),
        uploadFile(req.files?.transcriptFile?.[0], 'frontx/applications/transcripts'),
        uploadFile(req.files?.portfolioFile?.[0], 'frontx/applications/portfolios')
      ]);

      let certificates = [];
      if (req.files?.certificates && req.files.certificates.length > 0) {
        const results = await Promise.all(
          req.files.certificates.map(f => uploadToCloudinary(f, 'frontx/applications/certificates'))
        );
        certificates = results.map(r => ({ url: r.secure_url, publicId: r.public_id }));
      }

      const skills = req.body.skills
        ? req.body.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const languages = req.body.languages
        ? req.body.languages.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const application = await Application.create({
        opportunity: opp._id,
        recruiter: opp.recruiter,
        student: req.user.id,
        applicantRole: req.user.role,
        applicantName: req.user.name,
        applicantEmail: req.user.email,
        applicantDepartment: req.body.applicantDepartment || '',
        applicantStudentId: req.body.applicantStudentId || '',
        applicantSession: req.body.applicantSession || '',
        applicantGraduationYear: req.body.applicantGraduationYear || '',
        status: 'applied',
        phone: req.body.phone || '',
        currentAddress: req.body.currentAddress || '',
        skills,
        languages,
        coverLetter: req.body.coverLetter || '',
        githubUrl: req.body.githubUrl || '',
        linkedinUrl: req.body.linkedinUrl || '',
        portfolioUrl: req.body.portfolioUrl || '',
        resumeFile,
        transcriptFile,
        certificates,
        portfolioFile
      });

      await Opportunity.findByIdAndUpdate(opp._id, { $inc: { applicationCount: 1 } });

      try {
        await Notification.create({
          user: opp.recruiter,
          senderUserId: req.user.id,
          title: 'New Application Received',
          message: `${req.user.name} applied for ${opp.title}`,
          type: 'application',
          relatedId: opp._id
        });
      } catch (notifErr) {
        console.error('Notification creation failed (non-blocking):', notifErr.message);
      }

      res.status(201).json({ success: true, message: 'Application submitted successfully', application });
    } catch (error) {
      console.error('Apply for opportunity error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid opportunity ID format' });
      }
      res.status(500).json({ message: 'Failed to submit application', error: error.message });
    }
  }
);

module.exports = router;
