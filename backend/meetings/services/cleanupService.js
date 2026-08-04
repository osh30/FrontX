const Meeting = require('../../models/Meeting');
const Participant = require('../../models/Participant');
const MeetingNotification = require('../../models/MeetingNotification');
const { deleteRoom } = require('../livekit/roomService');
const { stopRoomRecording } = require('../livekit/egressService');
const { getRoomState, deleteRoomState, sweepInactiveRooms } = require('../socket/meetingNamespace');

const GRACE_SECONDS = 5 * 60;
const STALE_ROOM_IDLE_MS = 15 * 60 * 1000;

const runCleanup = async () => {
  const now = Date.now();

  const activeMeetings = await Meeting.find({ status: { $in: ['active', 'scheduled'] } }).lean();
  for (const meeting of activeMeetings) {
    const startTimeMs = meeting.startTime ? new Date(meeting.startTime).getTime() : null;
    const createdAtMs = new Date(meeting.createdAt || Date.now()).getTime();
    const started = startTimeMs ? Math.max(startTimeMs, createdAtMs) : createdAtMs;
    
    const plannedMs = (Number(meeting.duration) || 60) * 60 * 1000;
    const overdue = now - started > plannedMs + GRACE_SECONDS * 1000;

    if (!overdue) continue;

    let newStatus = 'ended';
    if (meeting.status === 'scheduled') newStatus = 'expired';

    if (meeting.recording && meeting.recording.egressId) {
      try {
        await stopRoomRecording({ egressId: meeting.recording.egressId });
      } catch (err) {
        console.warn(`[meetings] cleanup: stop egress failed for ${meeting.roomId}: ${err.message}`);
      }
    }

    await deleteRoom(meeting.roomId);

    await Meeting.updateOne(
      { _id: meeting._id },
      {
        $set: {
          status: newStatus,
          endTime: new Date(now),
          'recording.isRecording': false,
        },
      },
    );

    if (newStatus === 'ended') {
      await Participant.updateMany(
        { meetingId: meeting._id, status: 'joined' },
        { $set: { status: 'left', leftAt: new Date(now) } },
      );
      const recipientIds = [...new Set((meeting.participantIds || []).map((id) => String(id)))];
      if (recipientIds.length > 0) {
        await MeetingNotification.insertMany(
          recipientIds.map((recipientId) => ({
            meetingId: meeting._id,
            recipientId,
            type: 'ended',
            title: `Meeting ended: ${meeting.title}`,
          })),
        );
      }
    }

    deleteRoomState(meeting.roomId);
    console.log(`[meetings] Cleanup: auto-marked ${newStatus} ${meeting.roomId} (${meeting.title})`);
  }

  sweepInactiveRooms(STALE_ROOM_IDLE_MS);

  return { autoEnded: activeMeetings.length > 0 };
};

module.exports = { runCleanup };
