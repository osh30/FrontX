const Session = require('../models/Session');
const Activity = require('../models/Activity');
const Deadline = require('../models/Deadline');
const Notification = require('../models/Notification');
const User = require('../models/User');
const meetingService = require('../meetings/services/meetingService');
const { computeScheduleWindow, deriveSessionStatus } = require('../meetings/lib/meetingTime');

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private (Alumni)
const createSession = async (req, res) => {
  try {
    const {
      studentId,
      title,
      type,
      meetingType,
      platform,
      meetingLink,
      goal,
      notes,
      date,
      time,
      duration
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'Alumni') {
      return res.status(403).json({ message: 'Only alumni can schedule sessions.' });
    }

    const effectiveMeetingType = meetingType === 'frontx' ? 'frontx' : 'external';
    if (effectiveMeetingType === 'external' && !meetingLink) {
      return res.status(400).json({ message: 'Meeting link is required for external meetings.' });
    }

    const session = new Session({
      alumni: req.user.id,
      student: studentId,
      title,
      type,
      meetingType: effectiveMeetingType,
      platform: effectiveMeetingType === 'frontx' ? undefined : platform,
      meetingLink: effectiveMeetingType === 'frontx' ? undefined : meetingLink,
      goal,
      notes,
      date,
      time,
      duration,
      status: 'Scheduled'
    });

    const schedule = computeScheduleWindow({ date, time, duration });
    if (schedule && schedule.start) {
      session.scheduleStart = schedule.start;
      session.scheduleEnd = schedule.end;
    }

    await session.save();

    if (effectiveMeetingType === 'frontx') {
      try {
        const roomId = await meetingService.createFrontxMeeting({
          hostId: req.user.id,
          hostName: user.name || 'Alumni',
          hostRole: 'alumni',
          title,
          meetingType: 'session',
          duration: duration || 60,
          startTime: schedule ? schedule.start : date,
          scheduleStart: session.scheduleStart,
          scheduleEnd: session.scheduleEnd,
          participantIds: [req.user.id, studentId],
          linkedId: session._id
        });
        session.roomId = roomId;
        await session.save();
      } catch (err) {
        console.warn(`[sessions] FrontX room creation deferred for ${session._id}: ${err.message}`);
      }
    }

    // Create Notification
    await Notification.create({
      user: studentId,
      title: 'Session Scheduled',
      message: `Your session "${title}" has been scheduled for ${new Date(date).toLocaleDateString()} at ${time}.`,
      type: 'mentor',
      relatedId: session._id
    });

    // Create Activity for Alumni
    await Activity.create({
      user: req.user.id,
      title: `Scheduled session: ${title}`,
      type: 'mentorship',
      color: 'bg-blue-100 text-blue-600'
    });

    // Create Activity for Student
    await Activity.create({
      user: studentId,
      title: `Session scheduled: ${title}`,
      type: 'mentorship',
      color: 'bg-green-100 text-green-600'
    });

    // Create Deadline for Alumni
    await Deadline.create({
      user: req.user.id,
      title: `Session: ${title}`,
      date: date,
      type: 'mentorship',
      relatedId: session._id
    });

    // Create Deadline for Student
    await Deadline.create({
      user: studentId,
      title: `Session: ${title}`,
      date: date,
      type: 'mentorship',
      relatedId: session._id
    });

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('session_updated');
      io.to(studentId.toString()).emit('new_notification');
      io.to(studentId.toString()).emit('notification:new');
    }

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user's sessions
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const filter = user.role === 'Alumni' ? { alumni: req.user.id } : { student: req.user.id };

    const sessions = await Session.find(filter)
      .populate('alumni', 'name profilePicture department')
      .populate('student', 'name profilePicture department')
      .sort({ date: 1, time: 1 });

    // Derive the real status from the schedule window (date + start time + duration)
    // so sessions whose time has passed can never be reported as Upcoming.
    const io = req.app.get('io');
    const now = new Date();
    let changed = false;
    for (const session of sessions) {
      const derived = deriveSessionStatus(session, now);
      if (derived && derived !== session.status) {
        session.status = derived;
        await session.save();
        changed = true;
      }
    }
    if (changed && io) {
      io.emit('session_updated');
    }

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single session details
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('alumni', 'name profilePicture department bio')
      .populate('student', 'name profilePicture department bio');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const derived = deriveSessionStatus(session, new Date());
    if (derived && derived !== session.status) {
      session.status = derived;
      await session.save();
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Complete a session & add feedback
// @route   PUT /api/sessions/:id/complete
// @access  Private (Alumni)
const completeSession = async (req, res) => {
  try {
    const { strengths, improvement, nextSteps, resources } = req.body;
    
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.alumni.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    session.status = 'Completed';
    session.feedbackStrengths = strengths;
    session.feedbackImprovement = improvement;
    session.feedbackNextSteps = nextSteps;
    session.feedbackResources = resources;

    await session.save();

    // Create Notification
    await Notification.create({
      user: session.student,
      title: 'Session Completed',
      message: `Your session "${session.title}" is complete. Feedback is available!`,
      type: 'mentor',
      relatedId: session._id
    });

    // Create Activity for Alumni
    await Activity.create({
      user: req.user.id,
      title: `Completed session: ${session.title}`,
      type: 'mentorship',
      color: 'bg-purple-100 text-purple-600'
    });

    // Create Activity for Student
    await Activity.create({
      user: session.student,
      title: `Received feedback for: ${session.title}`,
      type: 'mentorship',
      color: 'bg-purple-100 text-purple-600'
    });

    // We can clean up the deadlines here if needed, or Deadline can just filter out passed dates.
    // getDeadlines in deadlineController already filters `date >= today`

    if (req.app.get('io')) {
      req.app.get('io').emit('session_updated');
    }

    const io_complete = req.app.get('io');
    if (io_complete) {
      const { recalculateProgress } = require('../utils/progressCalculator');
      await recalculateProgress(req.user.id);
      io_complete.emit('progress_updated', { userId: req.user.id });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  completeSession
};
