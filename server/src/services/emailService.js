const nodemailer = require("nodemailer");
const { emailEnabled, emailHost, emailPort, emailUser, emailPass, emailFrom, appUrl } = require("../config");

// Create transporter for sending emails
const createTransporter = () => {
  if (!emailEnabled || !emailUser || !emailPass) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ EMAIL NOT CONFIGURED!");
    console.error("=".repeat(60));
    console.error("To enable real email sending:");
    console.error("1. Open server/.env file");
    console.error("2. Set EMAIL_ENABLED=true");
    console.error("3. Add your Gmail to EMAIL_USER");
    console.error("4. Add App Password to EMAIL_PASS");
    console.error("5. Restart the server");
    console.error("=".repeat(60) + "\n");
    return null;
  }

  console.log(`\n✅ Email configured: Sending via ${emailHost}:${emailPort}`);
  
  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false, // For development; set true in production
    },
    logger: true, // Enable nodemailer internal logging
    debug: true,  // Show debug info
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} token - Password reset token
 * @param {string} username - Username for personalization
 */
const sendPasswordResetEmail = async (email, token, username) => {
  const transporter = createTransporter();
  const resetUrl = `${appUrl}/reset.html?token=${encodeURIComponent(token)}`;

  const mailOptions = {
    from: emailFrom,
    to: email,
    subject: "TypeZone - Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e, #4ade80); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 TypeZone Password Reset</h1>
            </div>
            <div class="content">
              <p>Hi ${username || "TypeZone User"},</p>
              
              <p>We received a request to reset your password. Click the button below to reset it:</p>
              
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>If you didn't request this reset, you can safely ignore this email</li>
                  <li>Your password won't change unless you use this link</li>
                  <li>For security, never share this link with anyone</li>
                </ul>
              </div>
              
              <p>Need help? Contact our support team.</p>
              
              <p>Best regards,<br>The TypeZone Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} TypeZone. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${username || "TypeZone User"},

We received a request to reset your password. Click the link below to reset it:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this reset, you can safely ignore this email.

Best regards,
The TypeZone Team
    `,
  };

  try {
    if (!transporter) {
      // Email not configured - log token for demo purposes
      console.log("\n" + "=".repeat(60));
      console.log("📧 PASSWORD RESET REQUESTED (Demo Mode)");
      console.log("=".repeat(60));
      console.log(`⚠️  Email service NOT configured - showing reset link here:`);
      console.log(`To: ${email}`);
      console.log(`Token: ${token}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log("\n💡 To receive real emails:");
      console.log("   1. Edit server/.env");
      console.log("   2. Set EMAIL_ENABLED=true");
      console.log("   3. Add your Gmail credentials");
      console.log("   4. Restart server");
      console.log("=".repeat(60) + "\n");
      
      return {
        success: true,
        message: "Demo mode - check server console for reset token",
        token: token, // Return token for demo/testing
        resetUrl: resetUrl,
        demoMode: true,
      };
    }

    console.log(`\n📤 Attempting to send email to: ${email}`);
    console.log(`From: ${emailFrom}`);
    console.log(`Subject: Password Reset Request`);
    
    // Send actual email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`\n✅ SUCCESS! Email sent to ${email}`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    
    return {
      success: true,
      message: "Password reset email sent successfully",
      messageId: info.messageId,
      demoMode: false,
    };
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ FAILED TO SEND EMAIL!");
    console.error("=".repeat(60));
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error(`Stack: ${error.stack}`);
    console.error("\n🔧 Common fixes:");
    console.error("   1. Check EMAIL_USER and EMAIL_PASS in .env");
    console.error("   2. Ensure Gmail App Password is correct (not regular password)");
    console.error("   3. Verify 2FA is enabled on Google account");
    console.error("   4. Check firewall allows port 587");
    console.error("   5. Try EMAIL_PORT=465 instead of 587");
    console.error("=".repeat(60) + "\n");
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};

module.exports = {
  sendPasswordResetEmail,
};
