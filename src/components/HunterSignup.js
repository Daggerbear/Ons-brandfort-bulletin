// src/components/HunterSignup.js
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const text = {
  af: {
    title: "WORD 'N HUNTER",
    body:
      "Hunters kry daaglikse en weeklikse missies, verdien XP en klim vlakke. Jy kan 'n speelnaam kies in plaas van jou regte naam.",
    button: "Word 'n Hunter",
    nameLabel: "Speelnaam",
    namePlaceholder: "bv. VeldVark",
    phoneLabel: "Selnommer (opsioneel)",
    phoneHelp:
      "Net vir jou rekening, vir toekomstige beloning-boodskappe. Ons wys dit nooit aan ander nie.",
    save: "Begin jag",
    saving: "Stoor...",
    cancel: "Kanselleer",
    nameRule: "Jou speelnaam moet tussen 3 en 20 karakters wees (letters, syfers, _ en -).",
    phoneRule: "Gebruik 'n Suid-Afrikaanse nommer, bv. 0821234567.",
    failed: "Kon nie stoor nie. Probeer asseblief weer.",
  },
  en: {
    title: "BECOME A HUNTER",
    body:
      "Hunters get daily and weekly missions, earn XP and level up. You can pick a gamer name instead of using your real name.",
    button: "Become a Hunter",
    nameLabel: "Gamer name",
    namePlaceholder: "e.g. VeldVark",
    phoneLabel: "Cell number (optional)",
    phoneHelp:
      "Only for your account, for future reward messages. We never show it to others.",
    save: "Start hunting",
    saving: "Saving...",
    cancel: "Cancel",
    nameRule: "Your gamer name must be 3 to 20 characters (letters, numbers, _ and -).",
    phoneRule: "Use a South African number, e.g. 0821234567.",
    failed: "Couldn't save. Please try again.",
  },
};

// 0821234567, 082 123 4567 or +27821234567 -> 0821234567
function cleanPhone(raw) {
  const digits = String(raw || "").replace(/[\s()-]/g, "");
  if (!digits) return "";
  const local = digits.startsWith("+27") ? "0" + digits.slice(3) : digits;
  return /^0\d{9}$/.test(local) ? local : null;
}

export default function HunterSignup({ lang = "af", defaultName = "" }) {
  const t = text[lang] || text.af;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    const gamer = name.trim();
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(gamer)) return setError(t.nameRule);
    const cell = cleanPhone(phone);
    if (cell === null) return setError(t.phoneRule);

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { hunter: true, gamer_name: gamer, phone: cell || null },
    });
    setSaving(false);
    // On success AuthProvider hears the update and the profile switches to Hunter mode
    if (updateError) setError(t.failed);
  };

  if (!open) {
    return (
      <section className="mt-4 rounded-2xl border border-cyan-400/30 bg-[#050b18] p-5">
        <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-300">
          [ {t.title} ]
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">{t.body}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 w-full rounded-lg bg-cyan-400 py-3 font-semibold text-black transition hover:bg-cyan-300"
        >
          🎯 {t.button}
        </button>
      </section>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 space-y-4 rounded-2xl border border-cyan-400/30 bg-[#050b18] p-5"
    >
      <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-300">
        [ {t.title} ]
      </p>

      <div>
        <label htmlFor="gamer_name" className="mb-1 block text-xs text-neutral-400">
          {t.nameLabel}
        </label>
        <input
          id="gamer_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder={t.namePlaceholder}
          autoComplete="off"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <label htmlFor="hunter_phone" className="mb-1 block text-xs text-neutral-400">
          {t.phoneLabel}
        </label>
        <input
          id="hunter_phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={16}
          autoComplete="tel"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-cyan-400"
        />
        <p className="mt-1 text-xs text-neutral-500">{t.phoneHelp}</p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-neutral-700 py-3 text-sm text-neutral-300"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 rounded-lg bg-cyan-400 py-3 font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {saving ? t.saving : t.save}
        </button>
      </div>
    </form>
  );
}
