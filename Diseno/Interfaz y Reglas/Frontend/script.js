const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const difficultyLevels = [
  { key: "muy-facil", label: "Principiante", givens: 48 },
  { key: "facil", label: "Iniciado", givens: 42 },
  { key: "medio", label: "Intermedio", givens: 36 },
  { key: "dificil", label: "Avanzado", givens: 31 },
  { key: "experto", label: "Experto", givens: 27 },
  { key: "maestro", label: "Profesional", givens: 24 },
];

const themes = ["system", "light", "dark"];
const THEME_KEY = "sudoku-theme";

const boardEl = document.getElementById("board");
const signBoardEl = document.getElementById("sign-board");
const keypadEl = document.getElementById("keypad");
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const hintBtn = document.getElementById("hint");
const clearBtn = document.getElementById("clear-cell");
const themeBtn = document.getElementById("theme-toggle");
const playNowBtn = document.getElementById("play-now");
const tabInicioBtn = document.getElementById("tab-inicio");
const tabJugarBtn = document.getElementById("tab-jugar");
const backHomeBtn = document.getElementById("back-home");
const inicioTab = document.getElementById("inicio-tab");
const juegoTab = document.getElementById("juego-tab");
const difficultySelect = document.getElementById("difficulty-select");
const difficultyLabel = document.getElementById("difficulty-label");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

let puzzle = [];
let state = [];
let selectedCell = null;
let seconds = 0;
let activeTheme = "system";
let timerInterval = null;
let currentDifficulty = difficultyLevels[2];

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createPuzzle(givens, difficultyKey) {
  const base = solution.map((row) => [...row]);
  const indices = Array.from({ length: 81 }, (_, i) => i);
  const rng = seededRandom(
    difficultyKey
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  );

  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = givens; i < indices.length; i += 1) {
    const row = Math.floor(indices[i] / 9);
    const col = indices[i] % 9;
    base[row][col] = "";
  }

  return base;
}

function setTab(mode) {
  const isGame = mode === "juego";
  inicioTab.classList.toggle("hidden", isGame);
  juegoTab.classList.toggle("hidden", !isGame);
  tabInicioBtn.classList.toggle("active", !isGame);
  tabJugarBtn.classList.toggle("active", isGame);
  if (isGame) window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyTheme(theme) {
  activeTheme = theme;
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  const label = theme === "system" ? "Sistema" : theme === "light" ? "Claro" : "Oscuro";
  themeBtn.textContent = `Tema: ${label}`;
}

function initTheme() {
  let stored = "system";
  try {
    stored = localStorage.getItem(THEME_KEY) || "system";
  } catch {}
  applyTheme(stored);
  themeBtn.addEventListener("click", () => {
    const next = themes[(themes.indexOf(activeTheme) + 1) % themes.length];
    applyTheme(next);
  });
}

function hasConflict(row, col, value) {
  if (value === "") return false;
  const n = Number(value);
  for (let i = 0; i < 9; i += 1) {
    if (i !== col && Number(state[row][i]) === n) return true;
    if (i !== row && Number(state[i][col]) === n) return true;
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r += 1) {
    for (let c = startCol; c < startCol + 3; c += 1) {
      if ((r !== row || c !== col) && Number(state[r][c]) === n) return true;
    }
  }
  return false;
}

function isSolved() {
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (Number(state[r][c]) !== solution[r][c]) return false;
    }
  }
  return true;
}

function getProgress() {
  let editable = 0;
  let correct = 0;

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (puzzle[r][c] === "") {
        editable += 1;
        if (Number(state[r][c]) === solution[r][c]) correct += 1;
      }
    }
  }

  const percentage = editable === 0 ? 100 : Math.round((correct / editable) * 100);
  return { correct, editable, percentage };
}

function updateProgress() {
  const { correct, editable, percentage } = getProgress();
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = `${correct}/${editable} celdas correctas (${percentage}%)`;
}

function setStatus(message, ok = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("ok", ok);
}

function fillSelected(value) {
  if (!selectedCell || selectedCell.dataset.prefilled === "true") return;
  const row = Number(selectedCell.dataset.row);
  const col = Number(selectedCell.dataset.col);

  state[row][col] = value === "" ? "" : Number(value);
  selectedCell.textContent = value;

  const conflict = hasConflict(row, col, value);
  selectedCell.classList.toggle("error", conflict);

  updateProgress();

  if (conflict) return setStatus("Hay conflicto en fila, columna o subcuadro.");
  if (isSolved()) return setStatus("¡Excelente! Completaste el Sudoku correctamente.", true);
  return setStatus("Sigue así, vas muy bien.");
}

