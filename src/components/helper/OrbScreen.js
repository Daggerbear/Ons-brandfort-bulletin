// src/components/helper/OrbScreen.js
// Lientjie's full-screen "orb" look: the ball on top, her answer in big centred text,
// and the question box at the bottom. Cards, links and buttons still come from BotMessage.
"use client";
import { useEffect, useRef } from "react";
import Orb from "@/components/helper/Orb";
import BotMessage from "@/components/helper/BotMessage";
import { QUICK_TAGS } from "@/components/helper/helperData";
import { TAG_ICONS } from "@/components/helper/HelperParts";
import { BOT_NAME } from "@/lib/botBrain";

export default function OrbScreen({
  messages,
  typing,
  t,
  lang,
  input,
  setInput,
  ask,
  close,
  chip,
  sendFeedback,
  switchLang,
  showChat,
}) {
  const scrollRef = useRef(null);
  let lastBot = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].type === "bot") {
      lastBot = i;
      break;
    }
  }
  const m = lastBot >= 0 ? messages[lastBot] : null;
  const lastUser = messages.length > 1 ? [...messages].reverse().find((x) => x.type === "user") : null;
  const state = typing ? "thinking" : m && messages.length > 1 ? "answer" : "idle";
  const hasExtras = m && ((m.updates && m.updates.length) || (m.events && m.events.length) || (m.results && m.results.length) || (m.menuHits && m.menuHits.length) || (m.links && m.links.length) || (m.suggest && m.suggest.length) || m.askFeedback);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col text-white"
      style={{
        background:
          "radial-gradient(600px 380px at 50% 22%, rgba(37,99,235,0.30), transparent 65%), radial-gradient(420px 300px at 90% 8%, rgba(255,106,0,0.16), transparent 60%), linear-gradient(180deg, #0a0c1a 0%, #070810 55%, #050507 100%)",
      }}
    >
      {/* Top bar: three equal columns so the name sits exactly over the ball */}
      <div
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 pb-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <div className="flex justify-start">
          <button
            onClick={showChat}
            aria-label={lang === "af" ? "Wys gesprek" : "Show chat"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-base transition hover:border-cyan-400"
          >
            💬
          </button>
        </div>
        <span className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-1.5 text-[13px] font-bold tracking-wide shadow-[0_0_18px_rgba(34,211,238,0.35)]">
          {BOT_NAME}
        </span>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={switchLang}
            aria-label={t.switchTo}
            className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400"
          >
            🌐 {lang === "af" ? "EN" : "AF"}
          </button>
          <button
            onClick={close}
            aria-label={t.close}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-neutral-200 transition hover:border-cyan-400"
          >
            ✕
          </button>
        </div>
      </div>

      {/* The ball */}
      <div className="flex justify-center pb-3 pt-4">
        <Orb size={typing || !hasExtras ? 160 : 120} state={state} pulseKey={messages.length} />
      </div>

      {/* Her answer */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-6 pb-4">
        <div className="mx-auto max-w-md text-center">
          {lastUser && (
            <p className="mb-3 truncate text-sm text-cyan-300/70">“{lastUser.text}”</p>
          )}
          {typing ? (
            <p className="lj-in text-lg text-neutral-400">{lang === "af" ? "Een oomblik…" : "One moment…"}</p>
          ) : (
            m &&
            m.text && (
              <p key={messages.length} className="lj-in whitespace-pre-line text-[22px] font-medium leading-snug text-white">
                {m.text}
              </p>
            )
          )}

          {!typing && m && (
            <div className="mt-6 text-left">
              {hasExtras && (
                <div className="-ml-9">
                  <BotMessage
                    m={{ ...m, text: null }}
                    i={lastBot}
                    showAvatar={false}
                    isLast
                    typing={typing}
                    t={t}
                    lang={lang}
                    close={close}
                    ask={ask}
                    chip={chip}
                    sendFeedback={sendFeedback}
                  />
                </div>
              )}
            </div>
          )}

          {messages.length <= 1 && !typing && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {QUICK_TAGS.map((tag) => (
                <button key={tag.en} onClick={() => ask(tag[lang])} className={chip}>
                  {TAG_ICONS[tag.en] || "💬"} {tag[lang]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="px-4 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] p-1.5 pl-5 shadow-[0_0_30px_rgba(37,99,235,0.2)] backdrop-blur-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-white outline-none placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            aria-label={t.send}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_0_16px_rgba(34,211,238,0.45)] transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12 2-12 2z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-neutral-600">{t.privacy}</p>
      </form>
    </div>
  );
}
