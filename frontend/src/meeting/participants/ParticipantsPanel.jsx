import { useParticipants } from '@livekit/components-react';
import { Users, X } from 'lucide-react';
import ParticipantItem from './ParticipantItem';

const ParticipantsPanel = ({
  raisedHands,
  onClose,
  currentUserId,
  isHost = false,
  hostUserId,
  onMuteParticipant,
  onRemoveParticipant,
  onTransferHost,
}) => {
  const participants = useParticipants();

  return (
    <aside className="fx-panel fx-glass">
      <header className="fx-panel__header">
        <span className="fx-panel__title">
          <Users /> Participants
          <span className="fx-panel__count">{participants.length}</span>
        </span>
        <button className="fx-panel__close" onClick={onClose} aria-label="Close participants">
          <X size={18} />
        </button>
      </header>

      <ul className="fx-participants__list">
        {participants.map((participant) => (
          <ParticipantItem
            key={participant.identity}
            participant={participant}
            raised={raisedHands.has(participant.identity)}
            currentUserId={currentUserId}
            isHost={isHost}
            hostUserId={hostUserId}
            onMute={onMuteParticipant}
            onRemove={onRemoveParticipant}
            onTransfer={onTransferHost}
          />
        ))}
      </ul>
    </aside>
  );
};

export default ParticipantsPanel;
