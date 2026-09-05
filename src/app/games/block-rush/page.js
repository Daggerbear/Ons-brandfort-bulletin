"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import GameSponsorBanner from "@/components/GameSponsorBanner";

const COLS = 10;
const ROWS = 20;

const SHAPES = {
  I: {
    color: "bg-cyan-500",
    states: [
      [[0,1],[1,1],[2,1],[3,1]],
      [[2,0],[2,1],[2,2],[2,3]],
      [[0,2],[1,2],[2,2],[3,2]],
      [[1,0],[1,1],[1,2],[1,3]],
    ],
  },
  O: {
    color: "bg-yellow-400",
    states: [
      [[1,0],[2,0],[1,1],[2,1]],
      [[1,0],[2,0],[1,1],[2,1]],
      [[1,0],[2,0],[1,1],[2,1]],
      [[1,0],[2,0],[1,1],[2,1]],
    ],
  },
  T: {
    color: "bg-purple-500",
    states: [
      [[1,0],[0,1],[1,1],[2,1]],
      [[1,0],[1,1],[2,1],[1,2]],
      [[0,1],[1,1],[2,1],[1,2]],
      [[1,0],[0,1],[1,1],[1,2]],
    ],
  },
  S: {
    color: "bg-green-500",
    states: [
      [[1,0],[2,0],[0,1],[1,1]],
      [[1,0],[1,1],[2,1],[2,2]],
      [[1,0],[2,0],[0,1],[1,1]],
      [[1,0],[1,1],[2,1],[2,2]],
    ],
  },
  Z: {
    color: "bg-red-500",
    states: [
      [[0,0],[1,0],[1,1],[2,1]],
      [[2,0],[1,1],[2,1],[1,2]],
      [[0,0],[1,0],[1,1],[2,1]],
      [[2,0],[1,1],[2,1],[1,2]],
    ],
  },
  J: {
    color: "bg-blue-500",
    states: [
      [[0,0],[0,1],[1,1],[2,1]],
      [[1,0],[2,0],[1,1],[1,2]],
      [[0,1],[1,1],[2,1],[2,2]],
      [[1,0],[1,1],[0,2],[1,2]],
    ],
  },
  L: {
    color: "bg-orange-500",
    states: [
      [[2,0],[0,1],[1,1],[2,1]],
      [[1,0],[1,1],[1,2],[2,2]],
      [[0,1],[1,1],[2,1],[0,2]],
      [[0,0],[1,0],[1,1],[1,2]],
    ],
  },
};

const SHAPE_KEYS = Object.keys(SHAPES);
const WALL_KICKS = [0, -1, 1, -2, 2];

function randomKey() {
  return SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
}

function spawnPiece(key) {
  return { key, rotation: 0, x: 3, y: -1, color: SHAPES[key].color };
}

function getBlocks(piece) {
  const state = SHAPES[piece.key].states[piece.rotation];
  return state.map(([lx, ly]) => ({ x: piece.x + lx, y: piece.y + ly }));
}

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function collides(board, blocks) {
  return blocks.some(
    ({ x, y }) =>
      x < 0 ||
      x >= COLS ||
      y >= ROWS ||
      (y >= 0 && board[y][x] !== null)
  );
}

