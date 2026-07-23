const { findUserByEmail, createUser } = require("./src/lib/db");
const { sendPasswordResetEmail } = require("./src/services/emailService");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Database = require("better-sqlite3");
const path = require("path");

// Connect to database
const db = new Database(path.resolve(__dirname, "data", "typezone.sqlite"));

async function testUserFlow() {
  console.log("🧪 Testing Complete User Password Reset Flow\n");
  
  // Step 1: Check if test user exists
  const testEmail = "testuser@example.com";
  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(testEmail);
  
  if (!user) {
    console.log("📝 Creating test user...");
    const passwordHash = await bcrypt.hash("testpassword123", 12);
    user = db.prepare(`
      INSERT INTO users (username, email, full_name, password_hash)
      VALUES (?, ?, ?, ?)
    `).run("testuser", testEmail, "Test User", passwordHash);
    
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.lastInsertRowid);
    console.log(`✅ Created user: ${user.username} (${user.email})`);
  } else {
    console.log(`✅ Found existing user: ${user.username} (${user.email})`);
  }
  
  // Step 2: Simulate forgot password request
  console.log("\n🔑 Generating password reset token...");
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  
  // Clear any existing resets for this user
  db.prepare("UPDATE password_resets SET used = 1 WHERE user_id = ?").run(user.id);
  
  // Create new reset token
  const resetRecord = db.prepare(`
    INSERT INTO password_resets (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `).run(user.id, token, expiresAt);
  
  console.log(`✅ Token created and saved to database`);
  
  // Step 3: Send email
  console.log("\n📧 Attempting to send password reset email...");
  console.log(`   To: ${user.email}`);
  console.log(`   From: TypeZone <typingzone50@gmail.com>`);
  
  try {
    const result = await sendPasswordResetEmail(user.email, token, user.username);
    
    console.log("\n" + "=".repeat(60));
    if (result.success) {
      console.log("✅ SUCCESS! Email sent to user!");
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Demo Mode: ${result.demoMode || false}`);
      
      if (result.demoMode) {
        console.log("\n⚠️  EMAIL NOT CONFIGURED PROPERLY!");
        console.log("   The system is in demo mode - emails won't be delivered.");
        console.log("   Check server/.env file:");
        console.log("   - EMAIL_ENABLED must be 'true'");
        console.log("   - EMAIL_USER and EMAIL_PASS must be set");
      } else {
        console.log("\n✅ Real email should be delivered to user!");
      }
    } else {
      console.log("❌ FAILED to send email");
    }
    console.log("=".repeat(60));
    
  } catch (error) {
    console.log("\n❌ ERROR sending email!");
    console.log(`   Error: ${error.message}`);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check .env file has EMAIL_ENABLED=true");
    console.log("   2. Verify EMAIL_USER is your Gmail address");
    console.log("   3. Verify EMAIL_PASS is the App Password (16 chars)");
    console.log("   4. Make sure 2FA is enabled on Google account");
    console.log("   5. Restart the server after changing .env");
  }
  
  db.close();
}

testUserFlow().catch(console.error);
