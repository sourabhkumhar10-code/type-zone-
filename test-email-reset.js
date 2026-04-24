const sendBtn = document.getElementById("sendBtn");
const messageDiv = document.getElementById("message");

async function sendResetEmail() {
  const email = document.getElementById("email").value.trim();

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("Please enter a valid email address", "error");
    return;
  }

  try {
    // Show loading state
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";
    messageDiv.style.display = "none";

    // Make API request
    const response = await fetch("http://localhost:3001/api/auth/forgot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      let successMsg = "<strong>✅ Success!</strong><br>";

      if (data.demoMode) {
        successMsg +=
          "<strong>Demo Mode:</strong> Email service not configured.<br>";
        successMsg += `<strong>Reset Link:</strong><br><a href="${data.resetUrl}" target="_blank" style="color: #22c55e; word-break: break-all;">${data.resetUrl}</a>`;
      } else {
        successMsg += `Check your email at <strong>${email}</strong> for the password reset link.<br>`;
        successMsg +=
          "<strong>Didn't receive it?</strong> Check your spam folder!";
      }

      showMessage(successMsg, "success");
    } else {
      showMessage("<strong>Error:</strong> " + (data.error || "Failed to send"), "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage(
      "<strong>Error:</strong> Could not connect to server.<br>" +
        "<strong>Make sure:</strong><br>" +
        "1. Server is running (npm start)<br>" +
        "2. Server is on http://localhost:3001<br>" +
        "<br>" +
        "<strong>Error details:</strong> " +
        error.message,
      "error"
    );
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send Reset Link";
  }
}

function showMessage(text, type) {
  messageDiv.className = "message " + type;
  messageDiv.innerHTML = text;
  messageDiv.style.display = "block";
}

if (sendBtn) {
  sendBtn.addEventListener("click", sendResetEmail);
}