export default function BlockRush() {
  const [board, setBoard] = useState(emptyBoard());
  const [piece, setPieceState] = useState(() => spawnPiece(randomKey()));
  const [nextKey, setNextKey] = useState(randomKey());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  const boardRef = useRef(board);
  const pieceRef = useRef(piece);
  const nextKeyRef = useRef(nextKey);
  const gameOverRef = useRef(gameOver);
  const pausedRef = useRef(paused);
  const dropInterval = useRef(null);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { pieceRef.current = piece; }, [piece]);
  useEffect(() => { nextKeyRef.current = nextKey; }, [nextKey]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  function setPiece(p) {
    pieceRef.current = p;
    setPieceState(p);
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from("block_rush_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);
    setLeaderboard(data || []);
  }

  async function saveScore() {
    if (!playerName.trim() || scoreSaved) return;
    await supabase.from("block_rush_scores").insert({
      player_name: playerName.trim(),
      score,
    });
    setScoreSaved(true);
    fetchLeaderboard();
  }

  function move(dx, dy) {
    if (gameOverRef.current || pausedRef.current) return false;
    const current = pieceRef.current;
    const moved = { ...current, x: current.x + dx, y: current.y + dy };
    if (collides(boardRef.current, getBlocks(moved))) return false;
    setPiece(moved);
    return true;
  }

  function doRotate() {
    if (gameOverRef.current || pausedRef.current) return;
    const current = pieceRef.current;
    const nextRotation = (current.rotation + 1) % 4;

    for (const kick of WALL_KICKS) {
      const attempt = { ...current, rotation: nextRotation, x: current.x + kick };
      if (!collides(boardRef.current, getBlocks(attempt))) {
        setPiece(attempt);
        return;
      }
    }
  }

  function lockPieceAt(pieceToLock) {
    const currentBoard = boardRef.current;
    const newBoard = currentBoard.map((row) => [...row]);
    getBlocks(pieceToLock).forEach(({ x, y }) => {
      if (y >= 0) newBoard[y][x] = pieceToLock.color;
    });

    let cleared = 0;
    const filtered = newBoard.filter((row) => {
      const full = row.every((cell) => cell !== null);
      if (full) cleared++;
      return !full;
    });
    while (filtered.length < ROWS) filtered.unshift(Array(COLS).fill(null));

    if (cleared > 0) setScore((s) => s + cleared * 100);

    const next = spawnPiece(nextKeyRef.current);

    if (collides(filtered, getBlocks(next))) {
      setBoard(filtered);
      boardRef.current = filtered;
      setGameOver(true);
      gameOverRef.current = true;
      return;
    }

    setBoard(filtered);
    boardRef.current = filtered;
    setPiece(next);
    const newNext = randomKey();
    setNextKey(newNext);
    nextKeyRef.current = newNext;
  }

  function softDrop() {
    if (gameOverRef.current || pausedRef.current) return;
    const current = pieceRef.current;
    const moved = { ...current, y: current.y + 1 };
    if (collides(boardRef.current, getBlocks(moved))) {
      lockPieceAt(current);
    } else {
      setPiece(moved);
    }
  }

  function hardDrop() {
    if (gameOverRef.current || pausedRef.current) return;
    const current = pieceRef.current;
    let dy = 0;
    while (!collides(boardRef.current, getBlocks({ ...current, y: current.y + dy + 1 }))) {
      dy++;
    }
    lockPieceAt({ ...current, y: current.y + dy });
  }

  useEffect(() => {
    if (gameOver || paused) return;
    dropInterval.current = setInterval(() => {
      softDrop();
    }, 700);
    return () => clearInterval(dropInterval.current);
  }, [gameOver, paused]);

  function resetGame() {
    const newBoard = emptyBoard();
    const newPiece = spawnPiece(randomKey());
    const newNext = randomKey();
    setBoard(newBoard);
    boardRef.current = newBoard;
    setPiece(newPiece);
    setNextKey(newNext);
    nextKeyRef.current = newNext;
    setScore(0);
    setGameOver(false);
    gameOverRef.current = false;
    setPaused(false);
    pausedRef.current = false;
    setScoreSaved(false);
    setPlayerName("");
  }

  const displayBoard = board.map((row) => [...row]);
  getBlocks(piece).forEach(({ x, y }) => {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) displayBoard[y][x] = piece.color;
  });

  return (
    <main className="min-h-screen bg-black text-white px-4 py-4 flex flex-col items-center overflow-hidden">
      <h1
        className="text-2xl font-black text-center mb-1 tracking-widest uppercase"
        style={{
          background: "linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Block Rush
      </h1>
      <p className="text-neutral-500 text-sm mb-2">Score: {score}</p>

      {gameOver && (
        <div className="text-center mb-3 w-full max-w-xs">
          <p className="text-xl mb-2">💀 Game Over — {score} pts</p>
          {!scoreSaved ? (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button
                onClick={saveScore}
                className="bg-purple-600 hover:bg-purple-500 transition text-white text-sm font-semibold rounded-lg px-4 py-2"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-green-400 text-sm mb-3">✓ Score saved!</p>
          )}
          <button
            onClick={resetGame}
            className="bg-cyan-500 hover:bg-cyan-400 transition text-black font-bold rounded-lg px-6 py-2 uppercase text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      <div
        className="grid border-2 border-purple-500"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          width: "min(60vw, 220px)",
          height: "min(56vh, 440px)",
        }}
      >
        {displayBoard.map((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              className={`border border-neutral-900 ${cell || "bg-neutral-950"}`}
            />
          ))
        )}
      </div>

      {!gameOver && (
        <>
          <div className="grid grid-cols-3 gap-2 mt-3" style={{ width: "min(90vw, 300px)" }}>
            <button
              onClick={() => move(-1, 0)}
              className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-lg hover:bg-purple-900 transition"
            >
              ←
            </button>
            <button
              onClick={doRotate}
              className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-lg hover:bg-purple-900 transition"
            >
              ⟳
            </button>
            <button
              onClick={() => move(1, 0)}
              className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-lg hover:bg-purple-900 transition"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2" style={{ width: "min(90vw, 300px)" }}>
            <button
              onClick={softDrop}
              className="py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-semibold hover:bg-purple-900 transition"
            >
              ↓ Soft Drop
            </button>
            <button
              onClick={hardDrop}
              className="py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-semibold hover:bg-purple-900 transition"
            >
              ⇓ Hard Drop
            </button>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="mt-2 text-sm text-neutral-500 hover:text-white underline"
          >
            {paused ? "Resume" : "Pause"}
          </button>
        </>
      )}

      {leaderboard.length > 0 && (
        <div className="mt-6 w-full max-w-xs">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-2 text-center">
            🏆 Top Scores
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.id}
                className="flex justify-between px-3 py-2 text-sm border-b border-neutral-800 last:border-0"
              >
                <span className="text-neutral-300">
                  {i + 1}. {entry.player_name}
                </span>
                <span className="text-cyan-400 font-semibold">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <GameSponsorBanner gameSlug="block-rush" />

      <Link href="/games" className="text-neutral-600 hover:text-white underline mt-6 text-xs">
        ← Back to Game Room
      </Link>
    </main>
  );
}