const socketPath = "/public/message/v1/tts";

const prepareSocketKey = (socketId) => {
  return `socket_${socketId}`;
};

const prepareSocketValue = (roomId, userId = null, socketId = null) => {
  // `room_${roomId}:user_${userId}:socket_${socketId}`;
  const value = `room_${roomId}`;
  return value;
};

module.exports = {
  socketPath,
  prepareSocketKey,
  prepareSocketValue,
};
