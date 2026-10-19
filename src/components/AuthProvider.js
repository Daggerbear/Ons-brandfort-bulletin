// src/components/AuthProvider.js
"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

// Where to send the person after Google brings them back
export const RETURN_KEY = "bulletin_auth_return";

const AuthContext = createContext(null);

// Only allow same-site relative paths, never another site or the auth pages
export function safeReturnPath(path) {
  if (typeof path !== "string") return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  if (path.startsWith("/auth")) return "/";
  return path;
}

const ERRORS = {
  start: {
    af: "Kon nie met Google begin nie. Probeer asseblief weer.",
    en: "Couldn't start Google sign-in. Please try again.",
  },
  session: {
    af: "Kon nie jou sessie laai nie. Herlaai die blad.",
    en: "Couldn't load your session. Please refresh the page.",
  },
  signout: {
    af: "Kon nie uitteken nie. Probeer asseblief weer.",
    en: "Couldn't sign out. Please try again.",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    // Restores a saved session on page load (this is what survives a refresh)
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(ERRORS.session);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    // Keep state in sync with sign-in, sign-out and token refresh.
    // Only set state in here, never call other Supabase methods.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      sessionStorage.setItem(
        RETURN_KEY,
        safeReturnPath(window.location.pathname + window.location.search)
      );
    } catch {}

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });

    // On success the browser leaves for Google, so we only get here on failure
    if (oauthError) {
      setError(ERRORS.start);
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    setBusy(true);
    // "local" signs out this device only
    const { error: outError } = await supabase.auth.signOut({ scope: "local" });
    if (outError) setError(ERRORS.signout);
    setBusy(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user, // Supabase auth user, or null for visitors
      loading, // true until the saved session has been checked
      isAuthenticated: !!user,
      busy,
      error, // { af, en } or null
      clearError,
      signInWithGoogle,
      signOut,
    }),
    [user, loading, busy, error, clearError, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
