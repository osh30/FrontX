import { useEffect } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { MEETING_EVENTS } from '../lib/events';

const HostSignal = ({ socket }) => {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!socket) return undefined;
    const onAction = (data) => {
      if (data.action === 'mute' && localParticipant && localParticipant.isMicrophoneEnabled) {
        localParticipant.setMicrophoneEnabled(false);
      }
    };
    socket.on(MEETING_EVENTS.HOST_ACTION, onAction);
    return () => socket.off(MEETING_EVENTS.HOST_ACTION, onAction);
  }, [socket, localParticipant]);

  return null;
};

export default HostSignal;
