// src/components/LegalPage.js
// One good-looking layout for Terms and Privacy: summary card, jump-to chips, numbered sections.
"use client";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

const WHATSAPP = "27603661384";
const EMAIL = "duplessisjaco978@gmail.com";

// Lines that start with "• " become a bullet list; everything else is a paragraph
function Body({ lines }) {
  const out = [];
  let bullets = [];
  const flush = () => {
    if (bullets.length) {
      out.push(
        <ul key={`u${out.length}`} className="mb-3 space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-neutral-300">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };
  lines.forEach((l, i) => {
    if (l.startsWith("• ")) bullets.push(l.slice(2));
    else {
      flush();
      out.push(
        <p key={`p${i}`} className="mb-3 text-[15px] leading-relaxed text-neutral-300">
          {l}
        </p>
      );
    }
  });
  flush();
  return out;
}

export default function LegalPage({ doc, other }) {
  const { lang, setLang } = useLang();
  const d = doc[lang] || doc.af;
  const o = other[lang] || other.af;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-16 pt-8 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{d.title}</h1>
            <p className="mt-1 text-sm text-neutral-500">{d.updated}</p>
          </div>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="flex-shrink-0 rounded-full border border-neutral-700 px-3 py-1 text-xs font-semibold text-neutral-300 transition hover:border-orange-500 hover:text-orange-400"
          >
            🌐 {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-neutral-900 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-400">{d.summaryTitle}</p>
          <ul className="space-y-2">
            {d.summary.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-neutral-200">
                <span className="text-orange-400">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-neutral-500">{d.summaryNote}</p>
        </div>

        <nav className="sticky top-14 z-10 -mx-4 mb-6 border-y border-neutral-800 bg-neutral-950/90 px-4 py-2.5 backdrop-blur">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {d.sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex-shrink-0 whitespace-nowrap rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                {i + 1}. {s.short || s.h}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-4">
          {d.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-32 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
              <h2 className="mb-3 flex items-center gap-3 text-lg font-bold text-white">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-sm font-black text-orange-400">{i + 1}</span>
                {s.h}
              </h2>
              <Body lines={s.p} />
              {s.contact && (
                <div className="flex flex-wrap gap-2">
                  <a href={`https://wa.me/${WHATSAPP}`} className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500">
                    💬 WhatsApp 060 366 1384
                  </a>
                  <a href={`mailto:${EMAIL}`} className="rounded-full border border-neutral-600 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-orange-500">
                    ✉️ {EMAIL}
                  </a>
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-sm">
          <Link href={other.href} className="rounded-full border border-neutral-700 px-5 py-2 text-neutral-200 transition hover:border-orange-500 hover:text-orange-400">
            {o}
          </Link>
          <Link href="/" className="text-neutral-500 underline hover:text-white">
            {lang === "af" ? "Terug na Tuisblad" : "Back to Homepage"}
          </Link>
        </div>
      </div>
    </main>
  );
}
