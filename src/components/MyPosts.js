// src/components/MyPosts.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// edit: the fields a person may change. status: the "mark as done" switch for listings.
const SOURCES = [
  {
    table: "posts", cols: "id, content, created_at, is_hidden", icon: "💬", af: "Feed", en: "Feed",
    href: (r) => `/?focus=post-${r.id}`, title: (r) => r.content, hidden: (r) => r.is_hidden,
    edit: [{ name: "content", type: "textarea", max: 600 }],
  },
  {
    table: "classifieds", cols: "id, title, description, price, price_on_request, is_sold, created_at, is_hidden", icon: "🛒", af: "Koop & Verkoop", en: "Buy & Sell",
    href: (r) => `/?focus=classified-${r.id}`, title: (r) => r.title, hidden: (r) => r.is_hidden,
    edit: [
      { name: "title", type: "text", max: 80 },
      { name: "price", type: "price" },
      { name: "description", type: "textarea", max: 600 },
    ],
    status: { col: "is_sold", af: "Gemerk as verkoop", en: "Mark as sold", doneAf: "Verkoop", doneEn: "Sold" },
  },
  {
    table: "housing", cols: "id, title, description, price, price_on_request, is_taken, created_at, is_hidden", icon: "🏠", af: "Behuising", en: "Housing",
    href: (r) => `/?focus=housing-${r.id}`, title: (r) => r.title, hidden: (r) => r.is_hidden,
    edit: [
      { name: "title", type: "text", max: 80 },
      { name: "price", type: "price" },
      { name: "description", type: "textarea", max: 600 },
    ],
    status: { col: "is_taken", af: "Merk as geneem", en: "Mark as taken", doneAf: "Geneem", doneEn: "Taken" },
  },
  {
    table: "jobs", cols: "id, title, description, type, is_filled, created_at, is_hidden", icon: "💼", af: "Werk", en: "Jobs",
    href: (r) => (r.type === "seeker" ? `/?focus=job-${r.id}` : "/business?filter=job"), title: (r) => r.title, hidden: (r) => r.is_hidden,
    edit: [
      { name: "title", type: "text", max: 80 },
      { name: "description", type: "textarea", max: 600 },
    ],
    status: { col: "is_filled", af: "Merk as gevul", en: "Mark as filled", doneAf: "Gevul", doneEn: "Filled" },
  },
  { table: "lost_found", cols: "id, title, created_at, flagged", icon: "🔎", af: "Verlore & Gevind", en: "Lost & Found", href: () => "/", title: (r) => r.title, hidden: (r) => r.flagged },
  {
    table: "events", cols: "id, title, created_at, status", icon: "📅", af: "Gebeurtenisse", en: "Events",
    href: (r) => `/events/${r.id}`, title: (r) => r.title, pending: (r) => r.status && r.status !== "approved",
    canDelete: true,
  },
  { table: "shoutouts", cols: "id, message, created_at, flagged", icon: "📣", af: "Shoutouts", en: "Shoutouts", href: () => "/", title: (r) => r.message, hidden: (r) => r.flagged },
  { table: "questions", cols: "id, question, created_at, flagged", icon: "❓", af: "Vrae", en: "Questions", href: () => "/", title: (r) => r.question, hidden: (r) => r.flagged },
];

const QUICK = [
  { icon: "💬", af: "Deel", en: "Share", href: "/create/share" },
  { icon: "🛒", af: "Verkoop", en: "Sell", href: "/create/sell" },
  { icon: "🏠", af: "Behuising", en: "Housing", href: "/create/housing" },
  { icon: "💼", af: "Werk", en: "Work", href: "/create/job" },
  { icon: "📅", af: "Gebeurtenis", en: "Event", href: "/create/event" },
];

const FIELD_LABELS = {
  content: { af: "Jou plasing", en: "Your post" },
  title: { af: "Opskrif", en: "Headline" },
  description: { af: "Meer inligting", en: "More details" },
  price: { af: "Prys (R)", en: "Price (R)" },
};

