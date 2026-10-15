"use client";
import { trackEvent } from "@/lib/analytics";

const STATION_URL = "https://veldbrandradio.co.za";

export default function ListenLiveCard({ lang }) {
  const t =
    lang === "af"
      ? {
          title: "Veldbrand Radio",
          desc: "Die radio waarna jy wil luister!",
          cta: "Luister",
        }
      : {
          title: "Veldbrand Radio",
          desc: "The radio you want to listen to!",
          cta: "Listen",
        };

  return (
    <a
      href={STATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("radio_card_click")}
      className="block relative rounded-2xl p-5 mb-4 overflow-hidden border-2 transition hover:scale-[1.01]"
      style={{
        borderColor: "#e11d48",
        background:
          "linear-gradient(135deg, rgba(225,29,72,0.18), rgba(250,204,21,0.10)), #0a0a0a",
        boxShadow: "0 0 24px rgba(225,29,72,0.3)",
      }}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">📻</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black uppercase tracking-wide text-rose-400">
            {t.title}
          </h2>
          <p className="text-sm text-neutral-300 mt-1">{t.desc}</p>
        </div>
        <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full bg-rose-500 text-black flex-shrink-0">
          {t.cta}
        </span>
      </div>
    </a>
  );
}