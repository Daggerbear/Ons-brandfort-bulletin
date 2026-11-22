// src/components/biz/BizParts.js
// Building blocks for the business page. They are painted with the page's
// colour variables (--bz-*), so one set of parts works for every colour scheme.
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { getCategoryByName } from "@/lib/categories";

export const st = {
  card: { background: "var(--bz-surface)", border: "1px solid var(--bz-border)" },
  accent: { background: "var(--bz-accent)", color: "var(--bz-on-accent)" },
  outline: { border: "2px solid var(--bz-accent)", color: "var(--bz-accent-text)" },
  ghost: { background: "var(--bz-surface2)", border: "1px solid var(--bz-border)", color: "var(--bz-text)" },
  whatsapp: { background: "#16a34a", color: "#ffffff" },
  chip: {
    background: "var(--bz-accent-soft)",
    border: "1px solid var(--bz-accent-line)",
    color: "var(--bz-accent-text)",
  },
  muted: { color: "var(--bz-muted)" },
  accentText: { color: "var(--bz-accent-text)" },
};

const BASE_BTN =
  "flex items-center justify-center gap-2 text-center font-semibold rounded-lg transition hover:opacity-90";

const SIZES = {
  md: "px-4 py-3",
  lg: "px-4 py-5 text-lg",
  tile: "flex-col px-2 py-4 text-sm",
};

// kind: whatsapp | accent | outline | ghost      size: md | lg | tile
export function ActionLink({ href, kind = "ghost", size = "md", onClick, external, className = "", children }) {
  return (
    <a
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={st[kind]}
      className={`${BASE_BTN} ${SIZES[size]} ${className}`}
    >
      {children}
    </a>
  );
}

export function SectionTitle({ children }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={st.muted}>
      {children}
    </h2>
  );
}

export function Hero({ business, cat, rating, t, big = false }) {
  const logo = big ? 112 : 88;
  return (
    <header
      className="px-6 pt-5 pb-7"
      style={{
        borderBottom: "1px solid var(--bz-accent-line)",
        background: "radial-gradient(circle at 20% 0%, var(--bz-hero-from), var(--bz-bg) 75%)",
      }}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-5">
          <Link href={`/besighede/${cat.slug}`} className="text-sm hover:opacity-80" style={st.accentText}>
            ← {t.back}
          </Link>
        </div>

        <div className={big ? "flex flex-col items-start gap-4" : "flex items-center gap-4"}>
          <SafeImage
            src={business.logo_url}
            alt={`${business.name} logo`}
            width={logo}
            height={logo}
            priority
            className={`${big ? "w-28 h-28" : "w-[88px] h-[88px]"} object-cover rounded-2xl border-2 border-[color:var(--bz-accent-line)] flex-shrink-0`}
            fallback={
              <div
                className="rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  width: logo,
                  height: logo,
                  fontSize: big ? 52 : 36,
                  background: "var(--bz-surface)",
                  border: "2px solid var(--bz-accent-line)",
                }}
              >
                {cat.icon}
              </div>
            }
          />
          <div className="min-w-0">
            <span
              className="inline-flex items-center gap-1 text-xs uppercase tracking-wide rounded-full px-3 py-1 mb-2"
              style={{ border: "1px solid var(--bz-accent-line)", color: "var(--bz-accent-text)" }}
            >
              {cat.icon} {cat.label}
            </span>
            <h1 className={`${big ? "text-3xl" : "text-2xl"} font-bold leading-tight break-words`}>
              {business.name}
            </h1>
            {rating.avg && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-400 text-sm">
                  {"★".repeat(Math.round(rating.avg))}
                  {"☆".repeat(5 - Math.round(rating.avg))}
                </span>
                <span className="text-xs" style={st.muted}>
                  {rating.avg} ({rating.count})
                </span>
              </div>
            )}
            {big && business.description && (
              <p className="mt-3 leading-relaxed whitespace-pre-line break-words" style={{ color: "var(--bz-text)" }}>
                {business.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Description({ text }) {
  if (!text) return null;
  return (
    <p className="mb-6 leading-relaxed whitespace-pre-line break-words" style={{ color: "var(--bz-text)", opacity: 0.88 }}>
      {text}
    </p>
  );
}

// variant: chips | cards | list
export function Services({ services, t, variant = "chips" }) {
  if (!services?.length) return null;
  return (
    <div className="mb-8">
      <SectionTitle>🛠️ {t.services}</SectionTitle>
      {variant === "chips" && (
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <span key={s} className="text-sm rounded-full px-3 py-1 capitalize" style={st.chip}>
              {s}
            </span>
          ))}
        </div>
      )}
      {variant === "cards" && (
        <div className="grid grid-cols-2 gap-3">
          {services.map((s) => (
            <div key={s} className="rounded-xl p-4" style={st.card}>
              <p className="text-lg mb-1" style={st.accentText}>
                ✦
              </p>
              <p className="font-semibold text-sm capitalize break-words">{s}</p>
            </div>
          ))}
        </div>
      )}
      {variant === "list" && (
        <ul className="space-y-2">
          {services.map((s) => (
            <li key={s} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={st.card}>
              <span style={st.accentText}>✓</span>
              <span className="capitalize break-words">{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function InfoCards({ business, mapsLink, onMaps, t }) {
  if (!business.address && !business.hours && !business.contact) return null;
  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      {business.address && (
        <a
          href={mapsLink}
          onClick={onMaps}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl p-3 col-span-2 hover:opacity-90 transition"
          style={st.card}
        >
          <p className="text-xs uppercase mb-1" style={st.muted}>
            📍 {t.address}
          </p>
          <p className="text-sm">{business.address}</p>
          <p className="text-xs mt-1" style={st.accentText}>
            {t.openMaps}
          </p>
        </a>
      )}
      {business.hours && (
        <div className="rounded-xl p-3" style={st.card}>
          <p className="text-xs uppercase mb-1" style={st.muted}>
            🕒 {t.hours}
          </p>
          <p className="text-sm">{business.hours}</p>
        </div>
      )}
      {business.contact && (
        <div className="rounded-xl p-3" style={st.card}>
          <p className="text-xs uppercase mb-1" style={st.muted}>
            📞 {t.contact}
          </p>
          <p className="text-sm break-words">{business.contact}</p>
        </div>
      )}
    </div>
  );
}

export function SisterList({ sisters, lang, t }) {
  if (!sisters?.length) return null;
  return (
    <div className="mb-8">
      <SectionTitle>👥 {t.sisterBusinesses}</SectionTitle>
      <div className="flex flex-col gap-2">
        {sisters.map((sister) => {
          const sCat = getCategoryByName(sister.category);
          return (
            <Link
              key={sister.id}
              href={`/business/${sister.id}`}
              className="flex items-center gap-3 rounded-xl p-3 hover:opacity-90 transition"
              style={st.card}
            >
              <SafeImage
                src={sister.logo_url}
                alt={sister.name}
                width={44}
                height={44}
                className="w-11 h-11 object-cover rounded-lg flex-shrink-0"
                fallback={
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "var(--bz-surface2)" }}
                  >
                    {sCat?.icon || "🏪"}
                  </div>
                }
              />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{sister.name}</p>
                <p className="text-xs truncate" style={st.muted}>
                  {sCat ? sCat[lang] : sister.category}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
