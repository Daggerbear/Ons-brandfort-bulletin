// src/components/helper/BotMessage.js
// One message from Lientjie: her words, plus any cards, links and follow-up buttons.
"use client";
import Link from "next/link";
import UpdateRow from "@/components/helper/UpdateRow";
import { EventCard, BusinessCard, MenuHitRow } from "@/components/helper/HelperCards";
import { Avatar, linkClass } from "@/components/helper/HelperParts";

export default function BotMessage({ m, i, showAvatar, isLast, typing, t, lang, close, ask, chip, sendFeedback }) {
  return (
    <div key={i} className="lj-in flex items-start gap-2">
      <div className="w-7 flex-shrink-0 pt-0.5">
        {showAvatar && <Avatar size={28} />}
      </div>
      <div className="min-w-0 flex-1">
        {m.text && (
          <div className="mb-2 inline-block max-w-full whitespace-pre-line rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.07] px-4 py-2.5 text-[15px] leading-relaxed text-neutral-100">
            {m.text}
          </div>
        )}
        {m.updates && m.updates.length > 0 && (
          <div className="mb-2 space-y-2">
            {m.updates.map((u) => (
              <UpdateRow key={u.id} u={u} lang={lang} onNavigate={close} />
            ))}
          </div>
        )}
        {m.events && m.events.length > 0 && (
          <div className="mb-2 space-y-2">
            {m.events.map((e) => (
              <EventCard key={e.id} e={e} onNavigate={close} />
            ))}
          </div>
        )}
        {m.results && m.results.length > 0 && (
          <div className="mb-2 space-y-2">
            {m.results.map((b) => (
              <BusinessCard key={b.id} b={b} menuMode={m.menu?.[b.id]} t={t} lang={lang} onNavigate={close} />
            ))}
          </div>
        )}
        {m.menuHits && m.menuHits.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {m.results && m.results.length > 0 && <p className="text-xs text-neutral-500">{t.onMenus}</p>}
            {m.menuHits.map((h) => (
              <MenuHitRow key={h.id} h={h} onNavigate={close} />
            ))}
          </div>
        )}
        {m.links && m.links.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {m.links.map((l) =>
              /^(https?:|tel:)/.test(l.href) ? (
                <a
                  key={l.href + l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`rounded-xl px-4 py-2.5 text-[13px] font-semibold transition ${linkClass(l.href)}`}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  onClick={close}
                  className={`rounded-xl px-4 py-2.5 text-[13px] font-semibold shadow-[0_0_14px_rgba(249,115,22,0.3)] transition ${linkClass(l.href)}`}
                >
                  {l.label}
                </Link>
              )
            )}
          </div>
        )}
        {m.suggest && m.suggest.length > 0 && isLast && !typing && (
          <div className="mb-2 flex flex-wrap gap-2">
            {m.suggest.map((s) => (
              <button key={s.label} onClick={() => ask(s.query)} className={chip}>
                {s.label}
              </button>
            ))}
          </div>
        )}
        {m.askFeedback && (
          <div className="mt-1 flex items-center gap-2 text-[12px] text-neutral-500">
            {m.feedback === "good" && <span>{t.thanks}</span>}
            {m.feedback === "bad" && <span>{t.reported}</span>}
            {!m.feedback && (
              <>
                <span>{t.helpful}</span>
                <button
                  onClick={() => sendFeedback(i, true)}
                  aria-label="👍"
                  className="rounded-full border border-white/10 px-2 py-0.5 transition hover:border-orange-500"
                >
                  👍
                </button>
                <button
                  onClick={() => sendFeedback(i, false)}
                  aria-label="👎"
                  className="rounded-full border border-white/10 px-2 py-0.5 transition hover:border-orange-500"
                >
                  👎
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
