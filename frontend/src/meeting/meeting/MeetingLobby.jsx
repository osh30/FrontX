import { ShieldCheck, Video } from 'lucide-react';

const MeetingLobby = ({ roomName, displayName, onChangeName, onJoin }) => {
  return (
    <div className="fx-lobby fx-backdrop">
      <div className="fx-lobby__card fx-glass">
        <div className="fx-lobby__logo">
          <Video size={34} />
        </div>

        <h1 className="fx-lobby__title">FrontX Meet</h1>
        <p className="fx-lobby__subtitle">
          Secure, in-app video meetings. No external apps required.
        </p>

        <div className="fx-lobby__room">{roomName}</div>

        <div className="fx-lobby__field">
          <label htmlFor="fx-display-name">Display name</label>
          <input
            id="fx-display-name"
            type="text"
            value={displayName}
            placeholder="Your display name"
            onChange={(event) => onChangeName(event.target.value)}
          />
        </div>

        <button className="fx-lobby__join" onClick={onJoin} disabled={!displayName.trim()}>
          Join Meeting
        </button>

        <p className="fx-lobby__hint">
          <ShieldCheck /> End-to-end encrypted by FrontX
        </p>
      </div>
    </div>
  );
};

export default MeetingLobby;
