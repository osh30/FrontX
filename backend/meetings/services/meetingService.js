const crypto = require('crypto');
const Meeting = require('../../models/Meeting');
const Participant = require('../../models/Participant');
const Session = require('../../models/Session');
const MentorshipSession = require('../../models/MentorshipSession');
const Interview = require('../../models/Interview');
const SessionAttendance = require('../../models/SessionAttendance');
const InterviewAttendance = require('../../models/InterviewAttendance');
const MeetingSetting = require('../../models/MeetingSetting');
const MeetingNotification = require('../../models/MeetingNotification');
const { createParticipantToken } = require('../livekit/tokenService');
const { createRoom, deleteRoom } = require('../livekit/roomService');
const { startRoomRecording, stopRoomRecording } = require('../livekit/egressService');
const { validateParticipant } = require('./participantService');
const config = require('../config');

const generateRoomId = () => `fm-${crypto.randomBytes(4).toString('hex')}`;

const createError = (message, statusCode = 400) =>
  Object.assign(new Error(message), { statusCode });

const isSessionExpired = (dateStr, timeStr, durationMinutes) => {
  if (!dateStr || !timeStr) return false;
  const duration = durationMinutes || 30;
  
  const dateObj = new Date(dateStr);
  const timeMatch = String(timeStr).match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!timeMatch) return false;
  
  let hours = parseInt(timeMatch[1], 10);
  const mins = parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3];
  
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  
  dateObj.setHours(hours, mins, 0, 0);
  const endTime = new Date(dateObj.getTime() + duration * 60000);
  return new Date() > endTime;
};

const CLOSED_MEETING_STATUSES = ['ended', 'cancelled', 'expired'];

const removeClosedMeeting = async (meetingId) => {
  await Promise.all([
    Meeting.deleteOne({ _id: meetingId }),
    Participant.deleteMany({ meetingId }),
    MeetingSetting.deleteMany({ meetingId }),
    MeetingNotification.deleteMany({ meetingId }),
  ]);
};

const createInviteNotifications = async (meetingId, title, recipientIds, type = 'invite') => {
  const unique = [...new Set(recipientIds.map((id) => String(id)))];
  if (unique.length === 0) return;
  await MeetingNotification.insertMany(
    unique.map((recipientId) => ({
      meetingId,
      recipientId,
      type,
      title,
    })),
  );
};

const recordAttendance = async (meeting, userId, action) => {
  if (!meeting.linkedId) return;
  const now = new Date();

  const update = async (Model, targetField, filter) => {
    if (action === 'join') {
      await Model.findOneAndUpdate(
        filter,
        {
          $set: { attended: true, joinedAt: now },
          $setOnInsert: { meetingId: meeting._id },
        },
        { upsert: true, new: true },
      );
    } else {
      const existing = await Model.findOne(filter);
      if (existing) {
        existing.leftAt = now;
        existing.durationSeconds = Math.round((now - existing.joinedAt) / 1000) || 0;
        await existing.save();
      }
    }
  };

  if (meeting.meetingType === 'session') {
    await update(SessionAttendance, 'sessionId', { sessionId: meeting.linkedId, userId });
  } else if (meeting.meetingType === 'interview') {
    await update(InterviewAttendance, 'interviewId', { interviewId: meeting.linkedId, userId });
  }
};

const createMeeting = async ({ user, body, skipNotifications = false }) => {
  const {
    title,
    meetingType = 'general',
    duration = 60,
    startTime,
    participants = [],
    settings = {},
    linkedId,
  } = body || {};

  if (!title || !String(title).trim()) {
    throw createError('Meeting title is required');
  }

  const roomId = generateRoomId();

  const meeting = await Meeting.create({
    roomId,
    hostId: user.id,
    participantIds: participants,
    title: String(title).trim(),
    meetingType,
    duration: Number(duration) || 60,
    startTime: startTime ? new Date(startTime) : new Date(),
    endTime: null,
    status: 'scheduled',
    linkedId: linkedId || null,
  });

  const setting = await MeetingSetting.create({ meetingId: meeting._id, ...settings });
  meeting.settings = setting._id;
  await meeting.save();

  try {
    await createRoom({
      name: meeting.roomId,
      maxParticipants: Number(settings.maxParticipants) || 50,
      emptyTimeout: 60,
    });
  } catch (err) {
    console.warn(`[meetings] LiveKit room auto-creation deferred for ${meeting.roomId}: ${err.message}`);
  }

  const allUserIds = [...new Set([...participants, user.id].map((id) => String(id)))];

  await Participant.insertMany(
    allUserIds.map((userId) => ({
      meetingId: meeting._id,
      userId,
      role: userId === String(user.id) ? 'host' : 'participant',
      status: userId === String(user.id) ? 'joined' : 'invited',
      joinedAt: userId === String(user.id) ? new Date() : null,
    })),
  );

  if (!skipNotifications) {
    await MeetingNotification.create({
      meetingId: meeting._id,
      recipientId: user.id,
      type: 'created',
      title: `Meeting created: ${meeting.title}`,
    });

    await createInviteNotifications(meeting._id, `You are invited to: ${meeting.title}`, participants);
  }

  return meeting;
};

