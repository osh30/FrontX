import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { Timer } from 'lucide-react';
import { useMeetingTimer } from '../hooks/useMeetingTimer';

const MeetingTimer = () => {
  const state = useConnectionState();
  const active = state === ConnectionState.Connected;
  const { display } = useMeetingTimer(active);

  return (
    <span className="fx-timer">
      <Timer />
      {display}
    </span>
  );
};

export default MeetingTimer;
