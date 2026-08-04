import { useMemo } from 'react';
import { useParticipants, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Hand, Mic, MicOff, MonitorUp, Crown, Wifi, WifiOff } from 'lucide-react';
import { useConnectionQuality } from '../hooks/useConnectionQuality';

const initials = (name) =>
  (name || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const VideoTile = ({ participant, cameraRef, screenRef, localRaised, raisedHands, quality, hostIdentity }) => {
  const isHost = String(hostIdentity) === String(participant.identity);
  const isSpeaking = participant.isSpeaking;
  const micOn = participant.isMicrophoneEnabled;
  const camOn = participant.isCameraEnabled;
  const isScreen = Boolean(screenRef && (screenRef.track || screenRef.publication));
  const hasVideo = Boolean((cameraRef && cameraRef.track) || (participant.isCameraEnabled && cameraRef) || isScreen);
  const raised = participant.isLocal ? localRaised : raisedHands.has(participant.identity);
  const poorQuality = quality === 'poor' || quality === 'lost';

  const videoRef = isScreen ? screenRef : cameraRef;

  return (
    <div
      className={`fx-tile ${isSpeaking ? 'fx-tile--speaking' : ''} ${raised ? 'fx-tile--hand' : ''} ${isScreen ? 'fx-tile--screen' : ''}`}
    >
      {hasVideo && videoRef && (
        <div className="fx-tile__video">
          <VideoTrack trackRef={videoRef} />
        </div>
      )}

      {!hasVideo && (
        <div className={`fx-tile__avatar ${!micOn ? 'fx-tile__avatar--mic-off' : ''}`}>
          <div className="fx-tile__avatar-inner">{initials(participant.name || participant.identity)}</div>
        </div>
      )}

      {isScreen && (
        <div className="fx-screen-banner">
          <MonitorUp /> Sharing screen
        </div>
      )}

      {poorQuality && (
        <span className={`fx-qbadge fx-qbadge--${quality}`} title="Weak connection">
          {quality === 'lost' ? <WifiOff size={12} /> : <Wifi size={12} />}
          {quality === 'lost' ? 'No signal' : 'Poor signal'}
        </span>
      )}

      {raised && (
        <div className="fx-raise-badge">
          <Hand />
        </div>
      )}

      <span className="fx-tile__name">
        <span className={`fx-tile__mic ${!micOn ? 'fx-tile__mic--off' : ''}`}>
          {micOn ? <Mic /> : <MicOff />}
        </span>
        <span className={participant.isLocal ? 'fx-tile__you' : ''}>
          {participant.name || participant.identity}
          {participant.isLocal ? ' (You)' : ''}
        </span>
        {isHost && (
          <span className="fx-host-badge">
            <Crown /> Host
          </span>
        )}
      </span>
    </div>
  );
};

const VideoGrid = ({ localRaised = false, raisedHands, hostIdentity }) => {
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });
  const qualityMap = useConnectionQuality();

  const tiles = useMemo(() => {
    const map = new Map();
    participants.forEach((p) => {
      map.set(p.identity, { participant: p, cameraRef: null, screenRef: null });
    });
    tracks.forEach((ref) => {
      const entry = map.get(ref.participant.identity) || {
        participant: ref.participant,
        cameraRef: null,
        screenRef: null,
      };
      if (ref.source === Track.Source.Camera) entry.cameraRef = ref;
      else if (ref.source === Track.Source.ScreenShare) entry.screenRef = ref;
      map.set(ref.participant.identity, entry);
    });
    return Array.from(map.values());
  }, [participants, tracks]);

  const count = tiles.length;
  const gridClass =
    count === 1 ? 'fx-grid fx-grid--single' : count === 2 ? 'fx-grid fx-grid--duo' : 'fx-grid';

  return (
    <div className={gridClass}>
      {tiles.map(({ participant, cameraRef, screenRef }) => (
        <VideoTile
          key={participant.identity}
          participant={participant}
          cameraRef={cameraRef}
          screenRef={screenRef}
          localRaised={localRaised}
          raisedHands={raisedHands}
          quality={qualityMap[participant.identity]}
          hostIdentity={hostIdentity}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
