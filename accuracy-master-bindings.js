const accBackButton = document.querySelector(".accuracy-btn[data-href]");
if (accBackButton) {
  accBackButton.addEventListener("click", () => {
    const href = accBackButton.getAttribute("data-href");
    if (href) {
      window.location.href = href;
    }
  });
}

const accStartBtn = document.getElementById("accStartBtn");
if (accStartBtn) {
  accStartBtn.addEventListener("click", () => {
    if (typeof accStartRound === "function") {
      accStartRound();
    } else {
      console.error("accStartRound not defined yet");
    }
  });
}

const accOverlayBtn = document.getElementById("accOverlayBtn");
if (accOverlayBtn) {
  accOverlayBtn.addEventListener("click", () => {
    if (typeof accStartRound === "function") {
      accStartRound();
    } else {
      console.error("accStartRound not defined yet");
    }
  });
}
