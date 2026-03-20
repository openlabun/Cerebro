import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { apiClient } from '../services/apiClient.js'
import {
  calculateProgress,
  calculateScore,
  clearNotesCell,
  countCorrectByNumber,
  createEmptyNotes,
  createPuzzle,
  difficultyLevels,
  generateSolution,
  getDifficultyByKey,
  getHintLimit,
  getRandomHint,
  isBoardSolved,
  toggleNote,
} from '../lib/sudoku.js'

const GAME_ID_SUDOKU = 'uVsB-k2rjora'
const STREAK_SESSION_WINDOW_MS = 28 * 60 * 60 * 1000

const ACHIEVEMENT_BADGES = [
  { key: 'first-game', label: 'Primera partida', icon: '🏁', description: 'Completa tu primera partida de Sudoku.' },
  { key: 'five-games', label: '5 partidas', icon: '5️⃣', description: 'Completa 5 partidas de Sudoku.' },
  { key: 'ten-games', label: '10 partidas', icon: '🔟', description: 'Completa 10 partidas de Sudoku.' },
  { key: 'score-over-500', label: 'Puntaje >500', icon: '🏏', description: 'Alcanza un puntaje mayor a 500 en una partida.' },
]

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function mapAchievementNameToBadgeKey(name) {
  const normalized = normalizeText(name)
  if (!normalized) return null
  if (normalized.includes('primera') && normalized.includes('partida')) return 'first-game'
  if (normalized.includes('5') && normalized.includes('partida')) return 'five-games'
  if (normalized.includes('10') && normalized.includes('partida')) return 'ten-games'
  if (normalized.includes('500') && normalized.includes('puntaje')) return 'score-over-500'
  return null
}

function getUnlockedKeysByRules(partidasJugadas = 0, bestScore = 0) {
  const unlocked = []
  if (partidasJugadas >= 1) unlocked.push('first-game')
  if (partidasJugadas >= 5) unlocked.push('five-games')
  if (partidasJugadas >= 10) unlocked.push('ten-games')
  if (bestScore > 500) unlocked.push('score-over-500')
  return unlocked
}

function toAchievementPopupItems(keys) {
  return Array.from(new Set(keys))
    .map((key) => ACHIEVEMENT_BADGES.find((badge) => badge.key === key))
    .filter(Boolean)
    .map((badge) => ({
      key: badge.key,
      icon: badge.icon,
      title: badge.label,
      description: badge.description,
    }))
}

function parseIsoDate(value) {
  const date = new Date(String(value || ''))
  if (Number.isNaN(date.getTime())) return null
  return date
}

function getSessionDayKey(value) {
  const date = parseIsoDate(value)
  if (!date) return null
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function cloneNotes(notes) {
  return notes.map((row) => row.map((cell) => new Set(cell)))
}

function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function removeCandidateFromPeerNotes(notes, row, col, num) {
  for (let currentCol = 0; currentCol < 9; currentCol += 1) {
    if (currentCol !== col) notes[row][currentCol].delete(num)
  }

  for (let currentRow = 0; currentRow < 9; currentRow += 1) {
    if (currentRow !== row) notes[currentRow][col].delete(num)
  }

  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3
  for (let currentRow = startRow; currentRow < startRow + 3; currentRow += 1) {
    for (let currentCol = startCol; currentCol < startCol + 3; currentCol += 1) {
      if (currentRow === row && currentCol === col) continue
      notes[currentRow][currentCol].delete(num)
    }
  }
}

function noteViolatesCurrentBoard(board, row, col, num) {
  for (let currentCol = 0; currentCol < 9; currentCol += 1) {
    if (currentCol !== col && board[row][currentCol] === num) return 'ya existe en la fila'
  }

  for (let currentRow = 0; currentRow < 9; currentRow += 1) {
    if (currentRow !== row && board[currentRow][col] === num) return 'ya existe en la columna'
  }

  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3
  for (let currentRow = startRow; currentRow < startRow + 3; currentRow += 1) {
    for (let currentCol = startCol; currentCol < startCol + 3; currentCol += 1) {
      if (currentRow === row && currentCol === col) continue
      if (board[currentRow][currentCol] === num) return 'ya existe en el bloque 3x3'
    }
  }

  return null
}

function revalidateAllNotes(puzzle, board, notes) {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (puzzle[row][col] !== 0) continue
      for (const note of Array.from(notes[row][col])) {
        if (noteViolatesCurrentBoard(board, row, col, note)) {
          notes[row][col].delete(note)
        }
      }
    }
  }
}

