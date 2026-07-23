const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.resolve(__dirname, "..", "data", "typezone.sqlite");
const db = new Database(dbPath);

const tables = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  )
  .all();

const users = db
  .prepare("SELECT id, username, email, full_name, created_at FROM users")
  .all();

const scores = db
  .prepare(
    "SELECT user_id, mode, level, wpm, accuracy, errors, chars, duration, updated_at FROM scores"
  )
  .all();

console.log("Tables:", tables);
console.log("Users:", users);
console.log("Scores:", scores);


