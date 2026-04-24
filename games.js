const gameCards = document.querySelectorAll(".game-card[data-href]");
const gameButtons = document.querySelectorAll(".game-card .level-btn[data-href]");

gameCards.forEach((card) => {
  card.addEventListener("click", () => {
    const href = card.getAttribute("data-href");
    if (href) {
      window.location.href = href;
    }
  });
});

gameButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const href = button.getAttribute("data-href");
    if (href) {
      window.location.href = href;
    }
  });
});
