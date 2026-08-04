import axios from 'axios';
import { Room, RoomEvent, ConnectionState } from 'livekit-client';
import { MEETING_CONFIG } from '../config';

export const defaultRoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: { resolution: { width: 1280, height: 720 } },
  publishDefaults: { simulcast: true },
};

export const createMeetingRoom = (options = {}) =>
  new Room({ ...defaultRoomOptions, ...options });

export const fetchLiveKitToken = async ({ roomName }) => {
  if (!roomName) {
    throw new Error('roomName is required to fetch a LiveKit token');
  }
  const { data } = await axios.get(MEETING_CONFIG.tokenEndpoint, {
    params: { roomName },
  });
  return data;
};

export const connectToMeeting = async ({ room, token, url }) => {
  if (room.state === ConnectionState.Connected) return;
  await room.connect(url, token);
};

export const disconnectFromMeeting = async (room) => {
  if (room) await room.disconnect();
};

export { RoomEvent };
