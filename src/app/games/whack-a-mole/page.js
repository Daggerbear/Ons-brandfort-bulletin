"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import GameSponsorBanner from "@/components/GameSponsorBanner";

const HOLE_COUNT = 9;
const GAME_DURATION = 30;

export default function WhackAMole() {
  const [activeHole, setActiveHole] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);
  const [whacked, setWhacked] = useState(null);

  const moleTimeout = useRef(null);
  const gameInterval = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from("whack_a_mole_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);
    setLeaderboard(data || []);
  }

  const popMole = useCallback(() => {
    const hole = Math.floor(Math.random() * HOLE_COUNT);
    setActiveHole(hole);
    const showTime = 500 + Math.random() * 500;
    moleTimeout.current = setTimeout(() => {
      setActiveHole(null);
      const gap = 200 + Math.random() * 400;
      moleTimeout.current = setTimeout(popMole, gap);
    }, showTime);
  }, []);

  function startGame() {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setScoreSaved(false);
    setPlayerName("");
    setPlaying(true);
    popMole();

    gameInterval.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function endGame() {
    clearInterval(gameInterval.current);
    clearTimeout(moleTimeout.current);
    setPlaying(false);
    setGameOver(true);
    setActiveHole(null);
  }

  function handleWhack(hole) {
    if (!playing || hole !== activeHole) return;
    setScore((s) => s + 1);
    setActiveHole(null);
    setWhacked(hole);
    setTimeout(() => setWhacked(null), 150);
    clearTimeout(moleTimeout.current);
    const gap = 200 + Math.random() * 400;
    moleTimeout.current = setTimeout(popMole, gap);
  }

  async function saveScore() {
    if (!playerName.trim() || scoreSaved) return;
    await supabase.from("whack_a_mole_scores").insert({
      player_name: playerName.trim(),
      score,
    });
    setScoreSaved(true);
    fetchLeaderboard();
  }

  useEffect(() => {
    return () => {
      clearInterval(gameInterval.current);
      clearTimeout(moleTimeout.current);
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
        Whack-a-Mole
      </h1>
      <p className="text-neutral-500 text-sm mb-6 tracking-wide uppercase">
        🔨 Tap the mole
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
        <div className="flex justify-between w-full max-w-xs mb-4 text-sm">
          <span className="text-neutral-400">
            Score: <span className="text-cyan-400 font-bold">{score}</span>
          </span>
          <span className="text-neutral-400">
            Time: <span className="text-pink-400 font-bold">{timeLeft}s</span>
          </span>
        </div>
      )}

      {gameOver && (
        <div className="text-center mb-6 w-full max-w-xs">
          <p className="text-xl mb-3">🎉 Game Over — {score} pts</p>
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
        className="grid grid-cols-3 gap-3 border-2 border-purple-500 rounded-2xl p-4 bg-neutral-950"
        style={{ width: "min(90vw, 340px)" }}
      >
        {Array.from({ length: HOLE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleWhack(i)}
            disabled={!playing}
            className="aspect-square rounded-full bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center text-3xl overflow-hidden relative"
          >
            {activeHole === i && (
              <span
                className={`transition-transform ${whacked === i ? "scale-0" : "scale-100"}`}
              >
                🐹
              </span>
            )}
          </button>
        ))}
      </div>

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

      <GameSponsorBanner gameSlug="whack-a-mole" />

      <Link href="/games" className="text-neutral-600 hover:text-white underline mt-8 text-sm">
        ← Back to Game Room
      </Link>
    </main>
  );
}