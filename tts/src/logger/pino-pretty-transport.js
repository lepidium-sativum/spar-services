const PinoPretty = require("pino-pretty");

module.exports = function (opts) {
  return PinoPretty({
    ...opts,
    messageFormat: (log, messageKey) => `${log[messageKey]}`,
  });
};
