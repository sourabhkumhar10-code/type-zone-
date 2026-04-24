/* =========================
   Type Zone — Typing Game
   ========================= */

const el = {
  mode: document.getElementById("mode"), // <-- NEW
  level: document.getElementById("level"),
  btnStart: document.getElementById("btnStart"),
  btnNext: document.getElementById("btnNext"),
  btnReset: document.getElementById("btnReset"),
  quote: document.getElementById("quote"),
  input: document.getElementById("input"),
  timeLabel: document.getElementById("timeLabel"),
  timeBar: document.getElementById("timeBar"),
  wpm: document.getElementById("wpm"),
  accuracy: document.getElementById("accuracy"),
  errors: document.getElementById("errors"),
  chars: document.getElementById("chars"),
  result: document.getElementById("result"),
};

// ======= Content pools =======
const EASY_WORDS = [
  "sun","moon","cat","dog","tree","lake","blue","green","bird","milk",
  "book","ball","rain","snow","wind","sand","road","boat","star","note",
  "fish","apple","car","phone","chair","desk","train","plane","house","river"
];

const MEDIUM_SENTENCES = [
  "Typing is a simple skill that improves with daily practice.",
  "Consistent effort builds confidence and speed over time.",
  "Small goals lead to big results when you stay focused.",
  "Keep your posture straight and your hands relaxed.",
  "Read the line first, then type it smoothly.",
  "Accuracy first, speed later, and both will grow together.",
  "Breathe, relax your shoulders, and find a steady rhythm.",
];

const HARD_SENTENCES = [
  "The quick brown fox jumps over the lazy dog near the riverbank at dawn.",
  "Precision and rhythm matter more than raw speed for sustained accuracy.",
  "Complex punctuation, mixed casing, and numbers truly test your focus.",
  "Mastery arrives when your hands move like music across the keyboard.",
  "Symbols, brackets ( ), and quotes \" \" demand attention and control.",
];

