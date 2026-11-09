// src/lib/matchmaking.js
import { supabase } from "@/lib/supabase";

// A searching player counts as "still here" for this long.
// (The lobby cancels a search after 90s, so anything older was abandoned.)
const FRESH_MS = 2 * 60 * 1000;
// Anything older than this is junk and gets swept away.
const JUNK_MS = 10 * 60 * 1000;

export async function findAndClaimWaitingOpponent(game, myCell) {
  const freshAfter = new Date(Date.now() - FRESH_MS).toISOString();

  const { data: candidates } = await supabase
    .from("matchmaking_queue")
    .select("*")
    .eq("game", game)
    .eq("status", "waiting")
    .neq("player_cell", myCell)
    .gte("created_at", freshAfter)
    .order("created_at", { ascending: true })
    .limit(5);

  if (!candidates || candidates.length === 0) return null;

  for (const candidate of candidates) {
    const { data: claimed } = await supabase
      .from("matchmaking_queue")
      .update({ status: "claiming" })
      .eq("id", candidate.id)
      .eq("status", "waiting")
      .select()
      .maybeSingle();

    if (claimed) return claimed;
  }

  return null;
}

export async function createQueueEntry(game, myName, myCell) {
  // Sweep abandoned entries and any old search of mine before queuing again
  const junkBefore = new Date(Date.now() - JUNK_MS).toISOString();
  await supabase.from("matchmaking_queue").delete().lt("created_at", junkBefore);
  await supabase
    .from("matchmaking_queue")
    .delete()
    .eq("player_cell", myCell)
    .eq("status", "waiting");

  const { data } = await supabase
    .from("matchmaking_queue")
    .insert({ game, player_name: myName, player_cell: myCell, status: "waiting" })
    .select()
    .single();
  return data;
}

export async function markQueueMatched(queueId, roomCode, asRole) {
  await supabase
    .from("matchmaking_queue")
    .update({ status: "matched", room_code: roomCode, as_role: asRole })
    .eq("id", queueId);
}

export async function cancelQueueEntry(queueId) {
  await supabase.from("matchmaking_queue").delete().eq("id", queueId);
}

export function subscribeToQueueEntry(queueId, onMatched) {
  const channel = supabase
    .channel(`queue-${queueId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "matchmaking_queue", filter: `id=eq.${queueId}` },
      (payload) => {
        if (payload.new.status === "matched") onMatched(payload.new);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
