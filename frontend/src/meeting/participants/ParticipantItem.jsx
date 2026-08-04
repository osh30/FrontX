import { Mic, MicOff, Video, VideoOff, Hand, Crown, UserMinus, Shield } from 'lucide-react';

const initials = (name) =>
  (name || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const ParticipantItem = ({
  participant,
  raised,
  currentUserId,
  isHost = false,
  hostUserId,
  onMute,
  onRemove,
  onTransfer,
}) => {
  const isSpeaking = participant.isSpeaking;
  const micOn = participant.isMicrophoneEnabled;
  const camOn = participant.isCameraEnabled;
  const isRoomHost = String(hostUserId) === String(participant.identity);
  const canAct = isHost && !participant.isLocal;

  return (
    <li
      className={`fx-participant ${isSpeaking ? 'fx-participant--speaking' : ''} ${raised ? 'fx-participant--hand' : ''}`}
    >
      <div className="fx-participant__avatar">{initials(participant.name || participant.identity)}</div>
      <div className="fx-participant__info">
        <span className="fx-participant__name">
          {participant.name || participant.identity}
          {isRoomHost && (
            <span className="fx-host-badge">
              <Crown /> Host
            </span>
          )}
          {participant.isLocal && <span className="fx-participant__you">(You)</span>}
        </span>
        <span className="fx-participant__status">
          {raised ? 'Raised hand' : isSpeaking ? 'Speaking…' : participant.isLocal ? 'Connected' : 'Joined'}
        </span>
      </div>
      <div className="fx-participant__icons">
        {raised && <Hand className="hand" size={17} />}
        <span className={micOn ? 'on' : 'off'}>{micOn ? <Mic size={16} /> : <MicOff size={16} />}</span>
        <span className={camOn ? 'on' : 'off'}>{camOn ? <Video size={16} /> : <VideoOff size={16} />}</span>
      </div>
      {canAct && (
        <div className="fx-participant__actions">
          {!isRoomHost && (
            <button
              type="button"
              title="Transfer host"
              className={micOn ? 'on' : 'off'}
              onClick={() => onTransfer(participant.identity)}
            >
              <Shield size={15} />
            </button>
          )}
          <button
            type="button"
            title={micOn ? 'Mute participant' : 'Participant is muted'}
            disabled={!micOn}
            onClick={() => onMute(participant.identity)}
          >
            <MicOff size={15} />
          </button>
          <button
            type="button"
            title="Remove from meeting"
            className="danger"
            onClick={() => onRemove(participant.identity)}
          >
            <UserMinus size={15} />
          </button>
        </div>
      )}
    </li>
  );
};

export default ParticipantItem;
