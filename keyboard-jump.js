// Keyboard Jump Game - Complete Working Version
console.log('Loading Keyboard Jump game...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}

let canvas, ctx, gameState;

function initializeGame() {
  console.log('Initializing game...');
  
  // Get canvas
  canvas = document.getElementById('jumpGameCanvas');
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }
  
  ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context!');
    return;
  }
  
  // Set canvas size
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Initialize game state
  resetGameState();
  
  // Setup difficulty selector
  setupDifficultyButtons();
  
  // Initial draw
  drawInitialScreen();
  
  console.log('Game initialized successfully!');
}

function resizeCanvas() {
  if (!canvas) return;
  const wrapper = canvas.parentElement;
  const width = Math.min(wrapper.offsetWidth - 40, 1200);
  canvas.width = width;
  canvas.height = Math.min(500, width * 0.5);
}

function resetGameState() {
  gameState = {
    running: false,
    paused: false,
    score: 0,
    level: 1,
    lives: 3,
    wordsTyped: 0,
    difficulty: 'easy',
    currentWord: '',
    typedChars: '',
    startTime: null,
    totalChars: 0,
    errorCount: 0,
    platforms: [],
    player: null,
    currentPlatformIndex: 0,
    clouds: [],
    particles: [],
    highScore: loadHighScore()
  };
}

function loadHighScore() {
  try {
    return parseInt(localStorage.getItem('keyboardJumpHighScore')) || 0;
  } catch(e) {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    localStorage.setItem('keyboardJumpHighScore', score.toString());
  } catch(e) {
    console.warn('Could not save high score');
  }
}

// Word Lists by Difficulty
const wordLists = {
  easy: ['cat', 'dog', 'sun', 'run', 'jump', 'ball', 'book', 'tree', 'fish', 'bird', 
         'star', 'moon', 'rain', 'snow', 'wind', 'fire', 'game', 'play', 'food', 'door',
         'hand', 'foot', 'head', 'road', 'blue', 'red'],
  medium: ['house', 'tiger', 'water', 'light', 'music', 'power', 'table', 'chair', 'plant', 'clock',
           'phone', 'paper', 'pencil', 'window', 'garden', 'river', 'mountain', 'ocean', 'forest', 'desert',
           'silver', 'golden', 'purple', 'orange'],
  hard: ['keyboard', 'computer', 'elephant', 'butterfly', 'adventure', 'challenge', 'beautiful', 'important',
         'different', 'wonderful', 'basketball', 'gymnastics', 'technology', 'incredible', 'magnificent',
         'extraordinary', 'spectacular', 'professional']
};

function drawInitialScreen() {
  if (!ctx || !canvas) return;
  
  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Welcome text
  ctx.fillStyle = '#4a4a4a';
  ctx.font = 'bold 32px Quicksand, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Click START GAME to begin!', canvas.width / 2, canvas.height / 2);
}

function setupDifficultyButtons() {
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (gameState && gameState.running) return;
      document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (gameState) {
        gameState.difficulty = btn.dataset.level;
      }
    });
  });
}

// Player Object
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 50;
    this.velocityY = 0;
    this.velocityX = 0;
    this.jumping = false;
    this.moving = false;
    this.targetX = x;
    this.color = '#5b6dcd';
  }

  draw() {
    // Draw simple character
    ctx.fillStyle = this.color;
    
    // Body
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Head
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y - 10, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2 - 5, this.y - 12, 4, 0, Math.PI * 2);
    ctx.arc(this.x + this.width / 2 + 5, this.y - 12, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2 - 5, this.y - 11, 2, 0, Math.PI * 2);
    ctx.arc(this.x + this.width / 2 + 5, this.y - 11, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  jump() {
    if (!this.jumping) {
      this.velocityY = -15;
      this.jumping = true;
      createJumpParticles(this.x + this.width / 2, this.y + this.height);
    }
  }

  moveToNextPlatform(platformX) {
    this.targetX = platformX;
    this.moving = true;
  }

  update() {
    // Horizontal movement
    if (this.moving) {
      const dx = this.targetX - this.x;
      if (Math.abs(dx) > 2) {
        this.velocityX = dx * 0.1; // Smooth movement
        this.x += this.velocityX;
      } else {
        this.x = this.targetX;
        this.velocityX = 0;
        this.moving = false;
      }
    }

    // Vertical movement (gravity)
    this.velocityY += 0.8; // Gravity
    this.y += this.velocityY;

    // Check collision with platforms
    gameState.platforms.forEach(platform => {
      if (this.velocityY > 0 && 
          this.x < platform.x + platform.width &&
          this.x + this.width > platform.x &&
          this.y + this.height > platform.y &&
          this.y + this.height < platform.y + platform.height) {
        this.y = platform.y - this.height;
        this.velocityY = 0;
        this.jumping = false;
      }
    });

    // Fall off screen - lose life
    if (this.y > canvas.height + 100) {
      loseLife();
    }
  }
}

