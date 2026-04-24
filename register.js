// If already logged in, go straight to the game
if (getCurrentUser()) {
  window.location.href = "index.html";
}

const form = document.getElementById("registerForm");
const errorMsgEl = document.getElementById("errorMsg");
const submitBtn = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get all input values
  const username = document.getElementById("username").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  errorMsgEl.textContent = ""; // Clear previous errors
  errorMsgEl.style.color = "var(--bad)";

  // --- Enhanced Validation Logic ---
  if (!fullName) {
    errorMsgEl.textContent = "Please enter your full name";
    document.getElementById("fullName").focus();
    return;
  }

  if (!email) {
    errorMsgEl.textContent = "Please enter your email";
    document.getElementById("email").focus();
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorMsgEl.textContent = "Please enter a valid email address";
    document.getElementById("email").focus();
    return;
  }

  if (!username) {
    errorMsgEl.textContent = "Please enter a username";
    document.getElementById("username").focus();
    return;
  }

  if (username.length < 3) {
    errorMsgEl.textContent = "Username must be at least 3 characters";
    document.getElementById("username").focus();
    return;
  }

  if (!password) {
    errorMsgEl.textContent = "Please enter a password";
    document.getElementById("password").focus();
    return;
  }

  if (password.length < 6) {
    errorMsgEl.textContent = "Password must be at least 6 characters";
    document.getElementById("password").focus();
    return;
  }

  if (!confirmPassword) {
    errorMsgEl.textContent = "Please confirm your password";
    document.getElementById("confirmPassword").focus();
    return;
  }

  if (password !== confirmPassword) {
    errorMsgEl.textContent = "Passwords do not match. Please try again.";
    document.getElementById("confirmPassword").value = "";
    document.getElementById("confirmPassword").focus();
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";
    await registerUser({
      username,
      fullName,
      email,
      password,
    });
    errorMsgEl.style.color = "var(--good)";
    errorMsgEl.textContent = "Account created successfully! Redirecting...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  } catch (err) {
    console.error("Registration error:", err);
    errorMsgEl.style.color = "var(--bad)";

    // More specific error messages
    if (err.message.includes("Username already taken") || err.status === 409) {
      errorMsgEl.textContent =
        "Username is already taken. Please choose a different username.";
      document.getElementById("username").focus();
    } else if (err.status === 400) {
      errorMsgEl.textContent = err.message || "Invalid input. Please check all fields.";
    } else if (err.status === 500) {
      errorMsgEl.textContent = "Server error. Please try again later.";
    } else if (err.message.includes("fetch") || err.message.includes("network")) {
      errorMsgEl.textContent =
        "Cannot connect to server. Please make sure the server is running.";
    } else {
      errorMsgEl.textContent = err.message || "Registration failed. Please try again.";
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
});
