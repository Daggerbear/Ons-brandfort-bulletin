// src/app/admin/lientjie/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TeachForm from "@/components/admin/TeachForm";
import { getReply } from "@/lib/botBrain";
import { cleanQuestion } from "@/lib/bot/teachHelpers";

const tagOf = (question) => {
  const m = (question || "").match(/^\[([^\]]+)\]\s*(.*)$/);
  return m ? { tag: m[1], text: m[2] } : { tag: null, text: question };
};
const tagWords = { ure: "asked about opening hours", "nie nuttig": "marked not helpful" };
const daysSince = (d) => (d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null);
const savedPw = () => {
  try {
    return sessionStorage.getItem("adminPw") || sessionStorage.getItem("bot_admin_pw") || "";
  } catch {
    return "";
  }
};
const btn = "border border-neutral-700 text-neutral-300 rounded-lg px-3.5 py-1.5 text-sm";
const main = "bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-3.5 py-1.5 text-sm";

export default function LientjieAdmin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState({ pending: [], handled: [], knowledge: [] });
  const [tab, setTab] = useState("pending");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState(null); // which card has the teach form open ("new" for a blank one)
  const [testQ, setTestQ] = useState("");
  const [testOut, setTestOut] = useState(null);

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
      try {
        setData(await call(pw, "GET"));
        setAuthed(true);
        setMessage("");
        try {
          sessionStorage.setItem("bot_admin_pw", pw);
        } catch {}
      } catch (e) {
        setAuthed(false);
        setMessage(e.message);
      }
      setLoading(false);
    },
    [call]
  );

  useEffect(() => {
    const pw = savedPw();
    if (pw) {
      setPassword(pw);
      load(pw);
    }
  }, [load]);

  const act = async (body, ok) => {
    try {
      await call(password, "POST", body);
      setMessage(ok || "");
      await load(password);
      return true;
    } catch (e) {
      setMessage(e.message);
      return false;
    }
  };

  const save = (row, existing) => async (form) => {
    const body = existing
      ? { action: "update", id: existing.id, ...form }
      : { action: "teach", unansweredId: row?.id || null, ...form };
    const ok = await act(body, "Saved. Lientjie knows this now. ✅");
    if (ok) setOpenId(null);
  };

  const runTest = () => {
    const q = testQ.trim();
    if (!q) return;
    const rows = data.knowledge.filter((k) => k.active);
    setTestOut(getReply({ query: q, lang: "af", businesses: [], knowledge: rows }));
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-16 max-w-sm mx-auto">
        <h1 className="text-2xl font-black mb-1">Teach Lientjie</h1>
        <p className="text-sm text-neutral-400 mb-6">Enter the admin password.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(password)}
          placeholder="Password"
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 mb-3 outline-none focus:border-orange-500"
        />
        <button onClick={() => load(password)} disabled={loading || !password} className={main + " w-full py-2.5 disabled:opacity-50"}>
          {loading ? "Checking…" : "Open"}
        </button>
        {message && <p className="text-sm text-red-400 mt-3">{message}</p>}
      </main>
    );
  }

  const list = tab === "pending" ? data.pending : data.handled;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black">Teach Lientjie</h1>
          <Link href="/admin" className="text-xs text-neutral-500 hover:text-orange-400">← Admin home</Link>
        </div>
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

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {[
          ["pending", `To teach (${data.pending.length})`],
          ["handled", `Done (${data.handled.length})`],
          ["knowledge", `What she knows (${data.knowledge.length})`],
          ["test", "Test her"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-sm whitespace-nowrap rounded-full px-4 py-1.5 border transition ${
              tab === key ? "bg-orange-500 text-black border-orange-500 font-semibold" : "border-neutral-700 text-neutral-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && <p className="text-sm bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 mb-4 text-neutral-200">{message}</p>}

      {(tab === "pending" || tab === "handled") && (
        <div className="space-y-3">
          {list.length === 0 && (
            <p className="text-neutral-500 text-sm">{tab === "pending" ? "Nothing to teach. She could answer everything people asked. 🎉" : "Nothing here yet."}</p>
          )}
          {list.map((row) => {
            const { tag, text } = tagOf(row.question);
            return (
              <div key={row.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold break-words">{text}</p>
                  <span className="text-xs text-orange-400 whitespace-nowrap">{row.times_asked}×</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {tag && <span className="mr-2 text-sky-300">{tagWords[tag] || tag}</span>}
                  last asked {new Date(row.last_asked).toLocaleDateString("en-ZA")}
                </p>
                {openId === row.id ? (
                  <TeachForm question={row.question} knowledge={data.knowledge} onSave={save(row)} onCancel={() => setOpenId(null)} />
                ) : (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tab === "pending" ? (
                      <>
                        <button onClick={() => setOpenId(row.id)} className={main}>Teach her</button>
                        <button onClick={() => act({ action: "handle", id: row.id, handled: true })} className={btn}>Ignore</button>
                      </>
                    ) : (
                      <button onClick={() => act({ action: "handle", id: row.id, handled: false })} className={btn}>Move back</button>
                    )}
                    <button
                      onClick={() => confirm("Delete this question?") && act({ action: "delete_unanswered", id: row.id })}
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
          {openId === "new" ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <p className="font-semibold">Teach her something new</p>
              <TeachForm knowledge={data.knowledge} onSave={save(null)} onCancel={() => setOpenId(null)} />
            </div>
          ) : (
            <button onClick={() => setOpenId("new")} className={main + " px-4 py-2"}>+ Teach her something</button>
          )}
          {data.knowledge.length === 0 && <p className="text-neutral-500 text-sm">She hasn't been taught anything yet.</p>}
          {data.knowledge.map((k) => {
            const age = daysSince(k.last_checked);
            return (
              <div key={k.id} className={`bg-neutral-900 border border-neutral-800 rounded-xl p-4 ${k.active ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(k.keywords || []).map((w) => (
                    <span key={w} className="text-[11px] bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5">{w}</span>
                  ))}
                </div>
                <p className="text-sm text-neutral-200 whitespace-pre-line">{k.answer_af}</p>
                {k.answer_en && <p className="text-xs text-neutral-400 mt-1">EN: {k.answer_en}</p>}
                {k.link && <p className="text-xs text-neutral-400 mt-1">Button → {k.link} {k.link_label_af ? `(${k.link_label_af})` : ""}</p>}
                <p className={`text-xs mt-2 ${age !== null && age > 60 ? "text-amber-400" : "text-neutral-500"}`}>
                  {age === null ? "Never checked" : age > 60 ? `⚠️ Not checked for ${age} days. Is it still true?` : `Checked ${age} days ago`}
                </p>
                {openId === k.id ? (
                  <TeachForm initial={k} knowledge={data.knowledge} onSave={save(null, k)} onCancel={() => setOpenId(null)} />
                ) : (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => setOpenId(k.id)} className={btn + " !px-3 !text-xs"}>Edit</button>
                    <button onClick={() => act({ action: "recheck", id: k.id }, "Marked as checked today.")} className={btn + " !px-3 !text-xs"}>Still correct ✓</button>
                    <button onClick={() => act({ action: "toggle", id: k.id, active: !k.active })} className={btn + " !px-3 !text-xs"}>{k.active ? "Turn off" : "Turn on"}</button>
                    <button
                      onClick={() => confirm("Delete this answer?") && act({ action: "delete_knowledge", id: k.id })}
                      className="text-red-400 border border-red-500/30 rounded-lg px-3 py-1.5 text-xs"
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

      {tab === "test" && (
        <div>
          <p className="text-sm text-neutral-400 mb-3">Type a question the way a visitor would. This shows what she says using her built-in rules and everything you taught her.</p>
          <div className="flex gap-2">
            <input
              value={testQ}
              onChange={(e) => setTestQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runTest()}
              placeholder="Ask her something…"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
            <button onClick={runTest} className={main}>Ask</button>
          </div>
          {testOut && (
            <div className="mt-4 rounded-xl bg-white/[0.05] border border-white/10 p-4">
              <p className="text-sm text-neutral-100 whitespace-pre-line">{testOut.text}</p>
              {testOut.links?.map((l) => (
                <span key={l.href} className="inline-block mt-2 mr-2 bg-orange-500 text-black text-xs font-bold rounded-full px-3 py-1">{l.label} → {l.href}</span>
              ))}
              {testOut.unanswered && <p className="text-xs text-amber-400 mt-3">She could not answer this one. It would show up under “To teach”.</p>}
              <p className="text-[11px] text-neutral-500 mt-3">Business searches can't be tested here because no business list is loaded.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
