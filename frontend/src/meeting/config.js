export const MEETING_CONFIG = {
  livekitUrl: import.meta.env.VITE_LIVEKIT_URL || '',
  tokenEndpoint: '/api/meetings/token',
  socketNamespace: '/meetings',
};
