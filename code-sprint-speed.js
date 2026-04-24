/**
 * Code Sprint Speed Test - JavaScript
 * Fast-paced code typing challenge
 */

// ============================================
// Game Configuration
// ============================================
const CONFIG = {
    INITIAL_TIME: 15,
    SNIPPETS_PER_LEVEL: 10,
    POINTS_CORRECT: 20,
    POINTS_BONUS: 10,
    HINT_PENALTY: 5,
    TIME_BONUS_THRESHOLD: 8
};

// ============================================
// Code Snippets Database by Difficulty
// ============================================
const CODE_DATABASE = {
    easy: [
        'x = 5',
        'print(x)',
        'a + b',
        'if x > 0:',
        'return x',
        'def func():',
        'for i in range(10):',
        'list = []',
        'dict = {}',
        'str = "text"',
        'num = 42',
        'bool = True',
        'arr[0]',
        'obj.key',
        'x += 1'
    ],
    medium: [
        'lambda x: x * 2',
        '[x for x in list]',
        'map(func, items)',
        'filter(lambda x: x > 0)',
        'sorted(items, reverse=True)',
        'zip(list1, list2)',
        'enumerate(items)',
        'try:\n    pass\nexcept:',
        'with open("file") as f:',
        'class MyClass:',
        '@decorator',
        'yield value',
        'async def fetch():',
        'await response',
        'import module'
    ],
    hard: [
        '[x**2 for x in range(10) if x % 2 == 0]',
        'reduce(lambda a, b: a + b, list)',
        'itertools.chain(*iterables)',
        'functools.partial(func, arg)',
        'collections.defaultdict(list)',
        'contextlib.contextmanager',
        'typing.List[int]',
        'dataclass(frozen=True)',
        'property.setter',
        '__init__(self, name)',
        'super().__init__()',
        'metaclass=ABCMeta',
        '@abstractmethod',
        'Protocol(ABC)',
        'TypeVar("T", bound=Base)'
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
    currentLanguage: 'Python',
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

function getRandomSnippet(difficulty) {
    const snippets = CODE_DATABASE[difficulty];
    return snippets[Math.floor(Math.random() * snippets.length)];
}

function saveHighScore(score) {
    const currentHighScore = parseInt(localStorage.getItem('codeSprintSpeedHighScore') || '0');
    if (score > currentHighScore) {
        localStorage.setItem('codeSprintSpeedHighScore', score.toString());
    }
}

function loadHighScore() {
    return parseInt(localStorage.getItem('codeSprintSpeedHighScore') || '0');
}

// ============================================
// UI Update Functions
// ============================================

function displayCodeSnippet(snippet) {
    elements.codeDisplay.textContent = snippet;
}

function updateStats() {
    elements.score.textContent = gameState.score;
    elements.streak.textContent = gameState.streak;
    elements.level.textContent = gameState.currentLevel.charAt(0).toUpperCase() + gameState.currentLevel.slice(1);
    elements.snippetsSolved.textContent = `${gameState.snippetsSolved}/${CONFIG.SNIPPETS_PER_LEVEL}`;
    
    const progressPercent = (gameState.snippetsSolved / CONFIG.SNIPPETS_PER_LEVEL) * 100;
    elements.progressFill.style.width = `${progressPercent}%`;
    
    const timerPercent = (gameState.currentTime / CONFIG.INITIAL_TIME) * 100;
    elements.timerFill.style.width = `${timerPercent}%`;
    elements.timerText.textContent = gameState.currentTime;
    
    if (gameState.currentTime <= 5) {
        elements.timerFill.classList.add('warning');
    } else {
        elements.timerFill.classList.remove('warning');
    }
}

function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${type}`;
    
    setTimeout(() => {
        elements.feedback.textContent = '';
        elements.feedback.className = 'feedback';
    }, 1500);
}

function createConfetti() {
    const colors = ['#e74c3c', '#f39c12', '#27ae60', '#3498db', '#9b59b6'];
    
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
        currentLanguage: 'Python',
        hintUsed: false
    };
    
    elements.startScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    loadNewSnippet();
    startTimer();
    elements.answerInput.focus();
}

function loadNewSnippet() {
    gameState.currentSnippet = getRandomSnippet(gameState.currentLevel);
    gameState.hintUsed = false;
    
    displayCodeSnippet(gameState.currentSnippet);
    updateStats();
    elements.answerInput.value = '';
    elements.answerInput.className = '';
}

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

function timeUp() {
    clearInterval(gameState.timerInterval);
    showFeedback(`Time's up!`, 'error');
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
    }, 1500);
}

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
    showFeedback(`✓ Perfect! +${points}`, 'success');
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
    }, 1200);
}

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
    }, 400);
}

function showHint() {
    if (gameState.hintUsed) {
        showFeedback('Skip already used!', 'error');
        return;
    }
    
    gameState.hintUsed = true;
    gameState.score = Math.max(0, gameState.score - CONFIG.HINT_PENALTY);
    gameState.snippetsSolved++;
    
    showFeedback(`Skipped! Next snippet...`, 'success');
    updateStats();
    
    setTimeout(() => {
        if (gameState.snippetsSolved < CONFIG.SNIPPETS_PER_LEVEL) {
            loadNewSnippet();
            gameState.currentTime = CONFIG.INITIAL_TIME;
            startTimer();
        } else {
            endGame();
        }
    }, 1000);
}

function pauseGame() {
    gameState.isPaused = true;
    clearInterval(gameState.timerInterval);
    elements.pauseScreen.classList.add('active');
}

function resumeGame() {
    gameState.isPaused = false;
    elements.pauseScreen.classList.remove('active');
    startTimer();
    elements.answerInput.focus();
}

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
