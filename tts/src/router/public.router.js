const Router = require("express");
const controller = require("../controllers");
const publicRouter = Router();

publicRouter.route("/v1/tts/speak").post(controller.talk);
publicRouter.get("*", async (req, res) =>
  res.status(404).send({
    error: { name: "404 Not Found", message: `${req.url} not found` },
  })
);

module.exports = {
  publicRouter,
};
