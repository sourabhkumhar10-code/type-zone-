const Database = require("better-sqlite3");
const path = require("path");

// Connect to database
const db = new Database(path.resolve(__dirname, "data", "typezone.sqlite"));

console.log("📊 Checking users in database...\n");

const users = db.prepare("SELECT id, username, email, full_name, created_at FROM users").all();

if (users.length === 0) {
  console.log("❌ No users found in database!");
  console.log("\n💡 Users need to register first before they can reset passwords.");
} else {
  console.log(`✅ Found ${users.length} user(s):\n`);
  users.forEach((user, index) => {
    console.log(`${index + 1}. Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.full_name}`);
    console.log(`   Created: ${user.created_at}\n`);
  });
  
  console.log("=".repeat(60));
  console.log("💡 To test password reset:");
  console.log("   1. Go to forgot.html in your browser");
  console.log("   2. Enter one of the emails above");
  console.log("   3. Check that user's email inbox");
  console.log("   4. The reset email should arrive there");
  console.log("=".repeat(60));
}

db.close();
