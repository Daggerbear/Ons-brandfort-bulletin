"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import GameSponsorBanner from "@/components/GameSponsorBanner";

const GRID = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }];
const INITIAL_DIR = { x: 1, y: 0 };
const SPEED_MS = 180;

function randomFood(snake) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function Snake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(() => randomFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  const dirRef = useRef(INITIAL_DIR);
  const snakeRef = useRef(INITIAL_SNAKE);
  const foodRef = useRef(food);
  const playingRef = useRef(false);
  const loopRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from("snake_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);
    setLeaderboard(data || []);
  }

  function setDir(newDir) {
    if (!playingRef.current) return;
    const cur = dirRef.current;
    if (cur.x === -newDir.x && cur.y === -newDir.y) return;
    dirRef.current = newDir;
  }

  const tick = useCallback(() => {
    const cur = snakeRef.current;
    const dir = dirRef.current;
    const head = { x: cur[0].x + dir.x, y: cur[0].y + dir.y };

    if (
      head.x < 0 ||
      head.x >= GRID ||
      head.y < 0 ||
      head.y >= GRID ||
      cur.some((s) => s.x === head.x && s.y === head.y)
    ) {
      endGame();
      return;
    }

    let newSnake = [head, ...cur];
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((s) => s + 10);
      const nf = randomFood(newSnake);
      foodRef.current = nf;
      setFood(nf);
    } else {
      newSnake = newSnake.slice(0, -1);
    }

    snakeRef.current = newSnake;
    setSnake(newSnake);
  }, []);

  function startGame() {
    clearInterval(loopRef.current);
    clearInterval(countdownRef.current);

    const initial = [{ x: 7, y: 7 }];
    snakeRef.current = initial;
    dirRef.current = { x: 1, y: 0 };
    const nf = randomFood(initial);
    foodRef.current = nf;
    setSnake(initial);
    setFood(nf);
    setScore(0);
    setGameOver(false);
    setScoreSaved(false);
    setPlayerName("");
    setPlaying(false);
    playingRef.current = false;

    let count = 3;
    setCountdown(count);
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(countdownRef.current);
        setCountdown(null);
        setPlaying(true);
        playingRef.current = true;
        loopRef.current = setInterval(tick, SPEED_MS);
      } else {
        setCountdown(count);
      }
    }, 700);
  }

  function endGame() {
    clearInterval(loopRef.current);
    playingRef.current = false;
    setPlaying(false);
    setGameOver(true);
  }

  async function saveScore() {
    if (!playerName.trim() || scoreSaved) return;
    await supabase.from("snake_scores").insert({
      player_name: playerName.trim(),
      score,
    });
    setScoreSaved(true);
    fetchLeaderboard();
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowUp") setDir({ x: 0, y: -1 });
      if (e.key === "ArrowDown") setDir({ x: 0, y: 1 });
      if (e.key === "ArrowLeft") setDir({ x: -1, y: 0 });
      if (e.key === "ArrowRight") setDir({ x: 1, y: 0 });
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(loopRef.current);
      clearInterval(countdownRef.current);
    };
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
        Snake
      </h1>
      <p className="text-neutral-500 text-sm mb-4 tracking-wide uppercase">
        🐍 Use the buttons below
      </p>

      {!playing && !gameOver && countdown === null && (
        <button
          onClick={startGame}
          className="bg-cyan-500 hover:bg-cyan-400 transition text-black font-bold rounded-lg px-8 py-4 uppercase mb-6"
        >
          Start Game
        </button>
      )}

      {countdown !== null && (
        <p className="text-4xl font-black text-pink-400 mb-6">{countdown}</p>
      )}

      {playing && (
        <p className="text-neutral-400 text-sm mb-3">
          Score: <span className="text-cyan-400 font-bold">{score}</span>
        </p>
      )}

      {gameOver && (
        <div className="text-center mb-6 w-full max-w-xs">
          <p className="text-xl mb-3">💀 Game Over — {score} pts</p>
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
        className="grid border-2 border-purple-500 bg-neutral-950"
        style={{
          gridTemplateColumns: `repeat(${GRID}, 1fr)`,
          width: "min(90vw, 340px)",
          height: "min(90vw, 340px)",
        }}
      >
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              className={`border border-neutral-900 ${
                isHead
                  ? "bg-cyan-400"
                  : isSnake
                  ? "bg-purple-500"
                  : isFood
                  ? "bg-pink-500 rounded-full"
                  : "bg-neutral-950"
              }`}
            />
          );
        })}
      </div>

      {(playing || countdown !== null) && (
        <div className="mt-5 grid grid-cols-3 gap-2" style={{ width: "min(90vw, 220px)" }}>
          <div />
          <button
            onClick={() => setDir({ x: 0, y: -1 })}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            ↑
          </button>
          <div />
          <button
            onClick={() => setDir({ x: -1, y: 0 })}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            ←
          </button>
          <button
            onClick={() => setDir({ x: 0, y: 1 })}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-2xl hover:bg-purple-900 transition"
          >
            ↓
          </button>
          <button
            onClick={() => setDir({ x: 1, y: 0 })}
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

      <GameSponsorBanner gameSlug="snake" />

      <Link href="/games" className="text-neutral-600 hover:text-white underline mt-8 text-sm">
        ← Back to Game Room
      </Link>
    </main>
  );
}