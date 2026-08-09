const Meeting = require('../../models/Meeting');
const { effectiveWindow, getMeetingPhase, EXPIRED_MSG } = require('../lib/meetingTime');

const CLOSED_STATUSES = ['ended', 'cancelled', 'canceled', 'expired'];

const validateParticipant = async ({ user, roomId }) => {
  if (!user || !user.id) {
    return { valid: false, message: 'Unauthorized', statusCode: 401 };
  }

  if (!roomId) {
    return { valid: false, message: 'roomId is required', statusCode: 400 };
  }

  const meeting = await Meeting.findOne({ roomId });
  if (!meeting) {
    return { valid: false, message: 'Meeting not found', statusCode: 404 };
  }

  if (CLOSED_STATUSES.includes(meeting.status)) {
    return { valid: false, message: `Meeting is already ${meeting.status}`, statusCode: 400 };
  }

  const isHost = String(meeting.hostId) === String(user.id);
  const isInvited = (meeting.participantIds || []).some((id) => String(id) === String(user.id));

  if (!isHost && !isInvited) {
    return { valid: false, message: 'You are not a participant of this meeting', statusCode: 403 };
  }

  // Enforce the scheduled window only for time-bound session/interview meetings.
  if (meeting.meetingType === 'session' || meeting.meetingType === 'interview') {
    const window = effectiveWindow(meeting);
    const phase = getMeetingPhase(window);
    if (phase.phase === 'ended') {
      return { valid: false, message: EXPIRED_MSG, statusCode: 403 };
    }
  }

  return {
    valid: true,
    meeting,
    role: isHost ? 'host' : 'participant',
  };
};

module.exports = { validateParticipant };
