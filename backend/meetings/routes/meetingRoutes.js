const express = require('express');
const { protect } = require('../../middleware/auth');
const { createParticipantToken } = require('../livekit/tokenService');
const { createRoom, listRooms, listParticipants, deleteRoom } = require('../livekit/roomService');
const egressService = require('../livekit/egressService');
const meetingService = require('../services/meetingService');
const participantService = require('../services/participantService');
const config = require('../config');

const router = express.Router();

const asyncHandler = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((err) => {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Server error' });
  });

router.get('/token', protect, asyncHandler(async (req, res) => {
  const { roomName } = req.query;
  if (!roomName) {
    return res.status(400).json({ message: 'roomName is required' });
  }

  const validated = await participantService.validateParticipant({ user: req.user, roomId: roomName });
  if (!validated.valid) {
    return res.status(validated.statusCode || 403).json({ message: validated.message });
  }

  const token = await createParticipantToken({
    identity: String(req.user.id),
    name: req.user.name,
    roomName,
    metadata: JSON.stringify({ role: req.user.role, email: req.user.email, meetingRole: validated.role }),
  });

  res.json({ token, url: config.livekit.url });
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const meeting = await meetingService.createMeeting({ user: req.user, body: req.body });
  res.status(201).json({ meeting });
}));

router.get('/history', protect, asyncHandler(async (req, res) => {
  const data = await meetingService.getMeetingHistory({
    userId: req.user.id,
    query: req.query,
  });
  res.json(data);
}));

router.get('/config', protect, asyncHandler(async (req, res) => {
  res.json({ recording: { configured: egressService.isConfigured() } });
}));

router.post('/rooms', protect, asyncHandler(async (req, res) => {
  const { name, maxParticipants, emptyTimeout } = req.body || {};
  if (!name) {
    return res.status(400).json({ message: 'Room name is required' });
  }
  const room = await createRoom({ name, maxParticipants, emptyTimeout });
  res.status(201).json({ room });
}));

router.get('/rooms', protect, asyncHandler(async (req, res) => {
  res.json(await listRooms());
}));

router.get('/rooms/:roomName/participants', protect, asyncHandler(async (req, res) => {
  res.json(await listParticipants(req.params.roomName));
}));

router.delete('/rooms/:roomName', protect, asyncHandler(async (req, res) => {
  const result = await deleteRoom(req.params.roomName);
  if (!result.deleted) {
    return res.status(500).json({ message: result.error || 'Failed to delete room' });
  }
  res.json({ success: true });
}));

router.post('/:roomId/validate', protect, asyncHandler(async (req, res) => {
  const result = await participantService.validateParticipant({
    user: req.user,
    roomId: req.params.roomId,
  });
  if (!result.valid) {
    return res.status(result.statusCode || 403).json({ message: result.message });
  }
  res.json(result);
}));

router.post('/session/:sessionId/join', protect, asyncHandler(async (req, res) => {
  const data = await meetingService.getOrCreateSessionMeeting({
    user: req.user,
    sessionId: req.params.sessionId,
  });
  res.json(data);
}));

router.post('/mentorship-session/:sessionId/join', protect, asyncHandler(async (req, res) => {
  const data = await meetingService.getOrCreateMentorshipMeeting({
    user: req.user,
    sessionId: req.params.sessionId,
  });
  res.json(data);
}));

router.post('/interview/:interviewId/join', protect, asyncHandler(async (req, res) => {
  const data = await meetingService.getOrCreateInterviewMeeting({
    user: req.user,
    interviewId: req.params.interviewId,
  });
  res.json(data);
}));

router.post('/:roomId/join', protect, asyncHandler(async (req, res) => {
  const data = await meetingService.joinMeeting({
    user: req.user,
    roomId: req.params.roomId,
  });
  res.json(data);
}));

router.post('/:roomId/leave', protect, asyncHandler(async (req, res) => {
  const data = await meetingService.leaveMeeting({
    user: req.user,
    roomId: req.params.roomId,
  });
  res.json(data);
}));

router.post('/:roomId/end', protect, asyncHandler(async (req, res) => {
  const meeting = await meetingService.endMeeting({
    user: req.user,
    roomId: req.params.roomId,
  });
  res.json({ meeting });
}));

router.get('/:roomId/participants', protect, asyncHandler(async (req, res) => {
  const data = await meetingService.getMeetingParticipants({
    user: req.user,
    roomId: req.params.roomId,
  });
  res.json(data);
}));

router.get('/:roomId', protect, asyncHandler(async (req, res) => {
  const data = await meetingService.getMeetingDetails({
    roomId: req.params.roomId,
  });
  res.json(data);
}));

module.exports = router;
