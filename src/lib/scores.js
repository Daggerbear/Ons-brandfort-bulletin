// src/lib/scores.js
// One place for saving and reading game scores, so every game works the same way.
import { supabase } from "@/lib/supabase";
import { getStoredPlayer } from "@/lib/playerAuth";

// The name comes from the signed-in profile, never from a text box.
export function currentPlayerName() {
  return getStoredPlayer()?.name || "";
}

// Saves one score. The database fills in user_id from the signed-in account.
export async function saveScore(table, score, extra = {}) {
  const name = currentPlayerName();
  if (!name) return { error: new Error("not signed in") };
  return supabase.from(table).insert({ player_name: name, score, ...extra });
}

// Top scores with one row per player (their best), highest first.
export async function topScores(table, limit = 10) {
  const { data } = await supabase
    .from(table)
    .select("*")
    .order("score", { ascending: false })
    .limit(200);

  const seen = new Set();
  const out = [];
  for (const row of data || []) {
    const key = (row.player_name || "").trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}
