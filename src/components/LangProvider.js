// src/components/LangProvider.js
"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const KEY = "bulletin_lang";

const DEFAULT_VALUE = {
  lang: "af",
  setLang: () => {},
  toggleLang: () => {},
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const parent = useContext(LangContext);
  const [lang, setLangState] = useState("af");

  // Restore the saved choice after the page loads
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "af" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  const setLang = useCallback((next) => {
    if (next !== "af" && next !== "en") return;
    setLangState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "af" ? "en" : "af");
  }, [lang, setLang]);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang }),
    [lang, setLang, toggleLang]
  );

  // If a provider already exists higher up, use that one so there is only ever one language state
  if (parent) return children;

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// Pages adopt this by replacing their own useState("af") line:
//   const { lang, setLang } = useLang();
export function useLang() {
  return useContext(LangContext) ?? DEFAULT_VALUE;
}