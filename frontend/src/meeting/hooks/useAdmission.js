import { useEffect, useState, useCallback } from 'react';
import { MEETING_EVENTS } from '../lib/events';

const initialState = {
  state: 'pending',
  role: null,
  hostUserId: null,
  locked: false,
  waitingRoomEnabled: true,
};

export const useAdmission = ({ socket, currentUserId }) => {
  const [admission, setAdmission] = useState(initialState);

  useEffect(() => {
    if (!socket) return undefined;

    const onStatus = (data) => {
      setAdmission((prev) => ({
        ...prev,
        state: data.state,
        role: data.role || prev.role,
        hostUserId:
          data.role === 'host'
            ? String(currentUserId)
            : data.hostUserId
              ? String(data.hostUserId)
              : prev.hostUserId,
      }));
    };
    const onAdmit = () =>
      setAdmission((prev) => ({ ...prev, state: 'admitted', role: 'participant' }));
    const onDeny = () =>
      setAdmission((prev) => ({ ...prev, state: 'denied', role: 'participant' }));

    const onHostAction = (data) => {
      switch (data.action) {
        case 'removed':
          setAdmission((prev) => ({ ...prev, state: 'removed' }));
          break;
        case 'end':
          setAdmission((prev) => ({ ...prev, state: 'ended' }));
          break;
        case 'lock':
          setAdmission((prev) => ({ ...prev, locked: Boolean(data.payload && data.payload.locked) }));
          break;
        case 'waiting-room':
          setAdmission((prev) => ({
            ...prev,
            waitingRoomEnabled: Boolean(data.payload && data.payload.enabled),
          }));
          break;
        case 'host-transferred': {
          const newHostId = data.payload && data.payload.userId;
          setAdmission((prev) => ({
            ...prev,
            hostUserId: String(newHostId),
            role: String(newHostId) === String(currentUserId) ? 'host' : 'participant',
          }));
          break;
        }
        default:
          break;
      }
    };

    socket.on(MEETING_EVENTS.WAITING_STATUS, onStatus);
    socket.on(MEETING_EVENTS.WAITING_ADMIT, onAdmit);
    socket.on(MEETING_EVENTS.WAITING_DENY, onDeny);
    socket.on(MEETING_EVENTS.HOST_ACTION, onHostAction);
    return () => {
      socket.off(MEETING_EVENTS.WAITING_STATUS, onStatus);
      socket.off(MEETING_EVENTS.WAITING_ADMIT, onAdmit);
      socket.off(MEETING_EVENTS.WAITING_DENY, onDeny);
      socket.off(MEETING_EVENTS.HOST_ACTION, onHostAction);
    };
  }, [socket, currentUserId]);

  const isHost = admission.role === 'host';
  const isAdmitted = admission.state === 'admitted';

  const reset = useCallback(() => setAdmission(initialState), []);

  return { admission, isHost, isAdmitted, reset };
};
