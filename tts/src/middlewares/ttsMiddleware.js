const TTS = require("../tts/TTS");

const tts = () => {
  return (req, res, next) => {
    const tts = new TTS();
    if (tts) {
      req.tts = tts;
      return next();
    }
    return next(new Error("TTS initialization failed"));
  };
};

module.exports = { tts };
