import { useEffect, useState, useCallback } from 'react';
import { createMeetingRoom, connectToMeeting, disconnectFromMeeting, fetchLiveKitToken } from '../lib/livekit';
import { RoomEvent } from 'livekit-client';

export const useLiveKit = ({ roomName, autoConnect = true }) => {
  const [room] = useState(() => createMeetingRoom());
  const [token, setToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);

  const refreshParticipants = useCallback(() => {
    setParticipants([room.localParticipant, ...room.remoteParticipants.values()]);
  }, [room]);

  const connect = useCallback(async () => {
    try {
      const data = await fetchLiveKitToken({ roomName });
      setToken(data.token);
      setLivekitUrl(data.url);
      await connectToMeeting({ room, token: data.token, url: data.url });
    } catch (err) {
      setError(err.message || 'Failed to connect to LiveKit');
    }
  }, [room, roomName]);

  useEffect(() => {
    const onConnected = () => {
      setIsConnected(true);
      refreshParticipants();
    };
    const onDisconnected = () => setIsConnected(false);
    const onTrackSubscribed = () => refreshParticipants();

    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.ParticipantConnected, refreshParticipants);
    room.on(RoomEvent.ParticipantDisconnected, refreshParticipants);
    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.ActiveSpeakersChanged, refreshParticipants);

    return () => {
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.ParticipantConnected, refreshParticipants);
      room.off(RoomEvent.ParticipantDisconnected, refreshParticipants);
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.ActiveSpeakersChanged, refreshParticipants);
      disconnectFromMeeting(room);
    };
  }, [room, refreshParticipants]);

  useEffect(() => {
    if (autoConnect) connect();
  }, [autoConnect, connect]);

  return { room, token, livekitUrl, isConnected, participants, error, connect };
};
