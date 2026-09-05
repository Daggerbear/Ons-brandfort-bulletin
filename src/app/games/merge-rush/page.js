"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import GameSponsorBanner from "@/components/GameSponsorBanner";

const SIZE = 4;

const TILE_COLORS = {
  2: "bg-neutral-800 text-neutral-200",
  4: "bg-neutral-700 text-neutral-100",
  8: "bg-orange-700 text-white",
  16: "bg-orange-600 text-white",
  32: "bg-orange-500 text-white",
  64: "bg-pink-600 text-white",
  128: "bg-pink-500 text-white",
  256: "bg-purple-600 text-white",
  512: "bg-purple-500 text-white",
  1024: "bg-cyan-600 text-white",
  2048: "bg-cyan-400 text-black",
};

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function getEmptyCells(grid) {
  const cells = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) cells.push([r, c]);
  return cells;
}

function addRandomTile(grid) {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newGrid = grid.map((row) => [...row]);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

function slideRowLeft(row) {
  const filtered = row.filter((v) => v !== 0);
  let scoreGain = 0;
  const merged = [];
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      merged.push(val);
      scoreGain += val;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, scoreGain };
}

function rotateGrid(grid) {
  const newGrid = emptyGrid();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) newGrid[c][SIZE - 1 - r] = grid[r][c];
  return newGrid;
}

function move(grid, direction) {
  let g = grid.map((row) => [...row]);
  let rotations = { up: 3, right: 2, down: 1, left: 0 }[direction];
  for (let i = 0; i < rotations; i++) g = rotateGrid(g);

  let totalGain = 0;
  let moved = false;
  const result = g.map((row) => {
    const { row: newRow, scoreGain } = slideRowLeft(row);
    if (newRow.some((v, i) => v !== row[i])) moved = true;
    totalGain += scoreGain;
    return newRow;
  });

  let finalGrid = result;
  for (let i = 0; i < (4 - rotations) % 4; i++) finalGrid = rotateGrid(finalGrid);

  return { grid: finalGrid, scoreGain: totalGain, moved };
}

function canMove(grid) {
  if (getEmptyCells(grid).length > 0) return true;
  for (const dir of ["up", "down", "left", "right"]) {
    if (move(grid, dir).moved) return true;
  }
  return false;
}

export default function MergeRush() {
  const [grid, setGrid] = useState(emptyGrid());
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  const gridRef = useRef(grid);
  const scoreRef = useRef(0);
  const playingRef = useRef(false);
  const touchStart = useRef(null);
  const wonRef = useRef(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from("merge_rush_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);
    setLeaderboard(data || []);
  }

  function startGame() {
    let g = addRandomTile(emptyGrid());
    g = addRandomTile(g);
    gridRef.current = g;
    scoreRef.current = 0;
    wonRef.current = false;
    setGrid(g);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setScoreSaved(false);
    setPlayerName("");
    setPlaying(true);
    playingRef.current = true;
  }

  function handleMove(direction) {
    if (!playingRef.current) return;
    const { grid: newGrid, scoreGain, moved } = move(gridRef.current, direction);
    if (!moved) return;

    const withNewTile = addRandomTile(newGrid);
    gridRef.current = withNewTile;
    scoreRef.current += scoreGain;
    setGrid(withNewTile);
    setScore(scoreRef.current);

    if (!wonRef.current && withNewTile.some((row) => row.some((v) => v >= 2048))) {
      wonRef.current = true;
      setWon(true);
    }

    if (!canMove(withNewTile)) {
      endGame();
    }
  }

  function endGame() {
    playingRef.current = false;
    setPlaying(false);
    setGameOver(true);
  }

  async function saveScore() {
    if (!playerName.trim() || scoreSaved) return;
    await supabase.from("merge_rush_scores").insert({
      player_name: playerName.trim(),
      score,
    });
    setScoreSaved(true);
    fetchLeaderboard();
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleTouchStart(e) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
      if (Math.abs(dx) > Math.abs(dy)) {
        handleMove(dx > 0 ? "right" : "left");
      } else {
        handleMove(dy > 0 ? "down" : "up");
      }
    }
    touchStart.current = null;
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center">
      <h1
        className="text-3xl font-black text-center mb-1 tracking-widest uppercase"
        style={{
          background: "linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Merge Rush
      </h1>
      <p className="text-neutral-500 text-sm mb-4 tracking-wide uppercase">
        🔢 Swipe or use buttons — reach 2048
      </p>

      {!playing && !gameOver && (
        <button
          onClick={startGame}
          className="bg-cyan-500 hover:bg-cyan-400 transition text-black font-bold rounded-lg px-8 py-4 uppercase mb-6"
        >
          Start Game
        </button>
      )}

      {playing && (
        <p className="text-neutral-400 text-sm mb-3">
          Score: <span className="text-cyan-400 font-bold">{score}</span>
          {won && <span className="text-green-400 ml-2">🎉 2048 reached!</span>}
        </p>
      )}

      {gameOver && (
        <div className="text-center mb-6 w-full max-w-xs">
          <p className="text-xl mb-3">
            {won ? "🏆" : "💀"} Game Over — {score} pts
          </p>
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
            onClick={startGame}
            className="bg-cyan-500 hover:bg-cyan-400 transition text-black font-bold rounded-lg px-6 py-3 uppercase text-sm"
          >
            Play Again
          </button>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="grid grid-cols-4 gap-2 border-2 border-purple-500 rounded-2xl p-3 bg-neutral-950 touch-none"
        style={{ width: "min(90vw, 340px)" }}
      >
        {grid.flat().map((val, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
              val ? TILE_COLORS[val] || "bg-cyan-300 text-black" : "bg-neutral-900"
            }`}
          >
            {val !== 0 ? val : ""}
          </div>
        ))}
      </div>

      {(playing || gameOver === false) && playing && (
        <div className="mt-5 grid grid-cols-3 gap-2" style={{ width: "min(90vw, 220px)" }}>
          <div />
          <button
            onClick={() => handleMove("up")}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            ↑
          </button>
          <div />
          <button
            onClick={() => handleMove("left")}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            ←
          </button>
          <button
            onClick={() => handleMove("down")}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            ↓
          </button>
          <button
            onClick={() => handleMove("right")}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            →
          </button>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="mt-8 w-full max-w-xs">
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

      <GameSponsorBanner gameSlug="merge-rush" />

      <Link href="/games" className="text-neutral-600 hover:text-white underline mt-8 text-sm">
        ← Back to Game Room
      </Link>
    </main>
  );
}