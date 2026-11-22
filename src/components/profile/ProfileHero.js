// src/components/profile/ProfileHero.js
// The top card of the profile: banner, photo, name, bio and a few chips.
"use client";
import Avatar from "@/components/Avatar";

export default function ProfileHero({ user, profile, title, gamerName, gameLabel, totalXp, signedInAs }) {
  const name = profile?.display_name || title;
  return (
    <section className="pf-card overflow-hidden">
      <div className="pf-banner" />
      <div className="px-5 pb-5">
        <div className="-mt-11 flex items-end justify-between gap-3">
          <div className="pf-avatar">
            <Avatar user={user} size={80} />
          </div>
          <span className="pf-chip mb-1">⚡ {Number(totalXp || 0).toLocaleString("en-ZA")} XP</span>
        </div>

        <h1 className="mt-3 truncate text-2xl font-black tracking-tight">{name}</h1>
        {profile?.bio && <p className="pf-muted mt-1.5 whitespace-pre-line text-sm leading-relaxed">{profile.bio}</p>}

        {(gamerName || gameLabel) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {gamerName && <span className="pf-chip">🎯 {gamerName}</span>}
            {gameLabel && <span className="pf-chip">🎮 {gameLabel}</span>}
          </div>
        )}

        <p className="pf-faint mt-3 truncate text-xs">
          {signedInAs} {user.email}
        </p>
      </div>
    </section>
  );
}
