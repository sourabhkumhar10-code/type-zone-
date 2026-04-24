/**
 * Word Challenge Game - JavaScript
 * A fun and educational word unscramble game
 */

// ============================================
// Game Configuration
// ============================================
const CONFIG = {
    INITIAL_TIME: 20,
    WORDS_PER_LEVEL: 10,
    POINTS_CORRECT: 10,
    POINTS_BONUS: 5,
    HINT_PENALTY: 5,
    TIME_BONUS_THRESHOLD: 10
};

// ============================================
// Word Database by Difficulty
// ============================================
const WORD_DATABASE = {
    easy: [
        'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BOOK', 'FISH', 'BIRD', 'CAKE',
        'MILK', 'WATER', 'FIRE', 'EARTH', 'WIND', 'RAIN', 'SNOW', 'FLOWER', 'GRASS', 'LEAF'
    ],
    medium: [
        'APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'MELON', 'CHERRY', 'PEACH', 'PLUM', 'KIWI', 'LEMON',
        'TIGER', 'LION', 'ZEBRA', 'GIRAFFE', 'ELEPHANT', 'MONKEY', 'RABBIT', 'SQUIRREL', 'BEAR', 'WOLF',
        'COMPUTER', 'KEYBOARD', 'MONITOR', 'MOUSE', 'PRINTER', 'CAMERA', 'PHONE', 'TABLET', 'LAPTOP', 'SCREEN'
    ],
    hard: [
        'ADVENTURE', 'BEAUTIFUL', 'CHALLENGE', 'DISCOVERY', 'EDUCATION', 'FREEDOM', 'HAPPINESS', 'IMAGINATION', 
        'JOURNEY', 'KNOWLEDGE', 'LIBERTY', 'MAGNIFICENT', 'NAVIGATION', 'OPPORTUNITY', 'PERFECTION', 'QUALITY',
        'RESPONSIBILITY', 'SATISFACTION', 'TRANQUILITY', 'UNDERSTANDING', 'VICTORY', 'WONDERFUL', 'EXCELLENCE',
        'PHOTOGRAPH', 'TECHNOLOGY', 'UNIVERSITY', 'VOLUNTEER', 'WEATHER', 'YESTERDAY', 'ZOOLOGICAL'
    ]
};

// ============================================
// Game State
// ============================================
let gameState = {
    currentLevel: 'easy',
    score: 0,
    streak: 0,
    bestStreak: 0,
    wordsSolved: 0,
    totalWords: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentTime: CONFIG.INITIAL_TIME,
    timerInterval: null,
    isPaused: false,
    isPlaying: false,
    currentWord: '',
    scrambledLetters: [],
    revealedIndices: []
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    pauseScreen: document.getElementById('pause-screen'),
    gameoverScreen: document.getElementById('gameover-screen'),
    highScore: document.getElementById('high-score'),
    score: document.getElementById('score'),
    streak: document.getElementById('streak'),
    level: document.getElementById('level'),
    wordsSolved: document.getElementById('words-solved'),
    timerFill: document.getElementById('timer-fill'),
    timerText: document.getElementById('timer-text'),
    progressFill: document.getElementById('progress-fill'),
    scrambledWord: document.getElementById('scrambled-word'),
    wordLength: document.getElementById('word-length'),
    answerInput: document.getElementById('answer-input'),
    submitBtn: document.getElementById('submit-btn'),
    hintBtn: document.getElementById('hint-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    feedback: document.getElementById('feedback'),
    resumeBtn: document.getElementById('resume-btn'),
    restartBtnPause: document.getElementById('restart-btn-pause'),
    quitBtn: document.getElementById('quit-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    menuBtn: document.getElementById('menu-btn'),
    finalScore: document.getElementById('final-score'),
    wordsSolvedFinal: document.getElementById('words-solved-final'),
    bestStreak: document.getElementById('best-streak'),
    accuracy: document.getElementById('accuracy'),
    gameoverTitle: document.getElementById('gameover-title'),
    successAnimation: document.getElementById('success-animation')
};

// ============================================
// Utility Functions
// ============================================

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get random word from database based on difficulty
 */
function getRandomWord(difficulty) {
    const words = WORD_DATABASE[difficulty];
    return words[Math.floor(Math.random() * words.length)];
}

/**
 * Scramble word ensuring it's different from original
 */
function scrambleWord(word) {
    let scrambled;
    do {
        scrambled = shuffleArray(word.split(''));
    } while (scrambled.join('') === word && word.length > 1);
    
    return scrambled;
}

/**
 * Save high score to localStorage
 */
function saveHighScore(score) {
    const currentHighScore = parseInt(localStorage.getItem('wordChallengeHighScore') || '0');
    if (score > currentHighScore) {
        localStorage.setItem('wordChallengeHighScore', score.toString());
    }
}

/**
 * Load high score from localStorage
 */
function loadHighScore() {
    return parseInt(localStorage.getItem('wordChallengeHighScore') || '0');
}

// ============================================
// UI Update Functions
// ============================================

/**
 * Display scrambled letters with animation
 */
function displayScrambledWord(letters) {
    elements.scrambledWord.innerHTML = '';
    
    letters.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.style.animationDelay = `${index * 0.05}s`;
        
        if (gameState.revealedIndices.includes(index)) {
            tile.classList.add('revealed');
        }
        
        elements.scrambledWord.appendChild(tile);
    });
}

