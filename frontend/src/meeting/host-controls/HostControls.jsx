import { MicOff, Lock, Unlock, DoorOpen, LogOut, Circle, Square } from 'lucide-react';
import { useHostControls } from '../hooks/useHostControls';

const HostControls = ({
  socket,
  roomCode,
  isHost = false,
  locked = false,
  waitingRoomEnabled = true,
  recording = null,
}) => {
  const controls = useHostControls({ socket, roomCode, isHost });
  const isRecording = Boolean(recording && recording.isRecording);
  const recordingConfigured = !recording || recording.configured;

  if (!isHost) return null;

  return (
    <div className="fx-host fx-glass">
      <p className="fx-host__title">Host controls</p>

      <div className="fx-host__badges">
        {locked && <span className="fx-host__badge fx-host__badge--lock"><Lock size={12} /> Locked</span>}
        <span className={`fx-host__badge ${waitingRoomEnabled ? 'fx-host__badge--on' : 'fx-host__badge--off'}`}>
          <DoorOpen size={12} /> Waiting room {waitingRoomEnabled ? 'on' : 'off'}
        </span>
        {isRecording && (
          <span className="fx-host__badge fx-host__badge--rec">
            <Circle size={12} /> Recording
          </span>
        )}
      </div>

      <button className="fx-host__btn" onClick={controls.muteAll}>
        <MicOff size={15} /> <span>Mute all</span>
      </button>
      <button className="fx-host__btn" onClick={locked ? controls.unlockRoom : controls.lockRoom}>
        {locked ? <Unlock size={15} /> : <Lock size={15} />}
        <span>{locked ? 'Unlock room' : 'Lock room'}</span>
      </button>
      <button
        className="fx-host__btn"
        onClick={() => controls.toggleWaitingRoom(!waitingRoomEnabled)}
      >
        <DoorOpen size={15} />
        <span>{waitingRoomEnabled ? 'Disable waiting room' : 'Enable waiting room'}</span>
      </button>
      {recordingConfigured ? (
        <button
          className={`fx-host__btn ${isRecording ? 'fx-host__btn--danger' : ''}`}
          onClick={isRecording ? recording.stopRecording : recording.startRecording}
          disabled={Boolean(recording && recording.loading)}
        >
          {isRecording ? <Square size={15} /> : <Circle size={15} />}
          <span>{isRecording ? 'Stop recording' : 'Record meeting'}</span>
        </button>
      ) : (
        <button className="fx-host__btn" disabled title="Recording is not configured on this server">
          <Circle size={15} /> <span>Recording unavailable</span>
        </button>
      )}
      <button className="fx-host__btn fx-host__btn--danger" onClick={controls.endMeeting}>
        <LogOut size={15} /> <span>End meeting</span>
      </button>
    </div>
  );
};

export default HostControls;
