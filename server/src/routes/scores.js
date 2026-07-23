const express = require("express");
const authMiddleware = require("../middleware/auth");
const { upsertScore, getScore, getLeaderboard } = require("../lib/db");

const router = express.Router();

const allowedModes = new Set(["typing", "coding"]);
const allowedLevels = new Set(["easy", "medium", "hard"]);

const validatePayload = ({ mode, level, wpm, requireWpm = true }) => {
  if (!mode) {
    return "Mode is required";
  }
  if (!allowedModes.has(mode)) {
    return "Invalid mode";
  }
  if (!level) {
    return "Level is required";
  }
  if (!allowedLevels.has(level)) {
    return "Invalid level";
  }
  if (requireWpm && (typeof wpm !== "number" || Number.isNaN(wpm) || wpm < 0)) {
    return "Invalid WPM value";
  }
  return null;
};

router.post("/", authMiddleware, (req, res) => {
  const { mode, level, wpm, accuracy = null, errors = null, chars = null, duration = null } =
    req.body || {};

  const error = validatePayload({ mode, level, wpm });
  if (error) {
    return res.status(400).json({ error });
  }

  const updated = upsertScore({
    userId: req.user.id,
    mode,
    level,
    wpm,
    accuracy,
    errors,
    chars,
    duration,
  });

  const score = getScore({ userId: req.user.id, mode, level });
  return res.json({ updated, score });
});

router.get("/best", authMiddleware, (req, res) => {
  const { mode, level } = req.query;
  const error = validatePayload({ mode, level, wpm: 0, requireWpm: false });
  if (error) {
    return res.status(400).json({ error });
  }

  const score = getScore({
    userId: req.user.id,
    mode,
    level,
  });

  return res.json({ score });
});

router.get("/leaderboard", (req, res) => {
  const { mode, level, limit = 10 } = req.query;

  const error = validatePayload({
    mode,
    level,
    wpm: 0,
    requireWpm: false,
  });
  if (error) {
    return res.status(400).json({ error });
  }

  const parsedLimit = Math.min(
    50,
    Math.max(1, Number.isNaN(Number(limit)) ? 10 : Number(limit))
  );

  const entries = getLeaderboard({
    mode,
    level,
    limit: parsedLimit,
  });

  return res.json({ entries });
});

module.exports = router;