// Platform Object
class Platform {
  constructor(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 20;
    this.color = '#22c55e';
  }

  draw() {
    // Platform shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(this.x + 5, this.y + 5, this.width, this.height);
    
    // Platform
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Platform highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(this.x, this.y, this.width, this.height / 3);
  }
}

// Cloud Object
class Cloud {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 0.2 + Math.random() * 0.3;
  }

  draw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.arc(this.x + this.size * 0.7, this.y, this.size * 0.8, 0, Math.PI * 2);
    ctx.arc(this.x + this.size * 1.4, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.x += this.speed;
    if (this.x > canvas.width + this.size * 2) {
      this.x = -this.size * 2;
    }
  }
}

// Particle Object
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 1;
    this.color = color;
    this.size = 4 + Math.random() * 4;
  }

  draw() {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // Gravity
    this.life -= 0.02;
  }
}

// Initialize Game
function initGame() {
  gameState.platforms = [];
  gameState.clouds = [];
  gameState.particles = [];
  
  // Make sure word prompt is hidden initially
  const wordPrompt = document.getElementById('wordPrompt');
  if (wordPrompt) {
    wordPrompt.style.display = 'none';
  }
  
  // Create clouds
  for (let i = 0; i < 5; i++) {
    gameState.clouds.push(new Cloud(
      Math.random() * canvas.width,
      Math.random() * canvas.height * 0.4,
      30 + Math.random() * 30
    ));
  }

  // Create initial platforms
  const platformCount = 6;
  const spacing = canvas.width / (platformCount + 1);
  
  for (let i = 0; i < platformCount; i++) {
    const x = spacing * (i + 1) - 60;
    const y = canvas.height - 80 - Math.random() * 150;
    const width = 120;
    gameState.platforms.push(new Platform(x, y, width));
  }

  // Create player on first platform
  const firstPlatform = gameState.platforms[0];
  gameState.player = new Player(
    firstPlatform.x + firstPlatform.width / 2 - 20,
    firstPlatform.y - 60
  );

  gameState.currentPlatformIndex = 0;
}

// Start Game
function startGame() {
  console.log('Start Game button clicked!');
  
  if (!canvas || !ctx) {
    alert('Game not ready. Please refresh the page.');
    return;
  }
  
  if (gameState.running) {
    console.log('Game already running');
    return;
  }
  
  console.log('Starting new game...');
  
  // Reset game state
  gameState.running = true;
  gameState.paused = false;
  gameState.score = 0;
  gameState.level = 1;
  gameState.lives = 3;
  gameState.wordsTyped = 0;
  gameState.typedChars = '';
  gameState.startTime = Date.now();
  gameState.totalChars = 0;
  gameState.errorCount = 0;
  gameState.currentPlatformIndex = 0;

  // Update UI
  const startBtn = document.getElementById('startGameBtn');
  const pauseBtn = document.getElementById('pauseGameBtn');
  if (startBtn) startBtn.style.display = 'none';
  if (pauseBtn) pauseBtn.style.display = 'inline-block';

  // Initialize game objects
  initGameObjects();
  
  // Get first word
  getNewWord();
  
  // Start game loop
  gameLoop();
  
  console.log('Game started successfully!');
}

