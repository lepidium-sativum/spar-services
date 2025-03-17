const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const { setupRoutes } = require("./router/index");
const { tts } = require("./middlewares");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());
// TODO: tighten down cors
app.options("*", cors);
// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(tts());

// Setup the routes
setupRoutes(app);
if (process.env.ENV === "dev") {
  console.log(listEndpoints(app));
}

module.exports = app;
