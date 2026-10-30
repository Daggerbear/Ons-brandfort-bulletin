// src/components/NewspaperSlot.js
"use client";
import { trackEvent } from "@/lib/analytics";

// Fill these in when the newspaper partner is ready
const PAPER = {
  name: "Brandfort Nuus",
  url: "",
};

export default function NewspaperSlot({ lang }) {
  const t =
    lang === "af"
      ? {
          label: "Koerant",
          desc: "Plaaslike nuus, binnekort hier.",
          cta: "Lees",
        }
      : {
          label: "Newspaper",
          desc: "Local news, coming soon.",
          cta: "Read",
        };

  const live = Boolean(PAPER.url);
  const Wrapper = live ? "a" : "div";
  const props = live
    ? {
        href: PAPER.url,
        target: "_blank",
        rel: "noopener noreferrer",
        onClick: () => trackEvent("newspaper_slot_click"),
      }
    : {};

  return (
    <Wrapper
      {...props}
      className="block mt-8 rounded-2xl p-5 border-2 border-amber-400/60 bg-black/50 transition hover:scale-[1.01]"
      style={{ boxShadow: "0 0 20px rgba(251,191,36,0.18)" }}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">📰</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            {t.label}
          </p>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            {PAPER.name}
          </h2>
          <p className="text-sm text-neutral-400 mt-0.5">{t.desc}</p>
        </div>
        {live && (
          <span className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full bg-amber-400 text-black flex-shrink-0">
            {t.cta}
          </span>
        )}
      </div>
    </Wrapper>
  );
}