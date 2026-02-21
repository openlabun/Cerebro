const puzzle = [
  [5, 3, "", "", 7, "", "", "", ""],
  [6, "", "", 1, 9, 5, "", "", ""],
  ["", 9, 8, "", "", "", "", 6, ""],
  [8, "", "", "", 6, "", "", "", 3],
  [4, "", "", 8, "", 3, "", "", 1],
  [7, "", "", "", 2, "", "", "", 6],
  ["", 6, "", "", "", "", 2, 8, ""],
  ["", "", "", 4, 1, 9, "", "", 5],
  ["", "", "", "", 8, "", "", 7, 9],
];

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

const boardEl = document.getElementById("board");
const keypadEl = document.getElementById("keypad");
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const clearBtn = document.getElementById("clear-cell");
const hintBtn = document.getElementById("hint");

const themeToggleBtn = document.getElementById("theme-toggle");
const THEME_KEY = "sudoku-theme";
const themes = ["system", "light", "dark"];
let currentTheme = localStorage.getItem(THEME_KEY) || "system";

function applyTheme(theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }

  currentTheme = theme;
  localStorage.setItem(THEME_KEY, theme);
  themeToggleBtn.textContent = `Tema: ${theme === "system" ? "Sistema" : theme === "dark" ? "Oscuro" : "Claro"}`;
}

function setupThemeToggle() {
  applyTheme(currentTheme);

  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
    applyTheme(nextTheme);
  });
}

const state = puzzle.map((row) => [...row]);
let selectedCell = null;
let seconds = 0;

function getGridValue(row, col) {
  return state[row][col] === "" ? "" : Number(state[row][col]);
}

function hasConflict(row, col, value) {
  if (value === "") return false;
  const parsed = Number(value);

  for (let i = 0; i < 9; i += 1) {
    if (i !== col && getGridValue(row, i) === parsed) return true;
    if (i !== row && getGridValue(i, col) === parsed) return true;
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r += 1) {
    for (let c = startCol; c < startCol + 3; c += 1) {
      if ((r !== row || c !== col) && getGridValue(r, c) === parsed) {
        return true;
      }
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

function setStatus(message, isGood = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("ok", isGood);
}

function fillSelected(value) {
  if (!selectedCell || selectedCell.dataset.prefilled === "true") return;

  const row = Number(selectedCell.dataset.row);
  const col = Number(selectedCell.dataset.col);
  state[row][col] = value === "" ? "" : Number(value);
  selectedCell.textContent = value;

  const conflict = hasConflict(row, col, value);
  selectedCell.classList.toggle("error", conflict);

  if (conflict) {
    setStatus("Hay conflicto en fila, columna o subcuadro.");
  } else if (isSolved()) {
    setStatus("¡Excelente! Completaste el Sudoku correctamente.", true);
  } else {
    setStatus("Sigue así, vas muy bien.");
  }
}

function selectCell(cell) {
  if (selectedCell) selectedCell.classList.remove("selected");
  selectedCell = cell;
  selectedCell.classList.add("selected");
}

function createCell(value, row, col) {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = "cell";
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.dataset.prefilled = value !== "";

  if ((col + 1) % 3 === 0 && col !== 8) cell.classList.add("block-right");
  if ((row + 1) % 3 === 0 && row !== 8) cell.classList.add("block-bottom");

  if (value !== "") {
    cell.classList.add("prefilled");
    cell.textContent = value;
  }

  cell.addEventListener("click", () => selectCell(cell));
  return cell;
}

function createBoard() {
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      boardEl.appendChild(createCell(puzzle[r][c], r, c));
    }
  }
}

function createKeypad() {
  for (let n = 1; n <= 9; n += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip number";
    btn.textContent = n;
    btn.addEventListener("click", () => fillSelected(n));
    keypadEl.appendChild(btn);
  }
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
}

function startTimer() {
  setInterval(() => {
    seconds += 1;
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    timerEl.textContent = `${mm}:${ss}`;
  }, 1000);
}

setupThemeToggle();
createBoard();
createKeypad();
setupControls();
startTimer();
setStatus("Selecciona una celda para comenzar.");