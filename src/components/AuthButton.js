// src/components/AuthButton.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";

const labels = {
  af: { signIn: "Teken in", signOut: "Teken uit", profile: "Profiel", wait: "Wag...", dismiss: "Maak toe" },
  en: { signIn: "Sign in", signOut: "Sign out", profile: "Profile", wait: "Please wait...", dismiss: "Dismiss" },
};

// variant "tab" matches the TopNav tabs (icon over label); "pill" is a standalone button.
// In the nav, signed-in people see their photo and go to /profile (sign out lives there).
export default function AuthButton({ lang = "af", variant = "pill" }) {
  const { user, loading, busy, error, clearError, signInWithGoogle, signOut } =
    useAuth();
  const pathname = usePathname();
  const t = labels[lang] || labels.af;
  const isTab = variant === "tab";

  // Same footprint as the real button so the nav doesn't jump while the session loads
  if (loading) {
    return isTab ? (
      <div
        aria-hidden="true"
        className="flex flex-col items-center justify-center gap-0.5 py-2.5"
      >
        <span className="text-xl opacity-30 animate-pulse">👤</span>
        <span className="h-2 w-8 rounded bg-neutral-800 animate-pulse" />
      </div>
    ) : (
      <div
        aria-hidden="true"
        className="h-8 w-20 rounded-full bg-neutral-800 animate-pulse"
      />
    );
  }

  if (isTab && user) {
    const active = pathname?.startsWith("/profile");
    return (
      <Link
        href="/profile"
        title={user.email || ""}
        className="relative flex w-full flex-col items-center justify-center gap-0.5 py-2.5"
      >
        {active && (
          <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-orange-500" />
        )}
        <Avatar user={user} size={24} />
        <span
          className={`text-[10px] font-medium ${active ? "text-orange-400" : "text-neutral-500"}`}
        >
          {t.profile}
        </span>
      </Link>
    );
  }

  const label = busy ? t.wait : user ? t.signOut : t.signIn;
  const onClick = user ? signOut : signInWithGoogle;

  const button = isTab ? (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex w-full flex-col items-center justify-center gap-0.5 py-2.5 disabled:opacity-50"
    >
      <span className="text-xl">👤</span>
      <span className="text-[10px] font-medium text-orange-400">{label}</span>
    </button>
  ) : (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={user?.email || ""}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm transition disabled:opacity-50 ${
        user
          ? "border-neutral-600 text-neutral-200 hover:border-orange-500 hover:text-orange-400"
          : "border-orange-500 bg-orange-500 font-semibold text-black hover:bg-orange-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative">
      {button}
      {error && (
        <div
          role="alert"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-red-500/50 bg-red-950/90 px-3 py-2 text-xs text-red-200"
        >
          <p>{error[lang] || error.af}</p>
          <button
            type="button"
            onClick={clearError}
            className="mt-1 text-red-300 underline hover:text-white"
          >
            {t.dismiss}
          </button>
        </div>
      )}
    </div>
  );
}
