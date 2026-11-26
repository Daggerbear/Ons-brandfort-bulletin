// src/components/grid/gridFx.js
"use client";
import { useCallback, useRef } from "react";

// short phone vibration (ignored where it is not supported)
export function haptic(pattern = 12) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  } catch {}
}

// tiny synthesised sounds, no audio files needed. Silent unless `enabled` is true.
export function useSound(enabled) {
  const ctx = useRef(null);

  const blip = useCallback(
    (freq = 660, dur = 0.09, type = "sine", vol = 0.05, when = 0) => {
      if (!enabled) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!ctx.current) ctx.current = new AC();
        const c = ctx.current;
        if (c.state === "suspended") c.resume();
        const o = c.createOscillator();
        const g = c.createGain();
        const t0 = c.currentTime + when;
        o.type = type;
        o.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(vol, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g);
        g.connect(c.destination);
        o.start(t0);
        o.stop(t0 + dur + 0.02);
      } catch {}
    },
    [enabled]
  );

  const tap = useCallback(() => blip(880, 0.05, "square", 0.025), [blip]);
  const chime = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.16, "triangle", 0.06, i * 0.09));
  }, [blip]);

  return { tap, chime };
}
