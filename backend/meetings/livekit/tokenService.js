const { AccessToken } = require('livekit-server-sdk');
const config = require('../config');

const DEFAULT_TTL = '12h';

const createParticipantToken = async ({
  identity,
  name,
  roomName,
  canPublish = true,
  canSubscribe = true,
  metadata,
  ttl = DEFAULT_TTL,
}) => {
  const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
    identity,
    name,
    ttl,
    metadata,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish,
    canSubscribe,
    canPublishData: true,
  });

  return await at.toJwt();
};

const createIngressToken = async ({ name, roomName, ttl = DEFAULT_TTL }) => {
  const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
    identity: name,
    name,
    ttl,
  });

  at.addGrant({
    roomAdmin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return await at.toJwt();
};

module.exports = { createParticipantToken, createIngressToken };
