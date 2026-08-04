import { useEffect, useState, useCallback, useRef } from 'react';
import { MEETING_EVENTS } from '../lib/events';

let notifId = 0;

export const useMeetingNotifications = ({ socket, roomCode, currentUserId }) => {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef(new Map());

  const push = useCallback(
    (type, user) => {
      const userId = user && String(user.id);
      if (userId && userId === String(currentUserId)) return;
      const item = { id: `${notifId++}`, type, name: (user && user.name) || 'Someone' };
      setNotifications((prev) => [...prev.slice(-4), item]);
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== item.id));
        timersRef.current.delete(item.id);
      }, 6000);
      timersRef.current.set(item.id, timer);
    },
    [currentUserId],
  );

  useEffect(() => {
    if (!socket) return undefined;
    const onNotif = (data) => {
      if (data.type === 'joined' || data.type === 'left') push(data.type, data.user);
    };
    const onHand = (data) => {
      if (data.raised) push('hand-raised', data.user);
    };
    const onScreen = (data) => push(data.active ? 'screen-shared' : 'screen-stopped', data.user);

    socket.on(MEETING_EVENTS.NOTIFICATION, onNotif);
    socket.on(MEETING_EVENTS.RAISE_HAND, onHand);
    socket.on(MEETING_EVENTS.SCREEN_SHARE, onScreen);
    return () => {
      socket.off(MEETING_EVENTS.NOTIFICATION, onNotif);
      socket.off(MEETING_EVENTS.RAISE_HAND, onHand);
      socket.off(MEETING_EVENTS.SCREEN_SHARE, onScreen);
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [socket, push]);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
  }, []);

  return { notifications, dismiss };
};
