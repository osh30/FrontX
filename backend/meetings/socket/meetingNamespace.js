const { verifyToken } = require('../lib/jwt');
const config = require('../config');
const { validateParticipant } = require('../services/participantService');

const { events: EVENTS } = config.socket;

const rooms = new Map();

const ensureRoom = (roomCode, hostSocketId) => {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, {
      hostSocketId,
      sockets: new Map(),
      waiting: new Map(),
      locked: false,
      waitingRoom: true,
      recording: { isRecording: false, url: '' },
      updatedAt: Date.now(),
    });
  } else {
    rooms.get(roomCode).updatedAt = Date.now();
  }
  return rooms.get(roomCode);
};

const sweepInactiveRooms = (maxIdleMs) => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    const idle = now - (room.updatedAt || now);
    if (room.sockets.size === 0 && room.waiting.size === 0 && idle > maxIdleMs) {
      rooms.delete(code);
    }
  }
};

const persistJoin = async (roomCode, user, role) => {
  try {
    const Meeting = require('../../models/Meeting');
    const Participant = require('../../models/Participant');
    const meeting = await Meeting.findOne({ roomId: roomCode });
    if (!meeting) return;
    const now = new Date();

    // Track the first actual LiveKit connection so lifecycle statuses can tell
    // "attended" sessions/interviews apart from never-joined ones.
    if (!meeting.hasStarted) {
      await Meeting.updateOne(
        { _id: meeting._id },
        { $set: { hasStarted: true }, $setOnInsert: { firstJoinedAt: now } },
      );
      if (meeting.linkedId) {
        let src = null;
        if (meeting.meetingType === 'interview') {
          src = await require('../../models/Interview').findOne({ _id: meeting.linkedId });
        } else {
          // meetingType 'session' is shared by one-on-one Session and group MentorshipSession.
          src = (await require('../../models/Session').findOne({ _id: meeting.linkedId })) ||
            (await require('../../models/MentorshipSession').findOne({ _id: meeting.linkedId }));
        }
        if (src && !src.hasStarted) {
          src.hasStarted = true;
          if (!src.firstJoinedAt) src.firstJoinedAt = now;
          if (meeting.meetingType === 'session' && (src.status === 'Upcoming' || src.status === 'Scheduled')) {
            src.status = 'Ongoing';
          } else if (meeting.meetingType === 'interview' && src.status === 'scheduled') {
            src.status = 'active';
          }
          await src.save();
        }
      }
    }

    await Participant.findOneAndUpdate(
      { meetingId: meeting._id, userId: user.id },
      { $set: { status: 'joined', joinedAt: now }, $setOnInsert: { role: role || 'participant' } },
      { upsert: true, new: true },
    );
  } catch (err) {
    console.warn('[meetings] attendance persist (join) failed:', err.message);
  }
};

const persistLeave = async (roomCode, user) => {
  try {
    const Meeting = require('../../models/Meeting');
    const Participant = require('../../models/Participant');
    const meeting = await Meeting.findOne({ roomId: roomCode });
    if (!meeting) return;
    const existing = await Participant.findOne({ meetingId: meeting._id, userId: user.id });
    if (existing && existing.status === 'joined') {
      existing.status = 'left';
      existing.leftAt = new Date();
      await existing.save();
    }
  } catch (err) {
    console.warn('[meetings] attendance persist (leave) failed:', err.message);
  }
};

const findSocketByUserId = (room, userId) => {
  if (!userId) return null;
  for (const socket of room.sockets.values()) {
    if (String(socket.meetingUser.id) === String(userId)) return socket;
  }
  return null;
};

const getHostUserId = (room) => {
  if (!room || !room.hostSocketId) return null;
  const hostSocket = room.sockets.get(room.hostSocketId);
  return hostSocket ? hostSocket.meetingUser.id : null;
};

const broadcastParticipants = (ns, roomCode) => {
  const room = rooms.get(roomCode);
  if (!room) return;
  const participants = Array.from(room.sockets.values()).map((socket) => ({
    socketId: socket.id,
    user: socket.meetingUser,
    meetingRole: socket.data.meetingRole || 'participant',
  }));
  ns.to(roomCode).emit(EVENTS.PARTICIPANTS_UPDATE, { roomCode, participants });
};

