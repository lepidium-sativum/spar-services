const http = require("http");
const app = require("./app.js");
const { startSocketListeningToConnections } = require("./socketServer.js");
const { createRedisConnection } = require("./redis.js");
const { logger } = require("./logger/logger");

const startHttpServer = async (port = process.env.PORT || 80) => {
  const httpServer = http.createServer(app);
  httpServer.setTimeout(30000);

  /**
   * Socket.io section
   */
  await startSocketListeningToConnections(httpServer);

  await createRedisConnection();

  // Start the HTTP server
  httpServer.listen(port, () => {
    logger.info(`Server is running on http://0.0.0.0:${port}`);
  });

  // await setupShutdownOnEvents(httpServer);

  return httpServer;
};

startHttpServer();

module.exports = startHttpServer;
