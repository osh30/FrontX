import { useEffect, useState, useCallback } from 'react';
import { MEETING_EVENTS } from '../lib/events';

export const useRaiseHand = ({ socket, roomCode }) => {
  const [raised, setRaised] = useState(false);
  const [raisedUsers, setRaisedUsers] = useState(() => new Set());

  useEffect(() => {
    if (!socket) return undefined;
    const handler = (data) => {
      setRaisedUsers((prev) => {
        const next = new Set(prev);
        if (data.raised) next.add(String(data.user.id));
        else next.delete(String(data.user.id));
        return next;
      });
    };
    socket.on(MEETING_EVENTS.RAISE_HAND, handler);
    return () => socket.off(MEETING_EVENTS.RAISE_HAND, handler);
  }, [socket]);

  const toggle = useCallback(() => {
    setRaised((prev) => {
      const next = !prev;
      socket && socket.emit(MEETING_EVENTS.RAISE_HAND, { roomCode, raised: next });
      return next;
    });
  }, [socket, roomCode]);

  const lower = useCallback(() => {
    setRaised(false);
    socket && socket.emit(MEETING_EVENTS.RAISE_HAND, { roomCode, raised: false });
  }, [socket, roomCode]);

  return { raised, raisedUsers, toggle, lower };
};
