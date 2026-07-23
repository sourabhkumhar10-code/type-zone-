const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '..', 'data', 'typezone.sqlite');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
console.log('Tables:', tables);

try {
  const res = db.prepare('SELECT * FROM password_resets LIMIT 5').all();
  console.log('Password resets:', res);
} catch (err) {
  console.error('Error reading password_resets:', err.message);
}
