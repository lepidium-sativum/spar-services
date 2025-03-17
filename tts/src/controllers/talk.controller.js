const { logger } = require("../logger/logger");
const talk = async (req, res) => {
  try {
    const { body, tts } = req;
    const { roomId, message, lang, voice, emotion } = body;
    let result;
    if (emotion && !message) {
      result = await tts.sendEmotion(roomId, emotion);
    } else {
      result = await tts.speak(roomId, message, lang, voice, emotion);
    }
    return res.json(result);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  talk,
};
