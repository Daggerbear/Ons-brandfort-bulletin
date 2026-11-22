// src/components/ClaimBusinessButton.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";
import { useAuth } from "@/components/AuthProvider";

const T = {
  af: {
    ask: "Is dit jou besigheid?",
    cta: "Maak aanspraak",
    signin: "Teken in om aanspraak te maak",
    name: "Jou naam",
    whatsapp: "WhatsApp-nommer",
    message: "Hoe is jy aan die besigheid verbonde?",
    messagePh: "Bv. Ek is die eienaar",
    send: "Stuur aanvraag",
    sending: "Stuur...",
    cancel: "Kanselleer",
    sent: "Aanvraag gestuur. Ons kontak jou op WhatsApp.",
    already: "Jy het reeds 'n aanvraag vir hierdie besigheid gestuur.",
    taken: "Hierdie besigheid het reeds 'n eienaar.",
    limit: "Jy het te veel oop aanvrae. Wag tot ons van hulle besluit het.",
    fail: "Kon nie stuur nie. Probeer weer.",
    needNameWa: "Vul jou naam en WhatsApp-nommer in.",
    owned: "Eienaar bevestig",
  },
  en: {
    ask: "Is this your business?",
    cta: "Claim it",
    signin: "Sign in to claim",
    name: "Your name",
    whatsapp: "WhatsApp number",
    message: "How are you connected to this business?",
    messagePh: "E.g. I am the owner",
    send: "Send request",
    sending: "Sending...",
    cancel: "Cancel",
    sent: "Request sent. We will contact you on WhatsApp.",
    already: "You already sent a request for this business.",
    taken: "This business already has an owner.",
    limit: "You have too many open requests. Wait until we decide on them.",
    fail: "Could not send. Please try again.",
    needNameWa: "Fill in your name and WhatsApp number.",
    owned: "Owner verified",
  },
};

export default function ClaimBusinessButton({ businessId, ownerId }) {
  const { lang } = useLang();
  const t = T[lang] || T.af;
  const { user, loading: authLoading } = useAuth();

  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", whatsapp: "", message: "" });
  const ready = !authLoading;
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    supabase
      .from("business_claims")
      .select("id")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .limit(1)
      .then(({ data }) => {
        if (alive && data && data.length > 0) setSent(true);
      });
    const first = (user?.user_metadata?.given_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "").split(" ")[0];
    if (first) setForm((f) => (f.name ? f : { ...f, name: first }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, userId]);

  if (!ready) return null;

  if (ownerId) {
    return (
      <p className="text-xs text-green-400 mt-4 flex items-center gap-1.5">
        <span>✔</span> {t.owned}
      </p>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.whatsapp.trim()) {
      setError(t.needNameWa);
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.from("business_claims").insert({
      business_id: businessId,
      user_id: user.id,
      claimant_name: form.name.trim(),
      whatsapp: form.whatsapp.trim(),
      message: form.message.trim() || null,
    });
    setBusy(false);
    if (!err) {
      setSent(true);
      setOpen(false);
      return;
    }
    if (err.code === "23505") setError(t.already);
    else if (err.code === "42501") setError(t.limit);
    else setError(t.fail);
  };

  return (
    <div className="mt-6 border border-neutral-800 rounded-xl p-4 bg-neutral-900/60">
      <p className="text-sm font-semibold text-white">{t.ask}</p>

      {sent ? (
        <p className="text-sm text-green-400 mt-2">{t.sent}</p>
      ) : !user ? (
        <Link
          href="/profile"
          className="inline-block mt-3 text-sm font-semibold bg-orange-500 hover:bg-orange-600 transition text-black rounded-lg px-4 py-2"
        >
          {t.signin}
        </Link>
      ) : !open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 text-sm font-semibold bg-orange-500 hover:bg-orange-600 transition text-black rounded-lg px-4 py-2"
        >
          {t.cta}
        </button>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t.name}
            maxLength={60}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
          />
          <input
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            placeholder={t.whatsapp}
            inputMode="tel"
            maxLength={20}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={`${t.message} ${t.messagePh}`}
            rows={2}
            maxLength={300}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 transition text-black rounded-lg px-4 py-2 disabled:opacity-50"
            >
              {busy ? t.sending : t.send}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-neutral-400 hover:text-white px-3 py-2"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
