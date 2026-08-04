import { useState } from 'react';
import { useConnectionState, useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { useConnectionQuality } from '../hooks/useConnectionQuality';
import { Wifi, WifiOff } from 'lucide-react';

const QUALITY_LABEL = { excellent: 'Excellent', good: 'Good', poor: 'Poor', lost: 'Lost' };

const ConnectionIndicator = ({ token, serverUrl }) => {
  const state = useConnectionState();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const qualityMap = useConnectionQuality();
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');

  const quality = localParticipant ? qualityMap[localParticipant.identity] : undefined;
  const showQuality = quality && quality !== 'unknown';

  const handleReconnect = async () => {
    if (!room || retrying) return;
    setRetrying(true);
    setRetryError('');
    try {
      await room.connect(serverUrl, token);
    } catch (err) {
      setRetryError('Reconnect failed.');
    } finally {
      setRetrying(false);
    }
  };

  const chip =
    state === ConnectionState.Connected
      ? 'connected'
      : state === ConnectionState.Reconnecting || state === ConnectionState.Connecting
        ? 'reconnecting'
        : 'offline';

  const stateLabel =
    state === ConnectionState.Connected
      ? 'Connected'
      : state === ConnectionState.Connecting
        ? 'Connecting'
        : state === ConnectionState.Reconnecting
          ? 'Reconnecting'
          : 'Disconnected';

  return (
    <div className="fx-conn-wrap">
      <span className={`fx-conn fx-conn--${chip}`}>
        <span className="fx-conn__dot" />
        {stateLabel}
      </span>

      {showQuality && (
        <span className={`fx-quality fx-quality--${quality}`} title={`Connection quality: ${QUALITY_LABEL[quality]}`}>
          {quality === 'poor' || quality === 'lost' ? <WifiOff size={13} /> : <Wifi size={13} />}
          {QUALITY_LABEL[quality]}
        </span>
      )}

      {(state === ConnectionState.Disconnected || retrying) && (
        <button
          type="button"
          className="fx-conn__reconnect"
          onClick={handleReconnect}
          disabled={retrying}
          aria-label="Reconnect to meeting"
        >
          {retrying ? 'Reconnecting…' : 'Reconnect'}
        </button>
      )}

      {retryError && <span className="fx-conn__err">{retryError}</span>}
    </div>
  );
};

export default ConnectionIndicator;
