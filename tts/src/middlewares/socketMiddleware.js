const allowedPaths = (io, socketPath) => {
  return (socket, next) => {
    const requestedPath = socket.handshake.headers.referer;
    if (requestedPath && requestedPath.includes(socketPath)) {
      return next();
    }
    // Reject connections to other paths
    return next(new Error("Invalid path"));
  };
};

module.exports = { allowedPaths };
