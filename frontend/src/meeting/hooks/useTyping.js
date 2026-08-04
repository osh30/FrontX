import { useEffect, useState, useCallback } from 'react';
import { MEETING_EVENTS } from '../lib/events';

export const useTyping = ({ socket, roomCode, currentUserId }) => {
  const [typingMap, setTypingMap] = useState({});

  useEffect(() => {
    if (!socket) return undefined;
    const handler = (data) => {
      const id = String(data.user.id);
      if (id === String(currentUserId)) return;
      setTypingMap((prev) => {
        if (!data.typing) {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        }
        return { ...prev, [id]: { id, name: data.user.name, at: Date.now() } };
      });
    };
    socket.on(MEETING_EVENTS.TYPING, handler);
    return () => socket.off(MEETING_EVENTS.TYPING, handler);
  }, [socket, currentUserId]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTypingMap((prev) => {
        const hasStale = Object.values(prev).some((entry) => now - entry.at > 4000);
        if (!hasStale) return prev;
        const next = {};
        Object.entries(prev).forEach(([id, entry]) => {
          if (now - entry.at <= 4000) next[id] = entry;
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const emitTyping = useCallback(
    (typing) => {
      if (socket) socket.emit(MEETING_EVENTS.TYPING, { roomCode, typing: Boolean(typing) });
    },
    [socket, roomCode],
  );

  return { typingUsers: Object.values(typingMap), emitTyping };
};
