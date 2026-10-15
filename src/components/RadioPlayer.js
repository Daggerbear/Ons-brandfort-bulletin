"use client";
import { useEffect, useState } from "react";

const PLAYER_URL = "https://sv2.famcast.co.za/AudioPlayer/veldbrand-radio?mount=";
const STATION_URL = "https://veldbrandradio.co.za";

export default function RadioPlayer() {
  const [open, setOpen] = useState(false);
  // Only mount the iframe after the first open, then never unmount it,
  // so audio keeps playing when the panel is retracted or pages change.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("radio_open") === "1") setOpen(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (open) setLoaded(true);
    try {
      localStorage.setItem("radio_open", open ? "1" : "0");
    } catch {}
  }, [open]);

  return (
    <div
      className="fixed left-0 top-1/2 z-50 flex items-center transition-transform duration-300 ease-out"
      style={{
        transform: `translate(${open ? "0px" : "calc(-100% + 36px)"}, -50%)`,
      }}
    >
      {/* Panel */}
      <div
        className="bg-neutral-950/95 backdrop-blur border border-l-0 border-neutral-800 rounded-r-2xl p-3 shadow-2xl"
        style={{ width: "min(320px, calc(100vw - 48px))" }}
      >
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            📻 Radio
          </span>
        </div>

        <h3 className="text-lg font-black leading-tight text-white px-1 mb-2">
          Veldbrand <span className="text-orange-500">Radio</span>
        </h3>

        {loaded && (
          <iframe
            width="100%"
            height="250"
            src={PLAYER_URL}
            style={{ border: 0, borderRadius: 12 }}
            title="Luister regstreeks na Veldbrand Radio"
            allow="autoplay"
          />
        )}

        {/* Permission footnote */}
        <p className="mt-2 px-1 text-[10px] leading-snug text-neutral-500">
          Gebruik met toestemming van{" "}
          <a
            href={STATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 underline hover:text-orange-400"
          >
            Veldbrand Media
          </a>
          .
          <br />
          Used with permission from Veldbrand Media.
        </p>
      </div>

      {/* Tab handle */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close radio player" : "Open radio player"}
        className="-ml-px flex flex-col items-center justify-center gap-1 w-9 py-4 bg-orange-500 hover:bg-orange-600 transition text-black rounded-r-xl border border-orange-400 shadow-lg"
      >
        <span className="text-base leading-none">{open ? "‹" : "📻"}</span>
        {!open && (
          <span
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Radio
          </span>
        )}
      </button>
    </div>
  );
}