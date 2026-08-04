const { EgressClient } = require('livekit-server-sdk');
const config = require('../config');

const isConfigured = () => {
  const { egressUrl, apiKey, apiSecret } = config.livekit;
  const { bucket, accessKey, secret } = config.livekit.s3 || {};
  return Boolean(egressUrl && apiKey && apiSecret && bucket && accessKey && secret);
};

const getClient = () => {
  if (!isConfigured()) {
    const err = new Error(
      'Recording is not configured on this server. Set LIVEKIT_EGRESS_URL and S3 credentials in the backend .env file.',
    );
    err.statusCode = 503;
    throw err;
  }
  return new EgressClient(config.livekit.egressUrl, config.livekit.apiKey, config.livekit.apiSecret);
};

const startRoomRecording = async ({ roomName }) => {
  const client = getClient();
  const { s3 } = config.livekit;
  const info = await client.startRoomCompositeEgress(
    roomName,
    {
      file: {
        filepath: `meetings/${roomName}-${Date.now()}.mp4`,
        s3: {
          accessKey: s3.accessKey,
          secret: s3.secret,
          region: s3.region,
          bucket: s3.bucket,
          endpoint: s3.endpoint || undefined,
        },
      },
    },
    { preset: 'H264_720P_30', layout: 'speaker' },
  );
  return { egressId: info.egressId, url: (info.fileResults && info.fileResults[0] && info.fileResults[0].url) || '' };
};

const stopRoomRecording = async ({ egressId }) => {
  if (!egressId) {
    const err = new Error('No active recording to stop');
    err.statusCode = 400;
    throw err;
  }
  const client = getClient();
  const info = await client.stopEgress(egressId);
  return { egressId: info.egressId, url: (info.fileResults && info.fileResults[0] && info.fileResults[0].url) || '' };
};

module.exports = {
  isConfigured,
  startRoomRecording,
  stopRoomRecording,
};
