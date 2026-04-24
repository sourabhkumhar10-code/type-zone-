const backButton = document.querySelector(".btn-secondary[data-href]");
if (backButton) {
  backButton.addEventListener("click", () => {
    const href = backButton.getAttribute("data-href");
    if (href) {
      window.location.href = href;
    }
  });
}

const startButton = document.getElementById("startGameBtn");
if (startButton) {
  startButton.addEventListener("click", () => {
    if (typeof startGame === "function") {
      startGame();
    }
  });
}

const pauseButton = document.getElementById("pauseGameBtn");
if (pauseButton) {
  pauseButton.addEventListener("click", () => {
    if (typeof togglePause === "function") {
      togglePause();
    }
  });
}

const restartButton = document.getElementById("restartGameBtn");
if (restartButton) {
  restartButton.addEventListener("click", () => {
    if (typeof restartGame === "function") {
      restartGame();
    }
  });
}
