const pino = require("pino");
// const pinoPrettyTransport = require("./pino-pretty-transport");

const logger = pino({
  name: `spar-tts-${process.env.ENV}`,
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  level: "debug",
  transport: {
    target: "pino-pretty", // pinoPrettyTransport
    options: {
      colorize: true,
      levelFirst: true,
    },
  },
});

module.exports = { logger };