const createFrontxMeeting = async ({
  hostId,
  hostName = 'Host',
  hostRole = 'alumni',
  title,
  meetingType = 'general',
  duration = 60,
  startTime,
  participantIds = [],
  linkedId,
}) => {
  const meeting = await createMeeting({
    user: { id: hostId, name: hostName, role: hostRole },
    body: {
      title,
      meetingType,
      duration,
      startTime: startTime ? new Date(startTime) : new Date(),
      participants: participantIds,
      linkedId,
    },
    skipNotifications: true,
  });
  return meeting.roomId;
};

const joinMeeting = async ({ user, roomId }) => {
  const validated = await validateParticipant({ user, roomId });
  if (!validated.valid) {
    throw createError(validated.message, validated.statusCode || 403);
  }
  const meeting = validated.meeting;
  const participantRole = validated.role;

  await Participant.findOneAndUpdate(
    { meetingId: meeting._id, userId: user.id },
    {
      $set: {
        role: participantRole,
        status: 'joined',
        joinedAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );

  if (!meeting.participantIds.some((id) => String(id) === String(user.id))) {
    meeting.participantIds.push(user.id);
  }

  if (meeting.status === 'scheduled' && participantRole === 'host') {
    meeting.status = 'active';
  }
  await meeting.save();

  await recordAttendance(meeting, user.id, 'join');

  const token = await createParticipantToken({
    identity: String(user.id),
    name: user.name,
    roomName: meeting.roomId,
    metadata: JSON.stringify({ role: user.role, meetingId: String(meeting._id), meetingRole: participantRole }),
  });

  return { meeting, token, role: participantRole };
};

const leaveMeeting = async ({ user, roomId }) => {
  const meeting = await Meeting.findOne({ roomId });
  if (!meeting) throw createError('Meeting not found', 404);

  const participant = await Participant.findOneAndUpdate(
    { meetingId: meeting._id, userId: user.id },
    { $set: { status: 'left', leftAt: new Date() } },
    { new: true },
  );

  await recordAttendance(meeting, user.id, 'leave');

  return { success: true, participant };
};

const endMeeting = async ({ user, roomId }) => {
  const meeting = await Meeting.findOne({ roomId });
  if (!meeting) throw createError('Meeting not found', 404);

  if (String(meeting.hostId) !== String(user.id)) {
    throw createError('Only the meeting host can end this meeting', 403);
  }

  meeting.status = 'ended';
  meeting.endTime = new Date();
  await meeting.save();

  const roomResult = await deleteRoom(meeting.roomId);
  if (!roomResult.deleted) {
    console.warn(`[meetings] LiveKit room cleanup skipped for ${meeting.roomId}: ${roomResult.error}`);
  }

  await Participant.updateMany(
    { meetingId: meeting._id, status: 'joined' },
    { $set: { status: 'left', leftAt: new Date() } },
  );

  await createInviteNotifications(
    meeting._id,
    `Meeting ended: ${meeting.title}`,
    meeting.participantIds,
    'ended',
  );

  return meeting;
};

const getMeetingParticipants = async ({ user, roomId }) => {
  const meeting = await Meeting.findOne({ roomId });
  if (!meeting) throw createError('Meeting not found', 404);

  const canView =
    user &&
    (String(meeting.hostId) === String(user.id) ||
      (meeting.participantIds || []).some((id) => String(id) === String(user.id)));
  if (user && !canView) {
    throw createError('You are not part of this meeting', 403);
  }

  const participants = await Participant.find({ meetingId: meeting._id })
    .populate('userId', 'name email role profilePicture')
    .sort({ joinedAt: 1 })
    .lean();

  const enriched = participants.map((p) => {
    let durationSeconds = 0;
    if (p.joinedAt && p.leftAt) {
      durationSeconds = Math.max(0, Math.round((new Date(p.leftAt) - new Date(p.joinedAt)) / 1000));
    } else if (p.status === 'joined' && meeting.startTime) {
      const anchor = meeting.endTime || new Date();
      durationSeconds = Math.max(0, Math.round((new Date(anchor) - new Date(meeting.startTime)) / 1000));
    }
    return { ...p, durationSeconds };
  });

  return {
    meetingId: meeting._id,
    roomId,
    meeting: {
      _id: meeting._id,
      title: meeting.title,
      status: meeting.status,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      hostId: meeting.hostId,
    },
    participants: enriched,
  };
};

const startMeetingRecording = async ({ user, roomId }) => {
  const meeting = await Meeting.findOne({ roomId });
  if (!meeting) throw createError('Meeting not found', 404);
  if (String(meeting.hostId) !== String(user.id)) {
    throw createError('Only the meeting host can control recording', 403);
  }
  if (meeting.recording && meeting.recording.isRecording) {
    return { meeting, recording: meeting.recording };
  }

  const result = await startRoomRecording({ roomName: meeting.roomId });
  meeting.recording = {
    isRecording: true,
    egressId: result.egressId || '',
    url: result.url || '',
    startedAt: new Date(),
    endedAt: null,
  };
  await meeting.save();
  return { meeting, recording: meeting.recording };
};

const stopMeetingRecording = async ({ user, roomId }) => {
  const meeting = await Meeting.findOne({ roomId });
  if (!meeting) throw createError('Meeting not found', 404);
  if (String(meeting.hostId) !== String(user.id)) {
    throw createError('Only the meeting host can control recording', 403);
  }
  if (!(meeting.recording && meeting.recording.isRecording)) {
    return { meeting, recording: meeting.recording || { isRecording: false } };
  }

  const egressId = meeting.recording.egressId;
  let url = meeting.recording.url || '';
  if (egressId) {
    try {
      const result = await stopRoomRecording({ egressId });
      url = result.url || url;
    } catch (err) {
      console.warn(`[meetings] stop egress failed for ${roomId}: ${err.message}`);
    }
  }

  meeting.recording = {
    isRecording: false,
    egressId: '',
    url,
    startedAt: meeting.recording.startedAt || null,
    endedAt: new Date(),
  };
  await meeting.save();
  return { meeting, recording: meeting.recording };
};

const getMeetingDetails = async ({ roomId }) => {
  const meeting = await Meeting.findOne({ roomId })
    .populate('hostId', 'name email role profilePicture')
    .populate('participantIds', 'name email role profilePicture');
  if (!meeting) throw createError('Meeting not found', 404);

  const settings = await MeetingSetting.findOne({ meetingId: meeting._id });
  const participantCount = await Participant.countDocuments({
    meetingId: meeting._id,
    status: 'joined',
  });

  return { meeting, settings, participantCount };
};

const getOrCreateSessionMeeting = async ({ user, sessionId }) => {
  const session = await Session.findById(sessionId);
  if (!session) throw createError('Session not found', 404);

  const isAlumni = String(session.alumni) === String(user.id);
  const isStudent = String(session.student) === String(user.id);
  if (!isAlumni && !isStudent) {
    throw createError('You are not part of this session', 403);
  }

  if (isSessionExpired(session.date, session.time, session.duration)) {
    throw createError('This session has already ended', 403);
  }

  if (session.meetingType === 'external') {
    if (!session.meetingLink) {
      throw createError('This session does not have an external meeting link', 400);
    }
    return { meetingType: 'external', platform: session.platform, externalUrl: session.meetingLink };
  }

  let meeting = await Meeting.findOne({ meetingType: 'session', linkedId: session._id });
  if (meeting && CLOSED_MEETING_STATUSES.includes(meeting.status)) {
    await removeClosedMeeting(meeting._id);
    meeting = null;
  }
  if (!meeting) {
    meeting = await createMeeting({
      user: { id: String(session.alumni), name: 'Session Host', role: 'alumni' },
      body: {
        title: session.title,
        meetingType: 'session',
        duration: session.duration || 60,
        startTime: session.date,
        participants: [session.alumni, session.student],
        linkedId: session._id,
      },
    });
    session.roomId = meeting.roomId;
    await session.save();
  }

  const joined = await joinMeeting({ user, roomId: meeting.roomId });
  return { roomId: meeting.roomId, meeting: joined.meeting, token: joined.token, serverUrl: config.livekit.url, identity: String(user.id) };
};

const getOrCreateMentorshipMeeting = async ({ user, sessionId }) => {
  const session = await MentorshipSession.findById(sessionId);
  if (!session) throw createError('Session not found', 404);

  const isAlumni = String(session.alumniId) === String(user.id);
  const isSelected = (session.selectedStudents || []).some((id) => String(id) === String(user.id));
  if (!isAlumni && !isSelected) {
    throw createError('You are not part of this session', 403);
  }

  if (isSessionExpired(session.sessionDate, session.sessionTime, session.sessionDuration)) {
    throw createError('This session has already ended', 409);
  }

  if (session.meetingType === 'external') {
    if (!session.meetingLink) {
      throw createError('This session does not have an external meeting link', 400);
    }
    return { meetingType: 'external', platform: session.meetingPlatform, externalUrl: session.meetingLink };
  }

  let meeting = await Meeting.findOne({ meetingType: 'session', linkedId: session._id });
  if (meeting && CLOSED_MEETING_STATUSES.includes(meeting.status)) {
    await removeClosedMeeting(meeting._id);
    meeting = null;
  }
  if (!meeting) {
    meeting = await createMeeting({
      user: { id: String(session.alumniId), name: 'Session Host', role: 'alumni' },
      body: {
        title: session.sessionTitle,
        meetingType: 'session',
        duration: session.sessionDuration || 60,
        startTime: session.sessionDate,
        participants: [session.alumniId, ...(session.selectedStudents || [])],
        linkedId: session._id,
      },
    });
    session.roomId = meeting.roomId;
    await session.save();
  }

  const joined = await joinMeeting({ user, roomId: meeting.roomId });
  return { roomId: meeting.roomId, meeting: joined.meeting, token: joined.token, serverUrl: config.livekit.url, identity: String(user.id) };
};

const getOrCreateInterviewMeeting = async ({ user, interviewId }) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) throw createError('Interview not found', 404);

  const isRecruiter = String(interview.recruiter) === String(user.id);
  const isStudent = String(interview.student) === String(user.id);
  if (!isRecruiter && !isStudent) {
    throw createError('You are not part of this interview', 403);
  }

  if (interview.status === 'cancelled') {
    throw createError('This interview has been cancelled', 403);
  }
  if (interview.status === 'completed') {
    throw createError('This interview has already been completed', 403);
  }

  if (interview.meetingType === 'external') {
    if (!interview.meetingLink) {
      throw createError('This interview does not have an external meeting link', 400);
    }
    return { meetingType: 'external', platform: interview.platform, externalUrl: interview.meetingLink };
  }

  let meeting = await Meeting.findOne({ meetingType: 'interview', linkedId: interview._id });
  if (meeting && CLOSED_MEETING_STATUSES.includes(meeting.status)) {
    await removeClosedMeeting(meeting._id);
    meeting = null;
  }
  if (!meeting) {
    meeting = await createMeeting({
      user: { id: String(interview.recruiter), name: 'Recruiter', role: 'recruiter' },
      body: {
        title: interview.title || 'Interview',
        meetingType: 'interview',
        duration: interview.duration || 30,
        startTime: interview.date,
        participants: [interview.recruiter, interview.student],
        linkedId: interview._id,
      },
    });
    interview.roomId = meeting.roomId;
    await interview.save();
  }

  const joined = await joinMeeting({ user, roomId: meeting.roomId });
  return {
    roomId: meeting.roomId,
    meeting: joined.meeting,
    token: joined.token,
    role: joined.role,
    serverUrl: config.livekit.url,
    identity: String(user.id),
  };
};

