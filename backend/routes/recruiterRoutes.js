const express = require('express');
const router = express.Router();
const { protectRecruiter } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');
const {
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
  getOpportunityRequests,
  resubmitOpportunity,
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
  messageCandidate
} = require('../controllers/recruiterController');

// All routes require authentication + recruiter role
router.use(protectRecruiter);

// ─── Dashboard ───
router.get('/dashboard', getDashboard);

// ─── Profile ───
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// ─── Company Profile ───
router.get('/company-profile', getCompanyProfile);
router.put('/company-profile', updateCompanyProfile);
router.post('/company-profile/logo', upload.single('logo'), uploadCompanyLogo);
router.delete('/company-profile/logo', removeCompanyLogo);

// ─── Opportunities ───
router.get('/opportunities', getOpportunities);
router.get('/opportunities/:id', getOpportunityById);
router.post('/opportunities', createOpportunity);
router.post('/opportunities/upload', upload.single('document'), async (req, res) => {
  try {
    const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const result = await uploadToCloudinary(req.file, 'frontx/opportunity-documents');
    res.json({ url: result.secure_url, name: req.file.originalname, type: req.file.mimetype });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});
router.put('/opportunities/:id', updateOpportunity);
router.delete('/opportunities/:id', deleteOpportunity);

// ─── Opportunity Requests (Approval Workflow) ───
router.get('/opportunity-requests', getOpportunityRequests);
router.put('/opportunities/:id/resubmit', resubmitOpportunity);

// ─── Applicants ───
router.get('/applicants', getApplicants);
router.get('/applicants/:id', getApplicantById);
router.put('/applicants/:id/status', updateApplicantStatus);
router.get('/shortlisted', getShortlisted);

// ─── Interviews ───
router.get('/interviews', getInterviews);
router.get('/interviews/:id', getInterviewById);
router.post('/interviews', scheduleInterview);
router.put('/interviews/:id', rescheduleInterview);
router.patch('/interviews/:id/reschedule', rescheduleInterview);
router.patch('/interviews/:id/cancel', cancelInterview);
router.patch('/interviews/:id/complete', completeInterview);
router.delete('/interviews/:id', deleteInterview);

// ─── Notifications ───
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);
router.delete('/notifications/:id', deleteNotification);
router.delete('/notifications/read-all', deleteAllReadNotifications);

// ─── Analytics ───
router.get('/analytics', getAnalytics);

// ─── Talent Search ───
router.get('/search', searchCandidates);
router.get('/candidate/:id', getCandidateById);
router.post('/save-candidate', saveCandidate);
router.get('/saved-candidates', getSavedCandidates);
router.post('/invite', inviteCandidate);
router.post('/message', messageCandidate);

module.exports = router;
