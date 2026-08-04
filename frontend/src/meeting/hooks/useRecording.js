import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MEETING_EVENTS } from '../lib/events';

export const useRecording = ({ socket, roomCode, isHost = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [url, setUrl] = useState('');
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get('/api/meetings/config')
      .then(({ data }) => {
        if (!cancelled) setConfigured(Boolean(data.recording && data.recording.configured));
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const onRecording = ({ isRecording: rec, url: recUrl }) => {
      setIsRecording(Boolean(rec));
      if (recUrl) setUrl(recUrl);
    };
    socket.on(MEETING_EVENTS.RECORDING, onRecording);
    return () => {
      socket.off(MEETING_EVENTS.RECORDING, onRecording);
    };
  }, [socket]);

  const startRecording = useCallback(() => {
    if (!socket || !isHost || !configured) return;
    setLoading(true);
    socket.emit(MEETING_EVENTS.HOST_ACTION, { roomCode, action: 'start-recording' });
    setTimeout(() => setLoading(false), 1500);
  }, [socket, isHost, configured, roomCode]);

  const stopRecording = useCallback(() => {
    if (!socket || !isHost) return;
    setLoading(true);
    socket.emit(MEETING_EVENTS.HOST_ACTION, { roomCode, action: 'stop-recording' });
    setTimeout(() => setLoading(false), 1500);
  }, [socket, isHost, roomCode]);

  return {
    isRecording,
    url,
    configured,
    loading,
    startRecording,
    stopRecording,
  };
};
