import { useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { toast } from 'react-hot-toast';
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, Users, Hand, Settings, PhoneOff,
} from 'lucide-react';
import { MEETING_EVENTS } from '../lib/events';
import DeviceMenu from '../device/DeviceMenu';

const Toolbar = ({
  panel,
  unread = 0,
  raised = false,
  socket,
  roomCode,
  onToggleChat,
  onToggleParticipants,
  onToggleRaise,
  onLeave,
}) => {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const room = useRoomContext();
  const [deviceOpen, setDeviceOpen] = useState(false);

  const isScreenShareEnabled = Boolean(localParticipant.isScreenShareEnabled);

  const toggleMicrophone = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled, {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
    } catch (err) {
      toast.error(err.message || 'Could not access microphone');
    }
  };
  
  const toggleCamera = async () => {
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (err) {
      if (err.name === 'NotReadableError') {
        toast.error('Camera is currently in use by another application');
      } else {
        toast.error(err.message || 'Could not access camera');
      }
    }
  };

  const toggleScreenShare = () => {
    const next = !isScreenShareEnabled;
    localParticipant.setScreenShareEnabled(next);
    if (socket && roomCode) socket.emit(MEETING_EVENTS.SCREEN_SHARE, { roomCode, active: next });
  };

  const handleLeave = () => {
    room.disconnect();
    if (onLeave) onLeave();
  };

  return (
    <footer className="fx-toolbar">
      <div className="fx-toolbar__inner fx-glass">
        <button
          type="button"
          className={`fx-tb ${isMicrophoneEnabled ? 'fx-tb--active' : 'fx-tb--off'}`}
          onClick={toggleMicrophone}
          aria-label="Toggle microphone"
        >
          {isMicrophoneEnabled ? <Mic /> : <MicOff />}
          <span className="fx-tb__tip">{isMicrophoneEnabled ? 'Mute' : 'Unmute'}</span>
        </button>

        <button
          type="button"
          className={`fx-tb ${isCameraEnabled ? 'fx-tb--active' : 'fx-tb--off'}`}
          onClick={toggleCamera}
          aria-label="Toggle camera"
        >
          {isCameraEnabled ? <Video /> : <VideoOff />}
          <span className="fx-tb__tip">{isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}</span>
        </button>

        <button
          type="button"
          className={`fx-tb ${isScreenShareEnabled ? 'fx-tb--active' : ''}`}
          onClick={toggleScreenShare}
          aria-label="Toggle screen share"
        >
          <MonitorUp />
          <span className="fx-tb__tip">{isScreenShareEnabled ? 'Stop sharing' : 'Share screen'}</span>
        </button>

        <button
          type="button"
          className={`fx-tb ${panel === 'chat' ? 'fx-tb--panel-open' : ''}`}
          onClick={onToggleChat}
          aria-label="Toggle chat"
        >
          <MessageSquare />
          {unread > 0 && <span className="fx-tb__badge">{unread > 99 ? '99+' : unread}</span>}
          <span className="fx-tb__tip">Chat</span>
        </button>

        <button
          type="button"
          className={`fx-tb ${panel === 'participants' ? 'fx-tb--panel-open' : ''}`}
          onClick={onToggleParticipants}
          aria-label="Toggle participants"
        >
          <Users />
          <span className="fx-tb__tip">Participants</span>
        </button>

        <button
          type="button"
          className={`fx-tb ${raised ? 'fx-tb--active' : ''}`}
          onClick={onToggleRaise}
          aria-label="Raise hand"
        >
          <Hand />
          <span className="fx-tb__tip">{raised ? 'Lower hand' : 'Raise hand'}</span>
        </button>

        <button
          type="button"
          className={`fx-tb ${deviceOpen ? 'fx-tb--panel-open' : ''}`}
          onClick={() => setDeviceOpen((open) => !open)}
          aria-label="Device settings"
        >
          <Settings />
          <span className="fx-tb__tip">Device settings</span>
        </button>

        <button type="button" className="fx-tb fx-tb--leave" onClick={handleLeave} aria-label="Leave meeting">
          <PhoneOff />
          <span className="fx-tb__tip">Leave</span>
        </button>
      </div>

      <DeviceMenu open={deviceOpen} room={room} onClose={() => setDeviceOpen(false)} />
    </footer>
  );
};

export default Toolbar;
