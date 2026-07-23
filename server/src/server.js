const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { initDb } = require("./lib/db");
const config = require("./config");

const authRoutes = require("./routes/auth");
const scoreRoutes = require("./routes/scores");

initDb();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Add request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hostname: req.hostname,
    version: "1.0.0",
  });
});

// Serve static frontend files from project root
const frontendPath = path.resolve(__dirname, '../..');
console.log('Serving frontend from:', frontendPath);
console.log('forgot.html exists at:', require('fs').existsSync(path.join(frontendPath, 'forgot.html')));
app.use(express.static(frontendPath));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);

// Catch-all route - serve forgot.html for /forgot requests
app.get('/forgot', (req, res) => {
  res.sendFile(path.join(frontendPath, 'forgot.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(config.port, () => {
  console.log(`TypeZone API listening on http://localhost:${config.port}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});


