// src/components/dash/PostPanel.js
// Post an update to the business feed. Free: 3 a month. Paid: unlimited. Goes live straight away.
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { uploadPhoto } from "@/lib/createHelpers";

const CATS = [
  ["Special", "🔥", "catSpecial"],
  ["New Stock", "📦", "catNewStock"],
  ["Menu", "🍽️", "catMenu"],
  ["Offer", "🏷️", "catOffer"],
  ["Announcement", "📣", "catAnnouncement"],
];

const field = {
  background: "var(--bz-surface)",
  border: "1px solid var(--bz-border)",
  color: "var(--bz-text)",
};

export default function PostPanel({ biz, d }) {
  const [quota, setQuota] = useState(null); // { unlimited, used, limit }
  const [form, setForm] = useState({ category: "Announcement", title: "", body: "" });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadQuota = async () => {
    const { data } = await supabase.rpc("business_post_quota", { p_business_id: biz.id });
    if (data) setQuota(data);
  };

  useEffect(() => {
    loadQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biz.id]);

  const left = quota ? Math.max(0, quota.limit - quota.used) : null;
  const blocked = quota && !quota.unlimited && left === 0;

  const pickPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  };
  const clearPhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview(null);
  };

  const send = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.title.trim()) return setMsg({ ok: false, text: d.postsNeedTitle });
    setBusy(true);
    try {
      let imageUrl = null;
      if (photo) imageUrl = await uploadPhoto("business_update_images", photo);
      const { error } = await supabase.rpc("post_business_update", {
        p_business_id: biz.id,
        p_title: form.title,
        p_body: form.body,
        p_category: form.category,
        p_image_url: imageUrl,
      });
      if (error) {
        const limit = error.message?.includes("post_limit_reached");
        setMsg({ ok: false, text: limit ? d.postsLocked(quota?.limit ?? 3) : d.postsFail });
        if (limit) loadQuota();
      } else {
        setMsg({ ok: true, text: d.postsDone });
        setForm((f) => ({ ...f, title: "", body: "" }));
        clearPhoto();
        loadQuota();
      }
    } catch {
      setMsg({ ok: false, text: d.postsFail });
    }
    setBusy(false);
  };

  return (
    <form onSubmit={send} className="space-y-4">
      <p
        className="rounded-lg px-3 py-2 text-sm"
        style={{ background: "var(--bz-accent-soft)", border: "1px solid var(--bz-accent-line)", color: "var(--bz-accent-text)" }}
      >
        {quota ? (quota.unlimited ? d.postsUnlimited : d.postsQuota(left, quota.limit)) : d.loading}
      </p>

      {blocked ? (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--bz-muted)" }}>
            {d.postsLocked(quota.limit)}
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-lg px-4 py-3 text-sm font-bold"
            style={{ background: "var(--bz-accent)", color: "var(--bz-on-accent)" }}
          >
            {d.contactUs}
          </Link>
        </div>
      ) : (
        <>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--bz-muted)" }}>
              {d.postsCategory}
            </p>
            <div className="flex flex-wrap gap-2">
              {CATS.map(([value, icon, key]) => {
                const on = form.category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, category: value })}
                    className="rounded-full px-3 py-1.5 text-sm"
                    style={
                      on
                        ? { background: "var(--bz-accent)", color: "var(--bz-on-accent)", fontWeight: 700 }
                        : { border: "1px solid var(--bz-accent-line)", color: "var(--bz-text)" }
                    }
                  >
                    {icon} {d[key]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">{d.postsTitle}</label>
            <input
              value={form.title}
              maxLength={80}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={d.postsTitlePh}
              className="w-full rounded-lg px-3 py-3 text-base outline-none"
              style={field}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">{d.postsBody}</label>
            <textarea
              value={form.body}
              maxLength={600}
              rows={4}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full resize-y rounded-lg px-3 py-3 text-base outline-none"
              style={field}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">{d.postsPhoto}</label>
            {preview ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <button type="button" onClick={clearPhoto} className="text-sm" style={{ color: "var(--bz-accent-text)" }}>
                  {d.removePhoto}
                </button>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={pickPhoto} className="block w-full text-sm" />
            )}
          </div>

          {msg && (
            <p className="text-sm" style={{ color: msg.ok ? "#86efac" : "#fca5a5" }}>
              {msg.text}{" "}
              {msg.ok && (
                <Link href={`/business/${biz.id}`} className="underline">
                  {d.viewPage}
                </Link>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg px-4 py-3 font-bold disabled:opacity-50"
            style={{ background: "var(--bz-accent)", color: "var(--bz-on-accent)" }}
          >
            {busy ? d.postsSending : d.postsSend}
          </button>
        </>
      )}
    </form>
  );
}
