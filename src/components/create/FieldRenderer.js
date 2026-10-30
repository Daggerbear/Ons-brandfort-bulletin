// src/components/create/FieldRenderer.js
"use client";
import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3.5 text-base text-white placeholder-neutral-500 outline-none focus:border-orange-500";

const UI = {
  af: {
    choosePhoto: "Tik om 'n foto te kies",
    takePhoto: "Neem of kies 'n foto",
    remove: "Verwyder",
    onRequest: "Prys op navraag",
    addVideo: "＋ Voeg 'n video by",
    videoPlaceholder: "Plak 'n YouTube skakel",
  },
  en: {
    choosePhoto: "Tap to choose a photo",
    takePhoto: "Take or choose a photo",
    remove: "Remove",
    onRequest: "Price on request",
    addVideo: "＋ Add a video",
    videoPlaceholder: "Paste a YouTube link",
  },
};

function pick(spec, values, lang) {
  if (!spec) return "";
  const resolved = typeof spec === "function" ? spec(values) : spec;
  return resolved?.[lang] ?? "";
}

function Wrap({ label, hint, required, children }) {
  return (
    <div>
      {label && (
        <p className="mb-2 text-sm font-semibold text-neutral-100">
          {label}
          {required && <span className="text-orange-400"> *</span>}
        </p>
      )}
      {children}
      {hint && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export default function FieldRenderer({
  field,
  values,
  set,
  lang,
  preview,
  onPickPhoto,
  onRemovePhoto,
}) {
  const ui = UI[lang];
  const [videoOpen, setVideoOpen] = useState(false);

  const label = pick(field.label, values, lang);
  const hint = pick(field.hint, values, lang);
  const placeholder = pick(field.placeholder, values, lang);
  const value = values[field.name] ?? "";

  switch (field.kind) {
    case "chips":
      return (
        <Wrap label={label} hint={hint} required={field.required}>
          <div className="flex flex-wrap gap-2">
            {field.options.map((opt) => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set(field.name, opt.value)}
                  aria-pressed={selected}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    selected
                      ? "border-orange-500 bg-orange-500 text-black"
                      : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-orange-500"
                  }`}
                >
                  {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
                  {opt[lang]}
                </button>
              );
            })}
          </div>
        </Wrap>
      );

    case "textarea":
      return (
        <Wrap label={label} hint={hint} required={field.required}>
          <textarea
            value={value}
            onChange={(e) => set(field.name, e.target.value.slice(0, field.max || 1000))}
            placeholder={placeholder}
            rows={5}
            className={`${inputClass} resize-none`}
          />
          {field.max && (
            <p className="mt-1 text-right text-xs text-neutral-500">
              {value.length}/{field.max}
            </p>
          )}
        </Wrap>
      );

    case "photo":
      return (
        <Wrap label={label} hint={hint}>
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-neutral-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="max-h-64 w-full object-cover" />
              <button
                type="button"
                onClick={onRemovePhoto}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white"
              >
                ✕ {ui.remove}
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-900 py-8 text-neutral-300 transition hover:border-orange-500">
              <span className="text-4xl">📷</span>
              <span className="text-sm font-semibold">{ui.takePhoto}</span>
              <input type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
            </label>
          )}
        </Wrap>
      );

    case "youtube":
      return videoOpen || value ? (
        <Wrap label={label} hint={hint}>
          <input
            type="url"
            value={value}
            onChange={(e) => set(field.name, e.target.value)}
            placeholder={ui.videoPlaceholder}
            className={inputClass}
          />
        </Wrap>
      ) : (
        <button
          type="button"
          onClick={() => setVideoOpen(true)}
          className="text-left text-sm font-medium text-orange-400"
        >
          {ui.addVideo}
        </button>
      );

    case "price":
      return (
        <Wrap label={label} hint={hint}>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                R
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={values.priceOnRequest ? "" : values.price ?? ""}
                disabled={!!values.priceOnRequest}
                onChange={(e) => set("price", e.target.value.replace(/[^0-9.]/g, "").slice(0, 10))}
                placeholder="0"
                className={`${inputClass} pl-9 disabled:opacity-40`}
              />
            </div>
            <button
              type="button"
              onClick={() => set("priceOnRequest", !values.priceOnRequest)}
              aria-pressed={!!values.priceOnRequest}
              className={`flex-shrink-0 rounded-xl border px-3 py-3.5 text-xs font-semibold transition ${
                values.priceOnRequest
                  ? "border-orange-500 bg-orange-500 text-black"
                  : "border-neutral-700 bg-neutral-900 text-neutral-300"
              }`}
            >
              {ui.onRequest}
            </button>
          </div>
        </Wrap>
      );

    case "number":
      return (
        <div className={field.half ? "col-span-1" : "col-span-2"}>
          <Wrap label={label} hint={hint}>
            <input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) =>
                set(field.name, e.target.value.replace(/\D/g, "").slice(0, field.max || 3))
              }
              placeholder="0"
              className={inputClass}
            />
          </Wrap>
        </div>
      );

    case "date":
    case "time":
      return (
        <Wrap label={label} hint={hint} required={field.required}>
          <input
            type={field.kind}
            value={value}
            onChange={(e) => set(field.name, e.target.value)}
            className={inputClass}
          />
        </Wrap>
      );

    case "tel":
      return (
        <Wrap label={label} hint={hint} required={field.required}>
          <input
            type="tel"
            inputMode="tel"
            value={value}
            onChange={(e) => set(field.name, e.target.value.slice(0, field.max || 20))}
            placeholder={placeholder}
            autoComplete="tel"
            className={inputClass}
          />
        </Wrap>
      );

    default:
      return (
        <Wrap label={label} hint={hint} required={field.required}>
          <input
            type="text"
            value={value}
            onChange={(e) => set(field.name, e.target.value.slice(0, field.max || 100))}
            placeholder={placeholder}
            autoComplete={field.name === "name" ? "name" : "off"}
            className={inputClass}
          />
        </Wrap>
      );
  }
}