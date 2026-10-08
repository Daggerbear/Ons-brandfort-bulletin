// src/app/admin/bot/page.js
"use client";
import { useState, useEffect, useCallback } from "react";

const EMPTY_FORM = {
  keywords: "",
  answer_af: "",
  answer_en: "",
  link: "",
  link_label_af: "",
  link_label_en: "",
};

// turn a question into starter keywords (you can edit them)
function starterKeywords(question) {
  const text = (question || "").replace(/^\[[^\]]+\]\s*/, "").toLowerCase();
  const words = text.match(/[\p{L}\p{N}]{4,}/gu) || [];
  return Array.from(new Set(words)).slice(0, 4).join(", ");
}

function tagOf(question) {
  const m = (question || "").match(/^\[([^\]]+)\]\s*(.*)$/);
  return m ? { tag: m[1], text: m[2] } : { tag: null, text: question };
}

const tagStyle = {
  ure: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "nie nuttig": "bg-red-500/15 text-red-300 border-red-500/30",
};

export default function BotAdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState({ pending: [], handled: [], knowledge: [] });
  const [tab, setTab] = useState("pending");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [teachingId, setTeachingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const call = useCallback(async (pw, method, body) => {
    const res = await fetch("/api/admin/bot", {
      method,
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Something went wrong");
    return json;
  }, []);

  const load = useCallback(
    async (pw) => {
      setLoading(true);
      setMessage("");
      try {
        const json = await call(pw, "GET");
        setData(json);
        setAuthed(true);
        try {
          sessionStorage.setItem("bot_admin_pw", pw);
        } catch {}
      } catch (e) {
        setAuthed(false);
        setMessage(e.message);
        try {
          sessionStorage.removeItem("bot_admin_pw");
        } catch {}
      }
      setLoading(false);
    },
    [call]
  );

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("bot_admin_pw");
      if (saved) {
        setPassword(saved);
        load(saved);
      }
    } catch {}
  }, [load]);

  const act = async (body, okMessage) => {
    setMessage("");
    try {
      await call(password, "POST", body);
      if (okMessage) setMessage(okMessage);
      await load(password);
      return true;
    } catch (e) {
      setMessage(e.message);
      return false;
    }
  };

  const startTeaching = (row) => {
    setTeachingId(row.id);
    setForm({ ...EMPTY_FORM, keywords: starterKeywords(row.question) });
  };

  const saveTeaching = async (row) => {
    const ok = await act(
      {
        action: "teach",
        unansweredId: row?.id || null,
        keywords: form.keywords.split(",").map((k) => k.trim()),
        answer_af: form.answer_af,
        answer_en: form.answer_en,
        link: form.link,
        link_label_af: form.link_label_af,
        link_label_en: form.link_label_en,
      },
      "Saved. Lientjie knows this now."
    );
    if (ok) {
      setTeachingId(null);
      setForm(EMPTY_FORM);
    }
  };

  const input =
    "w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-orange-500 outline-none";

  const teachForm = (row) => (
    <div className="mt-3 space-y-2 bg-neutral-950 border border-neutral-800 rounded-xl p-3">
      <label className="block text-xs text-neutral-400">
        Words that should trigger this answer (separate with commas)
        <input
          className={input + " mt-1"}
          value={form.keywords}
          onChange={(e) => setForm({ ...form, keywords: e.target.value })}
          placeholder="apteek, pharmacy, medisyne"
        />
      </label>
      <label className="block text-xs text-neutral-400">
        Answer in Afrikaans (required)
        <textarea
          rows={3}
          className={input + " mt-1"}
          value={form.answer_af}
          onChange={(e) => setForm({ ...form, answer_af: e.target.value })}
        />
      </label>
      <label className="block text-xs text-neutral-400">
        Answer in English (optional)
        <textarea
          rows={2}
          className={input + " mt-1"}
          value={form.answer_en}
          onChange={(e) => setForm({ ...form, answer_en: e.target.value })}
        />
      </label>
      <label className="block text-xs text-neutral-400">
        Button link (optional, like /besighede or https://…)
        <input
          className={input + " mt-1"}
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <input
          className={input}
          placeholder="Button text (Afrikaans)"
          value={form.link_label_af}
          onChange={(e) => setForm({ ...form, link_label_af: e.target.value })}
        />
        <input
          className={input}
          placeholder="Button text (English)"
          value={form.link_label_en}
          onChange={(e) => setForm({ ...form, link_label_en: e.target.value })}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => saveTeaching(row)}
          className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-2 text-sm"
        >
          Save answer
        </button>
        <button
          onClick={() => {
            setTeachingId(null);
            setForm(EMPTY_FORM);
          }}
          className="border border-neutral-700 text-neutral-300 rounded-lg px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // ---------- password screen
  if (!authed) {
    return (
      <main className="min-h-screen bg-carbon text-white px-6 py-16 max-w-sm mx-auto">
        <h1 className="text-2xl font-black mb-1">Teach Lientjie</h1>
        <p className="text-sm text-neutral-400 mb-6">Admin only. Enter the bot admin password.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(password)}
          placeholder="Password"
          className={input + " mb-3"}
        />
        <button
          onClick={() => load(password)}
          disabled={loading || !password}
          className="w-full bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-2.5 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Open"}
        </button>
        {message && <p className="text-sm text-red-400 mt-3">{message}</p>}
      </main>
    );
  }

  const list = tab === "pending" ? data.pending : data.handled;

  return (
    <main className="min-h-screen bg-carbon text-white px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black">Teach Lientjie</h1>
        <button
          onClick={() => {
            try {
              sessionStorage.removeItem("bot_admin_pw");
            } catch {}
            setAuthed(false);
            setPassword("");
          }}
          className="text-xs border border-neutral-700 rounded-full px-3 py-1 text-neutral-300"
        >
          Lock
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto">
        {[
          ["pending", `Unanswered (${data.pending.length})`],
          ["handled", `Handled (${data.handled.length})`],
          ["knowledge", `What she knows (${data.knowledge.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-sm whitespace-nowrap rounded-full px-4 py-1.5 border transition ${
              tab === key
                ? "bg-orange-500 text-black border-orange-500 font-semibold"
                : "border-neutral-700 text-neutral-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <p className="text-sm bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 mb-4 text-neutral-200">
          {message}
        </p>
      )}

      {tab !== "knowledge" && (
        <div className="space-y-3">
          {list.length === 0 && (
            <p className="text-neutral-500 text-sm">
              {tab === "pending"
                ? "Nothing waiting. Everything people asked, she could answer."
                : "Nothing handled yet."}
            </p>
          )}
          {list.map((row) => {
            const { tag, text } = tagOf(row.question);
            return (
              <div key={row.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-white break-words">{text}</p>
                  <span className="text-xs text-orange-400 whitespace-nowrap">
                    asked {row.times_asked}×
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {tag && (
                    <span
                      className={`text-[11px] border rounded-full px-2 py-0.5 ${
                        tagStyle[tag] || "bg-neutral-800 text-neutral-300 border-neutral-700"
                      }`}
                    >
                      {tag === "ure" ? "asked about opening hours" : tag === "nie nuttig" ? "marked not helpful" : tag}
                    </span>
                  )}
                  <span className="text-xs text-neutral-500">
                    last asked {new Date(row.last_asked).toLocaleString("en-ZA")}
                  </span>
                </div>

                {teachingId === row.id ? (
                  teachForm(row)
                ) : (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tab === "pending" ? (
                      <>
                        <button
                          onClick={() => startTeaching(row)}
                          className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-3.5 py-1.5 text-sm"
                        >
                          Teach her
                        </button>
                        <button
                          onClick={() => act({ action: "handle", id: row.id, handled: true })}
                          className="border border-neutral-700 text-neutral-300 rounded-lg px-3.5 py-1.5 text-sm"
                        >
                          Done / ignore
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => act({ action: "handle", id: row.id, handled: false })}
                        className="border border-neutral-700 text-neutral-300 rounded-lg px-3.5 py-1.5 text-sm"
                      >
                        Move back
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this question?")) act({ action: "delete_unanswered", id: row.id });
                      }}
                      className="text-red-400 border border-red-500/30 rounded-lg px-3.5 py-1.5 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "knowledge" && (
        <div className="space-y-3">
          {teachingId === "new" ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <p className="font-semibold mb-1">Add something new</p>
              {teachForm(null)}
            </div>
          ) : (
            <button
              onClick={() => {
                setTeachingId("new");
                setForm(EMPTY_FORM);
              }}
              className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-2 text-sm"
            >
              + Add an answer
            </button>
          )}

          {data.knowledge.length === 0 && (
            <p className="text-neutral-500 text-sm">She hasn't been taught anything here yet.</p>
          )}
          {data.knowledge.map((k) => (
            <div
              key={k.id}
              className={`bg-neutral-900 border rounded-xl p-4 ${
                k.active ? "border-neutral-800" : "border-neutral-800 opacity-60"
              }`}
            >
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(k.keywords || []).map((w) => (
                  <span
                    key={w}
                    className="text-[11px] bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5"
                  >
                    {w}
                  </span>
                ))}
              </div>
              <p className="text-sm text-neutral-200">{k.answer_af}</p>
              {k.answer_en && <p className="text-xs text-neutral-400 mt-1">EN: {k.answer_en}</p>}
              {k.link && (
                <p className="text-xs text-neutral-400 mt-1">
                  Button → {k.link} {k.link_label_af ? `(${k.link_label_af})` : ""}
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-2">
                Last checked: {k.last_checked || "never"}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => act({ action: "recheck", id: k.id }, "Marked as checked today.")}
                  className="border border-neutral-700 text-neutral-300 rounded-lg px-3 py-1.5 text-xs"
                >
                  Still correct ✓
                </button>
                <button
                  onClick={() => act({ action: "toggle", id: k.id, active: !k.active })}
                  className="border border-neutral-700 text-neutral-300 rounded-lg px-3 py-1.5 text-xs"
                >
                  {k.active ? "Turn off" : "Turn on"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this answer?")) act({ action: "delete_knowledge", id: k.id });
                  }}
                  className="text-red-400 border border-red-500/30 rounded-lg px-3 py-1.5 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
