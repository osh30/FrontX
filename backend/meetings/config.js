const REQUIRED_ENV = ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'];

const config = {
  livekit: {
    url: process.env.LIVEKIT_URL || '',
    apiKey: process.env.LIVEKIT_API_KEY || '',
    apiSecret: process.env.LIVEKIT_API_SECRET || '',
    egressUrl: process.env.LIVEKIT_EGRESS_URL || '',
    s3: {
      accessKey: process.env.S3_ACCESS_KEY || '',
      secret: process.env.S3_SECRET_KEY || '',
      region: process.env.S3_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || '',
      endpoint: process.env.S3_ENDPOINT || '',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
  },
  socket: {
    namespace: '/meetings',
    events: {
      JOIN: 'meeting:join',
      LEAVE: 'meeting:leave',
      CHAT: 'meeting:chat',
      ERROR: 'meeting:error',
      WAITING_REQUEST: 'waiting:request',
      WAITING_ADMIT: 'waiting:admit',
      WAITING_DENY: 'waiting:deny',
      WAITING_STATUS: 'waiting:status',
      HOST_ACTION: 'host:action',
      RAISE_HAND: 'meeting:raise-hand',
      PARTICIPANTS_UPDATE: 'meeting:participants',
      TYPING: 'meeting:typing',
      SCREEN_SHARE: 'meeting:screen-share',
      NOTIFICATION: 'meeting:notification',
      RECORDING: 'meeting:recording',
    },
  },
};

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.warn(`[meetings] Missing env vars: ${missing.join(', ')}. Meeting features will be unavailable.`);
}

module.exports = config;