const joinRoomAsParticipant = (ns, roomCode, socket, role) => {
  socket.data.meetingRole = role;
  const room = rooms.get(roomCode);
  room.sockets.set(socket.id, socket);
  socket.join(roomCode);
  socket.data.roomCode = roomCode;
  socket.emit(EVENTS.WAITING_STATUS, { state: 'admitted', role, hostUserId: getHostUserId(room) });
  if (room.recording && room.recording.isRecording) {
    socket.emit(EVENTS.RECORDING, {
      roomCode,
      isRecording: true,
      url: room.recording.url || '',
    });
  }
  persistJoin(roomCode, socket.meetingUser, role);
  broadcastParticipants(ns, roomCode);
  socket.broadcast.to(roomCode).emit(EVENTS.NOTIFICATION, {
    type: 'joined',
    user: { id: socket.meetingUser.id, name: socket.meetingUser.name },
  });
};

const notifyHostOfWaiters = (ns, room) => {
  if (!room.hostSocketId) return;
  room.waiting.forEach((waitingSocket) => {
    ns.to(room.hostSocketId).emit(EVENTS.WAITING_REQUEST, {
      socketId: waitingSocket.id,
      roomCode: waitingSocket.data.roomCode,
      user: {
        id: waitingSocket.meetingUser.id,
        name: waitingSocket.meetingUser.name,
      },
    });
  });
};

const removeFromWaiting = (ns, roomCode, socketId) => {
  const room = rooms.get(roomCode);
  if (!room || !room.waiting.has(socketId)) return;
  const waitingSocket = room.waiting.get(socketId);
  room.waiting.delete(socketId);
  if (room.hostSocketId) {
    ns.to(room.hostSocketId).emit(EVENTS.WAITING_REQUEST, {
      socketId,
      user: { id: waitingSocket.meetingUser.id, name: waitingSocket.meetingUser.name },
      removed: true,
    });
  }
};

const leaveRoom = (socket, ns) => {
  const roomCode = socket.data.roomCode;
  if (!roomCode) return;
  const room = rooms.get(roomCode);
  if (room) {
    room.sockets.delete(socket.id);
    if (room.hostSocketId === socket.id) room.hostSocketId = null;
    socket.broadcast.to(roomCode).emit(EVENTS.NOTIFICATION, {
      type: 'left',
      user: { id: socket.meetingUser.id, name: socket.meetingUser.name },
    });
    if (room.sockets.size === 0) rooms.delete(roomCode);
  }
  persistLeave(roomCode, socket.meetingUser);
  socket.leave(roomCode);
  delete socket.data.roomCode;
  broadcastParticipants(ns, roomCode);
};

