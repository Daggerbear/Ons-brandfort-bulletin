"use client";
import { useState, useEffect } from "react";
import { getStoredPlayer, loginPlayer } from "@/lib/playerAuth";

export default function GamesLayout({ children }) {
  const [player, setPlayer] = useState(undefined);
  const [name, setName] = useState("");
  const [cell, setCell] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPlayer(getStoredPlayer());
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    if (!name.trim() || !cell.trim()) {
      setError("Enter your name and cell number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const p = await loginPlayer(name, cell);
      setPlayer(p);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  if (player === undefined) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </main>
    );
  }

  if (!player) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-2">🕹️ Glitch Cafe</h1>
          <p className="text-neutral-400 text-center text-sm mb-6">
            Enter your name and cell number to play. Your number is never shown publicly — it just keeps your identity yours across games.
          </p>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white mb-4 focus:border-orange-500 outline-none"
          />
          <input
            type="tel"
            placeholder="Cell number (e.g. 0821234567)"
            value={cell}
            onChange={(e) => setCell(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white mb-4 focus:border-orange-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
          >
            {loading ? "..." : "Enter Glitch Cafe"}
          </button>
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </form>
      </main>
    );
  }

  return children;
}