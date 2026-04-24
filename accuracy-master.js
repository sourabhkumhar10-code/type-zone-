console.log("Loading Accuracy Master.js  game...");

let accCanvas, accCtx;
let accState;
let accAnimationId;

const ACC_LEVELS = {
  // Slower, more relaxed timings for all levels
  easy:   { spawnInterval: 3500, fallSpeed: 0.4, penalty: 0.08 },
  medium: { spawnInterval: 2800, fallSpeed: 0.6, penalty: 0.10 },
  hard:   { spawnInterval: 2000, fallSpeed: 0.8, penalty: 0.14 },
};

const ACC_LETTERS = "asdfjkl;ghqwertyuiopzxcvbnm";

const accBest = {
  accuracy: 0,
  score: 0,
  combo: 0,
};

function accInit() {
  console.log("Initializing Accuracy Master...");
  
  accCanvas = document.getElementById("accuracyCanvas");
  console.log("Canvas found:", accCanvas);
  
  if (!accCanvas) {
    console.error("Canvas not found!");
    return;
  }
  
  accCtx = accCanvas.getContext("2d");
  resizeAccCanvas();
  window.addEventListener("resize", resizeAccCanvas);

  resetAccState();
  accAttachEvents();
  accRenderOverlayInitial();
  accRenderFrame();
  
  console.log("Accuracy Master initialized successfully!");
}

function resizeAccCanvas() {
  if (!accCanvas) return;
  const parent = accCanvas.parentElement;
  const width = parent.clientWidth;
  accCanvas.width = width;
  accCanvas.height = 460;
}

function resetAccState() {
  accState = {
    running: false,
    paused: false,
    lives: 3,
    score: 0,
    combo: 0,
    maxCombo: 0,
    hits: 0,
    errors: 0,
    startTime: null,
    lastSpawn: 0,
    difficulty: "easy",
    notes: [],
  };
}

function accAttachEvents() {
  console.log("=== Attaching Events ===");
  
  // Wait a bit to ensure DOM is fully ready
  setTimeout(() => {
    const startBtn = document.getElementById("accStartBtn");
    const pauseBtn = document.getElementById("accPauseBtn");
    const overlayBtn = document.getElementById("accOverlayBtn");
    const overlay = document.getElementById("accOverlay");

    console.log("Start button element:", startBtn);
    console.log("Overlay button element:", overlayBtn);
    console.log("Overlay element:", overlay);

    if (startBtn) {
      console.log("✓ Start button found, attaching click handler");
      startBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("▶ Start button CLICKED!");
       accStartRound();
      });
    } else {
      console.error("✗ Start button NOT FOUND!");
    }
    
    if (pauseBtn) {
      console.log("✓ Pause button found");
      pauseBtn.addEventListener("click", () => accTogglePause());
    }
    
    if (overlayBtn) {
      console.log("✓ Overlay button found, attaching click handler");
      overlayBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("▶ Overlay button CLICKED!");
        if (overlay) {
          console.log("Hiding overlay...");
          overlay.classList.add("hidden");
        }
       accStartRound();
      });
    } else {
      console.error("✗ Overlay button NOT FOUND!");
    }

    // Difficulty buttons
    document
      .querySelectorAll(".accuracy-difficulty button")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          if (accState.running) return;
          document
            .querySelectorAll(".accuracy-difficulty button")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          accState.difficulty = btn.dataset.level;
        });
      });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (!accState.running || accState.paused) return;

      if (e.key === "Escape") {
        accEndRound();
        return;
      }

      if (e.key.length === 1) {
        const key = e.key.toLowerCase();
        accHandleKey(key);
      }
    });
  }, 100);
}

function accStartRound() {
  console.log("Starting round...");
  
  if (!accCtx || !accCanvas) {
    console.error("Cannot start: ctx or canvas missing");
    return;
  }

  // Cancel any existing animation frame first
  if (accAnimationId) {
    cancelAnimationFrame(accAnimationId);
    accAnimationId = null;
  }

  resetAccState();
  accState.running = true;
  accState.paused = false;
  accState.startTime = performance.now();
  accState.lastSpawn = performance.now();

  const overlay = document.getElementById("accOverlay");
  if (overlay) {
    overlay.classList.add("hidden");
    console.log("Overlay hidden");
  }

  const startBtn = document.getElementById("accStartBtn");
  const pauseBtn = document.getElementById("accPauseBtn");
  
  if (startBtn) {
    startBtn.style.display = "none";
    console.log("Start button hidden");
  }
  if (pauseBtn) {
    pauseBtn.style.display= "inline-block";
    pauseBtn.textContent = "Pause";
    console.log("Pause button shown");
  }

  // Force a fresh render
  accRenderFrame();
  accUpdateHUD();
  
  // Start the game loop
  accAnimationId = requestAnimationFrame(accGameLoop);
  console.log("Game loop started, animation ID:", accAnimationId);
}

