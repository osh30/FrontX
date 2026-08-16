const Meeting = require('../../models/Meeting');
const Participant = require('../../models/Participant');
const MeetingNotification = require('../../models/MeetingNotification');
const { deleteRoom } = require('../livekit/roomService');
const { stopRoomRecording } = require('../livekit/egressService');
const { getRoomState, deleteRoomState, sweepInactiveRooms } = require('../socket/meetingNamespace');
const { effectiveWindow, getMeetingPhase, hasParticipated } = require('../lib/meetingTime');

const GRACE_SECONDS = 5 * 60;
const STALE_ROOM_IDLE_MS = 15 * 60 * 1000;

// Finalize the linked scheduled source (one-on-one Session, MentorshipSession, or Interview)
// based on whether anyone actually joined during its window.
const finalizeLinkedSource = async (meeting) => {
  if (!meeting.linkedId) return;

  const wasJoined = hasParticipated(meeting);
  const isInterview = meeting.meetingType === 'interview';

  if (isInterview) {
    const Interview = require('../../models/Interview');
    const interview = await Interview.findById(meeting.linkedId);
    if (!interview) return;
    if (interview.status === 'completed' || interview.status === 'cancelled' || interview.status === 'canceled') return;
    
    // Only mark as completed if someone joined. If no one joined, keep the existing status
    // (e.g. 'scheduled') so that "Scheduled, Cancelled, Rescheduled" statuses work normally.
    if (wasJoined) {
      interview.status = 'completed';
      await interview.save();
    }
    return;
  }

  // meetingType 'session' covers one-on-one Session and group MentorshipSession.
  const Session = require('../../models/Session');
  const MentorshipSession = require('../../models/MentorshipSession');
  const session =
    (await Session.findById(meeting.linkedId)) ||
    (await MentorshipSession.findById(meeting.linkedId));
  if (!session) return;
  if (session.status === 'Completed' || session.status === 'Cancelled' || session.status === 'Past Session') return;
  session.status = wasJoined ? 'Completed' : 'Past Session';
  await session.save();
};

const mongoose = require('mongoose');

const runCleanup = async () => {
  if (mongoose.connection.readyState !== 1) {
    return { skipped: true, reason: 'database_not_connected' };
  }

  const now = Date.now();

  const activeMeetings = await Meeting.find({ status: { $in: ['active', 'scheduled'] } }).lean();
  for (const meeting of activeMeetings) {
    // Time-bound scheduled meetings (sessions/interviews) use their schedule window.
    if (meeting.meetingType === 'session' || meeting.meetingType === 'interview') {
      const window = effectiveWindow(meeting);
      const phase = getMeetingPhase(window, new Date(now));
      if (phase.phase === 'ended') {
        const isInterview = meeting.meetingType === 'interview';
        const finalStatus = isInterview ? (meeting.hasStarted ? 'ended' : 'canceled') : (meeting.hasStarted ? 'ended' : 'expired');

        if (meeting.recording && meeting.recording.egressId) {
          try {
            await stopRoomRecording({ egressId: meeting.recording.egressId });
          } catch (err) {
            console.warn(`[meetings] cleanup: stop egress failed for ${meeting.roomId}: ${err.message}`);
          }
        }

        // Keep the LiveKit room alive; only block new tokens by closing the meeting record.
        await Meeting.updateOne(
          { _id: meeting._id },
          {
            $set: {
              status: finalStatus,
              endTime: new Date(now),
              'recording.isRecording': false,
            },
          },
        );

        await finalizeLinkedSource(meeting);

        await Participant.updateMany(
          { meetingId: meeting._id, status: 'joined' },
          { $set: { status: 'left', leftAt: new Date(now) } },
        );

        deleteRoomState(meeting.roomId);
        console.log(`[meetings] Cleanup: finalized ${meeting.roomId} (${meeting.title})`);
      }
      continue;
    }

    // Generic meetings keep the previous grace-based behavior.
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

  // Recovery sweep for Interviews and Sessions that got stuck or never had a meeting created
  // (e.g. if the sweep crashed previously, or if it's an offline/external event that is past due).
  try {
    const Interview = require('../../models/Interview');
    const Session = require('../../models/Session');
    const MentorshipSession = require('../../models/MentorshipSession');

    // Sweep stuck Interviews
    const activeInterviews = await Interview.find({ status: { $in: ['scheduled', 'active'] } }).lean();
    for (const interview of activeInterviews) {
      const window = effectiveWindow(interview);
      const phase = getMeetingPhase(window, new Date(now));
      if (phase.phase === 'ended') {
        // If it's ended, we check if there's an associated meeting to determine if it was joined.
        const meeting = await Meeting.findOne({ meetingType: 'interview', linkedId: interview._id }).lean();
        const wasJoined = interview.hasStarted || (meeting && meeting.hasStarted);
        
        // For Offline interviews, we shouldn't automatically mark as completed if they didn't have a digital track, 
        // BUT if the user explicitly clicked "Join" (which sets hasStarted), or if they expect Offline to complete?
        // The rule: "Only mark as completed if someone joined. If no one joined, keep the existing status (e.g. 'scheduled')"
        if (wasJoined) {
          await Interview.updateOne({ _id: interview._id }, { $set: { status: 'completed' } });
          console.log(`[meetings] Recovery: Marked interview ${interview._id} as completed.`);
        }
      }
    }

    // Sweep stuck Sessions
    const activeSessions = await Session.find({ status: { $in: ['Upcoming', 'Ongoing', 'Scheduled'] } }).lean();
    for (const session of activeSessions) {
      const window = effectiveWindow(session);
      const phase = getMeetingPhase(window, new Date(now));
      if (phase.phase === 'ended') {
        const meeting = await Meeting.findOne({ meetingType: 'session', linkedId: session._id }).lean();
        const wasJoined = session.hasStarted || (meeting && meeting.hasStarted);
        const nextStatus = wasJoined ? 'Completed' : 'Past Session';
        await Session.updateOne({ _id: session._id }, { $set: { status: nextStatus } });
        console.log(`[meetings] Recovery: Marked session ${session._id} as ${nextStatus}.`);
      }
    }

    // Sweep stuck MentorshipSessions
    const activeMentorships = await MentorshipSession.find({ status: { $in: ['Upcoming', 'Ongoing', 'Scheduled'] } }).lean();
    for (const session of activeMentorships) {
      const window = effectiveWindow(session);
      const phase = getMeetingPhase(window, new Date(now));
      if (phase.phase === 'ended') {
        const meeting = await Meeting.findOne({ meetingType: 'session', linkedId: session._id }).lean();
        const wasJoined = session.hasStarted || (meeting && meeting.hasStarted);
        const nextStatus = wasJoined ? 'Completed' : 'Past Session';
        await MentorshipSession.updateOne({ _id: session._id }, { $set: { status: nextStatus } });
        console.log(`[meetings] Recovery: Marked mentorship session ${session._id} as ${nextStatus}.`);
      }
    }
  } catch (err) {
    console.error(`[meetings] Recovery sweep failed: ${err.message}`);
  }

  return { autoEnded: activeMeetings.length > 0 };
};

module.exports = { runCleanup };