const getMeetingHistory = async ({ userId, query = {} }) => {
  const { status } = query;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {
    $or: [{ hostId: userId }, { participantIds: userId }],
  };
  if (status) filter.status = status;

  const [meetings, total] = await Promise.all([
    Meeting.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('hostId', 'name email profilePicture')
      .lean(),
    Meeting.countDocuments(filter),
  ]);

  const ids = meetings.map((m) => m._id);
  const counts = ids.length
    ? await Participant.aggregate([
        { $match: { meetingId: { $in: ids } } },
        {
          $group: {
            _id: '$meetingId',
            joined: { $sum: { $cond: [{ $eq: ['$status', 'joined'] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ])
    : [];
  const countsByMeeting = new Map(counts.map((r) => [String(r._id), r]));

  const enriched = meetings.map((m) => {
    const c = countsByMeeting.get(String(m._id)) || { joined: 0, total: 0 };
    return {
      ...m,
      myRole: String(m.hostId?._id || m.hostId) === String(userId) ? 'host' : 'participant',
      participantCount: c.total,
      joinedCount: c.joined,
      actualDurationSeconds:
        m.endTime && m.startTime
          ? Math.max(0, Math.round((new Date(m.endTime) - new Date(m.startTime)) / 1000))
          : null,
    };
  });

  return { meetings: enriched, total, page, limit, pages: Math.ceil(total / limit) };
};

module.exports = {
  createMeeting,
  joinMeeting,
  leaveMeeting,
  endMeeting,
  getMeetingParticipants,
  getMeetingDetails,
  getMeetingHistory,
  startMeetingRecording,
  stopMeetingRecording,
  getOrCreateSessionMeeting,
  getOrCreateMentorshipMeeting,
  getOrCreateInterviewMeeting,
  createFrontxMeeting,
};