function accTogglePause() {
  if (!accState.running) return;
  accState.paused = !accState.paused;
  const pauseBtn = document.getElementById("accPauseBtn");
  if (pauseBtn) pauseBtn.textContent = accState.paused ? "Resume" : "Pause";
}

function accGameLoop(timestamp) {
  if (!accState.running) return;

  if (!accState.paused) {
    const cfg = ACC_LEVELS[accState.difficulty] || ACC_LEVELS.easy;
    if (!accState.lastSpawn) accState.lastSpawn = timestamp;
    const sinceLast = timestamp - accState.lastSpawn;
    if (sinceLast >= cfg.spawnInterval) {
      accSpawnNote();
      accState.lastSpawn = timestamp;
    }

    accUpdateNotes(cfg.fallSpeed);
    accCheckMisses();
    accRenderFrame();
    accUpdateHUD();
  }

  accAnimationId = requestAnimationFrame(accGameLoop);
}

function accSpawnNote() {
  const letter=
    ACC_LETTERS[Math.floor(Math.random() * ACC_LETTERS.length)];
  const margin = 60;
  const x =
    margin +
    Math.random() * (accCanvas.width - margin * 2);
  const radius = 24;

  accState.notes.push({
    letter,
    x,
    y: 40,
    radius,
    hit: false,
  });
}

function accUpdateNotes(speed) {
  accState.notes.forEach((note) => {
    note.y += speed * 2; // Reduced multiplier for slower movement
  });
}

function accCheckMisses() {
  const floorY = accCanvas.height - 80;
  const remaining = [];

  accState.notes.forEach((note) => {
    if (!note.hit && note.y - note.radius > floorY) {
      // Missed note
      accState.errors++;
      accState.combo = 0;
      accState.lives -= 1;
      if (accState.lives <= 0) {
        accGameOver();
      }
    } else {
      if (!note.hit) remaining.push(note);
    }
  });

  accState.notes = remaining;
}

function accHandleKey(key) {
  if (!accState.notes.length) return;

  let target = null;
  let targetIndex = -1;
  let minDist = Infinity;

  const floorY = accCanvas.height - 80;

  accState.notes.forEach((note, index) => {
    if (note.letter === key && !note.hit) {
      const distFromFloor = Math.abs(floorY - note.y);
      if (distFromFloor < minDist) {
        minDist = distFromFloor;
        target = note;
        targetIndex = index;
      }
    }
  });

  if (!target) {
    // Wrong or mistimed key
    accState.errors++;
    accState.combo = 0;
    return;
  }

  // Hit
  target.hit = true;
  accState.hits++;
  accState.combo++;
  if (accState.combo > accState.maxCombo) {
    accState.maxCombo = accState.combo;
  }

  const distFactor = Math.max(
    0,
    1-
      Math.min(
        1,
        Math.abs(floorY - target.y) / 160
      )
  );
  const baseScore = 25;
  const bonus = Math.round(baseScore * distFactor) + accState.combo * 2;
  accState.score += baseScore + bonus;

  if (minDist < 25) {
    // perfect timing
    const el= document.getElementById("accPerfects");
    if (el) {
      const val = parseInt(el.textContent || "0", 10) || 0;
      el.textContent = String(val + 1);
    }
  }

  accState.notes.splice(targetIndex, 1);
}

function accCurrentAccuracy() {
  const total = accState.hits + accState.errors;
  if (!total) return 100;
 return Math.max(
    0,
    Math.round((accState.hits / total) * 100)
  );
}

function accGameOver() {
  accState.running = false;
  accUpdateHUD();
  accEndRound(true);
}

