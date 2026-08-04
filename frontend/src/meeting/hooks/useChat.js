import { useEffect, useState, useCallback } from 'react';
import { MEETING_EVENTS } from '../lib/events';

export const useChat = ({ socket, roomCode }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return undefined;
    const handler = (data) => setMessages((prev) => [...prev, data]);
    socket.on(MEETING_EVENTS.CHAT, handler);
    return () => socket.off(MEETING_EVENTS.CHAT, handler);
  }, [socket]);

  const sendMessage = useCallback(
    (text) => {
      if (!socket) return;
      socket.emit(MEETING_EVENTS.CHAT, { roomCode, message: text });
    },
    [socket, roomCode],
  );

  return { messages, sendMessage };
};
