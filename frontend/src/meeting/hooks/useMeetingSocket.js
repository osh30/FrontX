import { useEffect, useRef, useState, useCallback } from 'react';
import { getMeetingSocket, disconnectMeetingSocket } from '../lib/socket';
import { MEETING_EVENTS } from '../lib/events';

export const useMeetingSocket = ({ token, roomCode, isHost = false, onEvent }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const eventRef = useRef(onEvent);
  eventRef.current = onEvent;

  useEffect(() => {
    if (!token || !roomCode) return undefined;

    const client = getMeetingSocket({ token });
    setSocket(client);
    setConnected(client.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const relay = (event) => (data) => eventRef.current && eventRef.current({ type: event, data });

    client.on('connect', onConnect);
    client.on('disconnect', onDisconnect);
    client.on(MEETING_EVENTS.JOIN, relay(MEETING_EVENTS.JOIN));
    client.on(MEETING_EVENTS.CHAT, relay(MEETING_EVENTS.CHAT));
    client.on(MEETING_EVENTS.PARTICIPANTS_UPDATE, relay(MEETING_EVENTS.PARTICIPANTS_UPDATE));
    client.on(MEETING_EVENTS.WAITING_REQUEST, relay(MEETING_EVENTS.WAITING_REQUEST));
    client.on(MEETING_EVENTS.WAITING_ADMIT, relay(MEETING_EVENTS.WAITING_ADMIT));
    client.on(MEETING_EVENTS.WAITING_DENY, relay(MEETING_EVENTS.WAITING_DENY));
    client.on(MEETING_EVENTS.HOST_ACTION, relay(MEETING_EVENTS.HOST_ACTION));

    client.emit(MEETING_EVENTS.JOIN, { roomCode, isHost });

    return () => {
      client.emit(MEETING_EVENTS.LEAVE);
      client.off('connect', onConnect);
      client.off('disconnect', onDisconnect);
      disconnectMeetingSocket();
      setSocket(null);
      setConnected(false);
    };
  }, [token, roomCode, isHost]);

  const emit = useCallback(
    (event, data) => {
      if (socket) socket.emit(event, data);
    },
    [socket],
  );

  return { socket, connected, emit };
};
