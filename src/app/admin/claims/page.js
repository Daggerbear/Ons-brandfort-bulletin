// src/app/admin/claims/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const TABS = ["pending", "approved", "rejected", "all"];

export default function AdminClaims() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState("pending");
  const [claims, setClaims] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    setAuthed(sessionStorage.getItem("adminAuth") === "true");
    setChecked(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("business_claims")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const rows = data || [];
    setClaims(rows);
    const ids = [...new Set(rows.map((c) => c.business_id))];
    if (ids.length) {
      const { data: biz } = await supabase
        .from("businesses")
        .select("id, name, owner_id")
        .in("id", ids);
      const map = {};
      (biz || []).forEach((b) => (map[b.id] = b));
      setNames(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const decide = async (claim, approve) => {
    setWorkingId(claim.id);
    setError("");
    const { error: err } = await supabase.rpc("decide_claim", {
      p_claim_id: claim.id,
      p_approve: approve,
    });
    setWorkingId(null);
    if (err) {
      setError(
        err.message.includes("admin only")
          ? "Not recognised as admin. Sign in with Google in this browser first."
          : err.message
      );
      return;
    }
    load();
  };

  const removeOwner = async (claim) => {
    if (!confirm("Remove this owner from the business?")) return;
    setWorkingId(claim.id);
    const { error: err } = await supabase
      .from("businesses")
      .update({ owner_id: null })
      .eq("id", claim.business_id);
    setWorkingId(null);
    if (err) setError(err.message);
    else load();
  };

  if (!checked) return null;
  if (!authed) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <Link href="/admin" className="text-orange-400 underline">
          Log in on the admin page first
        </Link>
      </main>
    );
  }

  const shown = tab === "all" ? claims : claims.filter((c) => c.status === tab);
  const count = (s) => claims.filter((c) => c.status === s).length;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black">Business Claims</h1>
          <Link href="/admin" className="text-sm text-neutral-400 hover:text-orange-400">
            Back
          </Link>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto">
          {TABS.map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`text-sm rounded-full px-4 py-1.5 border whitespace-nowrap transition ${
                tab === tb
                  ? "bg-orange-500 border-orange-500 text-black font-bold"
                  : "border-neutral-700 text-neutral-300 hover:border-orange-500"
              }`}
            >
              {tb[0].toUpperCase() + tb.slice(1)}
              {tb !== "all" && ` · ${count(tb)}`}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-neutral-500 text-sm">Loading...</p>
        ) : shown.length === 0 ? (
          <p className="text-neutral-500 text-sm">Nothing here.</p>
        ) : (
          <div className="space-y-3">
            {shown.map((c) => {
              const biz = names[c.business_id];
              const wa = (c.whatsapp || "").replace(/[^0-9+]/g, "");
              return (
                <div
                  key={c.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {biz?.name || `Business #${c.business_id}`}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {new Date(c.created_at).toLocaleDateString()} · {c.status}
                      </p>
                    </div>
                    <Link
                      href={`/business/${c.business_id}`}
                      className="text-xs text-neutral-400 hover:text-orange-400 flex-shrink-0"
                    >
                      View
                    </Link>
                  </div>

                  <div className="mt-3 text-sm space-y-1">
                    <p>
                      <span className="text-neutral-500">Name: </span>
                      {c.claimant_name || "-"}
                    </p>
                    <p>
                      <span className="text-neutral-500">WhatsApp: </span>
                      {wa ? (
                        <a
                          href={`https://wa.me/${wa.replace("+", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 underline"
                        >
                          {c.whatsapp}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                    {c.message && (
                      <p>
                        <span className="text-neutral-500">Says: </span>
                        {c.message}
                      </p>
                    )}
                  </div>

                  {c.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => decide(c, true)}
                        disabled={workingId === c.id}
                        className="bg-green-600 hover:bg-green-700 transition text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => decide(c, false)}
                        disabled={workingId === c.id}
                        className="border border-red-500/60 text-red-300 hover:bg-red-950/40 transition text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {c.status === "approved" && biz?.owner_id === c.user_id && (
                    <button
                      onClick={() => removeOwner(c)}
                      disabled={workingId === c.id}
                      className="mt-4 text-sm text-red-300 border border-red-500/40 rounded-lg px-4 py-2 hover:bg-red-950/40 transition disabled:opacity-50"
                    >
                      Remove owner
                    </button>
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
