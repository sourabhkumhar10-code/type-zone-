const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/emailService");
const {
  findUserByUsername,
  findUserByEmail,
  createUser,
  getPasswordHashByUsername,
  findUserById,
  createPasswordReset,
  getPasswordResetByToken,
  markPasswordResetUsed,
  updateUserPassword,
  db,
} = require("../lib/db");
const { jwtSecret, tokenExpiresIn } = require("../config");

const router = express.Router();

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  fullName: user.full_name,
  createdAt: user.created_at,
});

const createToken = (userId) =>
  jwt.sign({ sub: userId }, jwtSecret, { expiresIn: tokenExpiresIn });

router.post("/register", async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;

    if (!username || !email || !fullName || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    if (findUserByUsername(username)) {
      return res.status(409).json({ error: "Username already taken" });
    }

    // Email can be reused for multiple accounts - only check username
    // if (findUserByEmail(email)) {
    //   return res.status(409).json({ error: "Email already registered" });
    // }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = createUser({
      username,
      email,
      fullName,
      passwordHash,
    });

    const token = createToken(user.id);

    return res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("POST /auth/register failed", err);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = findUserByEmail(email);

    // Always return a success response so callers cannot enumerate accounts
    if (!user) {
      return res.json({ 
        message: "If an account exists, a reset link was sent to your email",
        emailSent: true 
      });
    }

    // Invalidate any existing reset tokens for this user
    const existingResets = db.prepare(
      "SELECT id FROM password_resets WHERE user_id = ? AND used = 0"
    ).all(user.id);
    
    existingResets.forEach(reset => {
      db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(reset.id);
    });

    const token = crypto.randomBytes(32).toString("hex"); // 64 chars - more secure
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    createPasswordReset({ userId: user.id, token, expiresAt });

    // Send email with reset link
    const emailResult = await sendPasswordResetEmail(email, token, user.username);

    return res.json({ 
      message: "Password reset requested. Check your email for instructions.",
      emailSent: true,
      demoMode: !emailResult.messageId, // Indicate if we're in demo mode
      ...(emailResult.demoMode && { 
        token: emailResult.token,
        resetUrl: emailResult.resetUrl 
      }),
    });
  } catch (err) {
    console.error("POST /auth/forgot failed", err);
    return res.status(500).json({ error: "Failed to request password reset" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const reset = getPasswordResetByToken(token);
    if (!reset) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    const user = findUserById(reset.user_id);
    if (!user) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    updateUserPassword(user.id, passwordHash);
    markPasswordResetUsed(reset.id);

    const tokenStr = createToken(user.id);

    return res.json({ token: tokenStr, user: sanitizeUser(user) });
  } catch (err) {
    console.error("POST /auth/reset failed", err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const record = getPasswordHashByUsername(username);
    if (!record) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, record.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(record.id);

    return res.json({
      token,
      user: sanitizeUser(record),
    });
  } catch (err) {
    console.error("POST /auth/login failed", err);
    return res.status(500).json({ error: "Failed to login" });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;


