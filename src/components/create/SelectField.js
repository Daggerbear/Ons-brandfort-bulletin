// src/components/create/SelectField.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const selectClass =
  "w-full appearance-none rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3.5 pr-10 text-base text-white outline-none focus:border-orange-500";

const UI = {
  af: { choose: "Kies...", loading: "Laai...", none: "Geen besighede gevind nie" },
  en: { choose: "Choose...", loading: "Loading...", none: "No businesses found" },
};

function pick(spec, lang) {
  if (!spec) return "";
  return spec[lang] ?? "";
}

export default function SelectField({ field, values, set, lang }) {
  const ui = UI[lang];
  const isBusiness = field.kind === "business";
  const [businesses, setBusinesses] = useState(null);

  // The business picker lists approved businesses
  useEffect(() => {
    if (!isBusiness) return;
    let active = true;
    supabase
      .from("businesses")
      .select("id, name")
      .eq("Status", "approved")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (active) setBusinesses(data || []);
      });
    return () => {
      active = false;
    };
  }, [isBusiness]);

  const options = isBusiness
    ? (businesses || []).map((b) => ({ value: String(b.id), text: b.name }))
    : (field.options || []).map((o) => ({
        value: o.value,
        text: `${o.icon ? o.icon + " " : ""}${o[lang]}`,
      }));

  const label = pick(field.label, lang);
  const hint = pick(field.hint, lang);
  const placeholder =
    isBusiness && businesses === null
      ? ui.loading
      : isBusiness && businesses.length === 0
      ? ui.none
      : ui.choose;

  return (
    <div>
      {label && (
        <p className="mb-2 text-sm font-semibold text-neutral-100">
          {label}
          {field.required && <span className="text-orange-400"> *</span>}
        </p>
      )}
      <div className="relative">
        <select
          value={values[field.name] ?? ""}
          onChange={(e) => set(field.name, e.target.value)}
          className={selectClass}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.text}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
          ▾
        </span>
      </div>
      {hint && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}