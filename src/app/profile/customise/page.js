// src/app/profile/customise/page.js
"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LangProvider";
import ProfileTabs from "@/components/ProfileTabs";
import ProfileShell from "@/components/profile/ProfileShell";

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
    <ProfileShell>
      <Link href="/" className="pf-link text-sm">
        {t.back}
      </Link>

      {loading ? (
        <div className="pf-card mt-6 h-40 animate-pulse" />
      ) : !user ? (
        <p className="pf-muted mt-6 text-center text-sm">{t.signIn}</p>
      ) : (
        <div className="mt-5 space-y-4">
          <ProfileTabs lang={lang} />
          <div className="pf-card p-5">
            <p className="pf-eyebrow">
              {t.title} · {t.soon}
            </p>
            <p className="pf-muted mt-3 text-sm leading-relaxed">{t.intro}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {t.slots.map((s) => (
                <div
                  key={s.name}
                  className="rounded-xl border border-dashed p-3 text-center opacity-80"
                  style={{ borderColor: "var(--pf-line-strong)", background: "var(--pf-input)" }}
                >
                  <div className="text-3xl grayscale">{s.icon}</div>
                  <p className="mt-1 text-sm font-bold">{s.name}</p>
                  <p className="pf-faint mt-0.5 text-[11px] leading-snug">{s.note}</p>
                  <p className="pf-faint mt-2 text-[10px]">🔒</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ProfileShell>
  );
}
