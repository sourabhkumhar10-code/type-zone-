const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.resolve(__dirname, "data", "typezone.sqlite"));

console.log("\n📊 TYPEZONE DATABASE OVERVIEW\n");
console.log("=" .repeat(60));

// Count users
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
console.log(`\n👥 Total Users: ${userCount}`);

// Show all users
console.log("\n" + "=" .repeat(60));
console.log("USER LIST:");
console.log("=" .repeat(60));

const users = db.prepare("SELECT id, username, email, full_name, created_at FROM users ORDER BY id").all();

users.forEach((user, index) => {
  console.log(`\n${index + 1}. ${user.username} (ID: ${user.id})`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.full_name}`);
  console.log(`   Created: ${user.created_at}`);
});

// Count scores
const scoreCount = db.prepare("SELECT COUNT(*) as count FROM scores").get().count;
console.log("\n" + "=" .repeat(60));
console.log(`🏆 Total Scores Recorded: ${scoreCount}`);

// Show top scores
console.log("\n" + "=" .repeat(60));
console.log("TOP 5 HIGHEST WPM SCORES:");
console.log("=" .repeat(60));

const topScores = db.prepare(`
  SELECT s.wpm, s.accuracy, s.mode, s.level, u.username
  FROM scores s
  JOIN users u ON u.id = s.user_id
  ORDER BY s.wpm DESC
  LIMIT 5
`).all();

topScores.forEach((score, index) => {
  console.log(`${index + 1}. ${score.username} - ${score.wpm} WPM (${score.mode}, ${score.level}) - ${score.accuracy}% accuracy`);
});

db.close();

console.log("\n" + "=" .repeat(60));
console.log("✅ Database query complete!\n");
