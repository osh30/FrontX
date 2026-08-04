import { useEffect, useState } from 'react';
import { MEETING_EVENTS } from '../lib/events';

export const useParticipants = ({ socket }) => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!socket) return undefined;
    const handler = (data) => setParticipants(data.participants || []);
    socket.on(MEETING_EVENTS.PARTICIPANTS_UPDATE, handler);
    return () => socket.off(MEETING_EVENTS.PARTICIPANTS_UPDATE, handler);
  }, [socket]);

  return { participants };
};
