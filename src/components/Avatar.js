// src/components/Avatar.js
"use client";
import { useState } from "react";

// The person's Google photo, read from their sign-in session (nothing is stored by us)
export function avatarUrl(user) {
  const meta = user?.user_metadata || {};
  return meta.avatar_url || meta.picture || null;
}

export default function Avatar({ user, size = 28, className = "" }) {
  const [failed, setFailed] = useState(false);
  const url = avatarUrl(user);
  const meta = user?.user_metadata || {};
  const source = meta.given_name || meta.full_name || meta.name || user?.email || "?";
  const initial = (source.trim()[0] || "?").toUpperCase();
  const style = { width: size, height: size };

  if (!url || failed) {
    return (
      <span
        aria-hidden="true"
        style={{ ...style, fontSize: Math.round(size * 0.5) }}
        className={`inline-flex items-center justify-center rounded-full bg-orange-500 font-bold text-black ${className}`}
      >
        {initial}
      </span>
    );
  }

  return (
    // Plain img on purpose: Google photos don't need the Next image optimizer
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={style}
      className={`rounded-full object-cover ${className}`}
    />
  );
}
