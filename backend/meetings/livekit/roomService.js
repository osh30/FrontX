const { RoomServiceClient } = require('livekit-server-sdk');
const config = require('../config');

const roomService = new RoomServiceClient(
  config.livekit.url,
  config.livekit.apiKey,
  config.livekit.apiSecret,
);

const createRoom = async ({ name, maxParticipants, emptyTimeout = 60 }) =>
  roomService.createRoom({ name, maxParticipants, emptyTimeout });

const roomExists = async (name) => {
  try {
    const rooms = await roomService.listRooms();
    return rooms.some((room) => room.name === name);
  } catch {
    return false;
  }
};

const listRooms = () => roomService.listRooms();

const listParticipants = (roomName) => roomService.listParticipants(roomName);

const removeParticipant = (roomName, identity) => roomService.removeParticipant(roomName, identity);

const deleteRoom = async (name) => {
  try {
    await roomService.deleteRoom(name);
    return { deleted: true };
  } catch (err) {
    return { deleted: false, error: err.message };
  }
};

module.exports = {
  roomService,
  createRoom,
  roomExists,
  listRooms,
  listParticipants,
  removeParticipant,
  deleteRoom,
};
