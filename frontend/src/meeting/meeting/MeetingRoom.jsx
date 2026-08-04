import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { ShieldCheck } from 'lucide-react';
import { fetchLiveKitToken } from '../lib/livekit';
import { useMeetingSocket } from '../hooks/useMeetingSocket';
import { useChat } from '../hooks/useChat';
import { useRaiseHand } from '../hooks/useRaiseHand';
import { useTyping } from '../hooks/useTyping';
import { useMeetingNotifications } from '../hooks/useMeetingNotifications';
import { useAdmission } from '../hooks/useAdmission';
import { useHostControls } from '../hooks/useHostControls';
import { useRecording } from '../hooks/useRecording';
import { useAuth } from '../../context/AuthContext';
import VideoGrid from '../video/VideoGrid';
import ChatPanel from '../chat/ChatPanel';
import ParticipantsPanel from '../participants/ParticipantsPanel';
import WaitingRoom from '../waiting-room/WaitingRoom';
import HostControls from '../host-controls/HostControls';
import HostSignal from '../host-controls/HostSignal';
import Toolbar from './Toolbar';
import MeetingTimer from './MeetingTimer';
import ConnectionIndicator from './ConnectionIndicator';
import MeetingNotifications from './MeetingNotifications';
import MeetingGate from './MeetingGate';
import { MEETING_CONFIG } from '../config';

const roomOptions = {
  adaptiveStream: true,
  dynacast: true,
  audioCaptureDefaults: {
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true,
  },
  videoCaptureDefaults: {
    resolution: { width: 1280, height: 720, frameRate: 30 },
  },
  publishDefaults: {
    audioBitrate: 32000,
    dtx: true,
  },
};

const MeetingRoom = ({ roomName, token, serverUrl }) => {
  const livekit = token && serverUrl ? { token, url: serverUrl } : null;
  const [error, setError] = useState(null);
  const [panel, setPanel] = useState(null);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user && String(user.id);

  const { socket, connected } = useMeetingSocket({
    token: livekit && livekit.token,
    roomCode: roomName,
  });

  const { admission, isHost, isAdmitted } = useAdmission({ socket, currentUserId });

  const hostControls = useHostControls({ socket, roomCode: roomName, isHost });

  const recording = useRecording({ socket, roomCode: roomName, isHost });

  const chat = useChat({ socket, roomCode: roomName });
  const { raised, raisedUsers, toggle } = useRaiseHand({ socket, roomCode: roomName });
  const { typingUsers, emitTyping } = useTyping({ socket, roomCode: roomName, currentUserId });
  const { notifications, dismiss } = useMeetingNotifications({
    socket,
    roomCode: roomName,
    currentUserId,
  });

  const messagesRef = useRef(0);
  useEffect(() => {
    if (chat.messages.length > messagesRef.current) {
      const delta = chat.messages.length - messagesRef.current;
      if (panel !== 'chat') setUnread((u) => u + delta);
    }
    messagesRef.current = chat.messages.length;
  }, [chat.messages, panel]);

  // Token is now passed via props, no need to fetch.

  useEffect(() => {
    if (admission.state !== 'removed' && admission.state !== 'ended') return undefined;
    const timer = setTimeout(() => navigate('/dashboard'), 2800);
    return () => clearTimeout(timer);
  }, [admission.state, navigate]);

  const openChat = () => {
    setPanel((p) => (p === 'chat' ? null : 'chat'));
    setUnread(0);
  };

  const openParticipants = () => setPanel((p) => (p === 'participants' ? null : 'participants'));

  const handleLeave = () => navigate('/dashboard');

  if (error) {
    return (
      <div className="fx-error fx-backdrop">
        <div className="fx-error__card fx-glass">
          <div className="fx-error__icon">
            <ShieldCheck />
          </div>
          <p className="fx-error__title">Cannot join meeting</p>
          <p className="fx-error__msg">{error}</p>
          <button className="fx-error__retry" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!livekit) {
    return (
      <div className="fx-loading fx-backdrop">
        <div className="fx-loading__inner">
          <div className="fx-loader" />
          <p className="fx-loading__text">Connecting to a secure room…</p>
        </div>
      </div>
    );
  }

  // Admission gate removed per requirements.

  return (
    <div className="fx-room fx-backdrop">
      <LiveKitRoom
        token={livekit.token}
        serverUrl={livekit.url || MEETING_CONFIG.livekitUrl}
        connect={true}
        options={roomOptions}
        className="fx-room__inner"
        onDisconnected={(reason) => setError(reason ? `Disconnected: ${reason}` : 'Disconnected from room')}
      >
        <RoomAudioRenderer />
        <HostSignal socket={socket} />
        <MeetingNotifications notifications={notifications} onDismiss={dismiss} />

        <header className="fx-topbar">
          <div className="fx-brand">
            <div className="fx-brand__logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L3 7v6c0 4.6 3.6 8.4 9 9 5.4-.6 9-4.4 9-9V7l-9-5z" fill="currentColor" opacity="0.9" />
                <path d="M8.5 12.5l2.3 2.3 4.7-4.8" stroke="#0a1226" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="fx-brand__name">FrontX <span>Meet</span></span>
          </div>

          <div className="fx-topbar__meta">
            <span className="fx-roomname">{roomName}</span>
            {admission.locked && <span className="fx-roombadge fx-roombadge--lock">Locked</span>}
            {recording.isRecording && (
              <span className="fx-roombadge fx-roombadge--rec">
                <span className="fx-roombadge__dot" /> REC
              </span>
            )}
            <MeetingTimer />
          </div>

          <ConnectionIndicator token={livekit.token} serverUrl={livekit.url || MEETING_CONFIG.livekitUrl} />
        </header>

        <main className="fx-main">
          <section className="fx-stage">
            <VideoGrid localRaised={raised} raisedHands={raisedUsers} hostIdentity={admission.hostUserId} />
          </section>

          {panel === 'chat' && (
            <ChatPanel
              connected={connected}
              messages={chat.messages}
              onSend={chat.sendMessage}
              onClose={() => setPanel(null)}
              currentUserId={currentUserId}
              typingUsers={typingUsers}
              onTyping={emitTyping}
            />
          )}
          {panel === 'participants' && (
            <ParticipantsPanel
              raisedHands={raisedUsers}
              onClose={() => setPanel(null)}
              currentUserId={currentUserId}
              isHost={isHost}
              hostUserId={admission.hostUserId}
              onMuteParticipant={hostControls.muteParticipant}
              onRemoveParticipant={hostControls.removeParticipant}
              onTransferHost={hostControls.transferHost}
            />
          )}
        </main>


        <HostControls
          socket={socket}
          roomCode={roomName}
          isHost={isHost}
          locked={admission.locked}
          waitingRoomEnabled={admission.waitingRoomEnabled}
          recording={recording}
        />

        <Toolbar
          panel={panel}
          unread={unread}
          raised={raised}
          socket={socket}
          roomCode={roomName}
          onToggleChat={openChat}
          onToggleParticipants={openParticipants}
          onToggleRaise={toggle}
          onLeave={handleLeave}
        />
      </LiveKitRoom>
    </div>
  );
};

export default MeetingRoom;