const text = {
  af: {
    title: "MY PLASINGS",
    post: "Plaas iets",
    empty: "Jy het nog niks as 'n aangemelde gebruiker geplaas nie. Nuwe plasings verskyn hier.",
    pending: "Wag vir goedkeuring",
    hidden: "Weggesteek",
    edit: "Wysig",
    del: "Vee uit",
    sure: "Seker? Dit kan nie teruggedraai word nie.",
    yes: "Ja, vee uit",
    no: "Kanselleer",
    save: "Stoor",
    saving: "Stoor...",
    failed: "Kon nie stoor nie. Probeer weer.",
    delFailed: "Kon nie uitvee nie. Probeer weer.",
    required: "Hierdie veld mag nie leeg wees nie.",
    badPrice: "Gebruik net syfers vir die prys.",
  },
  en: {
    title: "MY POSTS",
    post: "Post something",
    empty: "You haven't posted anything while signed in yet. New posts will show up here.",
    pending: "Awaiting approval",
    hidden: "Hidden",
    edit: "Edit",
    del: "Delete",
    sure: "Sure? This can't be undone.",
    yes: "Yes, delete",
    no: "Cancel",
    save: "Save",
    saving: "Saving...",
    failed: "Couldn't save. Please try again.",
    delFailed: "Couldn't delete. Please try again.",
    required: "This field can't be empty.",
    badPrice: "Use numbers only for the price.",
  },
};