// ======= NEW: Coding snippets =======
const CODING_SNIPPETS = {
  easy: [
    { code: `let x = 10;\nconsole.log(x);`, output: `10` },
    { code: `function greet() {\n  return "Hello World";\n}\nconsole.log(greet());`, output: `Hello World` },
    { code: `const arr = [1, 2, 3];\nconsole.log(arr);`, output: `[1, 2, 3]` }
  ],
  medium: [
    { code: `for (let i = 0; i < 5; i++) {\n  console.log("Count:", i);\n}`, output: `Count: 0\nCount: 1\nCount: 2\nCount: 3\nCount: 4` },
    { code: `const nums = [1, 2, 3];\nnums.forEach(n => console.log(n));`, output: `1\n2\n3` },
    { code: `function sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(4, 5));`, output: `9` }
  ],
  hard: [
    { code: `class Person {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    console.log("Hi, I'm " + this.name);\n  }\n}\nconst p = new Person('Sam');\np.speak();`, output: `Hi, I'm Sam` },
    { code: `async function fetchData(url) {\n  try {\n    const res = await fetch(url);\n    return await res.json();\n  } catch (err) {\n    console.error(err);\n  }\n}\nconsole.log('No network call in this practice');`, output: `No network call in this practice` },
    { code: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(6));`, output: `8` }
  ]
};

const QUIZ_QUESTIONS = [
  { question: "What is the capital of France?", answers: ["paris"] },
  { question: "What planet is known as the Red Planet?", answers: ["mars"] },
  { question: "What is 5 + 3?", answers: ["8", "eight"] },
  { question: "What language is primarily used for web pages?", answers: ["javascript", "html", "css"] },
  { question: "What gas do plants absorb from the atmosphere?", answers: ["carbon dioxide", "co2"] }
];

// ======= Level settings (time per round) =======
const LEVELS = {
  easy:   { seconds: 25, generator: () => randomEasyLine(8, 11) },
  medium: { seconds: 35, generator: () => randomFrom(MEDIUM_SENTENCES) },
  hard:   { seconds: 45, generator: () => randomFrom(HARD_SENTENCES) },
};

// ======= State =======
let currentText = "";
let currentSnippetOutput = null;
let currentQuizAnswer = null;
let timer = null;
let timeLeft = 0;
let startedAt = 0;

let typedChars = 0;
let correctChars = 0;
let errorCount = 0;
let finished = false;

let latestBestScore = null;

const hasApiClient = () => typeof window.tzApi !== "undefined";

const loadBestScore = async (level, mode) => {
  if (!hasApiClient()) {
    latestBestScore = null;
    return null;
  }
  try {
    const query = `?mode=${encodeURIComponent(mode)}&level=${encodeURIComponent(
      level
    )}`;
    const res = await tzApi.apiRequest(`/scores/best${query}`, {
      auth: true,
    });
    latestBestScore = res?.score || null;
    return latestBestScore;
  } catch (err) {
    console.warn("Failed to load best score", err);
    latestBestScore = null;
    return null;
  }
};

const submitBestScore = async (payload) => {
  if (!hasApiClient()) {
    return null;
  }
  try {
    const res = await tzApi.apiRequest("/scores", {
      method: "POST",
      auth: true,
      body: payload,
    });
    if (res?.score) {
      latestBestScore = res.score;
    }
    return res;
  } catch (err) {
    console.warn("Failed to submit score", err);
    return null;
  }
};

const showPersonalBest = (score, { force = false } = {}) => {
  const isIdle = finished || el.input.disabled;
  if (!force && !isIdle) {
    return;
  }

  const hasMessage = el.result.textContent.trim().length > 0;
  if (!force && hasMessage) {
    return;
  }

  if (score?.wpm) {
    el.result.textContent = `Personal best: ${score.wpm} WPM.`;
  } else if (force) {
    el.result.textContent = "";
  }
};

/* ---------- Helpers ---------- */
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomEasyLine(minWords = 8, maxWords = 10) {
  const count = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const picked = Array.from({ length: count }, () => randomFrom(EASY_WORDS));
  return picked.join(" ");
}

function getText(level, mode) {
  if (mode === "coding") {
    const snippet = randomFrom(CODING_SNIPPETS[level]);
    currentSnippetOutput = snippet.output || null;
    currentQuizAnswer = null;
    return snippet.code;
  } else if (mode === "quiz") {
    const quiz = randomFrom(QUIZ_QUESTIONS);
    currentQuizAnswer = quiz.answers;
    currentSnippetOutput = null;
    return quiz.question;
  } else {
    currentSnippetOutput = null;
    currentQuizAnswer = null;
    return LEVELS[level].generator();
  }
}

function renderQuote(text) {
  el.quote.innerHTML = "";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.className = "char" + (i === 0 ? " active" : "");
    el.quote.appendChild(span);
  });
}

function resetStats() {
  typedChars = 0;
  correctChars = 0;
  errorCount = 0;
  finished = false;
  updateStats();
  el.result.textContent = "";
}

function updateStats() {
  el.errors.textContent = errorCount;
  el.chars.textContent = typedChars;

  const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60000);
  const wpm = Math.round((correctChars / 5) / minutes);
  el.wpm.textContent = isFinite(wpm) ? wpm : 0;

  const acc = typedChars ? Math.max(0, Math.round((correctChars / typedChars) * 100)) : 0;
  el.accuracy.textContent = acc + "%";
}

function updateTimeUI() {
  el.timeLabel.textContent = `Time: ${Math.max(0, Math.ceil(timeLeft))}s`;
  const levelSeconds = LEVELS[el.level.value].seconds;
  const pct = Math.max(0, Math.min(100, (timeLeft / levelSeconds) * 100));
  el.timeBar.style.width = pct + "%";
}

function endRound(win, customMessage = null) {
  finished = true;
  clearInterval(timer);
  el.input.disabled = true;
  el.btnNext.disabled = false;

  updateStats();

  const level = el.level.value;
  const mode = el.mode.value;
  const currentWpm = Number(el.wpm.textContent || 0);
  const accuracyPct = Number(
    (el.accuracy.textContent || "0").replace("%", "")
  );
  const durationSeconds = Math.max(
    0,
    Math.round(((Date.now() - startedAt) / 1000) * 100) / 100
  );

  const defaultBase = win
    ? "✅ Great job! You finished before time."
    : mode === "quiz"
    ? "⏱️ Time's up! Next question..."
    : "⏱️ Time's up! Try again or hit Next.";

  let message = customMessage || defaultBase;
  if (win && mode === "coding" && currentSnippetOutput) {
    message += `\nOutput:\n${currentSnippetOutput}`;
  }
  if (mode === "quiz" && currentQuizAnswer) {
    message += `\nAnswer: ${currentQuizAnswer[0]}`;
  }

  el.result.textContent = message;

  if (win) {
    submitBestScore({
      level,
      mode,
      wpm: currentWpm,
      accuracy: accuracyPct,
      errors: errorCount,
      chars: typedChars,
      duration: durationSeconds,
    }).then((res) => {
      if (!res) {
        return;
      }
      if (res.updated && res.score?.wpm) {
        el.result.textContent = `${message} New personal best: ${res.score.wpm} WPM 🎉`;
      } else if (res.score?.wpm) {
        el.result.textContent = `${message} Personal best: ${res.score.wpm} WPM.`;
      }
    });
  } else if (latestBestScore?.wpm) {
    el.result.textContent = `${message} Personal best: ${latestBestScore.wpm} WPM.`;
  }

  if (mode === "quiz") {
    setTimeout(() => {
      if (el.mode.value === "quiz") {
        startRound();
      }
    }, 1200);
  }
}

function startRound() {
  const level = el.level.value;
  const mode = el.mode.value;

  loadBestScore(level, mode);

  currentText = getText(level, mode);
  renderQuote(currentText);

  resetStats();

  el.input.value = "";
  el.input.disabled = false;
  el.input.focus();

  if (mode === "quiz") {
    el.input.placeholder = "Type your answer and press Enter...";
  } else {
    el.input.placeholder = "Start typing here...";
  }

  timeLeft = LEVELS[level].seconds;
  startedAt = Date.now();
  updateTimeUI();

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft -= 1;
    updateTimeUI();
    if (timeLeft <= 0 && !finished) {
      if (mode === "quiz") {
        endRound(false, "⏱️ Time's up! Next question...");
      } else {
        endRound(false);
      }
    }
  }, 1000);

  el.btnNext.disabled = true;
}

/* ---------- Typing logic ---------- */
el.input.addEventListener("input", () => {
  if (finished) return;

  const input = el.input.value;
  const mode = el.mode.value;

  if (mode === "quiz") {
    typedChars = input.length;
    correctChars = typedChars;
    errorCount = 0;
    updateStats();
    el.result.textContent = "";
    return;
  }

  const target = currentText;
  const spans = el.quote.querySelectorAll(".char");

  typedChars = input.length;
  correctChars = 0;
  errorCount = 0;

  // Clear all keyboard highlights
  document.querySelectorAll('.key').forEach(key => {
    key.classList.remove('active', 'correct', 'incorrect');
  });
  document.querySelectorAll('.finger').forEach(finger => {
    finger.classList.remove('active');
  });

  for (let i = 0; i < spans.length; i++) {
    const expected = target[i] ?? "";
    const typed = input[i] ?? null;
    const span = spans[i];

    span.classList.remove("active", "correct", "wrong");

    if (typed == null) {
      // not typed yet
    } else if (typed === expected) {
      span.classList.add("correct");
      correctChars++;
    } else {
      span.classList.add("wrong");
      errorCount++;
    }
  }

  const caretIndex = Math.min(input.length, spans.length - 1);
  spans[caretIndex]?.classList.add("active");

  // Highlight next key to press
  const nextChar = target[input.length];
  if (nextChar) {
    const nextKey = document.querySelector(`.key[data-key="${nextChar.toLowerCase()}"]`);
    if (nextKey) {
      nextKey.classList.add('active');
      const finger = nextKey.dataset.finger;
      const fingerElement = document.querySelector(`.finger[data-finger="${finger}"]`);
      if (fingerElement) {
        fingerElement.classList.add('active');
      }
    }
  }

  updateStats();

  if (input.length === target.length && errorCount === 0) {
    endRound(true);
  }
});

el.input.addEventListener("keydown", (event) => {
  if (finished) return;
  const mode = el.mode.value;
  if (mode !== "quiz") return;

  if (event.key === "Enter") {
    event.preventDefault();
    const answer = el.input.value.trim().toLowerCase();
    if (!currentQuizAnswer) {
      el.result.textContent = "No question selected yet. Press Start Practice.";
      return;
    }

    const isCorrect = currentQuizAnswer.some((a) => a.toLowerCase() === answer);
    if (isCorrect) {
      endRound(true, "✅ Correct! Great answer.");
    } else {
      const correctAnswer = currentQuizAnswer[0];
      el.input.value = correctAnswer;
      endRound(false, `❌ Incorrect. Auto-filled correct answer: ${correctAnswer}`);
    }
  }
});

/* ---------- Buttons ---------- */
el.btnStart.addEventListener("click", startRound);
el.btnNext.addEventListener("click", startRound);
el.btnReset.addEventListener("click", () => {
  clearInterval(timer);
  el.input.value = "";
  el.input.disabled = true;
  el.quote.innerHTML = "";
  el.result.textContent = "";
  el.timeBar.style.width = "0%";
  el.timeLabel.textContent = "Time: 0s";
  el.wpm.textContent = "0";
  el.accuracy.textContent = "0%";
  el.errors.textContent = "0";
  el.chars.textContent = "0";
  finished = true;
  showPersonalBest(latestBestScore, { force: true });
});

const refreshPersonalBest = ({ force = false } = {}) => {
  loadBestScore(el.level.value, el.mode.value).then((score) => {
    showPersonalBest(score, { force });
  });
};

refreshPersonalBest({ force: true });

el.level.addEventListener("change", () => {
  const force = finished || el.input.disabled;
  refreshPersonalBest({ force });
});

el.mode.addEventListener("change", () => {
  const force = finished || el.input.disabled;
  refreshPersonalBest({ force });
});
