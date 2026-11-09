// src/app/profile/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";
import ProfileTabs from "@/components/ProfileTabs";
import MyPosts from "@/components/MyPosts";
import { HUNTERS_ENABLED } from "@/lib/features";
import { useHunter } from "@/lib/useHunter";
import { useLang } from "@/components/LangProvider";

const GAMES = [
  { slug: "battleship", label: "Battleship" },
  { slug: "chess", label: "Chess" },
  { slug: "checkers", label: "Checkers" },
  { slug: "sudoku", label: "Sudoku" },
  { slug: "riddle-rush", label: "Riddle Rush" },
  { slug: "block-rush", label: "Block Rush" },
  { slug: "whack-a-mole", label: "Whack-a-Mole" },
  { slug: "snake", label: "Snake" },
  { slug: "brick-breaker", label: "Brick Breaker" },
  { slug: "merge-rush", label: "Merge Rush" },
];

const text = {
  af: {
    title: "My Profiel",
    private: "Jou profielinligting word gebruik om vorms makliker in te vul, en meer.",
    signInTitle: "Teken in om jou profiel te sien",
    signInNote: "Jy kan die Bulletin steeds sonder 'n rekening gebruik.",
    signIn: "Teken in met Google",
    wait: "Wag...",
    signedInAs: "Aangemeld as",
    photoNote: "Jou foto kom van jou Google-rekening.",
    editTitle: "WYSIG PROFIEL",
    nameLabel: "Vertoonnaam",
    nameHelp:
      "Gebruik jou eie naam. Moet asseblief nie 'n besigheidsnaam gebruik nie. Besigheidsrekeninge kom later.",
    whatsappLabel: "WhatsApp-nommer (opsioneel)",
    whatsappHelp:
      "Word net gebruik om jou plasings vooraf in te vul. Dit word nooit gewys tensy jy dit self in 'n plasing sit.",
    whatsappRule: "Gebruik 'n geldige nommer, bv. 0821234567.",
    bioLabel: "Kort bio (opsioneel)",
    gameLabel: "Gunsteling speletjie (opsioneel)",
    gameNone: "Geen",
    save: "Stoor",
    saving: "Stoor...",
    saved: "✓ Gestoor",
    nameRule: "Jou naam moet tussen 2 en 40 karakters wees.",
    bioRule: "Jou bio mag nie meer as 200 karakters wees nie.",
    saveFailed: "Kon nie stoor nie. Probeer asseblief weer.",
    loadFailed: "Kon nie jou profiel laai nie.",
    retry: "Probeer weer",
    signOut: "Teken uit",
    back: "← Terug na die Bulletin",
  },
  en: {
    title: "My Profile",
    private: "Your profile info is used for easier form fill-in and more.",
    signInTitle: "Sign in to see your profile",
    signInNote: "You can still use the Bulletin without an account.",
    signIn: "Sign in with Google",
    wait: "Please wait...",
    signedInAs: "Signed in as",
    photoNote: "Your photo comes from your Google account.",
    editTitle: "EDIT PROFILE",
    nameLabel: "Display name",
    nameHelp:
      "Use your own name. Please don't use a business name. Business accounts are coming later.",
    whatsappLabel: "WhatsApp number (optional)",
    whatsappHelp:
      "Only used to prefill your posts. It is never shown unless you put it in a post yourself.",
    whatsappRule: "Use a valid number, e.g. 0821234567.",
    bioLabel: "Short bio (optional)",
    gameLabel: "Favourite game (optional)",
    gameNone: "None",
    save: "Save",
    saving: "Saving...",
    saved: "✓ Saved",
    nameRule: "Your name must be 2 to 40 characters.",
    bioRule: "Your bio can't be longer than 200 characters.",
    saveFailed: "Couldn't save. Please try again.",
    loadFailed: "Couldn't load your profile.",
    retry: "Try again",
    signOut: "Sign out",
    back: "← Back to the Bulletin",
  },
};

