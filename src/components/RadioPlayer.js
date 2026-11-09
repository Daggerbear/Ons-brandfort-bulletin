// src/components/RadioPlayer.js
"use client";
import { useEffect, useState } from "react";
import { useQuestPing } from "@/components/QuestTracker";
import { useLang } from "@/components/LangProvider";

const PLAYER_URL = "https://sv2.famcast.co.za/AudioPlayer/veldbrand-radio?mount=";
const STATION_URL = "https://veldbrandradio.co.za";

const TEXT = {
  af: {
    loading: "Laai speler...",
    slow: "Neem lank? Maak Veldbrand Radio oop",
    close: "Maak toe",
    permission: "Gebruik met toestemming van",
    playerTitle: "Luister regstreeks na Veldbrand Radio",
  },
  en: {
    loading: "Loading player...",
    slow: "Taking long? Open Veldbrand Radio",
    close: "Close",
    permission: "Used with permission from",
    playerTitle: "Listen live to Veldbrand Radio",
  },
};

// The top bar radio button (in AppShell) fires a "toggle-radio" window event.
// This panel drops down from under the top bar.
export default function RadioPlayer() {
  const { lang } = useLang();
  const t = TEXT[lang] || TEXT.en;

  const [open, setOpen] = useState(false);
  // Only mount the iframe after the first open, then never unmount it,
  // so audio keeps playing when the panel is closed or pages change.
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  // Radio quest time counts while the player is loaded
  useQuestPing("radio", loaded && ready, false);

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener("toggle-radio", toggle);
    return () => window.removeEventListener("toggle-radio", toggle);
  }, []);

  useEffect(() => {
    if (open) setLoaded(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // If the player hasn't finished loading after 10s, show a fallback link
  useEffect(() => {
    if (!loaded || ready) return;
    const id = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(id);
  }, [loaded, ready]);

  return (
    <>
      {/* Tap outside to close (only exists while open) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[35] bg-black/40"
          aria-hidden="true"
        />
      )}

      {/* Drop-down panel, slides out from under the top bar (header is z-40) */}
      <div
        className="fixed inset-x-0 top-14 z-[38] transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateY(0)" : "translateY(-120%)",
          pointerEvents: open ? "auto" : "none",
        }}
        aria-hidden={!open}
      >
        <div className="mx-auto max-w-2xl px-3 pt-2">
          <div className="rounded-2xl border border-orange-500/30 bg-neutral-950/95 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-base font-black leading-tight text-white">
                📻 Veldbrand <span className="text-orange-500">Radio</span>
              </h3>
              <button
                onClick={() => setOpen(false)}
                aria-label={t.close}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-sm text-neutral-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            {loaded && (
              <div
                className="relative overflow-hidden rounded-xl bg-neutral-900"
                style={{ height: 250 }}
              >
                {!ready && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                    <span className="animate-pulse text-3xl">📻</span>
                    <p className="text-xs text-neutral-400">{t.loading}</p>
                    {slow && (
                      <a
                        href={STATION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-400 underline"
                      >
                        {t.slow}
                      </a>
                    )}
                  </div>
                )}
                <iframe
                  width="100%"
                  height="250"
                  src={PLAYER_URL}
                  onLoad={() => setReady(true)}
                  style={{ border: 0, position: "relative" }}
                  title={t.playerTitle}
                  allow="autoplay"
                />
              </div>
            )}

            <p className="mt-2 px-1 text-[10px] leading-snug text-neutral-500">
              {t.permission}{" "}
              <a
                href={STATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 underline hover:text-orange-400"
              >
                Veldbrand Media
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
