const qs = new URLSearchParams(window.location.search);
const token = qs.get("token");

const form = document.getElementById("resetForm");
const submitBtn = document.getElementById("submitBtn");
const tokenError = document.getElementById("tokenError");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const matchError = document.getElementById("matchError");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

// Check if token exists
if (!token) {
  form.style.display = "none";
  tokenError.style.display = "block";
} else {
  form.style.display = "block";
}

// Password strength indicator
passwordInput.addEventListener("input", (e) => {
  const password = e.target.value;
  const strength = calculatePasswordStrength(password);

  strengthBar.className = "strength-fill"; // Reset classes
  if (strength.score <= 2) {
    strengthBar.classList.add("strength-weak");
    strengthText.textContent = "Password strength: Weak";
    strengthText.style.color = "#ef4444";
  } else if (strength.score <= 4) {
    strengthBar.classList.add("strength-medium");
    strengthText.textContent = "Password strength: Medium";
    strengthText.style.color = "#f59e0b";
  } else {
    strengthBar.classList.add("strength-strong");
    strengthText.textContent = "Password strength: Strong";
    strengthText.style.color = "#22c55e";
  }
});

// Real-time password matching
confirmInput.addEventListener("input", () => {
  if (passwordInput.value !== confirmInput.value) {
    matchError.style.display = "block";
  } else {
    matchError.style.display = "none";
  }
});

function calculatePasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return { score };
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  errorMessage.style.display = "none";
  matchError.style.display = "none";

  // Validate password length
  if (password.length < 6) {
    errorMessage.textContent = "Password must be at least 6 characters";
    errorMessage.style.display = "block";
    return;
  }

  // Validate passwords match
  if (password !== confirmPassword) {
    matchError.style.display = "block";
    return;
  }

  try {
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    submitBtn.textContent = "Resetting...";

    await resetPassword({ token, password });

    // Success - auto-login and redirect
    form.style.display = "none";
    successMessage.style.display = "block";

    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } catch (err) {
    errorMessage.textContent =
      err.message || "Reset failed. The token may have expired.";
    errorMessage.style.display = "block";
  } finally {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
    submitBtn.textContent = "Reset Password";
  }
});
