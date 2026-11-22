// src/components/helper/HelperParts.js
// Small shared pieces of Lientjie's look: her face, the animations, button colours.

export const TAG_ICONS = {
  "I'm looking for a job": "💼",
  "I want to sell something": "🛒",
  "What's happening in town?": "📅",
  Plumber: "🔧",
  Restaurant: "🍽️",
};

export const CSS = `
@keyframes lj-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
@keyframes lj-dot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
@keyframes lj-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.4);opacity:0}}
.lj-in{animation:lj-in .28s ease-out both}
.lj-dot{animation:lj-dot 1.1s infinite ease-in-out}
.lj-ping{animation:lj-ping 1.9s infinite ease-out}
@media (prefers-reduced-motion: reduce){.lj-in,.lj-dot,.lj-ping{animation:none}}
`;

// Her face: a glowing ring (cyan to orange) around a wave, with an optional "online" dot
export function Avatar({ size = 40, online = false }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-orange-500 opacity-70 blur-[5px]" />
      <div className="absolute inset-[1.5px] rounded-full bg-neutral-950" />
      <span className="absolute inset-0 flex items-center justify-center" style={{ fontSize: size * 0.5 }}>
        👋
      </span>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
          <span className="lj-ping absolute inline-flex h-full w-full rounded-full bg-green-400/70" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-neutral-950 bg-green-400" />
        </span>
      )}
    </div>
  );
}

export function linkClass(href) {
  if (href.includes("wa.me")) return "bg-green-600 text-white hover:bg-green-500";
  if (href.startsWith("tel:")) return "border border-white/15 bg-white/10 text-white hover:bg-white/15";
  return "bg-orange-500 text-black hover:bg-orange-400";
}

