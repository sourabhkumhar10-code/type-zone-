const { sendPasswordResetEmail } = require("./src/services/emailService");

async function testEmail() {
  console.log("🧪 Testing Email Configuration...\n");
  
  try {
    const result = await sendPasswordResetEmail(
      "typingzone50@gmail.com", 
      "test-token-12345", 
      "TestUser"
    );
    
    console.log("\n✅ Email test completed!");
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n❌ Email test failed!");
    console.error("Error:", error.message);
    console.error("\nTroubleshooting tips:");
    console.error("1. Verify EMAIL_ENABLED=true in .env file");
    console.error("2. Check if typingzone50@gmail.com is correct");
    console.error("3. Ensure the app password is correct (16 characters, no spaces)");
    console.error("4. Make sure 2FA is enabled on your Google account");
    console.error("5. Try using port 465 instead of 587 in .env");
  }
}

testEmail();