function clip(value, max = 70) {
  const s = String(value || "").trim().replace(/\s+/g, " ");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function Row({ source, row, lang, t, userId, onChanged, onDeleted }) {
  const [mode, setMode] = useState("view"); // view | edit | confirm
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const dateLocale = lang === "af" ? "af-ZA" : "en-ZA";
  const canEdit = !!source.edit;
  const canDelete = !!source.edit || source.canDelete;
  const done = source.status && row[source.status.col];

  const startEdit = () => {
    const d = {};
    source.edit.forEach((f) => {
      d[f.name] = row[f.name] == null ? "" : String(row[f.name]);
    });
    setDraft(d);
    setError(null);
    setMode("edit");
  };

  const save = async () => {
    const payload = {};
    for (const f of source.edit) {
      const raw = String(draft[f.name] ?? "").trim();
      if (f.type === "price") {
        if (raw === "") {
          payload.price = null;
        } else {
          const n = Number(raw.replace(",", "."));
          if (!Number.isFinite(n) || n < 0) return setError(t.badPrice);
          payload.price = n;
          payload.price_on_request = false;
        }
      } else {
        if (!raw) return setError(t.required);
        payload[f.name] = f.max ? raw.slice(0, f.max) : raw;
      }
    }
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase
      .from(source.table)
      .update(payload)
      .eq("id", row.id)
      .eq("user_id", userId)
      .select("id");
    setBusy(false);
    // RLS quietly changes 0 rows when you don't own it, so check we really changed one
    if (err || !data || data.length === 0) return setError(t.failed);
    onChanged({ ...row, ...payload });
    setMode("view");
  };

  const toggleStatus = async () => {
    const col = source.status.col;
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase
      .from(source.table)
      .update({ [col]: !row[col] })
      .eq("id", row.id)
      .eq("user_id", userId)
      .select("id");
    setBusy(false);
    if (err || !data || data.length === 0) return setError(t.failed);
    onChanged({ ...row, [col]: !row[col] });
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase
      .from(source.table)
      .delete()
      .eq("id", row.id)
      .eq("user_id", userId)
      .select("id");
    setBusy(false);
    if (err || !data || data.length === 0) {
      setMode("view");
      return setError(t.delFailed);
    }
    onDeleted(row.id);
  };

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950">
      <div className="flex items-stretch">
        <Link
          href={source.href(row)}
          className="min-w-0 flex-1 px-3 py-2 transition hover:text-orange-300"
        >
          <p className="truncate text-sm text-neutral-200">
            {clip(source.title(row)) || "—"}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
            <span>{new Date(row.created_at).toLocaleDateString(dateLocale)}</span>
            {source.pending && source.pending(row) && (
              <span className="text-amber-400">{t.pending}</span>
            )}
            {source.hidden && source.hidden(row) && (
              <span className="text-red-400">{t.hidden}</span>
            )}
            {done && (
              <span className="text-emerald-400">
                ✓ {lang === "af" ? source.status.doneAf : source.status.doneEn}
              </span>
            )}
          </p>
        </Link>
        {mode === "view" && (canEdit || canDelete) && (
          <div className="flex flex-shrink-0 items-center gap-1 pr-2">
            {canEdit && (
              <button
                type="button"
                onClick={startEdit}
                aria-label={t.edit}
                title={t.edit}
                className="flex h-9 w-9 items-center justify-center rounded-full text-base text-neutral-400 transition hover:bg-neutral-800 hover:text-orange-400"
              >
                ✏️
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("confirm");
                }}
                aria-label={t.del}
                title={t.del}
                className="flex h-9 w-9 items-center justify-center rounded-full text-base text-neutral-400 transition hover:bg-neutral-800 hover:text-red-400"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {mode === "view" && source.status && (
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={toggleStatus}
            disabled={busy}
            className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-300 transition hover:border-emerald-400 hover:text-emerald-300 disabled:opacity-50"
          >
            {done ? "↩ " : "✓ "}
            {done
              ? lang === "af" ? "Maak weer oop" : "Reopen"
              : lang === "af" ? source.status.af : source.status.en}
          </button>
        </div>
      )}

      {mode === "edit" && (
        <div className="space-y-3 border-t border-neutral-800 p-3">
          {source.edit.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-[11px] text-neutral-400">
                {FIELD_LABELS[f.name][lang]}
              </label>
              {f.type === "textarea" ? (
                <>
                  <textarea
                    value={draft[f.name] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value.slice(0, f.max) })}
                    rows={5}
                    className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                  <p className="text-right text-[11px] text-neutral-500">
                    {(draft[f.name] || "").length}/{f.max}
                  </p>
                </>
              ) : (
                <input
                  value={draft[f.name] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                  inputMode={f.type === "price" ? "decimal" : "text"}
                  maxLength={f.max}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              )}
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-lg border border-neutral-700 py-2 text-sm text-neutral-300"
            >
              {t.no}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="col-span-2 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-black transition hover:bg-orange-600 disabled:opacity-50"
            >
              {busy ? t.saving : t.save}
            </button>
          </div>
        </div>
      )}

      {mode === "confirm" && (
        <div className="space-y-3 border-t border-red-500/30 bg-red-950/20 p-3">
          <p className="text-sm text-red-200">{t.sure}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-lg border border-neutral-700 py-2 text-sm text-neutral-300"
            >
              {t.no}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-lg bg-red-500 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {busy ? "..." : t.yes}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="px-3 pb-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export default function MyPosts({ userId, lang = "af" }) {
  const t = text[lang] || text.af;
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    Promise.all(
      SOURCES.map(async (source) => {
        const { data, error } = await supabase
          .from(source.table)
          .select(source.cols)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);
        return { source, rows: error ? [] : data || [] };
      })
    ).then((result) => {
      if (active) setGroups(result.filter((g) => g.rows.length > 0));
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const changeRow = (table, updated) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.source.table === table
          ? { ...g, rows: g.rows.map((r) => (r.id === updated.id ? updated : r)) }
          : g
      )
    );

  const dropRow = (table, id) =>
    setGroups((prev) =>
      prev
        .map((g) =>
          g.source.table === table ? { ...g, rows: g.rows.filter((r) => r.id !== id) } : g
        )
        .filter((g) => g.rows.length > 0)
    );

  return (
    <section className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5">
      <p className="text-[11px] font-bold tracking-[0.25em] text-orange-400">
        [ {t.title} ]
      </p>

      <p className="mt-3 text-xs text-neutral-400">{t.post}</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {QUICK.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex w-20 flex-shrink-0 flex-col items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 text-center transition hover:border-orange-500"
          >
            <span className="text-2xl">{q.icon}</span>
            <span className="text-[11px] font-semibold leading-tight text-white">
              {q[lang] || q.af}
            </span>
          </Link>
        ))}
      </div>

      {groups && groups.length === 0 && (
        <p className="mt-4 text-sm text-neutral-500">{t.empty}</p>
      )}

      {groups &&
        groups.map(({ source, rows }) => (
          <div key={source.table} className="mt-4">
            <p className="text-xs font-semibold text-neutral-200">
              {source.icon} {source[lang] || source.af}{" "}
              <span className="text-neutral-500">({rows.length})</span>
            </p>
            <div className="mt-2 space-y-2">
              {rows.map((row) => (
                <Row
                  key={row.id}
                  source={source}
                  row={row}
                  lang={lang}
                  t={t}
                  userId={userId}
                  onChanged={(u) => changeRow(source.table, u)}
                  onDeleted={(id) => dropRow(source.table, id)}
                />
              ))}
            </div>
          </div>
        ))}
    </section>
  );
}
