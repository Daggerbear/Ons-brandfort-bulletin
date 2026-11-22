// src/components/admin/TeachForm.js
// The "teach Lientjie" form: tap keyword chips, type one answer, tap a page for the button,
// and see straight away whether she will really use it.
"use client";
import { useMemo, useState } from "react";
import { getReply } from "@/lib/botBrain";
import { PAGE_PICKS, suggestKeywords, findOverlaps, tidyKeyword, cleanQuestion } from "@/lib/bot/teachHelpers";

const field =
  "w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-orange-500 outline-none";
const chipOn = "bg-orange-500 text-black border-orange-500 font-semibold";
const chipOff = "border-neutral-700 text-neutral-300";

export default function TeachForm({ question = "", initial = null, knowledge = [], onSave, onCancel }) {
  const q = cleanQuestion(question);
  const sug = useMemo(() => suggestKeywords(q), [q]);

  const [keywords, setKeywords] = useState(() => (initial ? initial.keywords || [] : sug.phrase ? [sug.phrase] : []));
  const [custom, setCustom] = useState("");
  const [af, setAf] = useState(initial?.answer_af || "");
  const [en, setEn] = useState(initial?.answer_en || "");
  const [link, setLink] = useState(initial?.link || "");
  const [labelAf, setLabelAf] = useState(initial?.link_label_af || "");
  const [labelEn, setLabelEn] = useState(initial?.link_label_en || "");
  const [saving, setSaving] = useState(false);

  const candidates = Array.from(new Set([...(sug.phrase ? [sug.phrase] : []), ...sug.words, ...keywords]));
  const toggle = (k) => setKeywords((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  const addCustom = () => {
    const k = tidyKeyword(custom);
    if (k && !keywords.includes(k)) setKeywords((cur) => [...cur, k]);
    setCustom("");
  };
  const pickPage = (p) => {
    if (link === p.link) {
      setLink("");
      setLabelAf("");
      setLabelEn("");
    } else {
      setLink(p.link);
      setLabelAf(p.labelAf);
      setLabelEn(p.labelEn);
    }
  };

  const overlaps = findOverlaps(keywords, knowledge, initial?.id);
  const singleWords = keywords.filter((k) => !k.includes(" "));

  // Would she really use this answer for the question that was asked?
  const check = useMemo(() => {
    if (!q || !af.trim() || keywords.length === 0) return null;
    const draft = { id: "draft", keywords, answer_af: af.trim(), answer_en: en.trim() || null, link: link || null, link_label_af: labelAf, link_label_en: labelEn };
    try {
      const rows = (knowledge || []).filter((k) => k.id !== initial?.id && k.active !== false);
      const reply = getReply({ query: q, lang: "af", businesses: [], knowledge: [...rows, draft] });
      return reply && (reply.text === draft.answer_af || reply.text === draft.answer_en);
    } catch {
      return null;
    }
  }, [q, af, en, keywords, link, labelAf, labelEn, knowledge, initial]);

  const canSave = keywords.length > 0 && af.trim().length > 0 && !saving;

  const save = async () => {
    setSaving(true);
    await onSave({ keywords, answer_af: af, answer_en: en, link, link_label_af: labelAf, link_label_en: labelEn });
    setSaving(false);
  };

  return (
    <div className="mt-3 space-y-4 bg-neutral-950 border border-neutral-800 rounded-xl p-3">
      <div>
        <p className="text-xs font-bold text-orange-400 mb-1.5">1 · When someone asks…</p>
        <div className="flex flex-wrap gap-1.5">
          {candidates.map((k) => (
            <button key={k} onClick={() => toggle(k)} className={`text-xs border rounded-full px-3 py-1.5 transition ${keywords.includes(k) ? chipOn : chipOff}`}>
              {k}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input className={field} value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()} placeholder="Add your own words…" />
          <button onClick={addCustom} className="border border-neutral-700 text-neutral-200 rounded-lg px-3 text-sm">Add</button>
        </div>
        <p className="text-[11px] text-neutral-500 mt-1.5">The whole question is safest. A single word catches every question that has it.</p>
        {singleWords.length > 0 && (
          <p className="text-[11px] text-amber-400 mt-1">⚠️ Single word picked: {singleWords.join(", ")}. Make sure that is what you want.</p>
        )}
        {overlaps.map((o, i) => (
          <p key={i} className="text-[11px] text-amber-400 mt-1">⚠️ “{o.keywords.join(", ")}” is already used by: {o.answer}…</p>
        ))}
      </div>

      <div>
        <p className="text-xs font-bold text-orange-400 mb-1.5">2 · She says</p>
        <textarea rows={3} className={field} value={af} onChange={(e) => setAf(e.target.value)} placeholder="Her answer in Afrikaans" />
        <textarea rows={2} className={field + " mt-2"} value={en} onChange={(e) => setEn(e.target.value)} placeholder="English version (optional, she uses Afrikaans if empty)" />
        <button onClick={() => setEn(af)} className="text-[11px] text-neutral-400 underline mt-1">Same in English (names, numbers)</button>
      </div>

      <div>
        <p className="text-xs font-bold text-orange-400 mb-1.5">3 · Add a button? (optional, tap again to remove)</p>
        <div className="flex flex-wrap gap-1.5">
          {PAGE_PICKS.map((p) => (
            <button key={p.id} onClick={() => pickPage(p)} className={`text-xs border rounded-full px-3 py-1.5 transition ${link === p.link ? chipOn : chipOff}`}>
              {p.en}
            </button>
          ))}
        </div>
        <details className="mt-2">
          <summary className="text-[11px] text-neutral-400 cursor-pointer">Other link or button text</summary>
          <div className="space-y-2 mt-2">
            <input className={field} value={link} onChange={(e) => setLink(e.target.value)} placeholder="/page or https://…" />
            <div className="grid grid-cols-2 gap-2">
              <input className={field} value={labelAf} onChange={(e) => setLabelAf(e.target.value)} placeholder="Button (Afrikaans)" />
              <input className={field} value={labelEn} onChange={(e) => setLabelEn(e.target.value)} placeholder="Button (English)" />
            </div>
          </div>
        </details>
      </div>

      {af.trim() && (
        <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3">
          <p className="text-[11px] text-neutral-500 mb-1">Preview</p>
          <p className="text-sm text-neutral-100 whitespace-pre-line">{af}</p>
          {link && <span className="inline-block mt-2 bg-orange-500 text-black text-xs font-bold rounded-full px-3 py-1">{labelAf || "→"}</span>}
        </div>
      )}

      {check === true && <p className="text-xs text-green-400">✅ She will use this for “{q}”.</p>}
      {check === false && (
        <p className="text-xs text-amber-400">⚠️ For “{q}” she would still say something else. Use the whole question as a keyword, or a longer phrase.</p>
      )}

      <div className="flex gap-2">
        <button onClick={save} disabled={!canSave} className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-5 py-2 text-sm disabled:opacity-40">
          {saving ? "Saving…" : "Save answer"}
        </button>
        <button onClick={onCancel} className="border border-neutral-700 text-neutral-300 rounded-lg px-4 py-2 text-sm">Cancel</button>
      </div>
    </div>
  );
}
