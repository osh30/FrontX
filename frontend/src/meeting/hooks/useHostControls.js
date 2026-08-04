import { useCallback } from 'react';
import { MEETING_EVENTS } from '../lib/events';

export const useHostControls = ({ socket, roomCode, isHost = false }) => {
  const emitAction = useCallback(
    (action, payload = {}) => {
      if (!socket || !isHost) return;
      socket.emit(MEETING_EVENTS.HOST_ACTION, { roomCode, action, payload });
    },
    [socket, roomCode, isHost],
  );

  const muteAll = useCallback(() => emitAction('mute-all'), [emitAction]);
  const muteParticipant = useCallback((userId) => emitAction('mute-one', { userId }), [emitAction]);
  const removeParticipant = useCallback((userId) => emitAction('remove', { userId }), [emitAction]);
  const lockRoom = useCallback(() => emitAction('lock-room'), [emitAction]);
  const unlockRoom = useCallback(() => emitAction('unlock-room'), [emitAction]);
  const toggleWaitingRoom = useCallback(
    (enabled) => emitAction('waiting-room', { enabled }),
    [emitAction],
  );
  const transferHost = useCallback((userId) => emitAction('transfer-host', { userId }), [emitAction]);
  const endMeeting = useCallback(() => emitAction('end-meeting'), [emitAction]);
  const startRecording = useCallback(() => emitAction('start-recording'), [emitAction]);
  const stopRecording = useCallback(() => emitAction('stop-recording'), [emitAction]);

  return {
    muteAll,
    muteParticipant,
    removeParticipant,
    lockRoom,
    unlockRoom,
    toggleWaitingRoom,
    transferHost,
    endMeeting,
    startRecording,
    stopRecording,
  };
};
