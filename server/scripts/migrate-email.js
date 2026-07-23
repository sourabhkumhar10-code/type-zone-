/**
 * Migration script to remove UNIQUE constraint from email column
 * This allows multiple accounts to use the same email address
 */

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { dbPath } = require("../src/config");

console.log("🔄 Starting email migration...");
console.log(`Database path: ${dbPath}`);

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log("⚠️  Database doesn't exist yet. No migration needed.");
  console.log("The new schema will be created when the server starts.");
  process.exit(0);
}

const db = new Database(dbPath);

try {
  // Begin transaction
  db.exec("BEGIN TRANSACTION");

  // Check if the users table has the UNIQUE constraint on email
  const tableInfo = db.pragma("table_info(users)");
  console.log("\n📋 Current users table structure:");
  console.table(tableInfo);

  // Create new table without email UNIQUE constraint
  db.exec(`
    CREATE TABLE IF NOT EXISTS users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Copy data from old table to new table
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  console.log(`\n📊 Found ${userCount.count} users to migrate`);

  db.exec(`
    INSERT INTO users_new (id, username, email, full_name, password_hash, created_at)
    SELECT id, username, email, full_name, password_hash, created_at
    FROM users;
  `);

  // Drop old table
  db.exec("DROP TABLE users");

  // Rename new table to users
  db.exec("ALTER TABLE users_new RENAME TO users");

  // Create index on email for better query performance
  db.exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");

  // Commit transaction
  db.exec("COMMIT");

  console.log("\n✅ Migration completed successfully!");
  console.log("✅ Email field is now non-unique - users can share email addresses");
  console.log("✅ Username remains unique");

  // Verify the new structure
  const newTableInfo = db.pragma("table_info(users)");
  console.log("\n📋 New users table structure:");
  console.table(newTableInfo);

  const indexes = db.pragma("index_list(users)");
  console.log("\n🔍 Indexes:");
  console.table(indexes);

} catch (err) {
  console.error("\n❌ Migration failed:", err);
  db.exec("ROLLBACK");
  process.exit(1);
} finally {
  db.close();
}

console.log("\n🎉 Done! You can now restart the server.");
