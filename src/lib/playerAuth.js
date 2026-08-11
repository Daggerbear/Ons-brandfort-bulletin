import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "bulletin_player";

export function getStoredPlayer() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storePlayer(player) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

export function clearStoredPlayer() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function loginPlayer(name, cell) {
  const cleanCell = cell.trim().replace(/\D/g, "");
  const cleanName = name.trim();

  const { data: existing } = await supabase
    .from("players")
    .select("*")
    .eq("cell", cleanCell)
    .maybeSingle();

  let player;
  if (existing) {
    if (existing.name !== cleanName) {
      const { data: updated } = await supabase
        .from("players")
        .update({ name: cleanName, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
      player = updated || existing;
    } else {
      player = existing;
    }
  } else {
    const { data: created, error } = await supabase
      .from("players")
      .insert({ cell: cleanCell, name: cleanName })
      .select()
      .single();
    if (error) throw error;
    player = created;
  }

  storePlayer(player);
  return player;
}