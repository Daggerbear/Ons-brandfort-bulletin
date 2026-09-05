"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import GameSponsorBanner from "@/components/GameSponsorBanner";

const MAZE_TEMPLATE = [
  "###########",
  "#.........#",
  "#.##...##.#",
  "#.........#",
  "#.##...##.#",
  "#.........#",
  "#####.#####",
  "#.G.G.G...#",
  "#####.#####",
  "#.........#",
  "#.##...##.#",
  "#....P....#",
  "###########",
];

const ROWS = MAZE_TEMPLATE.length;
const COLS = MAZE_TEMPLATE[0].length;
const SPEED_MS = 260;
const GHOST_COLORS = ["#ec4899", "#22d3ee", "#a855f7"];

function parseMaze() {
  const wallGrid = [];
  const dotSet = new Set();
  let playerStart = { x: 5, y: 11 };
  const ghostStarts = [];

  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const ch = MAZE_TEMPLATE[r][c];
      if (ch === "#") {
        row.push("wall");
      } else {
        row.push("open");
        if (ch === ".") dotSet.add(`${r},${c}`);
        if (ch === "P") playerStart = { x: c, y: r };
        if (ch === "G") ghostStarts.push({ x: c, y: r });
      }
    }
    wallGrid.push(row);
  }

  return { wallGrid, dotSet, playerStart, ghostStarts };
}

const {
  wallGrid: WALLS,
  dotSet: INITIAL_DOTS,
  playerStart: PLAYER_START,
  ghostStarts: GHOST_STARTS,
} = parseMaze();

