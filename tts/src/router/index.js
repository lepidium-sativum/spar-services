const { publicRouter } = require("./public.router");
const { health } = require("./health");

const setupRoutes = (app) => {
  // Serve your index.html file for basic testing
  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

  app.get("/health", health);
  app.use("/api/public", publicRouter);
  app.get("*", async (req, res) =>
    res.status(404).send({
      error: { name: "404 Not Found", message: `${req.url} not found` },
    })
  );
};

module.exports = {
  setupRoutes,
};
