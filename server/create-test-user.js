const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

console.log('\n🔧 Creating Test User for Login\n');

const db = new Database(path.resolve(__dirname, "data", "typezone.sqlite"));

// Create a test user with known credentials
const username = "demouser";
const email = "demo@typezone.com";
const fullName = "Demo User";
const password = "password123";

try {
  // Check if user already exists
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  
  if (existing) {
    console.log(`⚠️  User "${username}" already exists!`);
    
    // Update the password
    const passwordHash = bcrypt.hashSync(password, 12);
    db.prepare("UPDATE users SET password_hash = ? WHERE username = ?").run(passwordHash, username);
    console.log(`✅ Password updated for "${username}"`);
  } else {
    // Create new user
    const passwordHash = bcrypt.hashSync(password, 12);
    const result = db.prepare(`
      INSERT INTO users (username, email, full_name, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(username, email, fullName, passwordHash);
    
    console.log(`✅ Created user "${username}" with ID ${result.lastInsertRowid}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('LOGIN CREDENTIALS:');
  console.log('='.repeat(60));
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log('='.repeat(60));
  console.log('\nYou can now login at: http://localhost:3001/login.html\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
