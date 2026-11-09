// src/app/profile/hunter/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LangProvider";
import { useHunter } from "@/lib/useHunter";
import { HUNTERS_ENABLED } from "@/lib/features";
import { suggestedNameFrom } from "@/lib/useSuggestedName";
import ProfileTabs from "@/components/ProfileTabs";
import XpCard from "@/components/XpCard";
import TownCard from "@/components/TownCard";
import HunterSignup from "@/components/HunterSignup";

const text = {
  af: {
    back: "← Terug na die Bulletin",
    title: "Hunter",
    signInTitle: "Teken in om 'n Hunter te word",
    signInNote: "Jy kan die Bulletin steeds sonder 'n rekening gebruik.",
    signIn: "Teken in met Google",
    wait: "Wag...",
    soon: "Die Hunter-stelsel kom binnekort.",
    pitchTitle: "Verken. Neem deel. Verdien.",
    pitch:
      "Voltooi daaglikse en weeklikse missies, verdien XP en Bulletin Bucks (BB), en klim vlakke. Dis 'n manier om meer van Brandfort se gemeenskap te ontdek.",
    gamer: "Speelnaam",
    openGrid: "Maak die Grid oop",
    gridSub: "Verken die dorp en spandeer jou BB",
  },
  en: {
    back: "← Back to the Bulletin",
    title: "Hunter",
    signInTitle: "Sign in to become a Hunter",
    signInNote: "You can still use the Bulletin without an account.",
    signIn: "Sign in with Google",
    wait: "Please wait...",
    soon: "The Hunter system is coming soon.",
    pitchTitle: "Explore. Participate. Earn.",
    pitch:
      "Complete daily and weekly missions, earn XP and Bulletin Bucks (BB), and level up. It's a way to discover more of Brandfort's community.",
    gamer: "Gamer name",
    openGrid: "Open the Grid",
    gridSub: "Explore the town and spend your BB",
  },
};

export default function HunterPage() {
  const { user, loading, busy, signInWithGoogle } = useAuth();
  const { lang } = useLang();
  const t = text[lang === "af" ? "af" : "en"];
  const { hunter, loading: hunterLoading, refresh } = useHunter();
  const [totalXp, setTotalXp] = useState(0);
  const userId = user?.id;
  const isHunter = HUNTERS_ENABLED && !!hunter;

  useEffect(() => {
    if (!userId || !isHunter) return;
    let active = true;
    supabase.rpc("my_total_xp").then(({ data, error }) => {
      if (active) setTotalXp(error ? 0 : Number(data) || 0);
    });
    return () => {
      active = false;
    };
  }, [userId, isHunter]);

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-orange-400 hover:text-orange-300">
          {t.back}
        </Link>

        {loading ? (
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-neutral-900" />
        ) : !user ? (
          <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 text-center">
            <p className="text-lg font-bold">{t.signInTitle}</p>
            <p className="mt-2 text-sm text-neutral-400">{t.signInNote}</p>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              className="mt-5 rounded-full bg-orange-500 px-6 py-2.5 font-semibold text-black transition hover:bg-orange-600 disabled:opacity-50"
            >
              {busy ? t.wait : t.signIn}
            </button>
          </div>
        ) : (
          <>
            <ProfileTabs lang={lang} />

            {!HUNTERS_ENABLED ? (
              <p className="mt-6 text-center text-sm text-neutral-400">{t.soon}</p>
            ) : hunterLoading ? (
              <div className="mt-6 h-40 animate-pulse rounded-2xl bg-neutral-900" />
            ) : isHunter ? (
              <>
                <p className="mt-5 text-center text-sm font-semibold text-cyan-300">
                  🎯 {t.gamer}: {hunter.gamer_name}
                </p>
                <Link
                  href="/grid"
                  className="mt-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-4 text-black shadow-[0_0_28px_rgba(34,211,238,0.45)] transition active:scale-[0.99] hover:brightness-110"
                >
                  <span className="text-3xl">🌐</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-black tracking-[0.15em]">
                      BRANDFORT GRID
                    </span>
                    <span className="block text-xs font-semibold opacity-80">
                      {t.openGrid} · {t.gridSub}
                    </span>
                  </span>
                  <span className="text-2xl font-black">›</span>
                </Link>

                <div className="mt-4">
                  <XpCard totalXp={totalXp} lang={lang} />
                </div>
                <div className="mt-4">
                  <TownCard lang={lang} />
                </div>
              </>
            ) : (
              <>
                <div className="mt-5 rounded-2xl border border-cyan-400/30 bg-[#050b18] p-5">
                  <p className="text-lg font-black text-white">{t.pitchTitle}</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-300">{t.pitch}</p>
                </div>
                <HunterSignup
                  lang={lang}
                  defaultName={suggestedNameFrom(user)}
                  onJoined={refresh}
                />
                <div className="mt-4">
                  <TownCard lang={lang} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}