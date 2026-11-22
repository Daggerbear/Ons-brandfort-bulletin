// src/components/mybiz/StylePicker.js
// PAID: pick a page layout and a colour scheme.
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  SCHEMES,
  TEMPLATES,
  schemeKeys,
  templateKeys,
  safeScheme,
  safeTemplate,
  themeStyle,
} from "@/lib/bizTheme";

function Swatch({ scheme, active, label, onClick }) {
  const s = SCHEMES[scheme];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border p-2 text-left ${active ? "border-orange-500 ring-2 ring-orange-500/50" : "border-neutral-700"}`}
    >
      <div className="flex h-8 overflow-hidden rounded-lg border border-neutral-700">
        <span className="flex-1" style={{ background: s.dark }} />
        <span className="flex-1" style={{ background: s.light }} />
        <span className="flex-1" style={{ background: s.accent }} />
      </div>
      <p className="mt-1.5 text-center text-xs text-neutral-200">{label}</p>
    </button>
  );
}

function MiniPreview({ scheme, template, name, t, lang }) {
  const vars = themeStyle(scheme);
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ ...vars, background: "var(--bz-bg)", color: "var(--bz-text)", borderColor: "var(--bz-border)" }}
    >
      <div
        className="px-4 py-3"
        style={{ background: "radial-gradient(circle at 20% 0%, var(--bz-hero-from), var(--bz-bg) 75%)" }}
      >
        <p className="text-xs" style={{ color: "var(--bz-accent-text)" }}>
          {TEMPLATES[template].name[lang]}
        </p>
        <p className="text-lg font-bold">{name}</p>
      </div>
      <div className="space-y-2 px-4 py-3">
        <div
          className="rounded-lg px-3 py-2 text-center text-sm font-semibold"
          style={{ background: "var(--bz-accent)", color: "var(--bz-on-accent)" }}
        >
          {t.stylePreviewButton}
        </div>
        <div
          className="rounded-lg px-3 py-2 text-xs"
          style={{ background: "var(--bz-surface)", border: "1px solid var(--bz-border)", color: "var(--bz-muted)" }}
        >
          {t.stylePreviewCard}
        </div>
      </div>
    </div>
  );
}

export default function StylePicker({ biz, t, lang }) {
  const [saved, setSaved] = useState({
    template: safeTemplate(biz.page_template),
    theme: safeScheme(biz.page_theme),
  });
  const [template, setTemplate] = useState(saved.template);
  const [theme, setTheme] = useState(saved.theme);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [changedAt, setChangedAt] = useState(biz.look_changed_at || null);
  const dirty = template !== saved.template || theme !== saved.theme;

  // One change every 30 days (the database enforces this too)
  const unlockAt = changedAt ? new Date(new Date(changedAt).getTime() + 30 * 86400000) : null;
  const locked = !!unlockAt && unlockAt.getTime() > Date.now();
  const unlockText = unlockAt
    ? unlockAt.toLocaleDateString(lang === "en" ? "en-ZA" : "af-ZA", { day: "numeric", month: "long" })
    : "";

  const save = async () => {
    if (locked || !window.confirm(t.styleConfirm)) return;
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase
      .from("businesses")
      .update({ page_template: template, page_theme: theme })
      .eq("id", biz.id)
      .select("id");
    setBusy(false);
    if (error || !data || data.length === 0) {
      const lockedErr = error?.message?.includes("look_locked");
      setMsg({ ok: false, text: lockedErr ? t.styleLockedGeneric : t.fail });
      return;
    }
    setChangedAt(new Date().toISOString());
    setSaved({ template, theme });
    setMsg({ ok: true, text: t.saved });
  };

  return (
    <div className="mt-4 space-y-5">
      <p
        className={`rounded-lg px-3 py-2 text-sm ${
          locked ? "bg-yellow-600/15 text-yellow-300" : "bg-neutral-800 text-neutral-300"
        }`}
      >
        {locked ? t.styleLocked(unlockText) : t.styleOnceMonth}
      </p>

      <div>
        <p className="mb-2 text-sm font-semibold text-neutral-200">{t.styleLayout}</p>
        <div className="space-y-2">
          {templateKeys.map((key) => {
            const tpl = TEMPLATES[key];
            const on = template === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTemplate(key)}
                aria-pressed={on}
                className={`w-full rounded-xl border p-3 text-left ${on ? "border-orange-500 bg-orange-500/10" : "border-neutral-700"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{tpl.name[lang]}</span>
                  {tpl.free && (
                    <span className="rounded-full bg-green-600/25 px-2 py-0.5 text-xs font-bold text-green-300">
                      {t.freeBadge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-400">{tpl.desc[lang]}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-neutral-200">{t.styleColours}</p>
        <div className="grid grid-cols-4 gap-2">
          {schemeKeys.map((key) => (
            <Swatch key={key} scheme={key} label={SCHEMES[key].name[lang]} active={theme === key} onClick={() => setTheme(key)} />
          ))}
        </div>
      </div>

      <MiniPreview scheme={theme} template={template} name={biz.name} t={t} lang={lang} />

      {msg && <p className={`text-sm ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>}
      <button
        type="button"
        onClick={save}
        disabled={busy || !dirty || locked}
        className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-black transition hover:bg-orange-600 disabled:opacity-40"
      >
        {busy ? t.saving : t.styleSave}
      </button>
    </div>
  );
}