function accEndRound(isGameOver = false) {
  cancelAnimationFrame(accAnimationId);
  const overlay = document.getElementById("accOverlay");
  const title = document.getElementById("accOverlayTitle");
  const subtitle = document.getElementById("accOverlaySubtitle");

  const accuracy = accCurrentAccuracy();

  if (accuracy > accBest.accuracy) accBest.accuracy = accuracy;
  if (accState.score > accBest.score) accBest.score = accState.score;
  if (accState.maxCombo > accBest.combo) accBest.combo = accState.maxCombo;

  const bestAcc = document.getElementById("accBestAccuracy");
  const bestScore = document.getElementById("accBestScore");
  const bestCombo = document.getElementById("accBestCombo");

  if (bestAcc) bestAcc.textContent = accBest.accuracy ? accBest.accuracy + "%" : "—";
  if (bestScore) bestScore.textContent = accBest.score || "—";
  if (bestCombo) bestCombo.textContent = accBest.combo ? accBest.combo + "x" : "—";

  if (title) title.textContent = isGameOver ? "Round Complete" : "Accuracy Master";
  if (subtitle) {
    if (accState.hits + accState.errors === 0) {
      subtitle.textContent = "No notes hit yet. Try a focused warm-up round.";
    } else {
      subtitle.textContent =
        "Final accuracy " +
        accuracy +
        "%. Press Start to chase a cleaner run.";
    }
  }

  if (overlay) overlay.classList.remove("hidden");

  const startBtn = document.getElementById("accStartBtn");
  const pauseBtn = document.getElementById("accPauseBtn");
  if (startBtn) startBtn.style.display= "inline-block";
  if (pauseBtn) pauseBtn.style.display= "none";
}

function accUpdateHUD() {
  const accEl = document.getElementById("accAccuracy");
  const comboEl = document.getElementById("accCombo");
  const scoreEl = document.getElementById("accScore");
  const timeEl = document.getElementById("accTime");
  const livesEl = document.getElementById("accLives");

  if (accEl) accEl.textContent = accCurrentAccuracy() + "%";
  if (comboEl) comboEl.textContent = accState.combo + "x";
  if (scoreEl) scoreEl.textContent = accState.score;
  if (livesEl) livesEl.textContent = "❤️".repeat(Math.max(0, accState.lives));

  if (timeEl && accState.startTime) {
    const seconds = Math.floor(
      (performance.now() - accState.startTime) / 1000
    );
    timeEl.textContent = seconds + "s";
  }
}

function accRenderFrame() {
  if (!accCtx || !accCanvas) return;

  const ctx = accCtx;
  const w = accCanvas.width;
  const h = accCanvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#020617");
  grad.addColorStop(0.4, "#020617");
  grad.addColorStop(1, "#111827");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Horizontal guide lines
  ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
  ctx.lineWidth = 1;
  const lanes = 5;
  for (let i = 1; i <= lanes; i++) {
    const y = (h / (lanes + 1)) * i;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(w - 40, y);
    ctx.stroke();
  }

  // Target "red" zone
  const zoneHeight = 40;
  const zoneY = h -80 - zoneHeight;
  const zoneGrad = ctx.createLinearGradient(0, zoneY, 0, zoneY + zoneHeight);
  zoneGrad.addColorStop(0, "rgba(248, 113, 113, 0.12)");
  zoneGrad.addColorStop(1, "rgba(248, 113, 113, 0.35)");
  ctx.fillStyle = zoneGrad;
  ctx.fillRect(40, zoneY, w - 80, zoneHeight);

  ctx.strokeStyle = "rgba(248, 113, 113, 0.7)";
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(40, zoneY + zoneHeight);
  ctx.lineTo(w - 40, zoneY + zoneHeight);
  ctx.stroke();
  ctx.setLineDash([]);

  // Notes
  accState.notes.forEach((note) => {
    const baseColor = "rgba(34, 197, 94, 1)";
    const glowColor = "rgba(45, 212, 191, 0.9)";

    // Glow
    ctx.beginPath();
    ctx.fillStyle = "rgba(34, 197, 94, 0.18)";
    ctx.arc(note.x, note.y, note.radius + 16, 0, Math.PI * 2);
    ctx.fill();

    // Main circle
    const radial = ctx.createRadialGradient(
      note.x - 5,
      note.y - 8,
      6,
      note.x,
      note.y,
      note.radius +4
    );
    radial.addColorStop(0, glowColor);
    radial.addColorStop(1, baseColor);
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(note.x, note.y, note.radius, 0, Math.PI * 2);
    ctx.fill();

    // Letter
    ctx.fillStyle = "#022c22";
    ctx.font = "bold 26px Quicksand, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(note.letter.toUpperCase(), note.x, note.y + 1);
  });
}

function accRenderOverlayInitial() {
  const overlay = document.getElementById("accOverlay");
  if (overlay) overlay.classList.remove("hidden");
  accUpdateHUD();
  accRenderFrame();
}

// Initialize when page loads
console.log("DOM ready state:", document.readyState);
if (document.readyState === "loading") {
  console.log("Waiting for DOMContentLoaded...");
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded fired");
    accInit();
  });
} else {
  console.log("DOM already loaded, initializing immediately");
  accInit();
}
