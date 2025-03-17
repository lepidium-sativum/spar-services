const socketIO = require("socket.io");
const { socketHandler } = require("./socket/socketHandler");

const startSocketListeningToConnections = (httpServer) => {
  const io = socketIO(httpServer);
  global.io = io;

  // https://socket.io/docs/v4/server-application-structure/
  const onConnection = (socket) => {
    socketHandler(io, socket);
  };

  // Handle socket.io connections
  io.on("connection", onConnection);
};

module.exports = { startSocketListeningToConnections };
