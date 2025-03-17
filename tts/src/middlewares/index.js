const socketMiddleware = require("./socketMiddleware");
const ttsMiddleware = require("./ttsMiddleware");

module.exports = {
  ...socketMiddleware,
  ...ttsMiddleware,
};
