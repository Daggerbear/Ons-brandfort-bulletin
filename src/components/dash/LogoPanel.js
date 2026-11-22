// src/components/dash/LogoPanel.js
// Change the business logo. Free: once a month. Paid: as often as you like.
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadPhoto } from "@/lib/createHelpers";

export default function LogoPanel({ biz, active, d, lang }) {
  const [logo, setLogo] = useState(biz.logo_url || null);
  const [changedAt, setChangedAt] = useState(biz.logo_changed_at || null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const unlockAt = changedAt ? new Date(new Date(changedAt).getTime() + 30 * 86400000) : null;
  const locked = !active && !!unlockAt && unlockAt.getTime() > Date.now();
  const unlockText = unlockAt
    ? unlockAt.toLocaleDateString(lang === "en" ? "en-ZA" : "af-ZA", { day: "numeric", month: "long" })
    : "";

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMsg(null);
  };

  const save = async () => {
    if (!file || locked) return;
    if (!active && !window.confirm(d.logoConfirm)) return;
    setBusy(true);
    setMsg(null);
    try {
      const url = await uploadPhoto("business_logos", file, "logo");
      const { data, error } = await supabase
        .from("businesses")
        .update({ logo_url: url })
        .eq("id", biz.id)
        .select("id");
      if (error || !data || data.length === 0) {
        const lockedErr = error?.message?.includes("logo_locked");
        setMsg({ ok: false, text: lockedErr ? d.logoLockedGeneric : d.logoFail });
      } else {
        setLogo(url);
        setChangedAt(new Date().toISOString());
        setFile(null);
        setPreview(null);
        setMsg({ ok: true, text: d.logoDone });
      }
    } catch {
      setMsg({ ok: false, text: d.logoFail });
    }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <p
        className="rounded-lg px-3 py-2 text-sm"
        style={
          locked
            ? { background: "rgba(202,138,4,0.18)", color: "#fde047" }
            : { background: "var(--bz-accent-soft)", border: "1px solid var(--bz-accent-line)", color: "var(--bz-accent-text)" }
        }
      >
        {locked ? d.logoLocked(unlockText) : active ? d.logoPaid : d.logoFree}
      </p>

      <div className="flex items-center gap-4">
        <div
          className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl"
          style={{ background: "var(--bz-surface)", border: "2px solid var(--bz-accent-line)" }}
        >
          {preview || logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview || logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-xs" style={{ color: "var(--bz-muted)" }}>
              {d.logoNone}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-sm font-semibold">{preview ? d.logoNew : d.logoCurrent}</p>
          <input
            type="file"
            accept="image/*"
            disabled={locked}
            onChange={pick}
            className="block w-full text-sm disabled:opacity-40"
          />
        </div>
      </div>

      {msg && (
        <p className="text-sm" style={{ color: msg.ok ? "#86efac" : "#fca5a5" }}>
          {msg.text}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={busy || !file || locked}
        className="w-full rounded-lg px-4 py-3 font-bold disabled:opacity-40"
        style={{ background: "var(--bz-accent)", color: "var(--bz-on-accent)" }}
      >
        {busy ? d.logoSaving : d.logoSave}
      </button>
    </div>
  );
}
