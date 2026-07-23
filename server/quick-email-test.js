/**
 * Quick Email Test - Send a simple test email
 * Usage: node quick-email-test.js your-email@gmail.com
 */

const nodemailer = require("nodemailer");

// Load environment variables
require("dotenv").config();

const TEST_CONFIG = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: (process.env.EMAIL_PORT === "465"),
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  from: process.env.EMAIL_FROM || "TypeZone <noreply@typezone.local>"
};

async function sendQuickTest(recipientEmail) {
  console.log("\n" + "=".repeat(60));
  console.log("📧 QUICK EMAIL TEST");
  console.log("=".repeat(60) + "\n");
  
  // Check if configured
  if (!TEST_CONFIG.user || !TEST_CONFIG.pass) {
    console.error("❌ EMAIL NOT CONFIGURED!");
    console.error("\nTo enable:");
    console.error("1. Edit server/.env");
    console.error("2. Set EMAIL_ENABLED=true");
    console.error("3. Add Gmail credentials");
    console.error("4. Restart server\n");
    
    // Show what would be sent
    console.log("📧 DEMO MODE - Would send:");
    console.log(`   To: ${recipientEmail}`);
    console.log(`   From: ${TEST_CONFIG.from}`);
    console.log(`   Subject: TypeZone Password Reset Test`);
    console.log(`   Host: ${TEST_CONFIG.host}:${TEST_CONFIG.port}\n`);
    return;
  }
  
  const mailOptions = {
    from: TEST_CONFIG.from,
    to: recipientEmail,
    subject: "✅ TypeZone Email Test",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color: #22c55e;">✅ Email Test Successful!</h2>
        <p>This is a test email from TypeZone.</p>
        <p>If you received this, your email system is working correctly.</p>
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
      </div>
    `,
    text: `
✅ Email Test Successful!

This is a test email from TypeZone.
If you received this, your email system is working correctly.

Sent at: ${new Date().toLocaleString()}
    `
  };
  
  try {
    const transporter = nodemailer.createTransport({
      host: TEST_CONFIG.host,
      port: TEST_CONFIG.port,
      secure: TEST_CONFIG.secure,
      auth: {
        user: TEST_CONFIG.user,
        pass: TEST_CONFIG.pass,
      },
      tls: { rejectUnauthorized: false },
    });
    
    console.log("📤 Sending test email...");
    console.log(`   To: ${recipientEmail}`);
    console.log(`   From: ${mailOptions.from}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log("\n✅ EMAIL SENT SUCCESSFULLY!");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Status: ${info.response}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`   Preview: ${previewUrl}`);
    }
    
    console.log("\n💡 Check your inbox (and spam folder)");
    console.log("=".repeat(60) + "\n");
    
  } catch (error) {
    console.error("\n❌ FAILED TO SEND EMAIL!");
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Check Gmail App Password");
    console.error("   2. Verify 2FA is enabled");
    console.error("   3. Try port 465 instead of 587");
    console.error("   4. Check firewall settings\n");
  }
}

// Get recipient from command line or use default
const recipient = process.argv[2] || "test@example.com";
sendQuickTest(recipient);
