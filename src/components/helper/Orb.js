// src/components/helper/Orb.js
// Lientjie's glowing ball. Pure CSS, no images and no libraries.
// state: "idle" (slow float) | "thinking" (spins faster and pulses) | "answer" (one ripple, then idle)
"use client";

const ORB_CSS = `
@keyframes lo-float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.025)}}
@keyframes lo-spin{to{transform:rotate(360deg)}}
@keyframes lo-spin-rev{to{transform:rotate(-360deg)}}
@keyframes lo-think{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes lo-ring{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.9);opacity:0}}
.lo-orb{position:absolute;inset:0;border-radius:50%;overflow:hidden;
  background:radial-gradient(circle at 34% 28%,#e0fbff 0%,#22d3ee 16%,#2563eb 44%,#1b1650 74%,#05050f 100%);
  box-shadow:0 0 60px 8px rgba(34,211,238,.32),0 0 130px 28px rgba(37,99,235,.22),0 0 90px 10px rgba(255,106,0,.14),inset 0 0 36px rgba(255,255,255,.16);
  animation:lo-float 6s ease-in-out infinite}
.lo-orb.lo-thinking{animation:lo-think 1.1s ease-in-out infinite}
.lo-swirl{position:absolute;inset:-25%;mix-blend-mode:screen;filter:blur(10px);opacity:.9;animation:lo-spin 11s linear infinite;
  background:conic-gradient(from 0deg,transparent 0%,rgba(255,106,0,.55) 12%,transparent 30%,rgba(34,211,238,.65) 48%,transparent 62%,rgba(147,197,253,.55) 80%,transparent 100%)}
.lo-swirl.lo-b{animation:lo-spin-rev 16s linear infinite;opacity:.6;filter:blur(16px);
  background:conic-gradient(from 90deg,transparent 0%,rgba(99,102,241,.7) 20%,transparent 40%,rgba(34,211,238,.5) 70%,transparent 100%)}
.lo-thinking .lo-swirl{animation-duration:3.2s}
.lo-thinking .lo-swirl.lo-b{animation-duration:4.6s}
.lo-gloss{position:absolute;left:14%;top:8%;width:46%;height:30%;border-radius:50%;
  background:radial-gradient(ellipse at 50% 40%,rgba(255,255,255,.55),transparent 70%);filter:blur(3px)}
.lo-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(34,211,238,.7);animation:lo-ring 1.3s ease-out both;pointer-events:none}
@media (prefers-reduced-motion: reduce){.lo-orb,.lo-swirl,.lo-ring{animation:none}}
`;

export default function Orb({ size = 150, state = "idle", pulseKey = 0 }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <style>{ORB_CSS}</style>
      {state === "answer" && <span key={pulseKey} className="lo-ring" />}
      {state === "answer" && <span key={`b${pulseKey}`} className="lo-ring" style={{ animationDelay: "0.25s" }} />}
      <div className={`lo-orb ${state === "thinking" ? "lo-thinking" : ""}`}>
        <span className="lo-swirl" />
        <span className="lo-swirl lo-b" />
        <span className="lo-gloss" />
      </div>
    </div>
  );
}
