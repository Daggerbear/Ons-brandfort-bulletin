"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminRiddleWinners() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [monthKey, setMonthKey] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  async function handleRun() {
    setRunning(true);
    setResult(null);

    const res = await fetch("/api/admin-trigger-riddle-winners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, monthKey: monthKey.trim() || undefined }),
    });

    const data = await res.json();
    setRunning(false);

    if (!res.ok) {
      setResult({ created: false, reason: data.error || "Something went wrong." });
      return;
    }
    setResult(data);
  }

  if (!checked) return null;

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <p className="text-neutral-400">
          Please{" "}
          <Link href="/admin" className="text-orange-400">
            log in
          </Link>{" "}
          first.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Riddle Rush Winners</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>
        <p className="text-sm text-neutral-500 mb-6">
          Runs automatically at 00:00 UTC on the 1st of every month, posting the previous month's top scorers to the Community Feed. Use this to test manually or re-check a specific month.
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
          <label className="block text-xs text-neutral-500">Admin Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
          />

          <label className="block text-xs text-neutral-500">
            Month to process (optional — YYYY-MM, defaults to last month)
          </label>
          <input
            type="text"
            placeholder="e.g. 2026-08"
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
          />

          <button
            onClick={handleRun}
            disabled={running || !password}
            className="w-full bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
          >
            {running ? "Running..." : "Run Now"}
          </button>
        </div>

        {result && (
          <div
            className={`mt-4 rounded-lg p-4 text-sm ${
              result.created
                ? "bg-green-950/40 border border-green-800 text-green-300"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400"
            }`}
          >
            {result.created
              ? `✓ Posted for ${result.monthKey} (post ID ${result.postId})`
              : result.reason}
          </div>
        )}
      </div>
    </main>
  );
}