// src/app/games/layout.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LangProvider";
import { getStoredPlayer, storePlayer, clearStoredPlayer } from "@/lib/playerAuth";
import QuestTracker from "@/components/QuestTracker";

const TEXT = {
  af: {
    loading: "Laai...",
    note: "Teken in om te speel en jou tellings te stoor. Dis gratis, en ons vra nie meer vir jou selfoonnommer nie.",
    signIn: "Teken in met Google",
    profTitle: "Stoor eers jou profiel",
    profNote: "Kies 'n naam vir jou profiel, dan kan jy dadelik speel.",
    profGo: "Maak my profiel klaar",
    failed: "Kon nie jou speler laai nie. Probeer asseblief weer.",
    retry: "Probeer weer",
  },
  en: {
    loading: "Loading...",
    note: "Sign in to play and save your scores. It's free, and we no longer ask for your cell number.",
    signIn: "Sign in with Google",
    profTitle: "Save your profile first",
    profNote: "Pick a name for your profile, then you can play straight away.",
    profGo: "Set up my profile",
    failed: "Couldn't load your player. Please try again.",
    retry: "Try again",
  },
};

export default function GamesLayout({ children }) {
  const { user, loading: authLoading, busy, signInWithGoogle } = useAuth();
  const { lang } = useLang();
  const pathname = usePathname();
  const t = TEXT[lang] || TEXT.en;

  const [player, setPlayer] = useState(undefined); // undefined = working on it
  const [state, setState] = useState("idle"); // idle | noprofile | failed
  const [retryKey, setRetryKey] = useState(0);
  const userId = user?.id;

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      clearStoredPlayer();
      setPlayer(null);
      setState("idle");
      return;
    }

    let active = true;
    (async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userId)
          .maybeSingle();
        if (!active) return;
        if (!profile?.display_name) {
          setPlayer(null);
          setState("noprofile");
          return;
        }

        // Reuse the stored player if it already belongs to this account
        const stored = getStoredPlayer();
        if (stored?.user_id === userId && stored.name === profile.display_name) {
          setPlayer(stored);
          setState("idle");
          return;
        }

        const { data: existing } = await supabase
          .from("players")
          .select("id, name, user_id")
          .eq("user_id", userId)
          .maybeSingle();

        let p = existing;
        if (!p) {
          const { data: created, error } = await supabase
            .from("players")
            .insert({ user_id: userId, name: profile.display_name, cell: `acct-${userId}` })
            .select("id, name, user_id")
            .single();
          if (error) throw error;
          p = created;
        } else if (p.name !== profile.display_name) {
          await supabase
            .from("players")
            .update({ name: profile.display_name, updated_at: new Date().toISOString() })
            .eq("id", p.id);
          p = { ...p, name: profile.display_name };
        }

        if (!active) return;
        // matchmaking uses "cell" as a unique key; this is an account key, not a phone number
        p = { ...p, cell: `acct-${userId}` };
        storePlayer(p);
        setPlayer(p);
        setState("idle");
      } catch (err) {
        console.log("Glitch Cafe player error:", err);
        if (active) {
          setPlayer(null);
          setState("failed");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [userId, authLoading, retryKey]);

  // The leaderboard is public: no sign-in needed to look at it
  if (pathname === "/games/leaderboard") return <>{children}</>;

  if (authLoading || (userId && player === undefined)) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500">{t.loading}</p>
      </main>
    );
  }

  if (!player) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-2">🕹️ Glitch Cafe</h1>

          {state === "failed" ? (
            <>
              <p className="text-neutral-400 text-sm mb-6">{t.failed}</p>
              <button
                type="button"
                onClick={() => {
                  setPlayer(undefined);
                  setRetryKey((k) => k + 1);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3"
              >
                {t.retry}
              </button>
            </>
          ) : state === "noprofile" ? (
            <>
              <h2 className="font-semibold mb-1">{t.profTitle}</h2>
              <p className="text-neutral-400 text-sm mb-6">{t.profNote}</p>
              <Link
                href="/profile"
                className="block w-full bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3"
              >
                {t.profGo}
              </Link>
            </>
          ) : (
            <>
              <p className="text-neutral-400 text-sm mb-6">{t.note}</p>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={busy}
                className="w-full bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
              >
                {t.signIn}
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <>
      <QuestTracker kind="cafe" needVisible />
      {children}
    </>
  );
}