function initGameObjects() {
  gameState.platforms = [];
  gameState.clouds = [];
  gameState.particles = [];
  
  // Create clouds
  for (let i = 0; i < 5; i++) {
    gameState.clouds.push(new Cloud(
      Math.random() * canvas.width,
      Math.random() * canvas.height * 0.3,
      20 + Math.random() * 30
    ));
  }

  // Create platforms
  const platformCount = 6;
  const spacing = canvas.width / (platformCount + 1);
  
  for (let i = 0; i < platformCount; i++) {
    const x = spacing * (i + 1) - 60;
    const y = canvas.height - 60 - (Math.random() * 100 + 50);
    gameState.platforms.push(new Platform(x, y, 120));
  }

  // Create player on first platform
  if (gameState.platforms.length > 0) {
    const firstPlatform = gameState.platforms[0];
    gameState.player = new Player(
      firstPlatform.x + firstPlatform.width / 2 - 20,
      firstPlatform.y - 60
    );
  }
}

// Game Loop
function gameLoop() {
  if (!gameState.running || !canvas || !ctx) return;
  
  if (!gameState.paused) {
    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw clouds
      gameState.clouds.forEach(cloud => {
        cloud.update();
        cloud.draw();
      });

      // Draw platforms
      gameState.platforms.forEach(platform => platform.draw());

      // Update and draw particles
      gameState.particles = gameState.particles.filter(p => {
        p.update();
        p.draw();
        return p.life > 0;
      });

      // Update and draw player
      if (gameState.player) {
        gameState.player.update();
        gameState.player.draw();
      }

      updateHUD();
    } catch(e) {
      console.error('Error in game loop:', e);
    }
  }

  requestAnimationFrame(gameLoop);
}

// Get New Word
function getNewWord() {
  const words = wordLists[gameState.difficulty];
  gameState.currentWord = words[Math.floor(Math.random() * words.length)];
  gameState.typedChars = '';
  
  updateWordDisplay();
  const wordPrompt = document.getElementById('wordPrompt');
  wordPrompt.style.display = 'block';
  wordPrompt.style.visibility = 'visible';
  wordPrompt.style.opacity = '1';
}

// Update Word Display
function updateWordDisplay() {
  const typed = gameState.typedChars;
  const current = gameState.currentWord[typed.length] || '';
  const remaining = gameState.currentWord.slice(typed.length + 1);

  const typedElement = document.getElementById('typedPart');
  const currentElement = document.getElementById('currentChar');
  const remainingElement = document.getElementById('remainingPart');

  if (typedElement) typedElement.textContent = typed;
  if (currentElement) currentElement.textContent = current;
  if (remainingElement) remainingElement.textContent = remaining;

  // Debug log
  console.log('Word:', gameState.currentWord, 'Typed:', typed, 'Current:', current, 'Remaining:', remaining);
}

// Handle Typing
document.addEventListener('keydown', (e) => {
  if (!gameState.running || gameState.paused) return;
  
  const key = e.key.toLowerCase();
  const expectedChar = gameState.currentWord[gameState.typedChars.length];

  if (key === expectedChar) {
    gameState.typedChars += key;
    gameState.totalChars++;
    updateWordDisplay();

    // Word completed
    if (gameState.typedChars === gameState.currentWord) {
      wordCompleted();
    }
  } else if (key.length === 1 && key.match(/[a-z]/)) {
    // Wrong key - count as error
    gameState.errorCount++;
    createErrorParticles(canvas.width / 2, canvas.height / 2);
    loseLife();
    if (gameState.running) {
      gameState.typedChars = '';
      getNewWord();
    }
  }
});

// Word Completed
function wordCompleted() {
  gameState.score += gameState.currentWord.length * 10 * gameState.level;
  gameState.wordsTyped++;
  
  // Player jumps and moves to next platform
  if (gameState.player) {
    gameState.player.jump();
    
    // Move to next platform
    gameState.currentPlatformIndex++;
    if (gameState.currentPlatformIndex < gameState.platforms.length) {
      const nextPlatform = gameState.platforms[gameState.currentPlatformIndex];
      const targetX = nextPlatform.x + nextPlatform.width / 2 - gameState.player.width / 2;
      gameState.player.moveToNextPlatform(targetX);
    } else {
      // Reached end of platforms - level up
      levelUp();
    }
  }

  createSuccessParticles(canvas.width / 2, canvas.height / 2);
  
  setTimeout(() => {
    getNewWord();
  }, 300);
}

