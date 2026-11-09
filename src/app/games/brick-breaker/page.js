"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { saveScore as saveScoreRow, currentPlayerName } from "@/lib/scores";
import GameSponsorBanner from "@/components/GameSponsorBanner";

const CANVAS_W = 320;
const CANVAS_H = 420;
const PADDLE_W = 70;
const PADDLE_H = 12;
const BALL_R = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_W = CANVAS_W / BRICK_COLS;
const BRICK_H = 18;
const BRICK_COLORS = ["#22d3ee", "#a855f7", "#ec4899", "#22c55e", "#f97316"];

function createBricks() {
  const bricks = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({ r, c, alive: true });
    }
  }
  return bricks;
}

export default function BrickBreaker() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [playerName, setPlayerName] = useState("");
  useEffect(() => {
    setPlayerName(currentPlayerName());
  }, []);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [scoreError, setScoreError] = useState(false);

  const stateRef = useRef({
    paddleX: CANVAS_W / 2 - PADDLE_W / 2,
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H - 40,
    ballDX: 3,
    ballDY: -3,
    bricks: createBricks(),
    score: 0,
  });
  const rafRef = useRef(null);
  const playingRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    s.bricks.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = BRICK_COLORS[b.r % BRICK_COLORS.length];
      ctx.fillRect(b.c * BRICK_W + 2, b.r * BRICK_H + 30, BRICK_W - 4, BRICK_H - 4);
    });

    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(s.paddleX, CANVAS_H - 20, PADDLE_W, PADDLE_H);

    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#ec4899";
    ctx.fill();
  }, []);

  const loop = useCallback(() => {
    const s = stateRef.current;

    s.ballX += s.ballDX;
    s.ballY += s.ballDY;

    if (s.ballX <= BALL_R || s.ballX >= CANVAS_W - BALL_R) s.ballDX *= -1;
    if (s.ballY <= BALL_R) s.ballDY *= -1;

    if (
      s.ballY >= CANVAS_H - 20 - BALL_R &&
      s.ballY <= CANVAS_H - 20 + PADDLE_H &&
      s.ballX >= s.paddleX &&
      s.ballX <= s.paddleX + PADDLE_W &&
      s.ballDY > 0
    ) {
      const hitPos = (s.ballX - s.paddleX) / PADDLE_W - 0.5;
      s.ballDX = hitPos * 6;
      s.ballDY = -Math.abs(s.ballDY);
    }

    if (s.ballY > CANVAS_H) {
      endGame(false);
      return;
    }

    for (const b of s.bricks) {
      if (!b.alive) continue;
      const bx = b.c * BRICK_W;
      const by = b.r * BRICK_H + 30;
      if (
        s.ballX + BALL_R > bx &&
        s.ballX - BALL_R < bx + BRICK_W &&
        s.ballY + BALL_R > by &&
        s.ballY - BALL_R < by + BRICK_H
      ) {
        b.alive = false;
        s.ballDY *= -1;
        s.score += 10;
        setScore(s.score);
        break;
      }
    }

    if (s.bricks.every((b) => !b.alive)) {
      endGame(true);
      return;
    }

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  function startGame() {
    stateRef.current = {
      paddleX: CANVAS_W / 2 - PADDLE_W / 2,
      ballX: CANVAS_W / 2,
      ballY: CANVAS_H - 40,
      ballDX: 3,
      ballDY: -3,
      bricks: createBricks(),
      score: 0,
    };
    setScore(0);
    setGameOver(false);
    setWon(false);
    setScoreSaved(false);
    setPlayerName(currentPlayerName());
    setPlaying(true);
    playingRef.current = true;
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }

  function endGame(didWin) {
    cancelAnimationFrame(rafRef.current);
    playingRef.current = false;
    setPlaying(false);
    setGameOver(true);
    setWon(didWin);
  }

  async function saveScore() {
    if (!playerName || scoreSaved) return;
    const { error } = await saveScoreRow("brick_breaker_scores", score);
    if (error) {
      setScoreError(true);
      return;
    }
    setScoreError(false);
    setScoreSaved(true);
  }

  function movePaddle(clientX) {
    if (!playingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    const x = (clientX - rect.left) * scale;
    stateRef.current.paddleX = Math.max(
      0,
      Math.min(CANVAS_W - PADDLE_W, x - PADDLE_W / 2)
    );
  }

  function handleTouchMove(e) {
    e.preventDefault();
    movePaddle(e.touches[0].clientX);
  }

  function handleMouseMove(e) {
    if (e.buttons !== 1) return;
    movePaddle(e.clientX);
  }

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

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
        Brick Breaker
      </h1>
      <p className="text-neutral-500 text-sm mb-4 tracking-wide uppercase">
        🧱 Drag to move paddle
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
            {won ? "🏆 You Win!" : "💀 Game Over"} — {score} pts
          </p>
          {!scoreSaved ? (
            <div className="flex items-center gap-2 mb-3">
              <p className="flex-1 text-left text-sm text-neutral-300">
                Saving as <span className="text-orange-400 font-semibold">{playerName}</span>
              </p>
              <button
                onClick={saveScore}
                className="bg-purple-600 hover:bg-purple-500 transition text-white text-sm font-semibold rounded-lg px-4 py-2"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-green-400 text-sm mb-3">✓ Score saved!{" "}
              <Link href="/games/leaderboard" className="underline text-cyan-400">
                See the Glitch Cafe leaderboard
              </Link>
            </p>
          )}
          {scoreError && (
            <p className="text-red-400 text-sm mb-3">{"Couldn't save your score. Try again."}</p>
          )}
          <button
            onClick={startGame}
            className="bg-cyan-500 hover:bg-cyan-400 transition text-black font-bold rounded-lg px-6 py-3 uppercase text-sm"
          >
            Play Again
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onTouchMove={handleTouchMove}
        onMouseMove={handleMouseMove}
        className="border-2 border-purple-500 rounded-lg touch-none"
        style={{ width: "min(90vw, 320px)", height: "auto" }}
      />


      <GameSponsorBanner gameSlug="brick-breaker" />

      <Link href="/games" className="text-neutral-600 hover:text-white underline mt-8 text-sm">
        ← Back to Game Room
      </Link>
    </main>
  );
}