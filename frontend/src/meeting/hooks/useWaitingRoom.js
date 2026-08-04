import { useEffect, useState, useCallback } from 'react';
import { MEETING_EVENTS } from '../lib/events';

export const useWaitingRoom = ({ socket, roomCode, isHost = false }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!socket || !isHost) return undefined;
    const handler = (data) => {
      if (data.removed) {
        setRequests((prev) => prev.filter((request) => request.socketId !== data.socketId));
        return;
      }
      setRequests((prev) => [...prev, data]);
    };
    socket.on(MEETING_EVENTS.WAITING_REQUEST, handler);
    return () => socket.off(MEETING_EVENTS.WAITING_REQUEST, handler);
  }, [socket, isHost]);

  const requestAdmission = useCallback(
    (name) => {
      socket && socket.emit(MEETING_EVENTS.WAITING_REQUEST, { roomCode, name });
    },
    [socket, roomCode],
  );

  const admit = useCallback((socketId) => {
    socket && socket.emit(MEETING_EVENTS.WAITING_ADMIT, { socketId });
    setRequests((prev) => prev.filter((request) => request.socketId !== socketId));
  }, [socket]);

  const deny = useCallback((socketId) => {
    socket && socket.emit(MEETING_EVENTS.WAITING_DENY, { socketId });
    setRequests((prev) => prev.filter((request) => request.socketId !== socketId));
  }, [socket]);

  return { requests, requestAdmission, admit, deny };
};
