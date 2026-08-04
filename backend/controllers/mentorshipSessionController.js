const MentorshipSession = require('../models/MentorshipSession');
const MentorshipRequest = require('../models/MentorshipRequest');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const User = require('../models/User');
const meetingService = require('../meetings/services/meetingService');

// @desc    Create a new mentorship group session
// @route   POST /api/mentorship-sessions
// @access  Private (Alumni)
const createMentorshipSession = async (req, res) => {
  try {
    const {
      sessionTitle,
      sessionCategory,
      sessionDescription,
      selectedStudents,
      meetingType,
      meetingPlatform,
      meetingLink,
      sessionDate,
      sessionTime,
      sessionDuration,
      agenda
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can schedule group mentorship sessions.' });
    }

    const effectiveMeetingType = meetingType === 'frontx' ? 'frontx' : 'external';
    if (effectiveMeetingType === 'external' && !meetingLink) {
      return res.status(400).json({ message: 'Meeting link is required for external meetings.' });
    }

    // Prepare attendance array
    const attendance = selectedStudents.map(studentId => ({
      studentId,
      status: 'Pending'
    }));

    const session = new MentorshipSession({
      sessionTitle,
      sessionCategory,
      sessionDescription,
      alumniId: req.user.id,
      selectedStudents,
      meetingType: effectiveMeetingType,
      meetingPlatform: effectiveMeetingType === 'frontx' ? undefined : meetingPlatform,
      meetingLink: effectiveMeetingType === 'frontx' ? undefined : meetingLink,
      sessionDate,
      sessionTime,
      sessionDuration,
      agenda,
      status: 'Upcoming',
      attendance
    });

    await session.save();

    if (effectiveMeetingType === 'frontx') {
      try {
        const roomId = await meetingService.createFrontxMeeting({
          hostId: req.user.id,
          hostName: user.name || 'Alumni',
          hostRole: 'alumni',
          title: sessionTitle,
          meetingType: 'session',
          duration: sessionDuration || 60,
          startTime: sessionDate,
          participantIds: [req.user.id, ...(selectedStudents || [])],
          linkedId: session._id
        });
        session.roomId = roomId;
        await session.save();
      } catch (err) {
        console.warn(`[mentorship-sessions] FrontX room creation deferred for ${session._id}: ${err.message}`);
      }
    }

    // Create Global Activity
    const activity = await Activity.create({
      user: req.user.id,
      title: `scheduled a mentorship session: ${sessionTitle}`,
      type: 'mentorship',
      color: 'bg-orange-100 text-orange-600',
      relatedId: session._id,
      isGlobal: true
    });
    await activity.populate('user', 'name profilePicture');
    if (req.app.get('io')) {
      req.app.get('io').emit('new_global_activity', activity);
    }

    // Create Notification for each student
    for (const studentId of selectedStudents) {
      await Notification.create({
        user: studentId,
        title: 'New Mentorship Session Scheduled',
        message: `Session: ${sessionTitle}\nDate: ${new Date(sessionDate).toLocaleDateString()}\nTime: ${sessionTime}\nMentor: ${user.name || 'Alumni'}`,
        type: 'mentor',
        relatedId: session._id
      });
      
      // Activity for Student
      await Activity.create({
        user: studentId,
        title: `Mentorship session scheduled: ${sessionTitle}`,
        type: 'mentorship',
        color: 'bg-green-100 text-green-600'
      });
      
      // Emit socket event if io exists
      if (req.app.get('io')) {
        req.app.get('io').to(studentId.toString()).emit('session_updated');
        req.app.get('io').to(studentId.toString()).emit('new_notification');
        req.app.get('io').emit('session_updated');
      }
    }

    // Create Activity for Alumni
    await Activity.create({
      user: req.user.id,
      title: `Scheduled mentorship session: ${sessionTitle}`,
      type: 'mentorship',
      color: 'bg-blue-100 text-blue-600'
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user's mentorship sessions
// @route   GET /api/mentorship-sessions
// @access  Private
const getMentorshipSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let filter = {};

    if (user.role === 'alumni') {
      filter = { alumniId: req.user.id };
    } else {
      filter = { selectedStudents: req.user.id };
    }

    const sessions = await MentorshipSession.find(filter)
      .populate('alumniId', 'name profilePicture department')
      .populate('selectedStudents', 'name profilePicture department session')
      .populate('attendance.studentId', 'name profilePicture')
      .sort({ sessionDate: 1, sessionTime: 1 });

    // Check for auto-complete
    const now = new Date();
    let updated = false;
    const io = req.app.get('io');

    for (const session of sessions) {
      if (session.status === 'Upcoming') {
        const sessionDateTime = new Date(session.sessionDate);
        const [hours, minutes] = session.sessionTime.split(':');
        let hour = parseInt(hours);
        sessionDateTime.setHours(hour, parseInt(minutes), 0, 0);
        sessionDateTime.setMinutes(sessionDateTime.getMinutes() + session.sessionDuration);

        if (now > sessionDateTime) {
          session.status = 'Completed';
          await session.save();

          // Notify each student
          for (const studentId of session.selectedStudents) {
            await Notification.create({
              user: studentId,
              title: 'Session Completed',
              message: `The session "${session.sessionTitle}" has ended. Check back for outcomes and feedback.`,
              type: 'mentor',
              relatedId: session._id
            });
            if (io) {
              io.to(studentId.toString()).emit('new_notification');
            }
          }

          // Emit general update
          if (io) {
            io.emit('session_updated');
          }

          const { recalculateProgress } = require('../utils/progressCalculator');
          for (const studentId of session.selectedStudents) {
            await recalculateProgress(studentId);
            if (io) {
              io.emit('progress_updated', { userId: studentId });
            }
          }

          updated = true;
        }
      }
    }

    if (updated) {
      const updatedSessions = await MentorshipSession.find(filter)
        .populate('alumniId', 'name profilePicture department')
        .populate('selectedStudents', 'name profilePicture department session')
        .populate('attendance.studentId', 'name profilePicture')
        .sort({ sessionDate: 1, sessionTime: 1 });
      return res.json(updatedSessions);
    }

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single session details
// @route   GET /api/mentorship-sessions/:id
// @access  Private
const getMentorshipSessionById = async (req, res) => {
  try {
    const session = await MentorshipSession.findById(req.params.id)
      .populate('alumniId', 'name profilePicture department bio')
      .populate('selectedStudents', 'name profilePicture department session bio')
      .populate('attendance.studentId', 'name profilePicture department');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get accepted students for the logged-in alumni
// @route   GET /api/mentorship-sessions/accepted-students
// @access  Private (Alumni)
const getAcceptedStudents = async (req, res) => {
  try {
    // Find all MentorshipRequests where this user is the alumni and status is accepted
    const requests = await MentorshipRequest.find({
      alumniId: req.user.id,
      status: 'accepted'
    }).populate('studentId', 'name profilePicture department session');

    // Extract unique students
    const uniqueStudentsMap = new Map();
    requests.forEach(req => {
      if (req.studentId && !uniqueStudentsMap.has(req.studentId._id.toString())) {
        uniqueStudentsMap.set(req.studentId._id.toString(), req.studentId);
      }
    });

    res.json(Array.from(uniqueStudentsMap.values()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Submit Session Outcome and Attendance
// @route   PUT /api/mentorship-sessions/:id/outcome
// @access  Private (Alumni)
const submitSessionOutcome = async (req, res) => {
  try {
    const { outcome, attendance } = req.body;
    
    const session = await MentorshipSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.alumniId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    session.outcome = outcome;
    
    // Update attendance
    if (attendance && Array.isArray(attendance)) {
      session.attendance = attendance;
    }

    await session.save();

    res.json({ message: 'Outcome submitted successfully', session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Cancel Session
// @route   PUT /api/mentorship-sessions/:id/cancel
// @access  Private (Alumni)
const cancelSession = async (req, res) => {
  try {
    const session = await MentorshipSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.alumniId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    session.status = 'Cancelled';
    await session.save();

    // Notify students
    for (const studentId of session.selectedStudents) {
      await Notification.create({
        user: studentId,
        title: 'Session Cancelled',
        message: `The session "${session.sessionTitle}" has been cancelled by the mentor.`,
        type: 'mentor',
        relatedId: session._id
      });
      if (req.app.get('io')) {
        req.app.get('io').to(studentId.toString()).emit('new_notification');
        req.app.get('io').to(studentId.toString()).emit('session_updated');
      }
    }

    res.json({ message: 'Session cancelled', session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMentorshipSession,
  getMentorshipSessions,
  getMentorshipSessionById,
  getAcceptedStudents,
  submitSessionOutcome,
  cancelSession
};
