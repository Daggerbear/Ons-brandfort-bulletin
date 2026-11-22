// src/app/admin/plans/page.js
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const DAY = 86400000;
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

const STATE_STYLE = {
  active: ["Active", "bg-green-600/25 text-green-300"],
  grandfathered: ["Grandfathered", "bg-sky-600/25 text-sky-300"],
  expiring: ["Expiring soon", "bg-orange-500/25 text-orange-300"],
  grace: ["Grace period", "bg-yellow-600/25 text-yellow-300"],
  ending: ["Cancelled, runs to end", "bg-neutral-700 text-neutral-300"],
  expired: ["Expired", "bg-red-600/25 text-red-300"],
  revoked: ["Revoked", "bg-red-600/25 text-red-300"],
  none: ["No plan", "bg-neutral-800 text-neutral-400"],
};

const FILTERS = [
  ["all", "All"],
  ["active", "Active"],
  ["expiring", "Expiring"],
  ["expired", "Expired"],
  ["none", "No plan"],
  ["noowner", "No owner"],
];

function planState(sub) {
  if (!sub) return "none";
  const now = Date.now();
  if (sub.source === "grandfathered") return sub.status === "cancelled" ? "revoked" : "grandfathered";
  const until = sub.paid_until ? new Date(sub.paid_until).getTime() : 0;
  if (sub.status === "cancelled") return until > now ? "ending" : "revoked";
  if (until > now) return until - now <= 7 * DAY ? "expiring" : "active";
  if (until + (sub.grace_days ?? 7) * DAY > now) return "grace";
  return "expired";
}

const matches = (filter, key, biz) => {
  if (filter === "all") return true;
  if (filter === "active") return ["active", "grandfathered", "expiring", "grace", "ending"].includes(key);
  if (filter === "expiring") return ["expiring", "grace"].includes(key);
  if (filter === "expired") return ["expired", "revoked"].includes(key);
  if (filter === "none") return key === "none";
  if (filter === "noowner") return !biz.owner_id;
  return true;
};

function PlanPanel({ biz, sub, owner, state, busy, onApply, onGrant }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState(sub?.note || "");
  const rand = Number(String(amount).replace(",", ".")) || 0;

  const reminder = () => {
    const digits = (owner?.whatsapp || "").replace(/\D/g, "");
    if (!digits) return null;
    const number = digits.startsWith("0") ? `27${digits.slice(1)}` : digits;
    const when =
      sub?.paid_until && new Date(sub.paid_until).getTime() > Date.now()
        ? `runs out on ${fmt(sub.paid_until)}`
        : "has ended";
    const text = `Hi ${owner?.claimant_name || ""}, your Ons Brandfort Bulletin plan for ${biz.name} ${when}. Let me know if you would like to renew. Thank you!`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  };
  const waLink = reminder();

  const btn = "rounded-lg border border-neutral-600 px-3 py-2 text-sm text-neutral-100 disabled:opacity-40";

  return (
    <div className="space-y-4 border-t border-neutral-800 px-4 pb-4 pt-3">
      <div className="text-sm text-neutral-300">
        <p>
          <span className="text-neutral-500">Owner: </span>
          {owner ? owner.claimant_name || "Unnamed" : "No owner yet"}
          {owner?.whatsapp && <span className="text-neutral-400"> · {owner.whatsapp}</span>}
        </p>
        <p>
          <span className="text-neutral-500">Plan: </span>
          {sub ? `${sub.plan} · ${sub.source}` : "none"}
          {sub?.paid_until && sub.source !== "grandfathered" && ` · until ${fmt(sub.paid_until)}`}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs text-neutral-500">Payment received (R, optional)</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="e.g. 100"
          className="w-32 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-orange-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[30, 90, 365].map((d) => (
          <button
            key={d}
            disabled={busy}
            onClick={() => onGrant(biz, d, rand)}
            className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-bold text-black disabled:opacity-40"
          >
            {sub && state !== "none" ? `Extend ${d}d` : `Grant ${d}d`}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Or set an end date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-orange-500"
          />
        </div>
        <button
          disabled={busy || !date}
          className={btn}
          onClick={() =>
            onApply(
              biz,
              {
                status: "active",
                source: sub?.source && sub.source !== "grandfathered" ? sub.source : "manual",
                paid_until: new Date(`${date}T23:59:00`).toISOString(),
              },
              { okText: "End date set" },
            )
          }
        >
          Set date
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs text-neutral-500">Note</label>
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-orange-500"
          />
          <button
            disabled={busy || note === (sub?.note || "")}
            className={btn}
            onClick={() => onApply(biz, { note: note.trim() || null }, { okText: "Note saved" })}
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-neutral-800 pt-3">
        <button
          disabled={busy || state === "grandfathered"}
          className={btn}
          onClick={() => {
            if (!window.confirm(`Grandfather ${biz.name}? Free starter access with no end date.`)) return;
            onApply(biz, { status: "active", source: "grandfathered" }, { okText: "Grandfathered" });
          }}
        >
          Grandfather
        </button>
        {waLink && (
          <a href={waLink} target="_blank" rel="noreferrer" className={btn}>
            WhatsApp reminder
          </a>
        )}
        <button
          disabled={busy || !sub || state === "revoked"}
          className="ml-auto rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-300 disabled:opacity-40"
          onClick={() => {
            if (!window.confirm(`Revoke access for ${biz.name}?`)) return;
            onApply(
              biz,
              sub.source === "grandfathered"
                ? { status: "cancelled" }
                : { status: "cancelled", paid_until: new Date().toISOString() },
              { okText: "Access revoked" },
            );
          }}
        >
          Revoke
        </button>
      </div>
    </div>
  );
}

