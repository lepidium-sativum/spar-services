const {
  setRedisKey,
  getByKey,
  deleteByKey,
  getTotalNoOfKeys,
} = require("../redis");
const { logger } = require("../logger/logger");
const {
  // socketPath,
  prepareSocketKey,
  prepareSocketValue,
} = require("../utils/util");

const SOCKET_PATTERN = "socket_*";

const socketHandler = async (io, socket) => {
  const { roomId, userId } = socket.handshake.query; // ttl
  console.log(`Connected with roomId:${roomId}, userId:${userId}`);
  const socketId = prepareSocketKey(socket.id); // userId
  const room = prepareSocketValue(roomId); // userId, socket.id
  // TODO: once the changes added in SparAPI for socket.id, update it to use userId and socketId as well
  await setRedisKey({
    key: socketId,
    value: room,
    // ttl: 3600, // 3600 seconds = 1 hour
    // value: `${room}:${user}`,
  });
  socket.join(room);
  const totalNoOfKeys = await getTotalNoOfKeys(SOCKET_PATTERN);
  logger.info(
    `User connected: ${socket.id}, Room joined: ${room}, total: ${totalNoOfKeys}`
  );

  const onDisconnect = async () => {
    const socketId = prepareSocketKey(socket.id);
    const room = await getByKey(socketId);
    if (room) {
      // logger.info(`leaving room: ${room}. socketId is: ${socketId}`);
      socket.leave(room);
      await deleteByKey(socketId);
      const totalNoOfKeys = await getTotalNoOfKeys(SOCKET_PATTERN);
      logger.info(
        `User disconnected: ${socket.id}, Room left: ${room}, total: ${totalNoOfKeys}`
      );
    }
  };

  socket.on("disconnect", onDisconnect);
};

const sendMessageToRoom = async (roomId, event, data) => {
  try {
    const room = prepareSocketValue(roomId);
    global.io.to(room).emit(event, data);
  } catch (error) {
    logger.error(`Error emitting to a socket: ${error}`);
  }
};

module.exports = { sendMessageToRoom, socketHandler };
