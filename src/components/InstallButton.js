"use client";
import { useState, useEffect } from "react";

export default function InstallButton({ lang }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const iOSDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIOS(iOSDevice);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone) return null;

  const text = {
    af: {
      button: "📲 Installeer Die Bulletin",
      title: "Installeer Die Bulletin",
      iosSteps: [
        "Tik die Deel-knoppie onder in Safari",
        "Rol af en tik 'Voeg by Tuisskerm'",
        "Tik 'Voeg By'",
      ],
      androidSteps: [
        "Tik die drie kolletjies (⋮) regs bo in Chrome",
        "Tik 'Installeer app' of 'Voeg by tuisskerm'",
        "Bevestig deur op 'Installeer' te tik",
      ],
      close: "Maak toe",
    },
    en: {
      button: "📲 Install The Bulletin",
      title: "Install The Bulletin",
      iosSteps: [
        "Tap the Share button at the bottom of Safari",
        "Scroll down and tap 'Add to Home Screen'",
        "Tap 'Add'",
      ],
      androidSteps: [
        "Tap the three dots (⋮) top-right in Chrome",
        "Tap 'Install app' or 'Add to Home screen'",
        "Confirm by tapping 'Install'",
      ],
      close: "Close",
    },
  };
  const t = text[lang] || text.af;
  const steps = isIOS ? t.iosSteps : t.androidSteps;

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } else {
      setShowManualHelp(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-full px-5 py-2.5 text-sm shadow-lg shadow-orange-500/20"
      >
        {t.button}
      </button>

      {showManualHelp && (
        <div
          className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setShowManualHelp(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-orange-400 mb-4">{t.title}</h3>
            <ol className="space-y-3 mb-5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-neutral-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <button
              onClick={() => setShowManualHelp(false)}
              className="w-full text-center border border-neutral-700 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition rounded-lg px-4 py-2 text-sm"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}