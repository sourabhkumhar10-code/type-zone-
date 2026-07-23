// Navigation and page management for Type Zone

const user = getCurrentUser();
const authControls = document.getElementById("authControls");
const guestControls = document.getElementById("guestControls");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
const btnLogout = document.getElementById("btnLogout");

function updateNavForUser(user) {
  if (user) {
    guestControls.style.display = "none";
    authControls.style.display = "flex";
    document.getElementById("greetingName").textContent = user.username;
    const initial = user.username.charAt(0).toUpperCase();
    document.getElementById("userInitial").textContent = initial;
  } else {
    guestControls.style.display = "flex";
    authControls.style.display = "none";
  }
}

function getCurrentPageUrl() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function handleProtectedAction({ action, payload }) {
  if (getCurrentUser()) {
    return true;
  }
  redirectToLoginWithIntent({
    returnUrl: getCurrentPageUrl(),
    action,
    payload,
  });
  return false;
}

function executeSavedIntent() {
  const intent = processSavedIntent();
  if (!intent || !getCurrentUser()) {
    return;
  }

  if (intent.action === "startPractice") {
    const { mode, level } = intent.payload || {};
    if (mode && level) {
      document.getElementById("practiceMode").value = mode;
      document.getElementById("practiceLevel").value = level;
      document.getElementById("mode").value = mode;
      document.getElementById("level").value = level;
      showSection("practice");
      updatePracticeTitle();
      setTimeout(() => {
        document.getElementById("btnStart").click();
      }, 100);
    }
  }
}

updateNavForUser(user);
executeSavedIntent();

if (btnLogin) {
  btnLogin.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

if (btnRegister) {
  btnRegister.addEventListener("click", () => {
    window.location.href = "register.html";
  });
}

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    logoutUser();
    window.location.href = "login.html";
  });
}

// Get all sections
const sections = {
  lessons: document.getElementById("lessonsSection"),
  practice: document.getElementById("practiceSection"),
  games: document.getElementById("gamesSection"),
  progress: document.getElementById("progressSection"),
};

// Get all nav links
const navLinks = {
  lessons: document.getElementById("navLessons"),
  practice: document.getElementById("navPractice"),
  games: document.getElementById("navGames"),
  progress: document.getElementById("navProgress"),
};

// Function to show a specific section
function showSection(sectionName) {
  // Hide all sections
  Object.values(sections).forEach((section) => {
    section.style.display = "none";
  });

  // Remove active class from all nav links
  Object.values(navLinks).forEach((link) => {
    link.classList.remove("active");
  });

  // Show selected section and activate nav link
  sections[sectionName].style.display = "block";
  navLinks[sectionName].classList.add("active");
}

// Navigation click handlers
navLinks.lessons.addEventListener("click", (e) => {
  e.preventDefault();
  showSection("lessons");
});

navLinks.practice.addEventListener("click", (e) => {
  e.preventDefault();
  showSection("practice");
});

navLinks.games.addEventListener("click", (e) => {
  e.preventDefault();
  showSection("games");
});

navLinks.progress.addEventListener("click", (e) => {
  e.preventDefault();
  showSection("progress");
});

// Lesson card click handlers
document.querySelectorAll(".lesson-card .btn-start-lesson").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".lesson-card");
    const level = card.dataset.level;
    const mode = card.dataset.mode;

    if (!handleProtectedAction({ action: "startPractice", payload: { mode, level } })) {
      return;
    }

    // Set mode and level
    document.getElementById("mode").value = mode;
    document.getElementById("level").value = level;
    document.getElementById("practiceMode").value = mode;
    document.getElementById("practiceLevel").value = level;

    // Switch to practice section
    showSection("practice");

    // Update practice title
    const modeNames = { typing: "Text Typing", coding: "Code Practice", quiz: "GK Question" };
    const levelNames = { easy: "Beginner", medium: "Intermediate", hard: "Advanced" };
    document.getElementById("practiceTitle").textContent = `${modeNames[mode]} - ${levelNames[level]}`;

    // Auto-start
    setTimeout(() => {
      document.getElementById("btnStart").click();
    }, 300);
  });
});

// Game card level button handlers
const gameLevelButtons = document.querySelectorAll(".game-card .level-btn[data-level]");
gameLevelButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".game-card");
    const mode = card.dataset.game;
    const level = e.target.dataset.level;

    if (!handleProtectedAction({ action: "startPractice", payload: { mode, level } })) {
      return;
    }

    // Set mode and level
    document.getElementById("mode").value = mode;
    document.getElementById("level").value = level;
    document.getElementById("practiceMode").value = mode;
    document.getElementById("practiceLevel").value = level;

    // Switch to practice section
    showSection("practice");

    // Update practice title
    const modeNames = { typing: "Text Typing", coding: "Code Practice", quiz: "GK Question" };
    const levelNames = { easy: "Beginner", medium: "Intermediate", hard: "Advanced" };
    document.getElementById("practiceTitle").textContent = `${modeNames[mode]} - ${levelNames[level]}`;

    // Auto-start
    setTimeout(() => {
      document.getElementById("btnStart").click();
    }, 300);
  });
});

// Practice mode/level selectors
document.getElementById("practiceMode").addEventListener("change", (e) => {
  document.getElementById("mode").value = e.target.value;
  updatePracticeTitle();
});

document.getElementById("practiceLevel").addEventListener("change", (e) => {
  document.getElementById("level").value = e.target.value;
  updatePracticeTitle();
});

function updatePracticeTitle() {
  const modeNames = { typing: "Text Typing", coding: "Code Practice", quiz: "GK Question" };
  const levelNames = { easy: "Beginner", medium: "Intermediate", hard: "Advanced" };
  const mode = document.getElementById("practiceMode").value;
  const level = document.getElementById("practiceLevel").value;
  document.getElementById("practiceTitle").textContent = `${modeNames[mode]} - ${levelNames[level]}`;
}

// Initialize - show lessons by default
showSection("lessons");
