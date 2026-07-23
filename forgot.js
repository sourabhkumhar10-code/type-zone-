const form = document.getElementById("forgotForm");
const submitBtn = document.getElementById("submitBtn");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const demoInfo = document.getElementById("demoInfo");
const resetLinkDiv = document.getElementById("resetLink");
const infoBox = document.getElementById("infoBox");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  // Reset UI
  errorMessage.style.display = "none";
  errorMessage.textContent = "";
  successMessage.style.display = "none";

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorMessage.textContent = "Please enter a valid email address";
    errorMessage.style.display = "block";
    return;
  }

  try {
    // Show loading state
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    const data = await requestPasswordReset(email);

    // Hide form and show success
    form.style.display = "none";
    infoBox.style.display = "none";
    successMessage.style.display = "block";

    // If in demo mode, show the reset link
    if (data && data.demoMode && data.resetUrl) {
      demoInfo.style.display = "block";
      resetLinkDiv.textContent = data.resetUrl;

      // Make it clickable
      resetLinkDiv.innerHTML = `<a href="${data.resetUrl}" target="_blank" style="color: #22c55e; text-decoration: none;">${data.resetUrl}</a>`;
    }
  } catch (err) {
    errorMessage.textContent =
      err.message || "Unable to send reset link. Please try again.";
    errorMessage.style.display = "block";
  } finally {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Reset Link";
  }
});