// Level Up
function levelUp() {
  gameState.level++;
  gameState.currentPlatformIndex = 0;
  
  // Increase difficulty
  if (gameState.level % 3 === 0 && gameState.difficulty === 'easy') {
    gameState.difficulty = 'medium';
  } else if (gameState.level % 5 === 0 && gameState.difficulty === 'medium') {
    gameState.difficulty = 'hard';
  }

  initGame();
  
  // Bonus points
  gameState.score += 500 * gameState.level;
}

// Lose Life
function loseLife() {
  gameState.lives--;
  
  if (gameState.lives <= 0) {
    gameOver();
  } else {
    // Reset player position
    const firstPlatform = gameState.platforms[0];
    gameState.player = new Player(
      firstPlatform.x + firstPlatform.width / 2 - 20,
      firstPlatform.y - 60
    );
    gameState.currentPlatformIndex = 0;
  }
}

// Game Over
function gameOver() {
  console.log('Game Over!');
  gameState.running = false;
  
  const elapsedMinutes = Math.max((Date.now() - gameState.startTime) / 60000, 0.1);
  const avgWPM = Math.round((gameState.totalChars / 5) / elapsedMinutes);
  const accuracy = gameState.totalChars > 0 
    ? Math.round((gameState.totalChars / (gameState.totalChars + gameState.errorCount)) * 100) 
    : 100;

  // Save high score
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    saveHighScore(gameState.highScore);
  }

  // Update UI
  const elements = {
    finalScore: document.getElementById('finalScore'),
    highScore: document.getElementById('highScore'),
    finalLevel: document.getElementById('finalLevel'),
    wordsTyped: document.getElementById('wordsTyped'),
    avgWPM: document.getElementById('avgWPM'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    wordPrompt: document.getElementById('wordPrompt'),
    startBtn: document.getElementById('startGameBtn'),
    pauseBtn: document.getElementById('pauseGameBtn')
  };

  if (elements.finalScore) elements.finalScore.textContent = gameState.score;
  if (elements.highScore) elements.highScore.textContent = gameState.highScore;
  if (elements.finalLevel) elements.finalLevel.textContent = gameState.level;
  if (elements.wordsTyped) elements.wordsTyped.textContent = gameState.wordsTyped;
  if (elements.avgWPM) elements.avgWPM.textContent = avgWPM;
  if (elements.finalAccuracy) elements.finalAccuracy.textContent = accuracy + '%';
  
  if (elements.gameOverScreen) elements.gameOverScreen.classList.add('show');
  if (elements.wordPrompt) elements.wordPrompt.style.display = 'none';
  if (elements.startBtn) elements.startBtn.style.display = 'inline-block';
  if (elements.pauseBtn) elements.pauseBtn.style.display = 'none';
}

function restartGame() {
  const gameOverScreen = document.getElementById('gameOverScreen');
  if (gameOverScreen) {
    gameOverScreen.classList.remove('show');
  }
  startGame();
}

function togglePause() {
  if (!gameState.running) return;
  gameState.paused = !gameState.paused;
  const pauseBtn = document.getElementById('pauseGameBtn');
  if (pauseBtn) {
    pauseBtn.textContent = gameState.paused ? 'Resume' : 'Pause';
  }
}

// Update HUD
function updateHUD() {
  const elements = {
    score: document.getElementById('gameScore'),
    level: document.getElementById('gameLevel'),
    lives: document.getElementById('gameLives'),
    wpm: document.getElementById('gameWPM')
  };

  if (elements.score) elements.score.textContent = gameState.score;
  if (elements.level) elements.level.textContent = gameState.level;
  if (elements.lives) elements.lives.textContent = '❤️'.repeat(Math.max(0, gameState.lives));
  
  if (elements.wpm && gameState.startTime) {
    const elapsedMinutes = Math.max((Date.now() - gameState.startTime) / 60000, 0.1);
    const wpm = Math.round((gameState.totalChars / 5) / elapsedMinutes);
    elements.wpm.textContent = wpm;
  }
}

// Particle Effects
function createJumpParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    gameState.particles.push(new Particle(x, y, '#5b6dcd'));
  }
}

function createSuccessParticles(x, y) {
  for (let i = 0; i < 20; i++) {
    gameState.particles.push(new Particle(x, y, '#22c55e'));
  }
}

function createErrorParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    gameState.particles.push(new Particle(x, y, '#ef4444'));
  }
}

// Game is initialized via DOMContentLoaded event at the top of the file
console.log('Keyboard Jump game loaded and ready!');
