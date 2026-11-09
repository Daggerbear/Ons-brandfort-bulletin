// src/app/profile/customise/page.js
"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LangProvider";
import ProfileTabs from "@/components/ProfileTabs";

const text = {
  af: {
    back: "← Terug na die Bulletin",
    title: "Pasmaak",
    soon: "BINNEKORT",
    intro:
      "Hier gaan jy jou profiel pasmaak met items wat jy verdien. Alles word verdien deur te speel en deel te neem. Niks word met geld gekoop nie.",
    signIn: "Teken in om hierdie bladsy te sien.",
    slots: [
      { icon: "🖼️", name: "Rame", note: "Gloeiende rame vir jou profielfoto" },
      { icon: "🏷️", name: "Titels", note: "Wys wat jy bereik het" },
      { icon: "🎖️", name: "Kentekens", note: "Vir mylpale en spesiale geleenthede" },
      { icon: "⭐", name: "Beperkte items", note: "Slegs vir mense wat vroeg daar was" },
    ],
  },
  en: {
    back: "← Back to the Bulletin",
    title: "Customise",
    soon: "SOON",
    intro:
      "This is where you'll personalise your profile with items you earn. Everything is earned by playing and taking part. Nothing is bought with money.",
    signIn: "Sign in to see this page.",
    slots: [
      { icon: "🖼️", name: "Frames", note: "Glowing frames for your profile photo" },
      { icon: "🏷️", name: "Titles", note: "Show what you've achieved" },
      { icon: "🎖️", name: "Badges", note: "For milestones and special events" },
      { icon: "⭐", name: "Limited items", note: "Only for people who were here early" },
    ],
  },
};

export default function CustomisePage() {
  const { user, loading } = useAuth();
  const { lang } = useLang();
  const t = text[lang === "af" ? "af" : "en"];

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-orange-400 hover:text-orange-300">
          {t.back}
        </Link>

        {loading ? (
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-neutral-900" />
        ) : !user ? (
          <p className="mt-6 text-center text-sm text-neutral-400">{t.signIn}</p>
        ) : (
          <>
            <ProfileTabs lang={lang} />
            <div className="mt-5 rounded-2xl border border-cyan-400/30 bg-[#050b18] p-5">
              <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-300">
                [ {t.title.toUpperCase()} ] · {t.soon}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">{t.intro}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {t.slots.map((s) => (
                  <div
                    key={s.name}
                    className="rounded-xl border border-dashed border-cyan-400/30 bg-black p-3 text-center opacity-70"
                  >
                    <div className="text-3xl grayscale">{s.icon}</div>
                    <p className="mt-1 text-sm font-bold text-white">{s.name}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">{s.note}</p>
                    <p className="mt-2 text-[10px] text-neutral-600">🔒</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
