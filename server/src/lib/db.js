const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { dbPath } = require("../config");

const ensureDirectory = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectory(dbPath);

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mode TEXT NOT NULL,
      level TEXT NOT NULL,
      wpm INTEGER NOT NULL,
      accuracy REAL,
      errors INTEGER,
      chars INTEGER,
      duration REAL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (user_id, mode, level)
    );
    
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
  `);
};

const findUserByUsername = (username) =>
  db.prepare("SELECT * FROM users WHERE username = ?").get(username);

const findUserByEmail = (email) =>
  db.prepare("SELECT * FROM users WHERE email = ?").get(email);

const findUserById = (id) =>
  db.prepare("SELECT id, username, email, full_name, created_at FROM users WHERE id = ?").get(id);

const createUser = ({ username, email, fullName, passwordHash }) => {
  const insert = db.prepare(
    `
    INSERT INTO users (username, email, full_name, password_hash)
    VALUES (@username, @email, @fullName, @passwordHash)
  `
  );
  const info = insert.run({ username, email, fullName, passwordHash });
  return findUserById(info.lastInsertRowid);
};

const createPasswordReset = ({ userId, token, expiresAt }) => {
  const insert = db.prepare(
    `
    INSERT INTO password_resets (user_id, token, expires_at)
    VALUES (@userId, @token, @expiresAt)
  `
  );
  const info = insert.run({ userId, token, expiresAt });
  return db
    .prepare("SELECT * FROM password_resets WHERE id = ?")
    .get(info.lastInsertRowid);
};

const getPasswordResetByToken = (token) =>
  db
    .prepare(
      `
      SELECT * FROM password_resets
       WHERE token = ?
         AND used = 0
    `
    )
    .get(token);

const markPasswordResetUsed = (id) =>
  db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(id);

const updateUserPassword = (userId, passwordHash) =>
  db
    .prepare(
      `
      UPDATE users
         SET password_hash = @passwordHash
       WHERE id = @userId
    `
    )
    .run({ userId, passwordHash });

const getPasswordHashByUsername = (username) =>
  db
    .prepare(
      "SELECT id, username, email, full_name, password_hash FROM users WHERE username = ?"
    )
    .get(username);

const upsertScore = ({ userId, mode, level, wpm, accuracy, errors, chars, duration }) => {
  const existing = db
    .prepare(
      "SELECT * FROM scores WHERE user_id = ? AND mode = ? AND level = ?"
    )
    .get(userId, mode, level);

  if (!existing) {
    db.prepare(
      `
      INSERT INTO scores (user_id, mode, level, wpm, accuracy, errors, chars, duration)
      VALUES (@userId, @mode, @level, @wpm, @accuracy, @errors, @chars, @duration)
    `
    ).run({ userId, mode, level, wpm, accuracy, errors, chars, duration });
    return true;
  }

  if (wpm > existing.wpm) {
    db.prepare(
      `
      UPDATE scores
         SET wpm = @wpm,
             accuracy = @accuracy,
             errors = @errors,
             chars = @chars,
             duration = @duration,
             updated_at = datetime('now')
       WHERE user_id = @userId
         AND mode = @mode
         AND level = @level
    `
    ).run({ userId, mode, level, wpm, accuracy, errors, chars, duration });
    return true;
  }

  return false;
};

const getScore = ({ userId, mode, level }) =>
  db
    .prepare(
      `
      SELECT s.*, u.username, u.full_name
        FROM scores s
        JOIN users u ON u.id = s.user_id
       WHERE s.user_id = ?
         AND s.mode = ?
         AND s.level = ?
    `
    )
    .get(userId, mode, level);

const getLeaderboard = ({ mode, level, limit = 10 }) =>
  db
    .prepare(
      `
      SELECT s.wpm,
             s.accuracy,
             s.errors,
             s.chars,
             s.updated_at,
             u.username,
             u.full_name
        FROM scores s
        JOIN users u ON u.id = s.user_id
       WHERE s.mode = ?
         AND s.level = ?
       ORDER BY s.wpm DESC, s.accuracy DESC, s.updated_at ASC
       LIMIT ?
    `
    )
    .all(mode, level, limit);

module.exports = {
  db,
  initDb,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  createUser,
  getPasswordHashByUsername,
  upsertScore,
  getScore,
  getLeaderboard,
  createPasswordReset,
  getPasswordResetByToken,
  markPasswordResetUsed,
  updateUserPassword,
};