export default function AdminPlans() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [subs, setSubs] = useState({});
  const [owners, setOwners] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    setAuthed(sessionStorage.getItem("adminAuth") === "true");
    setChecked(true);
    return () => clearTimeout(toastTimer.current);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [b, s, c] = await Promise.all([
      supabase.from("businesses").select("*").order("name"),
      supabase.from("business_subscriptions").select("*"),
      supabase.from("business_claims").select("*").eq("status", "approved"),
    ]);
    const failed = [b, s, c].find((r) => r.error);
    if (failed) {
      setError(failed.error.message);
      setLoading(false);
      return;
    }
    const bl = b.data || [];
    setBusinesses(bl);
    setSubs(Object.fromEntries((s.data || []).map((x) => [x.business_id, x])));
    const ownerMap = {};
    bl.forEach((biz) => {
      const claim = (c.data || []).find((x) => x.business_id === biz.id && x.user_id === biz.owner_id);
      if (claim) ownerMap[biz.id] = claim;
    });
    setOwners(ownerMap);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const flash = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2000);
  };

  const apply = async (biz, patch, { okText = "Saved ✓", amount = 0 } = {}) => {
    setBusyId(biz.id);
    setError("");
    const cur = subs[biz.id];
    const row = {
      business_id: biz.id,
      plan: cur?.plan || "starter",
      status: cur?.status || "active",
      source: cur?.source || "manual",
      paid_until: cur?.paid_until || null,
      grace_days: cur?.grace_days ?? 7,
      note: cur?.note || null,
      ...patch,
      updated_at: new Date().toISOString(),
    };
    const { data, error: err } = await supabase
      .from("business_subscriptions")
      .upsert(row, { onConflict: "business_id" })
      .select("*")
      .single();
    if (err) {
      setBusyId(null);
      setError(
        err.message.includes("row-level security")
          ? "Not recognised as admin. Sign in with Google in this browser first."
          : err.message,
      );
      return;
    }
    if (amount > 0) {
      await supabase.from("business_payments").insert({
        business_id: biz.id,
        provider: "manual",
        provider_reference: `manual-${biz.id}-${Date.now()}`,
        amount_cents: Math.round(amount * 100),
        status: "success",
      });
    }
    setSubs((c) => ({ ...c, [biz.id]: data }));
    setBusyId(null);
    flash(okText);
  };

  const grant = (biz, days, amount) => {
    const cur = subs[biz.id];
    const now = Date.now();
    const runsTo =
      cur && cur.source !== "grandfathered" && cur.paid_until ? new Date(cur.paid_until).getTime() : 0;
    const base = runsTo > now ? runsTo : now;
    apply(
      biz,
      {
        status: "active",
        source: cur?.source === "paystack" ? "paystack" : "manual",
        paid_until: new Date(base + days * DAY).toISOString(),
      },
      { okText: `+${days} days`, amount },
    );
  };

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return businesses
      .map((b) => ({ biz: b, key: planState(subs[b.id]) }))
      .filter(({ biz, key }) => matches(filter, key, biz))
      .filter(({ biz }) => !needle || (biz.name || "").toLowerCase().includes(needle));
  }, [businesses, subs, filter, search]);

  const tally = useMemo(() => {
    const t = {};
    businesses.forEach((b) => {
      const k = planState(subs[b.id]);
      t[k] = (t[k] || 0) + 1;
    });
    return t;
  }, [businesses, subs]);

  if (!checked) return null;
  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
        <Link href="/admin" className="text-orange-400 underline">
          Log in on the admin page first
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-40 pt-8 text-white sm:px-6">
      {toast && (
        <div className="fixed left-1/2 top-[4.25rem] z-50 -translate-x-1/2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-black">Plans & Access</h1>
          <Link href="/admin" className="text-sm text-neutral-400 hover:text-orange-400">
            Back
          </Link>
        </div>

        <p className="mb-4 text-sm text-neutral-400">
          {(tally.active || 0) + (tally.expiring || 0) + (tally.grace || 0) + (tally.ending || 0)} paid ·{" "}
          {tally.grandfathered || 0} grandfathered · {(tally.expiring || 0) + (tally.grace || 0)} need renewing ·{" "}
          {(tally.expired || 0) + (tally.revoked || 0)} lapsed
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a business..."
          className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-3 text-base text-white outline-none focus:border-orange-500"
        />
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
                filter === key
                  ? "border-orange-500 bg-orange-500 font-bold text-black"
                  : "border-neutral-700 text-neutral-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-950/60 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing here.</p>
        ) : (
          <div className="space-y-2">
            {rows.map(({ biz, key }) => {
              const sub = subs[biz.id];
              const [label, tone] = STATE_STYLE[key];
              const open = openId === biz.id;
              return (
                <div key={biz.id} className="rounded-xl border border-neutral-800 bg-neutral-900">
                  <button
                    onClick={() => setOpenId(open ? null : biz.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{biz.name}</p>
                      <p className="truncate text-xs text-neutral-500">
                        {owners[biz.id]?.claimant_name || (biz.owner_id ? "Owner" : "No owner")}
                        {biz.Status !== "approved" && " · listing not live"}
                        {sub?.paid_until && sub.source !== "grandfathered" && ` · to ${fmt(sub.paid_until)}`}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
                      {label}
                    </span>
                  </button>
                  {open && (
                    <PlanPanel
                      key={`${biz.id}-${sub?.updated_at || "x"}`}
                      biz={biz}
                      sub={sub}
                      owner={owners[biz.id]}
                      state={key}
                      busy={busyId === biz.id}
                      onApply={apply}
                      onGrant={grant}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
