import { io } from 'socket.io-client';
import { MEETING_CONFIG } from '../config';

let meetingSocket = null;

export const getMeetingSocket = ({ token }) => {
  if (meetingSocket && meetingSocket.connected) return meetingSocket;

  if (meetingSocket) {
    meetingSocket.disconnect();
    meetingSocket = null;
  }

  if (!token) {
    throw new Error('A valid token is required to open the meeting socket');
  }

  meetingSocket = io(MEETING_CONFIG.socketNamespace, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return meetingSocket;
};

export const disconnectMeetingSocket = () => {
  if (meetingSocket) {
    meetingSocket.disconnect();
    meetingSocket = null;
  }
};