/**
 * Update all stat displays
 */
function updateStats() {
    elements.score.textContent = gameState.score;
    elements.streak.textContent = gameState.streak;
    elements.level.textContent = gameState.currentLevel.charAt(0).toUpperCase() + gameState.currentLevel.slice(1);
    elements.wordsSolved.textContent = `${gameState.wordsSolved}/${CONFIG.WORDS_PER_LEVEL}`;
    elements.wordLength.textContent = gameState.currentWord.length;
    
    // Update progress bar
    const progressPercent = (gameState.wordsSolved / CONFIG.WORDS_PER_LEVEL) * 100;
    elements.progressFill.style.width = `${progressPercent}%`;
    
    // Update timer
    const timerPercent = (gameState.currentTime / CONFIG.INITIAL_TIME) * 100;
    elements.timerFill.style.width = `${timerPercent}%`;
    elements.timerText.textContent = gameState.currentTime;
    
    // Timer warning when below 5 seconds
    if (gameState.currentTime <= 5) {
        elements.timerFill.classList.add('warning');
    } else {
        elements.timerFill.classList.remove('warning');
    }
}

/**
 * Show feedback message
 */
function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${type}`;
    
    setTimeout(() => {
        elements.feedback.textContent = '';
        elements.feedback.className = 'feedback';
    }, 2000);
}

/**
 * Create confetti animation
 */
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#11998e', '#38ef7d'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
        
        elements.successAnimation.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

// ============================================
// Game Logic Functions
// ============================================

/**
 * Start a new game
 */
function startGame(difficulty) {
    gameState = {
        currentLevel: difficulty,
        score: 0,
        streak: 0,
        bestStreak: 0,
        wordsSolved: 0,
        totalWords: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        currentTime: CONFIG.INITIAL_TIME,
        timerInterval: null,
        isPaused: false,
        isPlaying: true,
        currentWord: '',
        scrambledLetters: [],
        revealedIndices: []
    };
    
    // Switch screens
    elements.startScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    // Load first word
    loadNewWord();
    
    // Start timer
    startTimer();
    
    // Focus input
    elements.answerInput.focus();
}

/**
 * Load a new word
 */
function loadNewWord() {
    gameState.currentWord = getRandomWord(gameState.currentLevel);
    gameState.scrambledLetters = scrambleWord(gameState.currentWord);
    gameState.revealedIndices = [];
    
    displayScrambledWord(gameState.scrambledLetters);
    updateStats();
    elements.answerInput.value = '';
    elements.answerInput.className = '';
}

/**
 * Start the countdown timer
 */
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused && gameState.isPlaying) {
            gameState.currentTime--;
            updateStats();
            
            if (gameState.currentTime <= 0) {
                timeUp();
            }
        }
    }, 1000);
}

/**
 * Handle time running out
 */
function timeUp() {
    clearInterval(gameState.timerInterval);
    showFeedback(`Time's up! The word was: ${gameState.currentWord}`, 'error');
    gameState.streak = 0;
    gameState.wrongAnswers++;
    updateStats();
    
    setTimeout(() => {
        if (gameState.wordsSolved < CONFIG.WORDS_PER_LEVEL) {
            loadNewWord();
            gameState.currentTime = CONFIG.INITIAL_TIME;
            startTimer();
        } else {
            endGame();
        }
    }, 2000);
}

/**
 * Check the player's answer
 */
function checkAnswer() {
    const playerAnswer = elements.answerInput.value.trim().toUpperCase();
    
    if (!playerAnswer) {
        showFeedback('Please enter an answer!', 'error');
        return;
    }
    
    gameState.totalWords++;
    
    if (playerAnswer === gameState.currentWord) {
        // Correct answer
        handleCorrectAnswer();
    } else {
        // Wrong answer
        handleWrongAnswer(playerAnswer);
    }
}

/**
 * Handle correct answer
 */
