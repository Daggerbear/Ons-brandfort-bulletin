// src/app/api/admin/bot/route.js
// Private admin API for teaching Lientjie. Runs on the server only.
// Uses the SAME password as your admin login (ADMIN_PASSWORD).
// Also needs one server-side env var (NOT starting with NEXT_PUBLIC_):
//   SUPABASE_SERVICE_ROLE_KEY   - from Supabase > Project Settings > API
//   SUPABASE_URL                - your project URL (not secret), only needed if
//                                 NEXT_PUBLIC_SUPABASE_URL is not set in Vercel
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

function authorised(request) {
  const given = request.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function db() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in Vercel (add it, then redeploy).");
  }
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD is missing in Vercel.");
  }
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("SUPABASE_URL is missing in Vercel (your project URL, like https://xxxx.supabase.co).");
  }
  return createClient(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

const deny = async () => {
  await new Promise((r) => setTimeout(r, 500)); // slows down password guessing
  return NextResponse.json({ error: "Wrong password" }, { status: 401 });
};

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// only allow links that stay on the site or go to https
const safeLink = (v) => {
  const link = clean(v, 300);
  if (!link) return null;
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  if (link.startsWith("https://")) return link;
  return null;
};

async function handleGet(request) {
  if (!authorised(request)) return deny();
  const supabase = db();

  // small count for the dashboard badge
  if (new URL(request.url).searchParams.get("summary")) {
    const { count } = await supabase
      .from("bot_unanswered")
      .select("*", { count: "exact", head: true })
      .eq("handled", false);
    return NextResponse.json({ pending: count ?? 0 });
  }

  const [pending, handled, knowledge] = await Promise.all([
    supabase
      .from("bot_unanswered")
      .select("*")
      .eq("handled", false)
      .order("times_asked", { ascending: false })
      .order("last_asked", { ascending: false })
      .limit(200),
    supabase
      .from("bot_unanswered")
      .select("*")
      .eq("handled", true)
      .order("last_asked", { ascending: false })
      .limit(50),
    supabase.from("bot_knowledge").select("*").order("created_at", { ascending: false }),
  ]);

  const error = pending.error || handled.error || knowledge.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    pending: pending.data,
    handled: handled.data,
    knowledge: knowledge.data,
  });
}

async function handlePost(request) {
  if (!authorised(request)) return deny();
  const supabase = db();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { action } = body;

  if (action === "teach") {
    const keywords = (Array.isArray(body.keywords) ? body.keywords : [])
      .map((k) => clean(k, 40).toLowerCase())
      .filter(Boolean)
      .slice(0, 12);
    const answer_af = clean(body.answer_af, 600);
    if (keywords.length === 0 || !answer_af) {
      return NextResponse.json({ error: "Add at least one keyword and an Afrikaans answer." }, { status: 400 });
    }
    const link = safeLink(body.link);
    if (clean(body.link, 300) && !link) {
      return NextResponse.json({ error: "Link must start with / or https://" }, { status: 400 });
    }

    const { error } = await supabase.from("bot_knowledge").insert({
      keywords,
      answer_af,
      answer_en: clean(body.answer_en, 600) || null,
      link,
      link_label_af: clean(body.link_label_af, 60) || null,
      link_label_en: clean(body.link_label_en, 60) || null,
      active: true,
      last_checked: new Date().toISOString().slice(0, 10),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (body.unansweredId) {
      await supabase.from("bot_unanswered").update({ handled: true }).eq("id", body.unansweredId);
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "handle") {
    const { error } = await supabase
      .from("bot_unanswered")
      .update({ handled: !!body.handled })
      .eq("id", body.id);
    return error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ ok: true });
  }

  if (action === "delete_unanswered") {
    const { error } = await supabase.from("bot_unanswered").delete().eq("id", body.id);
    return error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ ok: true });
  }

  if (action === "toggle") {
    const { error } = await supabase
      .from("bot_knowledge")
      .update({ active: !!body.active })
      .eq("id", body.id);
    return error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ ok: true });
  }

  if (action === "recheck") {
    const { error } = await supabase
      .from("bot_knowledge")
      .update({ last_checked: new Date().toISOString().slice(0, 10) })
      .eq("id", body.id);
    return error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ ok: true });
  }

  if (action === "delete_knowledge") {
    const { error } = await supabase.from("bot_knowledge").delete().eq("id", body.id);
    return error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET(request) {
  try {
    return await handleGet(request);
  } catch (e) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    return await handlePost(request);
  } catch (e) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