function buildGame(difficultyKey) {
  const difficulty = getDifficultyByKey(difficultyKey)
  const seed = Math.floor(Math.random() * 1_000_000)
  const solution = generateSolution(seed)
  const puzzle = createPuzzle(solution, difficulty.holes, seed)

  return {
    difficulty,
    seed,
    solution,
    puzzle,
    board: puzzle.map((row) => [...row]),
    notes: createEmptyNotes(),
  }
}

function SudokuPage() {
  const [difficultyKey, setDifficultyKey] = useState(difficultyLevels[2].key)
  const [solution, setSolution] = useState([])
  const [puzzle, setPuzzle] = useState([])
  const [board, setBoard] = useState([])
  const [notes, setNotes] = useState(() => createEmptyNotes())
  const [selectedCell, setSelectedCell] = useState(null)
  const [noteMode, setNoteMode] = useState(false)
  const [highlightEnabled, setHighlightEnabled] = useState(true)
  const [paused, setPaused] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [status, setStatus] = useState('Cargando sudoku...')
  const [statusOk, setStatusOk] = useState(false)
  const [score, setScore] = useState(0)
  const [seed, setSeed] = useState(0)
  const difficulty = getDifficultyByKey(difficultyKey)
  const { isAuthenticated, accessToken } = useAuth()
  const latestMetricsRef = useRef({ seconds: 0, errorCount: 0, hintsUsed: 0 })
  const bestSudokuScoreRef = useRef(0)
  const achievementCatalogRef = useRef(new Map())

  const [unlockedBadges, setUnlockedBadges] = useState(new Set())
  const [showAchievementPopup, setShowAchievementPopup] = useState(false)
  const [achievementPopupItems, setAchievementPopupItems] = useState([])
  const [streakMessage, setStreakMessage] = useState('')

  function setGameStatus(message, ok = false) {
    setStatus(message)
    setStatusOk(ok)
  }

  async function syncRemoteAchievementCatalog() {
    if (!accessToken) return

    try {
      const catalog = await apiClient.getAchievements(accessToken)
      const map = new Map()
      if (!Array.isArray(catalog)) {
        achievementCatalogRef.current = map
        return
      }

      catalog.forEach((item) => {
        const key = mapAchievementNameToBadgeKey(item?.nombre)
        if (!key || !item?._id) return
        map.set(key, String(item._id))
      })

      achievementCatalogRef.current = map
    } catch (error) {
      console.warn('No se pudo cargar el catalogo de logros:', error)
    }
  }

  async function getUnlockedKeysFromRemote() {
    if (!accessToken) return []

    try {
      if (achievementCatalogRef.current.size === 0) {
        await syncRemoteAchievementCatalog()
      }

      const myAchievements = await apiClient.getMyAchievements(accessToken)
      if (!Array.isArray(myAchievements)) return []

      const byId = new Map()
      achievementCatalogRef.current.forEach((logroId, key) => {
        byId.set(logroId, key)
      })

      return myAchievements
        .map((item) => byId.get(String(item?.logroId || '')))
        .filter(Boolean)
    } catch (error) {
      console.warn('No se pudieron consultar los logros del usuario:', error)
      return []
    }
  }

  async function unlockRemoteAchievements(unlockedKeys) {
    if (!accessToken) return
    const map = achievementCatalogRef.current
    if (map.size === 0) return

    const promises = Array.from(new Set(unlockedKeys))
      .map((badgeKey) => map.get(badgeKey))
      .filter(Boolean)
      .map((logroId) =>
        apiClient.unlockAchievement(accessToken, logroId).catch((error) => {
          console.warn(`No se pudo desbloquear logro remoto ${logroId}:`, error)
          return null
        }),
      )

    await Promise.all(promises)
  }

  async function registerSudokuActivity(score, gameSession) {
    if (!accessToken || !isAuthenticated) {
      return { recorded: false, newlyUnlockedAchievements: [] }
    }

    const previousUnlocked = new Set(unlockedBadges)
    bestSudokuScoreRef.current = Math.max(bestSudokuScoreRef.current, score)

    const nextUnlocked = new Set(unlockedBadges)
    if (bestSudokuScoreRef.current > 500) nextUnlocked.add('score-over-500')

    try {
      const stats = await apiClient.getMyGameStats(accessToken, GAME_ID_SUDOKU)
      const partidasJugadas = Number(stats?.partidasJugadas || 0)
      const byRules = getUnlockedKeysByRules(partidasJugadas, bestSudokuScoreRef.current)
      byRules.forEach((key) => nextUnlocked.add(key))

      await syncRemoteAchievementCatalog()
      await unlockRemoteAchievements(nextUnlocked)

      const remoteKeys = await getUnlockedKeysFromRemote()
      remoteKeys.forEach((key) => nextUnlocked.add(key))

      setUnlockedBadges(nextUnlocked)

      const newlyUnlockedKeys = [...nextUnlocked].filter((key) => !previousUnlocked.has(key))
      const newlyUnlockedAchievements = toAchievementPopupItems(newlyUnlockedKeys)
      if (newlyUnlockedAchievements.length > 0) {
        setAchievementPopupItems(newlyUnlockedAchievements)
        setShowAchievementPopup(true)
      }

      if (gameSession?.jugadoEn) {
        try {
          const currentPlayedAt = parseIsoDate(gameSession.jugadoEn) || new Date()
          const previousSession = await apiClient.getLatestGameSession(accessToken, GAME_ID_SUDOKU, {
            excludeSessionId: String(gameSession._id || ''),
          })

          const previousPlayedAt = parseIsoDate(previousSession?.jugadoEn)
          const currentSessionDayKey = getSessionDayKey(gameSession.jugadoEn)
          const previousSessionDayKey = getSessionDayKey(previousSession?.jugadoEn)
          const isSameSessionDay = currentSessionDayKey && previousSessionDayKey && currentSessionDayKey === previousSessionDayKey
          const elapsedMs = previousPlayedAt ? currentPlayedAt.getTime() - previousPlayedAt.getTime() : null
          const isWithinStreakWindow = elapsedMs !== null && elapsedMs <= STREAK_SESSION_WINDOW_MS

          const shouldReset = elapsedMs !== null && !isSameSessionDay && elapsedMs > STREAK_SESSION_WINDOW_MS
          const shouldIncrease = elapsedMs === null || shouldReset || (!isSameSessionDay && isWithinStreakWindow)

          if (shouldReset) {
            await apiClient.resetStreak(accessToken)
          }
          if (shouldIncrease) {
            await apiClient.increaseStreak(accessToken)
          }

          const refreshedProfile = await apiClient.getMyProfile(accessToken)
          const streak = Number(refreshedProfile?.rachaActual)
          if (!Number.isNaN(streak)) {
            setStreakMessage(`Racha actual: ${streak}`)
          }
        } catch (err) {
          console.warn('Error sincronizando racha:', err)
        }
      }

      return { recorded: true, newlyUnlockedAchievements }
    } catch (error) {
      console.warn('Error registrando actividad de Sudoku:', error)
      return { recorded: false, newlyUnlockedAchievements: [] }
    }
  }

  function getXpByDifficulty(score, difficulty) {
    const baseXp = Math.max(0, Math.floor(score / 10))
    const multipliers = {
      Principiante: 1.0,
      Iniciado: 1.2,
      Intermedio: 1.5,
      Avanzado: 1.8,
      Experto: 2.1,
      Profesional: 2.5,
    }
    const multiplier = multipliers[difficulty?.label] ?? 1.0
    return Math.max(1, Math.floor(baseXp * multiplier))
  }

  function getVirtualOpponentRating(difficulty) {
    const map = {
      Principiante: 300,
      Iniciado: 500,
      Intermedio: 700,
      Avanzado: 900,
      Experto: 1100,
      Profesional: 1300,
    }
    return map[difficulty?.label] ?? 700
  }

  function calculateExpectedScore(playerElo, opponentElo) {
    const diff = (opponentElo - playerElo) / 400
    return 1 / (1 + 10 ** diff)
  }

  function calculateEloDelta(playerElo, opponentElo, result) {
    const k = playerElo < 1200 ? 40 : playerElo < 1800 ? 30 : 20
    const expected = calculateExpectedScore(playerElo, opponentElo)
    const actual = result === 'victoria' ? 1 : result === 'derrota' ? 0 : 0.5
    const delta = Math.round(k * (actual - expected))
    return delta
  }

  function calculatePerformanceState({ seconds, errorCount, hintsUsed }, difficulty) {
    const timeFactor = Math.min(1, 1 - seconds / 900)
    const errorFactor = Math.max(0, 1 - errorCount / 30)
    const hintFactor = Math.max(0, 1 - hintsUsed / 10)
    const basePerformance = (timeFactor + errorFactor + hintFactor) / 3

    const difficultyPenalty = {
      Principiante: 0.0,
      Iniciado: 0.04,
      Intermedio: 0.08,
      Avanzado: 0.12,
      Experto: 0.16,
      Profesional: 0.20,
    }

    return Math.max(0, basePerformance - (difficultyPenalty[difficulty?.label] ?? 0.08))
  }

  async function handleSudokuCompletion(nextScore) {
    if (!isAuthenticated || !accessToken) return

    let gameSession = null
    let eloChange = 0
    let resultado = 'victoria'
    let xpGain = 0

    try {
      const stats = await apiClient.getMyGameStats(accessToken, GAME_ID_SUDOKU).catch(() => null)
      const currentElo = Number(stats?.elo || 0)
      const opponentElo = getVirtualOpponentRating(difficulty)
      const performance = calculatePerformanceState({ seconds, errorCount, hintsUsed }, difficulty)

      const isBadInPrincipiante = difficulty?.label === 'Principiante' && currentElo >= 500 && performance < 0.54
      resultado = performance < 0.5 || isBadInPrincipiante ? 'derrota' : 'victoria'

      eloChange = calculateEloDelta(currentElo, opponentElo, resultado)
      // ensure negative on very poor principiante with high elo
      if (difficulty?.label === 'Principiante' && performance < 0.35 && currentElo > 600) {
        eloChange = Math.min(-5, eloChange)
        resultado = 'derrota'
      }

      xpGain = getXpByDifficulty(nextScore, difficulty)

      gameSession = await apiClient.createGameSession(accessToken, {
        juegoId: GAME_ID_SUDOKU,
        puntaje: nextScore,
        resultado,
        cambioElo: eloChange,
        tiempo: seconds,
        seedId: undefined,
        seed,
      })

      await apiClient.addExperience(accessToken, xpGain)
    } catch (error) {
      console.warn('No se pudo persistir la sesion de Sudoku:', error)
    }

    await registerSudokuActivity(nextScore, gameSession)
    setStatus(`XP ganada: ${xpGain}. ELO cambio: ${eloChange} (${resultado}).`, true)
  }

  function startNewGame(nextDifficultyKey = difficultyKey) {
    const nextGame = buildGame(nextDifficultyKey)
    setDifficultyKey(nextDifficultyKey)
    setSolution(nextGame.solution)
    setPuzzle(nextGame.puzzle)
    setBoard(nextGame.board)
    setNotes(nextGame.notes)
    setSelectedCell(null)
    setNoteMode(false)
    setHighlightEnabled(true)
    setPaused(false)
    setCompleted(false)
    setSeconds(0)
    setErrorCount(0)
    setHintsUsed(0)
    setScore(0)
    setSeed(nextGame.seed)
    setGameStatus(`Selecciona una celda para comenzar. Limite de pistas: ${getHintLimit(nextGame.difficulty)}.`)
  }

  function finishGame(nextBoard = board) {
    const metrics = latestMetricsRef.current
    const nextScore = calculateScore({
      puzzle,
      board: nextBoard,
      solution,
      seconds: metrics.seconds,
      errorCount: metrics.errorCount,
      hintsUsed: metrics.hintsUsed,
      difficulty,
    })

    setCompleted(true)
    setScore(nextScore)
    setGameStatus(
      `Sudoku completado. Puntaje final: ${nextScore} (tiempo: ${metrics.seconds}s, errores: ${metrics.errorCount}, pistas: ${metrics.hintsUsed}).`,
      true,
    )

    void handleSudokuCompletion(nextScore)
  }

  useEffect(() => {
    startNewGame(difficultyLevels[2].key)
  }, [])

  useEffect(() => {
    latestMetricsRef.current = { seconds, errorCount, hintsUsed }
  }, [seconds, errorCount, hintsUsed])

  useEffect(() => {
    if (paused || completed || board.length === 0) return undefined

    const interval = window.setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [paused, completed, board.length])

  useEffect(() => {
    if (!board.length || completed || !solution.length) return
    if (!isBoardSolved(board, solution)) return
    finishGame(board)
  }, [board, completed, solution])

  useEffect(() => {
    function handleKeyDown(event) {
      if (!board.length) return

      if (event.key.toLowerCase() === 'p') {
        event.preventDefault()
        setPaused((current) => !current)
        return
      }

      if (paused || completed || !selectedCell) return

      const { row, col } = selectedCell
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setNoteMode((current) => !current)
        return
      }

      if (puzzle[row][col] !== 0) return

      if (/^[1-9]$/.test(event.key)) {
        event.preventDefault()
        applyValue(Number(event.key), event.shiftKey || noteMode)
        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        if (noteMode) {
          setNotes((currentNotes) => {
            const nextNotes = cloneNotes(currentNotes)
            clearNotesCell(nextNotes, row, col)
            return nextNotes
          })
          setGameStatus('Notas eliminadas.')
        } else {
          clearSelectedCell()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [board, completed, noteMode, paused, puzzle, selectedCell])

  function clearSelectedCell() {
    if (!selectedCell || paused || completed) return
    const { row, col } = selectedCell

    if (puzzle[row][col] !== 0) {
      setGameStatus('No puedes modificar una celda fija.')
      return
    }

    setBoard((currentBoard) => {
      const nextBoard = currentBoard.map((line) => [...line])
      nextBoard[row][col] = 0
      return nextBoard
    })

    setNotes((currentNotes) => {
      const nextNotes = cloneNotes(currentNotes)
      clearNotesCell(nextNotes, row, col)
      return nextNotes
    })

    setGameStatus('Celda borrada')
  }

  function handleNoteInput(num) {
    if (!selectedCell) return
    const { row, col } = selectedCell

    if (puzzle[row][col] !== 0) {
      setGameStatus('No puedes poner notas en una celda fija.')
      return
    }

    const invalidReason = noteViolatesCurrentBoard(board, row, col, num)
    if (invalidReason) {
      setGameStatus(`No puedes agregar la nota ${num}: ${invalidReason}.`)
      return
    }

    setNotes((currentNotes) => {
      const nextNotes = cloneNotes(currentNotes)
      const result = toggleNote(nextNotes, board, row, col, num)
      if (!result.ok) {
        setGameStatus(result.message || 'No se pudo actualizar la nota.')
        return currentNotes
      }

      setGameStatus(result.action === 'added' ? `Nota ${num} agregada.` : `Nota ${num} eliminada.`)
      return nextNotes
    })
  }

  function applyValue(num, asNote = false) {
    if (!selectedCell || paused || completed) return
    if (asNote) {
      handleNoteInput(num)
      return
    }

    const { row, col } = selectedCell

    if (puzzle[row][col] !== 0) {
      setGameStatus('No puedes modificar una celda fija.')
      return
    }

    setBoard((currentBoard) => {
      const previousValue = currentBoard[row][col]
      const nextBoard = currentBoard.map((line) => [...line])
      nextBoard[row][col] = num

      setNotes((currentNotes) => {
        const nextNotes = cloneNotes(currentNotes)
        clearNotesCell(nextNotes, row, col)

        if (num === solution[row][col]) {
          removeCandidateFromPeerNotes(nextNotes, row, col, num)
          revalidateAllNotes(puzzle, nextBoard, nextNotes)
        }

        return nextNotes
      })

      if (num !== solution[row][col]) {
        setErrorCount((current) => {
          const next = previousValue !== num ? current + 1 : current
          setGameStatus(`Numero incorrecto. Errores: ${next}.`)
          return next
        })
        return nextBoard
      }

      setGameStatus('Movimiento aplicado')
      return nextBoard
    })
  }

  function applyHint() {
    if (paused || completed) return

    const hintLimit = getHintLimit(difficulty)
    if (hintLimit <= 0) {
      setGameStatus('Esta dificultad no permite pistas.')
      return
    }

    if (hintsUsed >= hintLimit) {
      setGameStatus(`Ya alcanzaste el limite de ${hintLimit} pista(s) para esta dificultad.`)
      return
    }

    const result = getRandomHint(board, solution, seed + seconds + hintsUsed + 1)
    if (!result.ok) {
      setGameStatus(result.message)
      return
    }

    setBoard((currentBoard) => {
      const nextBoard = currentBoard.map((line) => [...line])
      nextBoard[result.row][result.col] = result.value
      return nextBoard
    })

    setNotes((currentNotes) => {
      const nextNotes = cloneNotes(currentNotes)
      clearNotesCell(nextNotes, result.row, result.col)
      removeCandidateFromPeerNotes(nextNotes, result.row, result.col, result.value)
      const hintedBoard = board.map((line) => [...line])
      hintedBoard[result.row][result.col] = result.value
      revalidateAllNotes(puzzle, hintedBoard, nextNotes)
      return nextNotes
    })

    setHintsUsed((current) => current + 1)
    setGameStatus(`Pista aplicada. Pistas usadas: ${hintsUsed + 1}/${hintLimit}.`)
  }

  const progress = puzzle.length
    ? calculateProgress(puzzle, board, solution)
    : { correct: 0, editable: 0, percentage: 0 }
  const correctCounts = solution.length ? countCorrectByNumber(board, solution) : Array(10).fill(0)
  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : 0
  const hintLimit = getHintLimit(difficulty)

  return (
    <main>
      <section className="games-list">
        <div className="game-header">
          <div>
            <p className="section-kicker">Simulacion base</p>
            <h1 className="sudoku-page-title">Sudoku listo para integrar en PvP</h1>
          </div>
          <span className="stat-chip">Jugador: tablero local</span>
        </div>

        <div className={`board-card sudoku-game-card${paused ? ' paused' : ''}`}>
          <div className="sudoku-top-row">
            <div className="difficulty-wrap">
              <label htmlFor="difficulty-select">Dificultad:</label>
              <select
                id="difficulty-select"
                className="difficulty-select"
                value={difficultyKey}
                onChange={(event) => startNewGame(event.target.value)}
              >
                {difficultyLevels.map((level, index) => (
                  <option key={level.key} value={level.key}>
                    {index + 1}. {level.label}
                  </option>
                ))}
              </select>
              <span className="difficulty-label">Dificultad: {difficulty.label}</span>
            </div>

            <div className="sudoku-top-right">
              <span className="timer-display">{formatTime(seconds)}</span>
              <span className="stat-chip">Errores: {errorCount}</span>
              <span className="stat-chip">Pistas: {hintsUsed}</span>
              <button className="btn ghost btn-pause" type="button" onClick={() => setPaused((current) => !current)}>
                {paused ? 'Reanudar' : 'Pausar'}
              </button>
              <button className="btn btn-new-game" type="button" onClick={() => startNewGame(difficultyKey)}>
                Nuevo Juego
              </button>
            </div>
          </div>

          <div className="sudoku-main">
            <div className="sudoku-grid-wrap">
              <div className="board" role="grid" aria-label="Tablero Sudoku">
                {board.map((rowValues, rowIndex) =>
                  rowValues.map((value, colIndex) => {
                    const isPrefilled = puzzle[rowIndex]?.[colIndex] !== 0
                    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                    const isPeer =
                      highlightEnabled &&
                      selectedCell &&
                      (selectedCell.row === rowIndex || selectedCell.col === colIndex)
                    const isSameValue =
                      highlightEnabled && selectedValue !== 0 && value !== 0 && value === selectedValue
                    const isError = !isPrefilled && value !== 0 && solution[rowIndex]?.[colIndex] !== value

                    const classNames = [
                      'cell',
                      isPrefilled ? 'prefilled' : '',
                      isSelected ? 'selected' : '',
                      isPeer ? 'highlight-peer' : '',
                      isSameValue ? 'highlight-same' : '',
                      isError ? 'error' : '',
                      notes[rowIndex]?.[colIndex]?.size ? 'has-notes' : '',
                      (colIndex + 1) % 3 === 0 && colIndex !== 8 ? 'block-right' : '',
                      (rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? 'block-bottom' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')

                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        className={classNames}
                        type="button"
                        onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                      >
                        {value !== 0 ? (
                          <span>{value}</span>
                        ) : notes[rowIndex]?.[colIndex]?.size ? (
                          <div className="notes-grid">
                            {Array.from({ length: 9 }, (_, offset) => offset + 1).map((note) => (
                              <div
                                key={note}
                                className={`note${selectedValue !== 0 && note === selectedValue ? ' highlight-same-note' : ''}`}
                              >
                                {notes[rowIndex][colIndex].has(note) ? note : ''}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </button>
                    )
                  }),
                )}
              </div>
            </div>

            <div className="sudoku-controls">
              <div className="keypad-nums" aria-label="Teclado numerico">
                {Array.from({ length: 9 }, (_, index) => index + 1).map((num) => {
                  const unavailable = correctCounts[num] >= 9
                  return (
                    <button
                      key={num}
                      className={`chip number${unavailable ? ' num-unavailable' : ''}`}
                      type="button"
                      disabled={unavailable}
                      onClick={() => applyValue(num, noteMode)}
                    >
                      {num}
                    </button>
                  )
                })}
              </div>

              <div className="board-actions controls icon-actions">
                <button id="clear-cell" className="btn-control btn-icon-circle" type="button" onClick={clearSelectedCell}>
                  <span className="btn-icon" aria-hidden="true">
                    CLR
                  </span>
                </button>
                <button
                  id="toggle-notes"
                  className={`btn-control btn-icon-circle${noteMode ? ' active' : ''}`}
                  type="button"
                  aria-pressed={noteMode}
                  onClick={() => {
                    if (paused || completed) return
                    setNoteMode((current) => !current)
                    setGameStatus(!noteMode ? 'Modo notas: ACTIVADO.' : 'Modo notas: desactivado')
                  }}
                >
                  <span className="btn-icon-badge notes-badge">{noteMode ? 'ON' : 'OFF'}</span>
                  <span className="btn-icon" aria-hidden="true">
                    N
                  </span>
                </button>
                <button id="hint" className="btn-control btn-icon-circle" type="button" onClick={applyHint}>
                  <span className="btn-icon-badge hint-badge">{hintsUsed}</span>
                  <span className="btn-icon" aria-hidden="true">
                    H
                  </span>
                </button>
              </div>

              <div className="board-actions controls notes-actions">
                <button
                  id="toggle-highlights"
                  className={`btn-control${highlightEnabled ? ' active' : ''}`}
                  type="button"
                  aria-pressed={highlightEnabled}
                  onClick={() => {
                    if (paused || completed) return
                    setHighlightEnabled((current) => !current)
                  }}
                >
                  Resaltar: {highlightEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          <div className="sudoku-bottom">
            <div className="progress-wrapper" aria-label="Progreso del tablero">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
              </div>
              <p className="progress-text">
                {progress.correct}/{progress.editable} celdas correctas ({progress.percentage}%)
              </p>
            </div>

            <p className={`status${statusOk ? ' ok' : ''}`}>{status}</p>
            <p className="mode-copy">Seed: {seed} | Pistas maximas: {hintLimit} | Atajos: `N` notas, `P` pausa.</p>
          </div>
        </div>
      </section>

      {paused ? (
        <div className="sudoku-pause-overlay" role="dialog" aria-modal="true">
          <div className="sudoku-pause-card">
            <h3 className="sudoku-pause-title">Juego en pausa</h3>
            <p className="sudoku-pause-text">El tiempo esta detenido. Presiona reanudar para continuar.</p>
            <button className="btn primary sudoku-pause-resume-btn" type="button" onClick={() => setPaused(false)}>
              Reanudar
            </button>
          </div>
        </div>
      ) : null}

      {completed ? (
        <div className="sudoku-pause-overlay" role="alertdialog" aria-modal="true">
          <div className="sudoku-pause-card sudoku-completion-card">
            <h3 className="sudoku-pause-title">Sudoku completado</h3>
            <p className="sudoku-pause-text">Puntaje: {score}</p>
            <p className="sudoku-pause-text">
              Tiempo: {formatTime(seconds)} | Errores: {errorCount} | Pistas: {hintsUsed}
            </p>
            <button className="btn primary sudoku-pause-resume-btn" type="button" onClick={() => startNewGame(difficultyKey)}>
              Jugar otra vez
            </button>
          </div>
        </div>
      ) : null}

      {streakMessage ? (
        <div className="sudoku-streak-note" role="status" aria-live="polite">
          {streakMessage}
        </div>
      ) : null}

      {showAchievementPopup ? (
        <div className="sudoku-pause-overlay" role="dialog" aria-modal="true">
          <div className="sudoku-pause-card sudoku-completion-card">
            <h3 className="sudoku-pause-title">Logros desbloqueados</h3>
            <ul>
              {achievementPopupItems.map((item) => (
                <li key={item.key}>
                  <strong>{item.icon}</strong> {item.title} - {item.description}
                </li>
              ))}
            </ul>
            <button className="btn primary sudoku-pause-resume-btn" type="button" onClick={() => setShowAchievementPopup(false)}>
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default SudokuPage
