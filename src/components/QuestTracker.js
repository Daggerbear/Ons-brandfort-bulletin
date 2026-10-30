// src/components/QuestTracker.js
"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const PING_MS = 30000;

// Sends a heartbeat every 30s while `active`. The server decides how much time
// to credit, so this file can't award anything by itself.
export function useQuestPing(kind, active = true, needVisible = false) {
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    let busy = false;
    let first = true; // the first ping of a visit (or a resume) credits nothing

    const ping = async () => {
      if (busy || stopped) return;
      if (needVisible && document.visibilityState !== "visible") {
        first = true;
        return;
      }
      busy = true;
      try {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) return;
        const { error } = await supabase.rpc("quest_ping", {
          p_kind: kind,
          p_first: first,
        });
        if (!error) first = false;
      } catch {
        // Tracking must never break the page
      } finally {
        busy = false;
      }
    };

    ping();
    const id = setInterval(ping, PING_MS);
    const onVisible = () => {
      if (needVisible && document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [kind, active, needVisible]);
}

export default function QuestTracker({ kind, needVisible = true }) {
  useQuestPing(kind, true, needVisible);
  return null;
}