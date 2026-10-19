// src/components/AuthButton.js
"use client";
import { useAuth } from "@/components/AuthProvider";

const labels = {
  af: { signIn: "Teken in", signOut: "Teken uit", wait: "Wag...", dismiss: "Maak toe" },
  en: { signIn: "Sign in", signOut: "Sign out", wait: "Please wait...", dismiss: "Dismiss" },
};

// variant "tab" matches the TopNav tabs (icon over label); "pill" is a standalone button
export default function AuthButton({ lang = "af", variant = "pill" }) {
  const { user, loading, busy, error, clearError, signInWithGoogle, signOut } =
    useAuth();
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

  const label = busy ? t.wait : user ? t.signOut : t.signIn;
  const onClick = user ? signOut : signInWithGoogle;

  const button = isTab ? (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={user?.email || ""}
      className="w-full flex flex-col items-center justify-center gap-0.5 py-2.5 disabled:opacity-50"
    >
      <span className={`text-xl ${user ? "opacity-60" : ""}`}>👤</span>
      <span
        className={`text-[10px] font-medium ${
          user ? "text-neutral-500" : "text-orange-400"
        }`}
      >
        {label}
      </span>
    </button>
  ) : (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={user?.email || ""}
      className={`text-sm rounded-full px-3 py-1 border transition disabled:opacity-50 whitespace-nowrap ${
        user
          ? "border-neutral-600 text-neutral-200 hover:border-orange-500 hover:text-orange-400"
          : "border-orange-500 bg-orange-500 text-black font-semibold hover:bg-orange-600"
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
          className="absolute right-0 top-full mt-2 w-64 z-50 bg-red-950/90 border border-red-500/50 text-red-200 text-xs rounded-lg px-3 py-2"
        >
          <p>{error[lang] || error.af}</p>
          <button
            type="button"
            onClick={clearError}
            className="mt-1 underline text-red-300 hover:text-white"
          >
            {t.dismiss}
          </button>
        </div>
      )}
    </div>
  );
}
