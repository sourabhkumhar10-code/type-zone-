// --- Login Logic ---
// If already logged in, go straight to the game
if (getCurrentUser()) {
  window.location.href = "index.html";
}

const form = document.getElementById("loginForm");
const errorMsgEl = document.getElementById("errorMsg");
const submitBtn = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  errorMsgEl.textContent = "";

  // Client-side validation
  if (!username) {
    errorMsgEl.textContent = "Please enter your username";
    document.getElementById("username").focus();
    return;
  }

  if (!password) {
    errorMsgEl.textContent = "Please enter your password";
    document.getElementById("password").focus();
    return;
  }

  if (username.length < 3) {
    errorMsgEl.textContent = "Username must be at least 3 characters";
    document.getElementById("username").focus();
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
    await loginUser({ username, password });
    errorMsgEl.style.color = "var(--good)";
    errorMsgEl.textContent = "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  } catch (err) {
    console.error("Login error:", err);
    errorMsgEl.style.color = "var(--bad)";

    // More specific error messages
    if (err.message.includes("credentials")) {
      errorMsgEl.textContent = "Invalid username or password. Please try again.";
    } else if (err.message.includes("AUTH_REQUIRED")) {
      errorMsgEl.textContent = "Authentication failed. Please check your credentials.";
    } else if (err.status === 401) {
      errorMsgEl.textContent =
        "Invalid username or password. Don't have an account? Register below.";
    } else if (err.status === 500) {
      errorMsgEl.textContent = "Server error. Please try again later.";
    } else if (err.message.includes("fetch") || err.message.includes("network")) {
      errorMsgEl.textContent =
        "Cannot connect to server. Please make sure the server is running.";
    } else {
      errorMsgEl.textContent = err.message || "Unable to login. Please try again.";
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Login";
  }
});
