// src/app/profile/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import ProfileShell from "@/components/profile/ProfileShell";
import ProfileHero from "@/components/profile/ProfileHero";
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
    editTitle: "Wysig profiel",
    editBtn: "Wysig profiel",
    close: "Klaar",
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
    myBusiness: "My Besigheid",
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
    editTitle: "Edit profile",
    editBtn: "Edit profile",
    close: "Done",
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
    myBusiness: "My Business",
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
  const [ownsBusiness, setOwnsBusiness] = useState(false);
  const [editing, setEditing] = useState(false);

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
      supabase.from("businesses").select("id", { count: "exact", head: true }).eq("owner_id", userId),
    ]).then(([profileResult, xpResult, ownedResult]) => {
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
      setOwnsBusiness((ownedResult.count ?? 0) > 0);
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
    setEditing(false);
  };

  // A brand-new profile opens straight into the edit form
  const showForm = editing || (status === "ready" && !profile);

  const field = (id, label, help, control) => (
    <div>
      <label htmlFor={id} className="pf-label">
        {label}
      </label>
      {control}
      {help && <p className="pf-faint mt-1 text-xs">{help}</p>}
    </div>
  );

  return (
    <ProfileShell>
      <div className="mb-5">
        <Link href="/" className="pf-link text-sm">
          {t.back}
        </Link>
      </div>

      {loading || (user && (status === "idle" || status === "loading")) ? (
        <div aria-hidden="true" className="space-y-4">
          <div className="pf-card h-52 animate-pulse" />
          <div className="pf-card h-12 animate-pulse" />
          <div className="pf-card h-28 animate-pulse" />
        </div>
      ) : !user ? (
        <div className="pf-card p-7 text-center">
          <div className="mb-3 text-4xl">👤</div>
          <h1 className="text-xl font-bold">{t.signInTitle}</h1>
          <p className="pf-muted mt-2 text-sm">{t.signInNote}</p>
          <button type="button" onClick={signInWithGoogle} disabled={busy} className="pf-btn mt-5">
            {busy ? t.wait : t.signIn}
          </button>
        </div>
      ) : status === "failed" ? (
        <div className="pf-card p-7 text-center">
          <p role="alert" className="pf-bad">
            {t.loadFailed}
          </p>
          <button type="button" onClick={() => setReloadKey((n) => n + 1)} className="pf-btn-ghost mt-4">
            {t.retry}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <ProfileHero
            user={user}
            profile={profile}
            title={t.title}
            gamerName={isHunter ? gamerName : ""}
            gameLabel={gameLabel}
            totalXp={totalXp}
            signedInAs={t.signedInAs}
          />

          <ProfileTabs lang={lang} />

          {ownsBusiness && (
            <Link href="/my-business" className="pf-row">
              <span>🏪 {t.myBusiness}</span>
              <span aria-hidden="true">›</span>
            </Link>
          )}

          {message && !showForm && (
            <p role="status" className={`text-center text-sm ${message.type === "error" ? "pf-bad" : "pf-ok"}`}>
              {message.text}
            </p>
          )}

          <MyPosts userId={userId} lang={lang} />

          {!showForm ? (
            <button
              type="button"
              onClick={() => {
                setMessage(null);
                setEditing(true);
              }}
              className="pf-btn-ghost"
            >
              ✏️ {t.editBtn}
            </button>
          ) : (
            <form onSubmit={save} className="pf-card space-y-4 p-5">
              <div className="flex items-center justify-between">
                <p className="pf-eyebrow">{t.editTitle}</p>
                {profile && (
                  <button type="button" onClick={() => setEditing(false)} className="pf-link text-xs">
                    {t.close}
                  </button>
                )}
              </div>
              <p className="pf-faint -mt-2 text-xs">{t.private}</p>

              {field(
                "display_name",
                t.nameLabel,
                t.nameHelp,
                <input
                  id="display_name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={40}
                  autoComplete="nickname"
                  className="pf-input"
                />
              )}

              {field(
                "bio",
                t.bioLabel,
                null,
                <>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    maxLength={200}
                    rows={3}
                    className="pf-input resize-none"
                  />
                  <p className="pf-faint mt-1 text-right text-xs">{bio.length}/200</p>
                </>
              )}

              {field(
                "whatsapp",
                t.whatsappLabel,
                t.whatsappHelp,
                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  maxLength={20}
                  autoComplete="tel"
                  className="pf-input"
                />
              )}

              {field(
                "favourite_game",
                t.gameLabel,
                null,
                <select id="favourite_game" value={game} onChange={(event) => setGame(event.target.value)} className="pf-input">
                  <option value="">{t.gameNone}</option>
                  {GAMES.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      {g.label}
                    </option>
                  ))}
                </select>
              )}

              <p className="pf-faint text-xs">{t.photoNote}</p>

              {message && (
                <p role={message.type === "error" ? "alert" : "status"} className={`text-sm ${message.type === "error" ? "pf-bad" : "pf-ok"}`}>
                  {message.text}
                </p>
              )}

              <button type="submit" disabled={saving} className="pf-btn">
                {saving ? t.saving : t.save}
              </button>
            </form>
          )}

          <button type="button" onClick={signOut} disabled={busy} className="pf-btn-ghost">
            {busy ? t.wait : t.signOut}
          </button>
        </div>
      )}
    </ProfileShell>
  );
}