function createBoard() {
  boardEl.innerHTML = "";
  selectedCell = null;

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.dataset.prefilled = puzzle[r][c] !== "";

      if ((c + 1) % 3 === 0 && c !== 8) cell.classList.add("block-right");
      if ((r + 1) % 3 === 0 && r !== 8) cell.classList.add("block-bottom");

      if (puzzle[r][c] !== "") {
        cell.textContent = puzzle[r][c];
        cell.classList.add("prefilled");
      }

      cell.addEventListener("click", () => {
        if (selectedCell) selectedCell.classList.remove("selected");
        selectedCell = cell;
        cell.classList.add("selected");
      });

      boardEl.appendChild(cell);
    }
  }
}

function createSignBoard() {
  const letters = ["C", "E", "R", "E", "B", "R", "O", "!", "!"];
  signBoardEl.innerHTML = "";
  for (let i = 0; i < 81; i += 1) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const cell = document.createElement("div");
    cell.className = "sign-cell";

    if ((col + 1) % 3 === 0 && col !== 8) cell.classList.add("block-right");
    if ((row + 1) % 3 === 0 && row !== 8) cell.classList.add("block-bottom");

    const center = row % 3 === 1 && col % 3 === 1;
    const blockIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    if (center) cell.textContent = letters[blockIndex];

    signBoardEl.appendChild(cell);
  }
}

function createKeypad() {
  keypadEl.innerHTML = "";
  for (let n = 1; n <= 9; n += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip number";
    btn.textContent = n;
    btn.addEventListener("click", () => fillSelected(n));
    keypadEl.appendChild(btn);
  }
}

function startTimer(reset = false) {
  if (timerInterval) clearInterval(timerInterval);
  if (reset) seconds = 0;

  timerInterval = setInterval(() => {
    seconds += 1;
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    timerEl.textContent = `${mm}:${ss}`;
  }, 1000);
}

function initializeDifficultyOptions() {
  difficultySelect.innerHTML = "";
  difficultyLevels.forEach((level, index) => {
    const option = document.createElement("option");
    option.value = level.key;
    option.textContent = `${index + 1}. ${level.label}`;
    if (level.key === currentDifficulty.key) option.selected = true;
    difficultySelect.appendChild(option);
  });
}

function loadDifficulty(levelKey) {
  const found = difficultyLevels.find((d) => d.key === levelKey) || difficultyLevels[2];
  currentDifficulty = found;
  difficultyLabel.textContent = `Dificultad: ${found.label}`;
  puzzle = createPuzzle(found.givens, found.key);
  state = puzzle.map((row) => [...row]);
  createBoard();
  setStatus("Selecciona una celda para comenzar.");
  updateProgress();
  startTimer(true);
}

function setupControls() {
  clearBtn.addEventListener("click", () => fillSelected(""));
  hintBtn.addEventListener("click", () => {
    if (!selectedCell || selectedCell.dataset.prefilled === "true") {
      setStatus("Selecciona una celda vacía para usar pista.");
      return;
    }
    const row = Number(selectedCell.dataset.row);
    const col = Number(selectedCell.dataset.col);
    fillSelected(solution[row][col]);
  });

  document.addEventListener("keydown", (event) => {
    if (!selectedCell || selectedCell.dataset.prefilled === "true") return;
    if (/^[1-9]$/.test(event.key)) fillSelected(event.key);
    if (event.key === "Backspace" || event.key === "Delete") fillSelected("");
  });

  difficultySelect.addEventListener("change", (event) => {
    loadDifficulty(event.target.value);
  });

  playNowBtn.addEventListener("click", () => setTab("juego"));
  tabJugarBtn.addEventListener("click", () => setTab("juego"));
  tabInicioBtn.addEventListener("click", () => setTab("inicio"));
  backHomeBtn.addEventListener("click", () => setTab("inicio"));
}

initTheme();
createSignBoard();
createKeypad();
initializeDifficultyOptions();
setupControls();
loadDifficulty(currentDifficulty.key);
setTab("inicio");