export function createInitialBoard() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 !== 1) continue; // only dark squares are playable
      if (row <= 2) board[row][col] = { p: "player2", k: false };
      else if (row >= 5) board[row][col] = { p: "player1", k: false };
    }
  }
  return board;
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function forwardDirs(player, king) {
  if (king) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  return player === "player1" ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
}

export function getPieceMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return { simple: [], captures: [] };
  const dirs = forwardDirs(piece.p, piece.k);
  const simple = [];
  const captures = [];

  for (const [dr, dc] of dirs) {
    const nr = row + dr, nc = col + dc;
    if (inBounds(nr, nc) && !board[nr][nc]) {
      simple.push({ from: { row, col }, to: { row: nr, col: nc }, captured: null });
    }
    const jr = row + 2 * dr, jc = col + 2 * dc;
    if (
      inBounds(nr, nc) &&
      inBounds(jr, jc) &&
      board[nr][nc] &&
      board[nr][nc].p !== piece.p &&
      !board[jr][jc]
    ) {
      captures.push({ from: { row, col }, to: { row: jr, col: jc }, captured: { row: nr, col: nc } });
    }
  }
  return { simple, captures };
}

// Returns the full legal move list for a player this turn, respecting
// mandatory capture rules. If forcedSquare is given (mid multi-jump),
// only that piece's further captures are returned.
export function getAllMovesForPlayer(board, player, forcedSquare = null) {
  let allCaptures = [];
  let allSimple = [];
  const squares = forcedSquare ? [forcedSquare] : [];

  if (!forcedSquare) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.p === player) squares.push({ row: r, col: c });
      }
    }
  }

  for (const sq of squares) {
    const { simple, captures } = getPieceMoves(board, sq.row, sq.col);
    allSimple.push(...simple);
    allCaptures.push(...captures);
  }

  if (allCaptures.length > 0) return allCaptures; // mandatory capture rule
  if (forcedSquare) return []; // multi-jump ended, no more captures for this piece
  return allSimple;
}

export function applyMove(board, move) {
  const newBoard = board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
  const piece = newBoard[move.from.row][move.from.col];
  newBoard[move.from.row][move.from.col] = null;
  if (move.captured) newBoard[move.captured.row][move.captured.col] = null;

  let king = piece.k;
  if (!king) {
    if (piece.p === "player1" && move.to.row === 0) king = true;
    if (piece.p === "player2" && move.to.row === 7) king = true;
  }
  newBoard[move.to.row][move.to.col] = { p: piece.p, k: king };
  return newBoard;
}

export function hasAnyMoves(board, player) {
  return getAllMovesForPlayer(board, player).length > 0;
}

export function checkWinner(board, playerToMove) {
  if (!hasAnyMoves(board, playerToMove)) {
    return playerToMove === "player1" ? "player2" : "player1";
  }
  return null;
}

export function squareLabel(row, col) {
  return `${String.fromCharCode(97 + col)}${8 - row}`;
}