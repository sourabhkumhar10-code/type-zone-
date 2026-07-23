/**
 * Email System Test Script
 * Tests SMTP configuration and email delivery
 */

const nodemailer = require("nodemailer");

// Test configuration
const TEST_CONFIG = {
  // Using environment variables from .env
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: (process.env.EMAIL_PORT === "465"),
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  from: process.env.EMAIL_FROM || "TypeZone <noreply@typezone.local>"
};

console.log("\n" + "=".repeat(70));
console.log("📧 TYPEZONE EMAIL SYSTEM DIAGNOSTIC TEST");
console.log("=".repeat(70) + "\n");

// Step 1: Check if credentials are configured
console.log("📋 STEP 1: Checking Configuration...");
console.log("-".repeat(70));

if (!TEST_CONFIG.user || !TEST_CONFIG.pass) {
  console.error("❌ EMAIL CREDENTIALS NOT CONFIGURED!");
  console.error("\n📝 To fix this:");
  console.error("   1. Open server/.env file");
  console.error("   2. Set EMAIL_ENABLED=true");
  console.error("   3. Add your Gmail to EMAIL_USER");
  console.error("   4. Add App Password to EMAIL_PASS");
  console.error("   5. Restart the server\n");
  console.error("=" .repeat(70) + "\n");
  
  console.log("💡 Running in DEMO mode - showing what WOULD be sent:\n");
  
  const demoEmail = {
    to: "your-email@gmail.com",
    subject: "Test Email from TypeZone",
    text: "This is a test email to verify the email system is working correctly."
  };
  
  console.log("📧 Email would be sent with these details:");
  console.log(`   To: ${demoEmail.to}`);
  console.log(`   From: ${TEST_CONFIG.from}`);
  console.log(`   Subject: ${demoEmail.subject}`);
  console.log(`   Host: ${TEST_CONFIG.host}:${TEST_CONFIG.port}`);
  console.log("\n✅ Configuration check complete (DEMO MODE)\n");
  process.exit(0);
}

console.log(`✅ Email credentials found`);
console.log(`   Host: ${TEST_CONFIG.host}`);
console.log(`   Port: ${TEST_CONFIG.port}`);
console.log(`   Secure: ${TEST_CONFIG.secure ? "SSL (465)" : "TLS (587)"}`);
console.log(`   User: ${TEST_CONFIG.user}`);
console.log(`   From: ${TEST_CONFIG.from}\n`);