function isWall(x, y) {
  if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return true;
  return WALLS[y][x] === "wall";
}

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export default function GhostChase() {
  const [player, setPlayer] = useState(PLAYER_START);
  const [ghosts, setGhosts] = useState(
    GHOST_STARTS.map((g, i) => ({ ...g, color: GHOST_COLORS[i % GHOST_COLORS.length] }))
  );
  const [dots, setDots] = useState(new Set(INITIAL_DOTS));
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  const dirRef = useRef({ x: 0, y: 0 });
  const playerRef = useRef(PLAYER_START);
  const ghostsRef = useRef(ghosts);
  const dotsRef = useRef(new Set(INITIAL_DOTS));
  const scoreRef = useRef(0);
  const playingRef = useRef(false);
  const loopRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from("ghost_chase_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);
    setLeaderboard(data || []);
  }

  function setDir(d) {
    if (!playingRef.current) return;
    dirRef.current = DIRS[d];
  }

  function ghostMove(ghost) {
    const options = ["up", "down", "left", "right"]
      .map((k) => ({ key: k, ...DIRS[k] }))
      .filter((d) => !isWall(ghost.x + d.x, ghost.y + d.y));

    if (options.length === 0) return ghost;

    let choice;
    if (Math.random() < 0.6) {
      const p = playerRef.current;
      options.sort(
        (a, b) =>
          Math.abs(ghost.x + a.x - p.x) + Math.abs(ghost.y + a.y - p.y) -
          (Math.abs(ghost.x + b.x - p.x) + Math.abs(ghost.y + b.y - p.y))
      );
      choice = options[0];
    } else {
      choice = options[Math.floor(Math.random() * options.length)];
    }

    return { ...ghost, x: ghost.x + choice.x, y: ghost.y + choice.y };
  }

  function tick() {
    const dir = dirRef.current;
    let p = playerRef.current;
    if (dir.x !== 0 || dir.y !== 0) {
      const nx = p.x + dir.x;
      const ny = p.y + dir.y;
      if (!isWall(nx, ny)) {
        p = { x: nx, y: ny };
        playerRef.current = p;
        setPlayer(p);
      }
    }

    const key = `${p.y},${p.x}`;
    if (dotsRef.current.has(key)) {
      dotsRef.current.delete(key);
      scoreRef.current += 10;
      setScore(scoreRef.current);
      setDots(new Set(dotsRef.current));
      if (dotsRef.current.size === 0) {
        endGame(true);
        return;
      }
    }

    const newGhosts = ghostsRef.current.map(ghostMove);
    ghostsRef.current = newGhosts;
    setGhosts(newGhosts);

    if (newGhosts.some((g) => g.x === p.x && g.y === p.y)) {
      endGame(false);
    }
  }

  function startGame() {
    clearInterval(loopRef.current);
    playerRef.current = PLAYER_START;
    ghostsRef.current = GHOST_STARTS.map((g, i) => ({
      ...g,
      color: GHOST_COLORS[i % GHOST_COLORS.length],
    }));
    dotsRef.current = new Set(INITIAL_DOTS);
    scoreRef.current = 0;
    dirRef.current = { x: 0, y: 0 };

    setPlayer(PLAYER_START);
    setGhosts(ghostsRef.current);
    setDots(new Set(INITIAL_DOTS));
    setScore(0);
    setGameOver(false);
    setWon(false);
    setScoreSaved(false);
    setPlayerName("");
    setPlaying(true);
    playingRef.current = true;

    loopRef.current = setInterval(tick, SPEED_MS);
  }

  function endGame(didWin) {
    clearInterval(loopRef.current);
    playingRef.current = false;
    setPlaying(false);
    setGameOver(true);
    setWon(didWin);
  }

  async function saveScore() {
    if (!playerName.trim() || scoreSaved) return;
    await supabase.from("ghost_chase_scores").insert({
      player_name: playerName.trim(),
      score: scoreRef.current,
    });
    setScoreSaved(true);
    fetchLeaderboard();
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowUp") setDir("up");
      if (e.key === "ArrowDown") setDir("down");
      if (e.key === "ArrowLeft") setDir("left");
      if (e.key === "ArrowRight") setDir("right");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    return () => clearInterval(loopRef.current);
  }, []);

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
        Ghost Chase
      </h1>
      <p className="text-neutral-500 text-sm mb-4 tracking-wide uppercase">
        👻 Eat every dot, dodge the ghosts
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
        </p>
      )}

      {gameOver && (
        <div className="text-center mb-6 w-full max-w-xs">
          <p className="text-xl mb-3">
            {won ? "🏆 Cleared!" : "👻 Caught!"} — {score} pts
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
        className="grid bg-neutral-950 border-2 border-purple-500"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          width: "min(90vw, 330px)",
          aspectRatio: `${COLS} / ${ROWS}`,
        }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const x = i % COLS;
          const y = Math.floor(i / COLS);
          const wall = isWall(x, y);
          const hasDot = dots.has(`${y},${x}`);
          const isPlayer = player.x === x && player.y === y;
          const ghost = ghosts.find((g) => g.x === x && g.y === y);

          return (
            <div
              key={i}
              className={`flex items-center justify-center ${
                wall ? "bg-neutral-900" : "bg-neutral-950"
              }`}
            >
              {isPlayer && <div className="w-3/5 h-3/5 rounded-full bg-yellow-400" />}
              {!isPlayer && ghost && (
                <div
                  className="w-3/5 h-3/5 rounded-full"
                  style={{ backgroundColor: ghost.color }}
                />
              )}
              {!isPlayer && !ghost && hasDot && (
                <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              )}
            </div>
          );
        })}
      </div>

      {playing && (
        <div className="mt-5 grid grid-cols-3 gap-2" style={{ width: "min(90vw, 220px)" }}>
          <div />
          <button
            onClick={() => setDir("up")}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            ↑
          </button>
          <div />
          <button
            onClick={() => setDir("left")}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            ←
          </button>
          <button
            onClick={() => setDir("down")}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            ↓
          </button>
          <button
            onClick={() => setDir("right")}
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

      <GameSponsorBanner gameSlug="ghost-chase" />

      <Link href="/games" className="text-neutral-600 hover:text-white underline mt-8 text-sm">
        ← Back to Game Room
      </Link>
    </main>
  );
}