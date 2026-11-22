// src/components/mybiz/ListingForm.js
// The FREE part of My Business: the owner's public profile.
"use client";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  MAX_DESC,
  addService,
  completeness,
  hoursPresets,
  sameValues,
  toPayload,
  valuesFromBiz,
} from "./profileHelpers";

const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 text-base text-white outline-none focus:border-orange-500";

function Label({ children, hint }) {
  return (
    <div className="mb-1">
      <span className="text-sm font-semibold text-neutral-200">{children}</span>
      {hint && <span className="block text-xs text-neutral-500">{hint}</span>}
    </div>
  );
}

export default function ListingForm({ biz, t, lang }) {
  const [saved, setSaved] = useState(() => valuesFromBiz(biz));
  const [vals, setVals] = useState(() => valuesFromBiz(biz));
  const [serviceDraft, setServiceDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (k) => (e) => setVals((p) => ({ ...p, [k]: e.target.value }));
  const dirty = !sameValues(vals, saved);
  const meter = useMemo(() => completeness(vals), [vals]);

  const pushService = () => {
    setVals((p) => ({ ...p, services: addService(p.services, serviceDraft) }));
    setServiceDraft("");
  };

  const save = async (e) => {
    e.preventDefault();
    if (!vals.name.trim()) return;
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase
      .from("businesses")
      .update(toPayload(vals))
      .eq("id", biz.id)
      .select("id");
    setBusy(false);
    if (error || !data || data.length === 0) {
      setMsg({ ok: false, text: t.fail });
      return;
    }
    setSaved(vals);
    setMsg({ ok: true, text: t.saved });
  };

  return (
    <form onSubmit={save} className="space-y-5">
      {/* Live preview */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {t.previewTitle}
        </p>
        <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-bold text-white">{vals.name || "—"}</p>
            {vals.category && (
              <span className="flex-shrink-0 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-semibold text-orange-300">
                {vals.category}
              </span>
            )}
          </div>
          {vals.description && (
            <p className="mt-2 line-clamp-3 text-sm text-neutral-300">{vals.description}</p>
          )}
          <div className="mt-3 space-y-1 text-sm text-neutral-400">
            {vals.address && <p>📍 {vals.address}</p>}
            {vals.hours && <p>🕒 {vals.hours}</p>}
            {vals.contact && <p>📞 {vals.contact}</p>}
          </div>
          {vals.services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vals.services.slice(0, 6).map((s) => (
                <span key={s} className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completeness */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">
            {meter.percent === 100 ? t.meterDone : t.meterTitle(meter.percent)}
          </p>
          <span className="text-sm font-bold text-orange-400">{meter.percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
          <div
            className={`h-full rounded-full transition-all ${meter.percent === 100 ? "bg-green-500" : "bg-orange-500"}`}
            style={{ width: `${meter.percent}%` }}
          />
        </div>
        {meter.missing.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-neutral-400">
            {meter.missing.map((k) => (
              <li key={k}>○ {t.missing[k]}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Fields */}
      <div>
        <Label>{t.name}</Label>
        <input value={vals.name} onChange={set("name")} className={input} />
      </div>
      <div>
        <Label>{t.category}</Label>
        <input value={vals.category} onChange={set("category")} className={input} />
      </div>
      <div>
        <Label hint={t.descHelp}>{t.description}</Label>
        <textarea
          value={vals.description}
          onChange={(e) => setVals((p) => ({ ...p, description: e.target.value.slice(0, MAX_DESC) }))}
          rows={5}
          className={`${input} resize-y`}
        />
        <p className="mt-1 text-right text-xs text-neutral-500">
          {vals.description.length} / {MAX_DESC}
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>{t.contact}</Label>
          <input value={vals.contact} onChange={set("contact")} inputMode="tel" className={input} />
        </div>
        <div>
          <Label>{t.website}</Label>
          <input value={vals.website} onChange={set("website")} inputMode="url" className={input} />
        </div>
      </div>
      <div>
        <Label>{t.address}</Label>
        <input value={vals.address} onChange={set("address")} className={input} />
      </div>
      <div>
        <Label>{t.hours}</Label>
        <input value={vals.hours} onChange={set("hours")} className={input} />
        <p className="mb-1 mt-2 text-xs text-neutral-500">{t.hoursQuick}</p>
        <div className="flex flex-wrap gap-2">
          {hoursPresets(lang).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setVals((p) => ({ ...p, hours: h }))}
              className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-orange-500"
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label hint={t.servicesHelp}>{t.services}</Label>
        {vals.services.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {vals.services.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 rounded-full bg-neutral-800 py-1 pl-3 pr-1.5 text-sm text-neutral-100"
              >
                {s}
                <button
                  type="button"
                  aria-label={t.removeService}
                  onClick={() => setVals((p) => ({ ...p, services: p.services.filter((x) => x !== s) }))}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-700 text-xs text-neutral-200"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={serviceDraft}
            onChange={(e) => setServiceDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                pushService();
              }
            }}
            placeholder={t.servicesPh}
            className={input}
          />
          <button
            type="button"
            onClick={pushService}
            className="flex-shrink-0 rounded-lg border border-orange-500/60 px-4 text-sm font-semibold text-orange-300"
          >
            {t.addService}
          </button>
        </div>
      </div>

      {dirty && <p className="text-sm text-orange-300">● {t.unsaved}</p>}
      {msg && <p className={`text-sm ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>}
      <button
        type="submit"
        disabled={busy || !dirty || !vals.name.trim()}
        className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-black transition hover:bg-orange-600 disabled:opacity-40"
      >
        {busy ? t.saving : t.save}
      </button>
    </form>
  );
}