function handleCorrectAnswer() {
    gameState.correctAnswers++;
    gameState.wordsSolved++;
    
    // Calculate points
    let points = CONFIG.POINTS_CORRECT;
    
    // Streak bonus
    gameState.streak++;
    if (gameState.streak > 1) {
        points += Math.min(gameState.streak - 1, 5) * CONFIG.POINTS_BONUS;
    }
    
    // Time bonus
    if (gameState.currentTime >= CONFIG.TIME_BONUS_THRESHOLD) {
        points += CONFIG.POINTS_BONUS;
    }
    
    gameState.score += points;
    
    // Update best streak
    if (gameState.streak > gameState.bestStreak) {
        gameState.bestStreak = gameState.streak;
    }
    
    // Visual feedback
    elements.answerInput.classList.add('correct');
    showFeedback(`✓ Correct! +${points} points`, 'success');
    createConfetti();
    updateStats();
    
    // Next word or end game
    setTimeout(() => {
        if (gameState.wordsSolved < CONFIG.WORDS_PER_LEVEL) {
            loadNewWord();
            gameState.currentTime = CONFIG.INITIAL_TIME;
            startTimer();
        } else {
            endGame();
        }
    }, 1500);
}

/**
 * Handle wrong answer
 */
function handleWrongAnswer(answer) {
    gameState.wrongAnswers++;
    gameState.streak = 0;
    
    elements.answerInput.classList.add('wrong');
    showFeedback('✗ Try again!', 'error');
    updateStats();
    
    setTimeout(() => {
        elements.answerInput.classList.remove('wrong');
        elements.answerInput.value = '';
        elements.answerInput.focus();
    }, 500);
}

/**
 * Show hint (reveal one letter)
 */
function showHint() {
    if (gameState.revealedIndices.length >= gameState.scrambledLetters.length - 1) {
        showFeedback('All letters revealed!', 'error');
        return;
    }
    
    // Find an unrevealed position
    const unrevealedIndices = [];
    for (let i = 0; i < gameState.scrambledLetters.length; i++) {
        if (!gameState.revealedIndices.includes(i)) {
            unrevealedIndices.push(i);
        }
    }
    
    if (unrevealedIndices.length === 0) return;
    
    const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    gameState.revealedIndices.push(randomIndex);
    
    // Penalty
    gameState.score = Math.max(0, gameState.score - CONFIG.HINT_PENALTY);
    
    displayScrambledWord(gameState.scrambledLetters);
    showFeedback(`-5 points for hint`, 'error');
    updateStats();
}

/**
 * Pause the game
 */
function pauseGame() {
    gameState.isPaused = true;
    clearInterval(gameState.timerInterval);
    elements.pauseScreen.classList.add('active');
}

/**
 * Resume the game
 */
function resumeGame() {
    gameState.isPaused = false;
    elements.pauseScreen.classList.remove('active');
    startTimer();
    elements.answerInput.focus();
}

/**
 * End the game
 */
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerInterval);
    
    // Calculate accuracy
    const accuracy = gameState.totalWords > 0 
        ? Math.round((gameState.correctAnswers / gameState.totalWords) * 100) 
        : 0;
    
    // Update final stats
    elements.finalScore.textContent = gameState.score;
    elements.wordsSolvedFinal.textContent = `${gameState.wordsSolved}/${CONFIG.WORDS_PER_LEVEL}`;
    elements.bestStreak.textContent = gameState.bestStreak;
    elements.accuracy.textContent = `${accuracy}%`;
    
    // Save high score
    saveHighScore(gameState.score);
    
    // Show game over screen
    elements.gameScreen.classList.remove('active');
    elements.gameoverScreen.classList.add('active');
}

/**
 * Return to main menu
 */
function returnToMenu() {
    elements.gameoverScreen.classList.remove('active');
    elements.pauseScreen.classList.remove('active');
    elements.startScreen.classList.add('active');
    
    // Update high score display
    elements.highScore.textContent = loadHighScore();
}

// ============================================
// Event Listeners
// ============================================

// Difficulty selection
document.querySelectorAll('.btn-difficulty').forEach(btn => {
    btn.addEventListener('click', () => {
        const difficulty = btn.dataset.level;
        startGame(difficulty);
    });
});

// Submit answer
elements.submitBtn.addEventListener('click', checkAnswer);

// Enter key to submit
elements.answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// Hint button
elements.hintBtn.addEventListener('click', showHint);

// Pause button
elements.pauseBtn.addEventListener('click', pauseGame);

// Resume button
elements.resumeBtn.addEventListener('click', resumeGame);

// Restart from pause
elements.restartBtnPause.addEventListener('click', () => {
    elements.pauseScreen.classList.remove('active');
    startGame(gameState.currentLevel);
});

// Quit to menu
elements.quitBtn.addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    gameState.isPlaying = false;
    elements.pauseScreen.classList.remove('active');
    returnToMenu();
});

// Play again
elements.playAgainBtn.addEventListener('click', () => {
    elements.gameoverScreen.classList.remove('active');
    startGame(gameState.currentLevel);
});

// Menu button
elements.menuBtn.addEventListener('click', returnToMenu);

// Initialize high score display
elements.highScore.textContent = loadHighScore();

// Prevent accidental page close during game
window.addEventListener('beforeunload', (e) => {
    if (gameState.isPlaying) {
        e.preventDefault();
        e.returnValue = '';
    }
});
