"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const ANCHOR_UTC = Date.UTC(2026, 7, 3);
const TOTAL_RIDDLES = 50;

function getDayIndex() {
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((todayUtc - ANCHOR_UTC) / 86400000);
  const idx = ((diffDays % TOTAL_RIDDLES) + TOTAL_RIDDLES) % TOTAL_RIDDLES;
  return idx + 1;
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function RiddleRush() {
  const [riddle, setRiddle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [guess, setGuess] = useState("");
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("riddle_scores")
      .select("name, points")
      .eq("month_key", getMonthKey());
    if (!data) return;
    const totals = {};
    data.forEach((row) => {
      totals[row.name] = (totals[row.name] || 0) + row.points;
    });
    const sorted = Object.entries(totals)
      .map(([n, p]) => ({ name: n, points: p }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
    setLeaderboard(sorted);
  }, []);

  function loadProgressFor(playerName) {
    const todayKey = getTodayKey();
    const saved = localStorage.getItem(`riddleRush_${playerName}_${todayKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setTries(parsed.tries || 0);
      setSolved(!!parsed.solved);
      setLocked(!!parsed.locked);
      setPointsEarned(parsed.pointsEarned || 0);
    } else {
      setTries(0);
      setSolved(false);
      setLocked(false);
      setPointsEarned(0);
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);

      const dayIndex = getDayIndex();
      const { data } = await supabase
        .from("riddles")
        .select("id, riddle_text")
        .eq("day_index", dayIndex)
        .single();
      setRiddle(data || null);

      const savedName = localStorage.getItem("riddleRushName");
      if (savedName) {
        setName(savedName);
        loadProgressFor(savedName);
      }

      await loadLeaderboard();
      setLoading(false);
    }
    init();
  }, [loadLeaderboard]);

  function saveProgress(newTries, newSolved, newLocked, newPoints) {
    const todayKey = getTodayKey();
    localStorage.setItem(
      `riddleRush_${name}_${todayKey}`,
      JSON.stringify({ tries: newTries, solved: newSolved, locked: newLocked, pointsEarned: newPoints })
    );
  }

  function saveName() {
    if (!nameInput.trim()) return;
    const trimmed = nameInput.trim();
    localStorage.setItem("riddleRushName", trimmed);
    setName(trimmed);
    loadProgressFor(trimmed);
    setFeedback("");
    setGuess("");
  }

  function switchPlayer() {
    localStorage.removeItem("riddleRushName");
    setName("");
    setNameInput("");
    setTries(0);
    setSolved(false);
    setLocked(false);
    setPointsEarned(0);
    setFeedback("");
    setGuess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!riddle || locked || submitting || !guess.trim()) return;
    setSubmitting(true);
    setFeedback("");

    const { data: isCorrect } = await supabase.rpc("check_riddle_answer", {
      riddle_id_input: riddle.id,
      guess_input: guess.trim(),
    });

    if (isCorrect) {
      const points = tries === 0 ? 3 : tries === 1 ? 2 : 1;
      const newTries = tries + 1;
      setTries(newTries);
      setSolved(true);
      setLocked(true);
      setPointsEarned(points);
      saveProgress(newTries, true, true, points);

      await supabase.from("riddle_scores").insert({
        name,
        points,
        month_key: getMonthKey(),
        day_key: new Date().toISOString().slice(0, 10),
      });
      await loadLeaderboard();
      setFeedback(`🎉 Correct! You earned ${points} points.`);
    } else {
      const newTries = tries + 1;
      setTries(newTries);
      setGuess("");
      if (newTries >= 3) {
        setLocked(true);
        setPointsEarned(0);
        saveProgress(newTries, false, true, 0);
        setFeedback("Out of tries. Come back tomorrow for a new riddle!");
      } else {
        saveProgress(newTries, false, false, 0);
        setFeedback(`Not quite. ${3 - newTries} ${3 - newTries === 1 ? "try" : "tries"} left.`);
      }
    }
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(236,72,153,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-md mx-auto relative">
        <h1
          className="text-4xl font-black text-center mb-1 tracking-widest uppercase"
          style={{
            background: "linear-gradient(90deg, #ec4899, #a855f7, #22d3ee)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Riddle Rush
        </h1>
        <p className="text-neutral-500 text-center text-sm mb-4 tracking-wide uppercase">
          🧩 One riddle a day
        </p>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full text-center text-sm text-pink-400 hover:text-pink-300 underline mb-6"
        >
          {showHelp ? "Hide" : "❓ How to Play"}
        </button>

        {showHelp && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 mb-6 text-sm text-neutral-300 space-y-2">
            <p>🧩 A new riddle appears every day — same one for everyone.</p>
            <p>✍️ Type your answer and hit Submit.</p>
            <p>🎯 3 points if you get it on your 1st try, 2 on your 2nd, 1 on your 3rd.</p>
            <p>🔒 After 3 wrong guesses, that day's riddle locks — come back tomorrow!</p>
            <p>🏆 Points add up on the monthly leaderboard, which resets every month.</p>
            <p>👥 Sharing a phone? Use "Switch player" to let someone else play under their own name.</p>
          </div>
        )}

        {loading && <p className="text-center text-neutral-500">Loading...</p>}

        {!loading && !riddle && (
          <p className="text-center text-neutral-500">No riddle found for today.</p>
        )}

        {!loading && riddle && !name && (
          <div className="bg-neutral-950 border-2 border-pink-500 rounded-2xl p-6 mb-6">
            <p className="text-sm text-neutral-400 mb-3">Enter your name to play:</p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-pink-500"
            />
            <button
              onClick={saveName}
              className="w-full bg-pink-500 hover:bg-pink-600 transition rounded-lg py-3 font-semibold"
            >
              Start playing
            </button>
          </div>
        )}

        {!loading && riddle && name && (
          <div className="bg-neutral-950 border-2 border-pink-500 rounded-2xl p-6 mb-6 shadow-lg hover:shadow-pink-500/30 transition">
            <p className="text-lg leading-relaxed mb-4">{riddle.riddle_text}</p>

            {!locked && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Your answer..."
                  disabled={submitting}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  disabled={submitting || !guess.trim()}
                  className="w-full bg-pink-500 hover:bg-pink-600 transition rounded-lg py-3 font-semibold disabled:opacity-50"
                >
                  {submitting ? "Checking..." : `Submit (${3 - tries} left)`}
                </button>
              </form>
            )}

            {feedback && (
              <p className={`mt-4 text-sm ${solved ? "text-green-400" : "text-neutral-400"}`}>
                {feedback}
              </p>
            )}

            <div className="mt-3 flex justify-between items-center text-xs text-neutral-500">
              <span>
                Playing as <span className="text-pink-400">{name}</span>
                {locked && solved && ` · +${pointsEarned} pts`}
              </span>
              <button onClick={switchPlayer} className="underline hover:text-white">
                Not you? Switch player
              </button>
            </div>
          </div>
        )}

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400 mb-3">
            🏆 Monthly Leaderboard
          </h2>
          {leaderboard.length === 0 && (
            <p className="text-neutral-600 text-sm">No scores yet this month.</p>
          )}
          {leaderboard.map((entry, i) => (
            <div
              key={entry.name}
              className="flex justify-between text-sm py-1.5 border-b border-neutral-900 last:border-0"
            >
              <span className="text-neutral-300">
                {i + 1}. {entry.name}
              </span>
              <span className="text-pink-400 font-semibold">{entry.points} pts</span>
            </div>
          ))}
        </div>

        <Link
          href="/games"
          className="block text-center text-neutral-600 hover:text-white underline text-sm"
        >
          ← Back to Game Room
        </Link>
      </div>
    </main>
  );
}