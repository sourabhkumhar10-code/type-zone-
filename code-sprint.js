/**
 * Code Sprint Game - JavaScript
 * Typing practice for programming syntax
 */

// ============================================
// Game Configuration
// ============================================
const CONFIG = {
    INITIAL_TIME: 30,
    SNIPPETS_PER_LEVEL: 10,
    POINTS_CORRECT: 15,
    POINTS_BONUS: 8,
    HINT_PENALTY: 5,
    TIME_BONUS_THRESHOLD: 15
};

// ============================================
// Code Snippets Database by Difficulty
// ============================================
const CODE_DATABASE = {
    easy: [
        'console.log("Hello World");',
        'let x = 10;',
        'const PI = 3.14;',
        'if (x > 5) {}',
        'for (let i = 0; i < 10; i++) {}',
        'function add(a, b) { return a + b; }',
        'let arr = [1, 2, 3];',
        'let obj = { name: "John" };',
        'return result;',
        'let str = "JavaScript";',
        'document.getElementById("id");',
        'element.addEventListener("click", fn);',
        'let sum = a + b;',
        'let diff = a - b;',
        'let product = a * b;'
    ],
    medium: [
        'const greet = (name) => `Hello, ${name}!`;',
        'array.map(item => item * 2);',
        'array.filter(x => x > 10);',
        'async function fetchData() {}',
        'await fetch(url);',
        'try { riskyCode(); } catch (e) {}',
        'class Person { constructor(name) {} }',
        'export default function Component() {}',
        'import React, { useState } from "react";',
        'const [count, setCount] = useState(0);',
        'db.query("SELECT * FROM users");',
        'res.status(200).json({ success: true });',
        'module.exports = { router };',
        'process.env.NODE_ENV;',
        'setTimeout(() => {}, 1000);'
    ],
    hard: [
        'const reducer = (state, action) => { switch(action.type) {} };',
        'Promise.all([p1, p2, p3]).then(values => {});',
        'new Promise((resolve, reject) => {});',
        'Object.entries(obj).map(([k, v]) => {});',
        'arr.reduce((acc, cur) => acc + cur, 0);',
        'const { data, loading } = useQuery(QUERY);',
        'fetch(url, { method: "POST", body: JSON.stringify(data) });',
        'window.localStorage.getItem("key");',
        'Array.from({ length: 10 }, (_, i) => i);',
        'const memoized = useMemo(() => compute(), [deps]);',
        'router.get("/api/:id", async (req, res) => {});',
        'await axios.post("/api", { data });',
        'const filtered = items.filter(i => i.active !== false);',
        'export const connect = useSelector(state => state.user);',
        'db.collection.aggregate([{ $match: { status: "A" } }]);'
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
    snippetsSolved: 0,
    totalSnippets: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentTime: CONFIG.INITIAL_TIME,
    timerInterval: null,
    isPaused: false,
    isPlaying: false,
    currentSnippet: '',
    currentLanguage: 'JavaScript',
    hintUsed: false
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
    snippetsSolved: document.getElementById('snippets-solved'),
    timerFill: document.getElementById('timer-fill'),
    timerText: document.getElementById('timer-text'),
    progressFill: document.getElementById('progress-fill'),
    codeLanguage: document.getElementById('code-language'),
    codeDisplay: document.getElementById('code-display'),
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
    snippetsSolvedFinal: document.getElementById('snippets-solved-final'),
    bestStreak: document.getElementById('best-streak'),
    accuracy: document.getElementById('accuracy'),
    gameoverTitle: document.getElementById('gameover-title'),
    successAnimation: document.getElementById('success-animation')
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get random code snippet from database
 */
function getRandomSnippet(difficulty) {
    const snippets = CODE_DATABASE[difficulty];
    return snippets[Math.floor(Math.random() * snippets.length)];
}

/**
 * Save high score to localStorage
 */
function saveHighScore(score) {
    const currentHighScore = parseInt(localStorage.getItem('codeSprintHighScore') || '0');
    if (score > currentHighScore) {
        localStorage.setItem('codeSprintHighScore', score.toString());
    }
}

/**
 * Load high score from localStorage
 */
function loadHighScore() {
    return parseInt(localStorage.getItem('codeSprintHighScore') || '0');
}

// ============================================
// UI Update Functions
// ============================================

/**
 * Display code snippet
 */
function displayCodeSnippet(snippet) {
    elements.codeDisplay.textContent = snippet;
}

/**
 * Update all stat displays
 */
function updateStats() {
    elements.score.textContent = gameState.score;
    elements.streak.textContent = gameState.streak;
    elements.level.textContent = gameState.currentLevel.charAt(0).toUpperCase() + gameState.currentLevel.slice(1);
    elements.snippetsSolved.textContent = `${gameState.snippetsSolved}/${CONFIG.SNIPPETS_PER_LEVEL}`;
    
    // Update progress bar
    const progressPercent = (gameState.snippetsSolved / CONFIG.SNIPPETS_PER_LEVEL) * 100;
    elements.progressFill.style.width = `${progressPercent}%`;
    
    // Update timer
    const timerPercent = (gameState.currentTime / CONFIG.INITIAL_TIME) * 100;
    elements.timerFill.style.width = `${timerPercent}%`;
    elements.timerText.textContent = gameState.currentTime;
    
    // Timer warning when below 10 seconds
    if (gameState.currentTime <= 10) {
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
    const colors = ['#2c3e50', '#3498db', '#27ae60', '#e74c3c', '#f39c12'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
        
        elements.successAnimation.appendChild(confetti);
        
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
        snippetsSolved: 0,
        totalSnippets: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        currentTime: CONFIG.INITIAL_TIME,
        timerInterval: null,
        isPaused: false,
        isPlaying: true,
        currentSnippet: '',
        currentLanguage: 'JavaScript',
        hintUsed: false
    };
    
    elements.startScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    loadNewSnippet();
    startTimer();
    elements.answerInput.focus();
}

/**
 * Load a new code snippet
 */
function loadNewSnippet() {
    gameState.currentSnippet = getRandomSnippet(gameState.currentLevel);
    gameState.hintUsed = false;
    
    displayCodeSnippet(gameState.currentSnippet);
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
    showFeedback(`Time's up! The code was shown above`, 'error');
    gameState.streak = 0;
    gameState.wrongAnswers++;
    updateStats();
    
    setTimeout(() => {
        if (gameState.snippetsSolved < CONFIG.SNIPPETS_PER_LEVEL) {
            loadNewSnippet();
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
    const playerAnswer = elements.answerInput.value.trim();
    
    if (!playerAnswer) {
        showFeedback('Please type the code!', 'error');
        return;
    }
    
    gameState.totalSnippets++;
    
    if (playerAnswer === gameState.currentSnippet) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer(playerAnswer);
    }
}

/**
 * Handle correct answer
 */
function handleCorrectAnswer() {
    gameState.correctAnswers++;
    gameState.snippetsSolved++;
    
    let points = CONFIG.POINTS_CORRECT;
    
    gameState.streak++;
    if (gameState.streak > 1) {
        points += Math.min(gameState.streak - 1, 5) * CONFIG.POINTS_BONUS;
    }
    
    if (gameState.currentTime >= CONFIG.TIME_BONUS_THRESHOLD) {
        points += CONFIG.POINTS_BONUS;
    }
    
    gameState.score += points;
    
    if (gameState.streak > gameState.bestStreak) {
        gameState.bestStreak = gameState.streak;
    }
    
    elements.answerInput.classList.add('correct');
    showFeedback(`✓ Correct! +${points} points`, 'success');
    createConfetti();
    updateStats();
    
    setTimeout(() => {
        if (gameState.snippetsSolved < CONFIG.SNIPPETS_PER_LEVEL) {
            loadNewSnippet();
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
    showFeedback('✗ Check for typos and try again!', 'error');
    updateStats();
    
    setTimeout(() => {
        elements.answerInput.classList.remove('wrong');
        elements.answerInput.value = '';
        elements.answerInput.focus();
    }, 500);
}

/**
 * Show hint (first character)
 */
function showHint() {
    if (gameState.hintUsed) {
        showFeedback('Hint already used!', 'error');
        return;
    }
    
    gameState.hintUsed = true;
    gameState.score = Math.max(0, gameState.score - CONFIG.HINT_PENALTY);
    
    const firstChar = gameState.currentSnippet.charAt(0);
    showFeedback(`💡 First character: "${firstChar}"`, 'success');
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
    
    const accuracy = gameState.totalSnippets > 0 
        ? Math.round((gameState.correctAnswers / gameState.totalSnippets) * 100) 
        : 0;
    
    elements.finalScore.textContent = gameState.score;
    elements.snippetsSolvedFinal.textContent = `${gameState.snippetsSolved}/${CONFIG.SNIPPETS_PER_LEVEL}`;
    elements.bestStreak.textContent = gameState.bestStreak;
    elements.accuracy.textContent = `${accuracy}%`;
    
    saveHighScore(gameState.score);
    
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
    
    elements.highScore.textContent = loadHighScore();
}

// ============================================
// Event Listeners
// ============================================

document.querySelectorAll('.btn-difficulty').forEach(btn => {
    btn.addEventListener('click', () => {
        const difficulty = btn.dataset.level;
        startGame(difficulty);
    });
});

elements.submitBtn.addEventListener('click', checkAnswer);

elements.answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        checkAnswer();
    }
});

elements.hintBtn.addEventListener('click', showHint);
elements.pauseBtn.addEventListener('click', pauseGame);
elements.resumeBtn.addEventListener('click', resumeGame);

elements.restartBtnPause.addEventListener('click', () => {
    elements.pauseScreen.classList.remove('active');
    startGame(gameState.currentLevel);
});

elements.quitBtn.addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    gameState.isPlaying = false;
    elements.pauseScreen.classList.remove('active');
    returnToMenu();
});

elements.playAgainBtn.addEventListener('click', () => {
    elements.gameoverScreen.classList.remove('active');
    startGame(gameState.currentLevel);
});

elements.menuBtn.addEventListener('click', returnToMenu);

elements.highScore.textContent = loadHighScore();

window.addEventListener('beforeunload', (e) => {
    if (gameState.isPlaying) {
        e.preventDefault();
        e.returnValue = '';
    }
});
