import { API_BASE, SOCKET_URL } from '../config/api';

export const MEETING_CONFIG = {
  livekitUrl: import.meta.env.VITE_LIVEKIT_URL || '',
  tokenEndpoint: `${API_BASE}/meetings/token`,
  socketNamespace: '/meetings',
  socketUrl: `${SOCKET_URL}/meetings`,
};
