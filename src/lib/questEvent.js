// src/lib/questEvent.js
import { supabase } from "@/lib/supabase";

// Tells the server something happened (visited a business, played a game...).
// The server decides if it counts. Never throws, so it can't break a page.
export async function questEvent(kind, ref = "") {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data?.session) return;
    await supabase.rpc("quest_event", { p_kind: kind, p_ref: String(ref) });
  } catch {
    // ignore
  }
}