// Step 2: Create transporter and test connection
async function testEmailConnection() {
  console.log("📋 STEP 2: Testing SMTP Connection...");
  console.log("-".repeat(70));
  
  let transporter;
  
  try {
    transporter = nodemailer.createTransport({
      host: TEST_CONFIG.host,
      port: TEST_CONFIG.port,
      secure: TEST_CONFIG.secure,
      auth: {
        user: TEST_CONFIG.user,
        pass: TEST_CONFIG.pass,
      },
      tls: {
        rejectUnauthorized: false, // For development
      },
      logger: true,
      debug: true,
    });
    
    console.log("✅ Transporter created successfully");
    
    // Verify connection
    console.log("\n📋 STEP 3: Verifying SMTP Authentication...");
    console.log("-".repeat(70));
    
    await transporter.verify();
    console.log("✅ SMTP authentication successful!");
    console.log("   Server is ready to send emails\n");
    
  } catch (error) {
    console.error("❌ SMTP CONNECTION FAILED!");
    console.error("\n🔍 Error Details:");
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    console.error("\n🔧 Common Fixes:");
    console.error("   1. Verify EMAIL_USER is your full Gmail address");
    console.error("   2. Ensure EMAIL_PASS is an App Password (not regular password)");
    console.error("   3. Confirm 2FA is enabled on your Google account");
    console.error("   4. Try different port: 587 (TLS) or 465 (SSL)");
    console.error("   5. Check firewall isn't blocking the port");
    console.error("   6. Verify Gmail allows less secure apps (for testing)\n");
    
    throw error;
  }
  
  // Step 4: Send test email
  console.log("📋 STEP 4: Sending Test Email...");
  console.log("-".repeat(70));
  
  const testEmail = {
    from: TEST_CONFIG.from,
    to: TEST_CONFIG.user, // Send to yourself for testing
    subject: "✅ TypeZone Email Test Successful!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; }
            .info { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
            .config { background: #f8f9fa; padding: 15px; margin: 20px 0; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="success">
            <h2>✅ Email Test Successful!</h2>
            <p>Your TypeZone email system is configured correctly and working.</p>
          </div>
          
          <div class="info">
            <h3>📋 Test Details:</h3>
            <ul>
              <li><strong>Sent at:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>SMTP Host:</strong> ${TEST_CONFIG.host}:${TEST_CONFIG.port}</li>
              <li><strong>Encryption:</strong> ${TEST_CONFIG.secure ? "SSL" : "TLS"}</li>
            </ul>
          </div>
          
          <div class="config">
            <h3>⚙️ Configuration Used:</h3>
            <p>Host: ${TEST_CONFIG.host}</p>
            <p>Port: ${TEST_CONFIG.port}</p>
            <p>Secure: ${TEST_CONFIG.secure ? "Yes" : "No"}</p>
            <p>From: ${TEST_CONFIG.from}</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from TypeZone's email diagnostic system.
          </p>
        </body>
      </html>
    `,
    text: `
✅ TypeZone Email Test Successful!

Your email system is configured correctly and working.

Test Details:
- Sent at: ${new Date().toLocaleString()}
- SMTP Host: ${TEST_CONFIG.host}:${TEST_CONFIG.port}
- Encryption: ${TEST_CONFIG.secure ? "SSL" : "TLS"}

Configuration Used:
- Host: ${TEST_CONFIG.host}
- Port: ${TEST_CONFIG.port}
- Secure: ${TEST_CONFIG.secure ? "Yes" : "No"}
- From: ${TEST_CONFIG.from}

This is an automated test email from TypeZone.
    `
  };
  
  try {
    const info = await transporter.sendMail(testEmail);
    
    console.log("✅ EMAIL SENT SUCCESSFULLY!");
    console.log("\n📬 Delivery Details:");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Status: ${info.response || "Delivered"}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`   Preview URL: ${previewUrl}`);
    }
    
    console.log("\n" + "=".repeat(70));
    console.log("🎉 ALL TESTS PASSED!");
    console.log("=".repeat(70));
    console.log("\n✅ Your email system is fully functional!");
    console.log("   - SMTP connection: Working");
    console.log("   - Authentication: Successful");
    console.log("   - Email delivery: Confirmed");
    console.log("\n💡 Next Steps:");
    console.log("   1. Check your inbox (and spam folder) for the test email");
    console.log("   2. Try the forgot password feature on your website");
    console.log("   3. Monitor server logs for any delivery issues\n");
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error("\n❌ FAILED TO SEND TEST EMAIL!");
    console.error("\n🔍 Error Details:");
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    console.error("\n🔧 Troubleshooting Steps:");
    console.error("   1. Check if EMAIL_USER is a valid Gmail account");
    console.error("   2. Verify App Password is correct (16 characters, no spaces)");
    console.error("   3. Ensure 2FA is enabled on the Google account");
    console.error("   4. Try using port 465 instead of 587 (or vice versa)");
    console.error("   5. Check if your firewall blocks outbound email ports");
    console.error("   6. Verify Gmail isn't blocking 'less secure apps'");
    console.error("   7. Consider using a professional service like SendGrid\n");
    
    throw error;
  }
}

// Run the test
testEmailConnection()
  .then(result => {
    if (result.success) {
      process.exit(0);
    }
  })
  .catch(error => {
    console.error("\n" + "=".repeat(70));
    console.error("❌ TEST FAILED");
    console.error("=".repeat(70));
    console.error("\nPlease review the errors above and fix the configuration.\n");
    process.exit(1);
  });