const initMeetingNamespace = (io) => {
  const ns = io.of(config.socket.namespace);

  ns.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return next(new Error('Unauthorized: invalid or missing meeting token'));
    }
    socket.meetingUser = {
      id: payload.id,
      role: payload.role || 'guest',
      name: payload.name || 'Guest',
    };
    next();
  });

  ns.on('connection', (socket) => {
    socket.on(EVENTS.JOIN, async ({ roomCode }) => {
      if (!roomCode) return;

      let validated;
      try {
        validated = await validateParticipant({ user: socket.meetingUser, roomId: roomCode });
      } catch (err) {
        console.error('[meetings] meeting:join validation failed:', err);
        socket.emit(EVENTS.ERROR, { message: 'Failed to validate meeting' });
        return;
      }
      if (!validated.valid) {
        socket.emit(EVENTS.ERROR, { message: validated.message });
        return;
      }

      // Host identity is derived from the JWT-authenticated user, never trusted from the client.
      if (validated.role === 'host') {
        const room = ensureRoom(roomCode, socket.id);
        room.hostSocketId = socket.id;
        room.sockets.set(socket.id, socket);
        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.meetingRole = 'host';
        socket.emit(EVENTS.WAITING_STATUS, { state: 'admitted', role: 'host', hostUserId: socket.meetingUser.id });
        persistJoin(roomCode, socket.meetingUser, 'host');
        const hostRoom = rooms.get(roomCode);
        if (hostRoom && hostRoom.recording && hostRoom.recording.isRecording) {
          socket.emit(EVENTS.RECORDING, {
            roomCode,
            isRecording: true,
            url: hostRoom.recording.url || '',
          });
        }
        broadcastParticipants(ns, roomCode);
        notifyHostOfWaiters(ns, room);
        socket.broadcast.to(roomCode).emit(EVENTS.NOTIFICATION, {
          type: 'joined',
          user: { id: socket.meetingUser.id, name: socket.meetingUser.name },
        });
        return;
      }

      // Participant flow.
      const room = ensureRoom(roomCode, null);
      if (room.locked) {
        socket.emit(EVENTS.WAITING_STATUS, {
          state: 'locked',
          role: 'participant',
          hostUserId: getHostUserId(room),
        });
        return;
      }

      if (room.waitingRoom) {
        room.waiting.set(socket.id, socket);
        socket.data.roomCode = roomCode;
        socket.emit(EVENTS.WAITING_STATUS, {
          state: 'waiting',
          role: 'participant',
          hostUserId: getHostUserId(room),
        });
        if (room.hostSocketId) {
          ns.to(room.hostSocketId).emit(EVENTS.WAITING_REQUEST, {
            socketId: socket.id,
            roomCode,
            user: { id: socket.meetingUser.id, name: socket.meetingUser.name },
          });
        }
        return;
      }

      joinRoomAsParticipant(ns, roomCode, socket, 'participant');
    });

    socket.on(EVENTS.LEAVE, () => {
      removeFromWaiting(ns, socket.data.roomCode, socket.id);
      leaveRoom(socket, ns);
    });

    socket.on(EVENTS.CHAT, async ({ roomCode, message }) => {
      if (!roomCode || !message) return;
      let chat;
      try {
        const Meeting = require('../../models/Meeting');
        const MeetingChat = require('../../models/MeetingChat');

        const meeting = await Meeting.findOne({ roomId: roomCode });
        chat = await MeetingChat.create({
          meetingId: meeting ? meeting._id : null,
          senderId: socket.meetingUser.id,
          message: String(message).slice(0, 2000),
        });
      } catch (err) {
        console.error('[meetings] Chat persist failed:', err.message);
      }

      ns.to(roomCode).emit(EVENTS.CHAT, {
        id: chat ? String(chat._id) : `${socket.id}-${Date.now()}`,
        roomCode,
        sender: { id: socket.meetingUser.id, name: socket.meetingUser.name },
        text: message,
        createdAt: (chat && chat.createdAt) || new Date().toISOString(),
      });
    });

    const isHostSocket = (room, socketId) => Boolean(room) && room.hostSocketId === socketId;

    socket.on(EVENTS.WAITING_REQUEST, ({ roomCode, name }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      if (!room.waiting.has(socket.id) && !room.sockets.has(socket.id)) return;
      ns.to(room.hostSocketId).emit(EVENTS.WAITING_REQUEST, {
        socketId: socket.id,
        roomCode,
        user: { id: socket.meetingUser.id, name: name || socket.meetingUser.name },
      });
    });

    socket.on(EVENTS.WAITING_ADMIT, ({ socketId }) => {
      const room = rooms.get(socket.data.roomCode);
      if (!isHostSocket(room, socket.id)) return;
      const target = room.waiting.get(socketId);
      if (!target) return;
      room.waiting.delete(socketId);
      joinRoomAsParticipant(ns, socket.data.roomCode, target, 'participant');
    });

    socket.on(EVENTS.WAITING_DENY, ({ socketId }) => {
      const room = rooms.get(socket.data.roomCode);
      if (!isHostSocket(room, socket.id)) return;
      const target = room.waiting.get(socketId);
      if (!target) return;
      room.waiting.delete(socketId);
      ns.to(socketId).emit(EVENTS.WAITING_DENY, { socketId });
    });

    socket.on(EVENTS.HOST_ACTION, ({ roomCode, action, payload }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      if (!isHostSocket(room, socket.id)) {
        socket.emit(EVENTS.ERROR, { message: 'Only the meeting host can perform this action' });
        return;
      }

      switch (action) {
        case 'mute-all':
          room.sockets.forEach((target) => {
            if (target.id !== socket.id) {
              target.emit(EVENTS.HOST_ACTION, { action: 'mute' });
            }
          });
          break;
        case 'mute-one': {
          const target = findSocketByUserId(room, payload && payload.userId);
          if (target && target.id !== socket.id) {
            target.emit(EVENTS.HOST_ACTION, { action: 'mute' });
          }
          break;
        }
        case 'remove': {
          const target = findSocketByUserId(room, payload && payload.userId);
          if (target && target.id !== socket.id) {
            room.sockets.delete(target.id);
            target.leave(roomCode);
            delete target.data.roomCode;
            target.emit(EVENTS.HOST_ACTION, { action: 'removed' });
            ns.to(roomCode).emit(EVENTS.NOTIFICATION, {
              type: 'removed',
              user: { id: target.meetingUser.id, name: target.meetingUser.name },
            });
            broadcastParticipants(ns, roomCode);
          }
          break;
        }
        case 'lock-room':
          room.locked = true;
          ns.to(roomCode).emit(EVENTS.HOST_ACTION, { action: 'lock', payload: { locked: true } });
          break;
        case 'unlock-room':
          room.locked = false;
          ns.to(roomCode).emit(EVENTS.HOST_ACTION, { action: 'lock', payload: { locked: false } });
          break;
        case 'waiting-room':
          room.waitingRoom = Boolean(payload && payload.enabled);
          ns.to(roomCode).emit(EVENTS.HOST_ACTION, {
            action: 'waiting-room',
            payload: { enabled: room.waitingRoom },
          });
          break;
        case 'transfer-host': {
          const target = findSocketByUserId(room, payload && payload.userId);
          if (target && target.id !== socket.id) {
            room.hostSocketId = target.id;
            target.data.meetingRole = 'host';
            socket.data.meetingRole = 'participant';
            ns.to(roomCode).emit(EVENTS.HOST_ACTION, {
              action: 'host-transferred',
              payload: { userId: target.meetingUser.id, name: target.meetingUser.name },
            });
            broadcastParticipants(ns, roomCode);
          }
          break;
        }
        case 'start-recording': {
          const meetingService = require('../../services/meetingService');
          meetingService
            .startMeetingRecording({ user: socket.meetingUser, roomId: roomCode })
            .then((res) => {
              room.recording = { isRecording: true, url: (res.recording && res.recording.url) || '' };
              ns.to(roomCode).emit(EVENTS.RECORDING, {
                roomCode,
                isRecording: true,
                url: room.recording.url,
              });
            })
            .catch((err) => {
              socket.emit(EVENTS.ERROR, { message: err.message || 'Failed to start recording' });
            });
          break;
        }
        case 'stop-recording': {
          const meetingService = require('../../services/meetingService');
          meetingService
            .stopMeetingRecording({ user: socket.meetingUser, roomId: roomCode })
            .then((res) => {
              room.recording = { isRecording: false, url: (res.recording && res.recording.url) || '' };
              ns.to(roomCode).emit(EVENTS.RECORDING, {
                roomCode,
                isRecording: false,
                url: room.recording.url,
              });
            })
            .catch((err) => {
              socket.emit(EVENTS.ERROR, { message: err.message || 'Failed to stop recording' });
            });
          break;
        }
        case 'end-meeting': {
          const meetingService = require('../../services/meetingService');
          meetingService
            .endMeeting({ user: socket.meetingUser, roomId: roomCode })
            .catch((err) => console.warn('[meetings] end-meeting service call failed:', err.message));
          ns.to(roomCode).emit(EVENTS.HOST_ACTION, { action: 'end' });
          rooms.delete(roomCode);
          break;
        }
        default:
          break;
      }
    });

    socket.on(EVENTS.RAISE_HAND, ({ roomCode, raised }) => {
      if (!roomCode) return;
      ns.to(roomCode).emit(EVENTS.RAISE_HAND, {
        user: { id: socket.meetingUser.id, name: socket.meetingUser.name },
        raised: Boolean(raised),
      });
    });

    socket.on(EVENTS.TYPING, ({ roomCode, typing }) => {
      if (!roomCode) return;
      ns.to(roomCode).emit(EVENTS.TYPING, {
        user: { id: socket.meetingUser.id, name: socket.meetingUser.name },
        typing: Boolean(typing),
      });
    });

    socket.on(EVENTS.SCREEN_SHARE, ({ roomCode, active }) => {
      if (!roomCode) return;
      ns.to(roomCode).emit(EVENTS.SCREEN_SHARE, {
        user: { id: socket.meetingUser.id, name: socket.meetingUser.name },
        active: Boolean(active),
      });
    });

    socket.on('disconnect', () => {
      removeFromWaiting(ns, socket.data.roomCode, socket.id);
      leaveRoom(socket, ns);
    });
  });
};

module.exports = { initMeetingNamespace, sweepInactiveRooms, getRoomState: (roomCode) => rooms.get(roomCode), deleteRoomState: (roomCode) => rooms.delete(roomCode) };