const COLUMNS = "id, display_name, bio, favourite_game, whatsapp, account_type, created_at";

// First name from Google, used only as the suggested display name
function firstNameFrom(user) {
  const meta = user?.user_metadata || {};
  const given = (meta.given_name || "").trim();
  if (given) return given;
  const full = (meta.full_name || meta.name || "").trim();
  return full.split(/\s+/)[0] || "";
}

export default function ProfilePage() {
  const { user, loading, busy, signInWithGoogle, signOut } = useAuth();
  const { lang } = useLang();
  const t = text[lang];

  const [profile, setProfile] = useState(null); // saved row, or null if none yet
  const [totalXp, setTotalXp] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | failed
  const [reloadKey, setReloadKey] = useState(0);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [game, setGame] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: "ok" | "error", text }

  const userId = user?.id;
  const { hunter } = useHunter();
  const isHunter = HUNTERS_ENABLED && !!hunter;
  const gamerName = hunter?.gamer_name || "";
  const gameLabel = GAMES.find((g) => g.slug === profile?.favourite_game)?.label;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setStatus("idle");
      return;
    }
    let active = true;
    setStatus("loading");
    Promise.all([
      supabase.from("profiles").select(COLUMNS).eq("id", userId).maybeSingle(),
      supabase.rpc("my_total_xp"),
    ]).then(([profileResult, xpResult]) => {
      if (!active) return;
      if (profileResult.error) {
        setStatus("failed");
        return;
      }
      const data = profileResult.data;
      setProfile(data);
      setName(data?.display_name ?? firstNameFrom(user));
      setBio(data?.bio ?? "");
      setGame(data?.favourite_game ?? "");
      setWhatsapp(data?.whatsapp ?? "");
      setTotalXp(xpResult.error ? 0 : Number(xpResult.data) || 0);
      setStatus("ready");
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, reloadKey]);

  const save = async (event) => {
    event.preventDefault();
    setMessage(null);
    const cleanName = name.trim().replace(/\s+/g, " ");
    const cleanBio = bio.trim();
    if (cleanName.length < 2 || cleanName.length > 40) {
      return setMessage({ type: "error", text: t.nameRule });
    }
    if (cleanBio.length > 200) {
      return setMessage({ type: "error", text: t.bioRule });
    }

    // Keep digits only (and a leading +), 9 to 15 digits
    const rawWa = whatsapp.trim();
    const cleanWa = rawWa.replace(/[^\d]/g, "");
    if (rawWa && (cleanWa.length < 9 || cleanWa.length > 15)) {
      return setMessage({ type: "error", text: t.whatsappRule });
    }

    setSaving(true);
    const payload = {
      display_name: cleanName,
      bio: cleanBio || null,
      favourite_game: game || null,
      whatsapp: rawWa ? cleanWa : null,
    };
    const { data, error } = profile
      ? await supabase
          .from("profiles")
          .update(payload)
          .eq("id", userId)
          .select(COLUMNS)
          .single()
      : await supabase
          .from("profiles")
          .insert({ id: userId, ...payload })
          .select(COLUMNS)
          .single();
    setSaving(false);

    if (error) return setMessage({ type: "error", text: t.saveFailed });
    setProfile(data);
    setName(data.display_name);
    setBio(data.bio ?? "");
    setGame(data.favourite_game ?? "");
    setWhatsapp(data.whatsapp ?? "");
    setMessage({ type: "ok", text: t.saved });
  };

  return (
    <main className="min-h-screen bg-carbon px-6 py-8 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-orange-400 hover:text-orange-300"
          >
            {t.back}
          </Link>
        </div>

        {loading || (user && (status === "idle" || status === "loading")) ? (
          <div aria-hidden="true" className="space-y-4">
            <div className="h-20 animate-pulse rounded-2xl bg-neutral-900" />
            <div className="h-32 animate-pulse rounded-2xl bg-neutral-900" />
            <div className="h-12 animate-pulse rounded-lg bg-neutral-900" />
            <div className="h-24 animate-pulse rounded-lg bg-neutral-900" />
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 text-center">
            <div className="mb-3 text-4xl">👤</div>
            <h1 className="text-xl font-bold">{t.signInTitle}</h1>
            <p className="mt-2 text-sm text-neutral-400">{t.signInNote}</p>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              className="mt-5 rounded-full bg-orange-500 px-6 py-2.5 font-semibold text-black transition hover:bg-orange-600 disabled:opacity-50"
            >
              {busy ? t.wait : t.signIn}
            </button>
          </div>
        ) : status === "failed" ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-6 text-center">
            <p role="alert" className="text-red-200">
              {t.loadFailed}
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((n) => n + 1)}
              className="mt-4 rounded-full border border-neutral-500 px-5 py-2 text-sm text-neutral-100 hover:border-orange-500"
            >
              {t.retry}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5">
              <Avatar user={user} size={64} />
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold">
                  {profile?.display_name || t.title}
                </h1>
                {isHunter && gamerName && (
                  <p className="truncate text-sm font-semibold text-cyan-300">🎯 {gamerName}</p>
                )}
                {gameLabel && (
                  <p className="truncate text-sm text-cyan-300">🎮 {gameLabel}</p>
                )}
                <p className="truncate text-xs text-neutral-400">
                  {t.signedInAs} {user.email}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{t.photoNote}</p>
              </div>
            </div>

            <ProfileTabs lang={lang} />

            <p className="mt-3 text-center text-xs text-neutral-500">
              ⚡ {t.private}
            </p>

            <MyPosts userId={userId} lang={lang} />

            <form onSubmit={save} className="mt-5 space-y-4">
              <p className="text-[11px] font-bold tracking-[0.25em] text-orange-400">
                [ {t.editTitle} ]
              </p>

              <div>
                <label
                  htmlFor="display_name"
                  className="mb-1 block text-xs text-neutral-400"
                >
                  {t.nameLabel}
                </label>
                <input
                  id="display_name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={40}
                  autoComplete="nickname"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-orange-500"
                />
                <p className="mt-1 text-xs text-neutral-500">{t.nameHelp}</p>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="mb-1 block text-xs text-neutral-400"
                >
                  {t.bioLabel}
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-orange-500"
                />
                <p className="mt-1 text-right text-xs text-neutral-500">
                  {bio.length}/200
                </p>
              </div>

              <div>
                <label
                  htmlFor="whatsapp"
                  className="mb-1 block text-xs text-neutral-400"
                >
                  {t.whatsappLabel}
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  maxLength={20}
                  autoComplete="tel"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-orange-500"
                />
                <p className="mt-1 text-xs text-neutral-500">{t.whatsappHelp}</p>
              </div>

              <div>
                <label
                  htmlFor="favourite_game"
                  className="mb-1 block text-xs text-neutral-400"
                >
                  {t.gameLabel}
                </label>
                <select
                  id="favourite_game"
                  value={game}
                  onChange={(event) => setGame(event.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-orange-500"
                >
                  <option value="">{t.gameNone}</option>
                  {GAMES.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              {message && (
                <p
                  role={message.type === "error" ? "alert" : "status"}
                  className={`text-sm ${message.type === "error" ? "text-red-300" : "text-green-400"}`}
                >
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-black transition hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? t.saving : t.save}
              </button>
            </form>

            <button
              type="button"
              onClick={signOut}
              disabled={busy}
              className="mt-6 w-full rounded-lg border border-neutral-700 py-3 text-sm text-neutral-300 transition hover:border-orange-500 hover:text-orange-400 disabled:opacity-50"
            >
              {busy ? t.wait : t.signOut}
            </button>
          </>
        )}
      </div>
    </main>
  );
}