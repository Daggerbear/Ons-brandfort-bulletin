// src/components/BulletinHelper.js
"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";
import { getReply, getGreetingReply, BOT_NAME } from "@/lib/botBrain";
import { useAuth } from "@/components/AuthProvider";
import { trackEvent } from "@/lib/analytics";
import { QUICK_TAGS, TEXT, findMenuItems } from "@/components/helper/helperData";
import BotMessage from "@/components/helper/BotMessage";
import OrbScreen from "@/components/helper/OrbScreen";
import { Avatar, CSS, TAG_ICONS } from "@/components/helper/HelperParts";

export default function BulletinHelper() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [view, setView] = useState("orb"); // "orb" = the glowing ball look, "chat" = the classic chat window
  const bottomRef = useRef(null);
  const loadRef = useRef(null);
  const dataRef = useRef({ businesses: [], knowledge: [], events: null, menu: {}, updates: null });
  const memoryRef = useRef({ focus: [] }); // what we were just talking about
  const ownerRef = useRef(null); // { count } when the signed-in person owns businesses
  const { user } = useAuth();

  const t = TEXT[lang];

  const hidden =
    pathname === "/vind" ||
    (pathname || "").startsWith("/create") ||
    (pathname || "").startsWith("/games/") ||
    (pathname || "").startsWith("/admin") ||
    (pathname || "").startsWith("/auth") ||
    (pathname || "").startsWith("/grid");

  useEffect(() => {
    if (hidden) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("bulletin_helper_hint") === "1";
    } catch {}
    if (seen) return;
    const show = setTimeout(() => {
      setShowHint(true);
      try {
        sessionStorage.setItem("bulletin_helper_hint", "1");
      } catch {}
    }, 5000);
    const hide = setTimeout(() => setShowHint(false), 15000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [hidden]);

  useEffect(() => {
    if (!open || loadRef.current) return;
    loadRef.current = (async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [bizRes, knRes, evRes, menuRes, updRes, ownRes] = await Promise.all([
        supabase.from("businesses").select("*").eq("Status", "approved").order("created_at", { ascending: false }),
        supabase.from("bot_knowledge").select("*").eq("active", true),
        supabase.from("events").select("*").eq("status", "approved").order("created_at", { ascending: false }),
        supabase.from("business_menu_settings").select("business_id, menu_enabled, menu_mode"),
        supabase
          .from("business_updates")
          .select("id, business_id, title, body, category, created_at")
          .eq("Status", "approved")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(40),
        user
          ? supabase.from("businesses").select("id", { count: "exact", head: true }).eq("owner_id", user.id)
          : Promise.resolve({ count: 0 }),
      ]);
      ownerRef.current = (ownRes.count || 0) > 0 ? { count: ownRes.count } : null;
      const menu = {};
      (menuRes.data || []).forEach((m) => {
        if (m.menu_enabled) menu[m.business_id] = m.menu_mode || "order";
      });
      dataRef.current = {
        businesses: bizRes.data || [],
        knowledge: knRes.data || [],
        events: evRes.error || !evRes.data ? null : evRes.data,
        menu,
        updates: updRes.error || !updRes.data ? null : updRes.data,
      };
    })();
  }, [open]);

  useEffect(() => {
    setMessages((prev) => (prev.length <= 1 ? [] : prev));
  }, [lang]);
  useEffect(() => {
    if (!open || messages.length > 0) return;
    // wait for the data so an owner is greeted as an owner
    Promise.resolve(loadRef.current)
      .catch(() => {})
      .then(() => {
        const g = getGreetingReply(lang, ownerRef.current);
        setMessages((prev) => (prev.length === 0 ? [{ type: "bot", text: g.text, links: g.links }] : prev));
      });
  }, [open, messages.length, lang]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (hidden) return null;

  const logToTeam = (text) => {
    supabase.rpc("log_unanswered", { q: text }).then(
      () => {},
      () => {}
    );
  };

  const ask = async (query) => {
    const q = (query || "").trim();
    if (!q || typing) return;
    setInput("");
    setMessages((prev) => [...prev, { type: "user", text: q }]);
    setTyping(true);
    const started = Date.now();
    trackEvent("search", { query: q, source: "helper" });
    let botMessage;
    try {
      try {
        await loadRef.current;
      } catch {}
      const { businesses, knowledge, events, menu, updates } = dataRef.current;
      let reply = getReply({
        query: q,
        lang,
        businesses,
        knowledge,
        events,
        menu,
        updates,
        memory: memoryRef.current,
        owner: ownerRef.current,
      });
      if (reply.memory) memoryRef.current = { ...memoryRef.current, ...reply.memory };
      let menuHits = [];
      if (reply.results || reply.unanswered) {
        menuHits = await findMenuItems(q, businesses);
        if (reply.unanswered && menuHits.length > 0) reply = { text: TEXT[lang].foundOnMenu };
      }
      if (reply.unanswered) logToTeam(q);
      if (reply.logAs) logToTeam(reply.logAs);
      botMessage = {
        type: "bot",
        text: reply.text,
        results: reply.results,
        events: reply.events,
        updates: reply.updates,
        links: reply.links,
        suggest: reply.suggest,
        menuHits,
        menu,
        query: q,
        askFeedback:
          !reply.unanswered &&
          (!!reply.results || !!reply.events || !!reply.updates || !!reply.links?.length || menuHits.length > 0),
      };
    } catch {
      botMessage = {
        type: "bot",
        text: lang === "af" ? "Haai, iets het skeefgeloop. Probeer asseblief weer." : "Oops, something went wrong. Please try again.",
      };
    }
    // a short pause so she feels like she is typing, not a machine spitting out answers
    const wait = Math.max(0, 450 - (Date.now() - started));
    if (wait) await new Promise((r) => setTimeout(r, wait));
    setTyping(false);
    setMessages((prev) => [...prev, botMessage]);
  };

  const sendFeedback = (index, good) => {
    const m = messages[index];
    if (!m || m.feedback) return;
    if (!good) logToTeam(`[nie nuttig] ${m.query}`.slice(0, 200));
    setMessages((prev) => prev.map((x, i) => (i === index ? { ...x, feedback: good ? "good" : "bad" } : x)));
  };

  const switchLang = () => setLang(lang === "af" ? "en" : "af");

  // Docked flush on top of the tab bar (bar is 4rem tall + its small bottom padding)
  const bottomOffset = "calc(min(env(safe-area-inset-bottom, 0px), 12px) + 4rem)";
  const close = () => setOpen(false);
  const openChat = () => {
    setShowHint(false);
    setOpen(true);
  };

  const chip =
    "rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[13px] text-neutral-200 transition hover:border-orange-500/70 hover:text-orange-300 active:scale-95";

  return (
    <>
      <style>{CSS}</style>

      {!open && (
        <>
          {showHint && (
            <button
              onClick={openChat}
              className="lj-in fixed right-4 z-40 rounded-2xl rounded-br-sm border border-orange-500/50 bg-neutral-900/90 px-4 py-2 text-sm font-medium text-neutral-100 shadow-[0_0_18px_rgba(249,115,22,0.35)] backdrop-blur-md"
              style={{ bottom: "calc(min(env(safe-area-inset-bottom, 0px), 12px) + 8.5rem)" }}
            >
              {t.hint}
            </button>
          )}

          <button
            onClick={openChat}
            aria-label={t.open}
            className="fixed left-1/2 z-40 flex h-[52px] w-full max-w-2xl -translate-x-1/2 items-center gap-3 rounded-t-2xl border-x border-t border-white/15 px-3 shadow-[0_-10px_30px_rgba(0,0,0,0.55)] transition active:brightness-110"
            style={{
              bottom: bottomOffset,
              background: "linear-gradient(180deg, rgba(34,22,14,0.92), rgba(10,10,10,0.95))",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <Avatar size={38} online />
            <div className="flex flex-1 flex-col items-start leading-tight">
              <span className="text-[15px] font-bold text-white">{lang === "af" ? "Vra vir Lientjie" : "Ask Lientjie"}</span>
              <span className="text-[11px] font-medium text-cyan-300">
                {lang === "af" ? "Dorpsgids aanlyn" : "Town guide online"}
              </span>
            </div>
            <span className="rounded-full bg-orange-500 px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-wider text-black shadow-[0_0_14px_rgba(249,115,22,0.5)]">
              {lang === "af" ? "Gesels" : "Chat"}
            </span>
          </button>
        </>
      )}

      {open && view === "orb" && (
        <OrbScreen
          messages={messages}
          typing={typing}
          t={t}
          lang={lang}
          input={input}
          setInput={setInput}
          ask={ask}
          close={close}
          chip={chip}
          sendFeedback={sendFeedback}
          switchLang={switchLang}
          showChat={() => setView("chat")}
        />
      )}

      {open && view === "chat" && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm sm:pointer-events-none sm:bg-transparent" onClick={close}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 flex h-[85dvh] max-h-[680px] flex-col overflow-hidden rounded-t-3xl border border-white/10 shadow-[0_-12px_50px_rgba(0,0,0,0.65)] sm:pointer-events-auto sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[24rem] sm:rounded-3xl"
            style={{
              background:
                "radial-gradient(520px 220px at 15% -8%, rgba(255,106,0,0.20), transparent 62%), radial-gradient(420px 260px at 105% 20%, rgba(34,211,238,0.10), transparent 60%), linear-gradient(180deg, rgba(20,16,14,0.97), rgba(8,8,8,0.98))",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Avatar size={44} online />
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-bold leading-tight text-white">{BOT_NAME}</p>
                <p className="truncate text-xs text-cyan-300">{t.subtitle}</p>
              </div>
              <button
                onClick={() => setView("orb")}
                aria-label="Orb"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-base transition hover:bg-cyan-400/20"
              >
                🔮
              </button>
              <button
                onClick={switchLang}
                aria-label={t.switchTo}
                className="flex flex-shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-neutral-200 transition hover:border-orange-500 hover:text-orange-300"
              >
                🌐 {lang === "af" ? "EN" : "AF"}
              </button>
              <button
                onClick={close}
                aria-label={t.close}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-neutral-200 transition hover:bg-white/20 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
              <p className="rounded-xl bg-white/[0.04] px-3 py-2 text-[12px] leading-relaxed text-neutral-400">{t.intro}</p>

              {messages.map((m, i) =>
                m.type === "user" ? (
                  <div key={i} className="lj-in flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-orange-400 to-orange-600 px-4 py-2.5 text-[15px] font-medium text-black shadow-[0_4px_18px_rgba(249,115,22,0.35)]">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <BotMessage
                    key={i}
                    m={m}
                    i={i}
                    showAvatar={i === 0 || messages[i - 1].type === "user"}
                    isLast={i === messages.length - 1}
                    typing={typing}
                    t={t}
                    lang={lang}
                    close={close}
                    ask={ask}
                    chip={chip}
                    sendFeedback={sendFeedback}
                  />
                )
              )}

              {typing && (
                <div className="lj-in flex items-start gap-2">
                  <div className="w-7 flex-shrink-0 pt-0.5">
                    <Avatar size={28} />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.07] px-4 py-3.5">
                    {[0, 1, 2].map((n) => (
                      <span
                        key={n}
                        className="lj-dot h-2 w-2 rounded-full bg-orange-400"
                        style={{ animationDelay: `${n * 0.16}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {messages.length <= 1 && !typing && (
                <div className="pt-1">
                  <p className="mb-2 text-xs text-neutral-500">{t.tryTags}</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TAGS.map((tag) => (
                      <button key={tag.en} onClick={() => ask(tag[lang])} className={chip}>
                        {TAG_ICONS[tag.en] || "💬"} {tag[lang]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="border-t border-white/10 bg-black/30 px-3 pt-3"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.07] px-4 py-3 text-base text-white outline-none transition placeholder:text-neutral-500 focus:border-orange-500 focus:bg-white/[0.1]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  aria-label={t.send}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-black shadow-[0_0_16px_rgba(249,115,22,0.45)] transition hover:bg-orange-400 active:scale-95 disabled:opacity-40 disabled:shadow-none"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12 2-12 2z" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-neutral-600">{t.privacy}</p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
