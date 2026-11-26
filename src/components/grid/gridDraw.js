// src/components/grid/gridDraw.js
"use client";
import { useMemo } from "react";
import { N, ROADS, MAIN_ROAD, TW, TH } from "./gridConfig";

// ---------- isometric helpers ----------
export const iso = (x, y, z = 0) => [(x - y) * (TW / 2), (x + y) * (TH / 2) - z];
export const poly = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const pathOf = (pts) =>
  "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";

export function boxFaces(gx, gy, w, d, h, z = 0) {
  const t = z + h;
  return {
    top: poly([iso(gx, gy, t), iso(gx + w, gy, t), iso(gx + w, gy + d, t), iso(gx, gy + d, t)]),
    left: poly([iso(gx, gy + d, z), iso(gx + w, gy + d, z), iso(gx + w, gy + d, t), iso(gx, gy + d, t)]),
    right: poly([iso(gx + w, gy + d, z), iso(gx + w, gy, z), iso(gx + w, gy, t), iso(gx + w, gy + d, t)]),
  };
}

export function Box({ gx, gy, w, d, h, z = 0, color, alpha = 0.3, dash, width = 1.2, className }) {
  const f = boxFaces(gx, gy, w, d, h, z);
  const common = { stroke: color, strokeWidth: width, strokeLinejoin: "round", strokeDasharray: dash };
  return (
    <g className={className}>
      <polygon points={f.left} fill={color} fillOpacity={alpha * 0.6} {...common} />
      <polygon points={f.right} fill={color} fillOpacity={alpha} {...common} />
      <polygon points={f.top} fill={color} fillOpacity={alpha * 1.4} {...common} />
    </g>
  );
}

// lit windows on the two visible faces, up to the height that has been built
export function Windows({ gx, gy, w, d, h, lit, color, seed = 1, live = true }) {
  const rowH = 11;
  const rows = Math.floor((Math.min(lit, h) - 5) / rowH);
  if (rows <= 0) return null;
  const on = [];
  const dim = [];
  const blink = [];
  const faces = [
    { len: w, pt: (u, z) => iso(gx + u, gy + d, z) },
    { len: d, pt: (u, z) => iso(gx + w, gy + d - u, z) },
  ];
  faces.forEach((f, fi) => {
    const cols = Math.max(2, Math.round(f.len * 1.8));
    const cw = f.len / cols;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const u0 = c * cw + cw * 0.22;
        const u1 = c * cw + cw * 0.74;
        const z0 = 5 + r * rowH;
        const z1 = z0 + 5.5;
        const p = pathOf([f.pt(u0, z0), f.pt(u1, z0), f.pt(u1, z1), f.pt(u0, z1)]);
        const k = (c * 31 + r * 17 + fi * 11 + seed * 7) % 9;
        if (k === 0) dim.push(p);
        else if (k === 1 && live) blink.push(p);
        else on.push(p);
      }
    }
  });
  return (
    <g style={{ pointerEvents: "none" }}>
      <path d={dim.join("")} fill={color} fillOpacity="0.14" />
      <path d={on.join("")} fill={color} fillOpacity="0.85" />
      {blink.length > 0 && <path d={blink.join("")} fill={color} className="gx-flicker" />}
    </g>
  );
}

// ---------- shared defs (gradients, glow, clip) ----------
export function GridDefs() {
  const floor = poly([iso(0, 0), iso(N, 0), iso(N, N), iso(0, N)]);
  return (
    <defs>
      <radialGradient id="gx-floor" cx="50%" cy="50%" r="70%">
        <stop offset="0" stopColor="#0b2a4a" />
        <stop offset="1" stopColor="#030a18" />
      </radialGradient>
      <linearGradient id="gx-scangrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
        <stop offset="0.5" stopColor="#22d3ee" stopOpacity="0.22" />
        <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="gx-beamgrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#67e8f9" stopOpacity="0.55" />
        <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
      </linearGradient>
      <clipPath id="gx-floor-clip">
        <polygon points={floor} />
      </clipPath>
      <filter id="gx-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// ---------- the ground: floor, roads, grid lines, corner pylons, scan sweep ----------
export function Ground({ live }) {
  const els = [];
  els.push(
    <polygon
      key="halo"
      points={poly([iso(-0.6, -0.6), iso(N + 0.6, -0.6), iso(N + 0.6, N + 0.6), iso(-0.6, N + 0.6)])}
      fill="none"
      stroke="#22d3ee"
      strokeOpacity="0.14"
      strokeWidth="7"
      strokeLinejoin="round"
    />
  );
  els.push(
    <polygon key="floor" points={poly([iso(0, 0), iso(N, 0), iso(N, N), iso(0, N)])} fill="url(#gx-floor)" />
  );

  // roads (each tile is drawn once, even where two roads cross)
  const roadTiles = new Set();
  for (let i = 0; i < N; i++) {
    ROADS.forEach((r) => {
      roadTiles.add(`${r}-${i}`);
      roadTiles.add(`${i}-${r}`);
    });
  }
  roadTiles.forEach((tile) => {
    const [x, y] = tile.split("-").map(Number);
    const main = x === MAIN_ROAD || y === MAIN_ROAD;
    els.push(
      <polygon
        key={`road-${tile}`}
        points={poly([iso(x, y), iso(x + 1, y), iso(x + 1, y + 1), iso(x, y + 1)])}
        fill={main ? "rgba(34,211,238,0.10)" : "rgba(34,211,238,0.05)"}
        stroke={main ? "rgba(34,211,238,0.32)" : "rgba(34,211,238,0.16)"}
        strokeWidth="0.6"
      />
    );
  });

  // dashed road centre lines
  ROADS.forEach((r) => {
    const [ax, ay] = iso(0, r + 0.5);
    const [bx, by] = iso(N, r + 0.5);
    const [cx, cy] = iso(r + 0.5, 0);
    const [dx, dy] = iso(r + 0.5, N);
    const stroke = { stroke: "#67e8f9", strokeOpacity: 0.3, strokeWidth: 0.8, strokeDasharray: "3 6" };
    els.push(<line key={`cl-a${r}`} x1={ax} y1={ay} x2={bx} y2={by} {...stroke} />);
    els.push(<line key={`cl-b${r}`} x1={cx} y1={cy} x2={dx} y2={dy} {...stroke} />);
  });

  // grid lines
  for (let i = 0; i <= N; i++) {
    const edge = i === 0 || i === N;
    const stroke = edge ? "#22d3ee" : "#0a2f4d";
    const width = edge ? 1.6 : 0.6;
    const [ax, ay] = iso(i, 0);
    const [bx, by] = iso(i, N);
    const [cx, cy] = iso(0, i);
    const [dx, dy] = iso(N, i);
    els.push(<line key={`a${i}`} x1={ax} y1={ay} x2={bx} y2={by} stroke={stroke} strokeWidth={width} />);
    els.push(<line key={`b${i}`} x1={cx} y1={cy} x2={dx} y2={dy} stroke={stroke} strokeWidth={width} />);
  }

  // corner pylons
  [[0, 0], [N, 0], [N, N], [0, N]].forEach(([x, y], i) => {
    const [bx, by] = iso(x, y, 0);
    const [tx, ty] = iso(x, y, 26);
    els.push(<line key={`py${i}`} x1={bx} y1={by} x2={tx} y2={ty} stroke="#22d3ee" strokeWidth="1.4" />);
    els.push(<circle key={`pc${i}`} cx={tx} cy={ty} r="2.6" fill="#a5f3fc" className="gx-pulse" />);
  });

  return (
    <g>
      {els}
      {live && (
        <g clipPath="url(#gx-floor-clip)" style={{ pointerEvents: "none" }}>
          <rect x="-450" y="0" width="900" height="60" fill="url(#gx-scangrad)" className="gx-scan" />
        </g>
      )}
    </g>
  );
}

// ---------- little light-cars driving along the roads ----------
export function Traffic() {
  const colors = ["#22d3ee", "#e0f2fe", "#fb923c", "#a78bfa"];
  const cars = [];
  ROADS.forEach((r, i) => {
    [0, 1].forEach((axis) => {
      const a = axis === 0 ? iso(0, r + 0.5) : iso(r + 0.5, 0);
      const b = axis === 0 ? iso(N, r + 0.5) : iso(r + 0.5, N);
      [0, 1].forEach((dir) => {
        const [s, e] = dir ? [b, a] : [a, b];
        const dur = 9 + ((i * 3 + axis * 2 + dir) % 5) * 2.2;
        const begin = (i * 2 + axis + dir * 3) * 1.7;
        cars.push(
          <rect
            key={`car-${i}-${axis}-${dir}`}
            x="-5"
            y="-0.9"
            width="10"
            height="1.8"
            rx="0.9"
            fill={colors[(i + axis + dir) % 4]}
            opacity="0.9"
          >
            <animateMotion
              dur={`${dur}s`}
              begin={`-${begin}s`}
              repeatCount="indefinite"
              rotate="auto"
              path={`M${s[0].toFixed(1)} ${s[1].toFixed(1)}L${e[0].toFixed(1)} ${e[1].toFixed(1)}`}
            />
          </rect>
        );
      });
    });
  });
  return <g style={{ pointerEvents: "none" }}>{cars}</g>;
}

// ---------- night sky behind the map ----------
export function Starfield() {
  const stars = useMemo(() => {
    let s = 7;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: 64 }, () => ({
      x: r() * 100,
      y: r() * 100,
      s: 1 + r() * 1.6,
      d: r() * 4,
      o: 0.3 + r() * 0.6,
    }));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {stars.map((st, i) => (
        <span
          key={i}
          className="gx-twinkle absolute rounded-full bg-cyan-100"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            opacity: st.o,
            animationDelay: `${st.d}s`,
          }}
        />
      ))}
    </div>
  );
}

// ---------- all the Grid's own CSS (so globals.css does not need to change) ----------
export const GRID_CSS = `
.gx-root{touch-action:none;overscroll-behavior:contain;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
.gx-panel{background:rgba(2,10,24,.8);border:1px solid rgba(34,211,238,.28);border-radius:16px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 0 18px rgba(34,211,238,.1)}
.gx-btn{width:44px;height:44px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#67e8f9;background:rgba(2,10,24,.82);border:1px solid rgba(34,211,238,.35);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 0 14px rgba(34,211,238,.15);transition:transform .12s}
.gx-btn:active{transform:scale(.92)}
.gx-bar{background:linear-gradient(90deg,#0891b2,#22d3ee,#a5f3fc,#22d3ee,#0891b2);background-size:200% 100%;animation:gx-shine 2.6s linear infinite}
.gx-cta{background:linear-gradient(90deg,#06b6d4,#22d3ee);box-shadow:0 0 22px rgba(34,211,238,.4);transition:transform .12s,opacity .2s}
.gx-cta:active{transform:scale(.97)}
.gx-noscroll{scrollbar-width:none;-ms-overflow-style:none}
.gx-noscroll::-webkit-scrollbar{display:none}
.gx-scan{animation:gx-scan 5.5s linear infinite}
.gx-twinkle{animation:gx-twinkle 3.4s ease-in-out infinite}
.gx-pulse{animation:gx-pulse 1.8s ease-in-out infinite}
.gx-flicker{animation:gx-flicker 3.2s steps(1) infinite}
.gx-ring{transform-box:fill-box;transform-origin:center;animation:gx-ring 2.4s ease-out infinite}
.gx-burst{animation:gx-burst .95s ease-out both}
.gx-rise{animation:gx-rise 1.5s ease-out forwards}
.gx-march{animation:gx-march 1s linear infinite}
.gx-bounce{animation:gx-bounce .9s ease-in-out infinite}
.gx-beam{animation:gx-beam 2.8s ease-in-out infinite}
.gx-slide{animation:gx-slide .22s ease-out both}
.gx-banner{animation:gx-banner 3.8s ease-out both}
@keyframes gx-scan{from{transform:translateY(-60px)}to{transform:translateY(460px)}}
@keyframes gx-twinkle{0%,100%{opacity:.12}50%{opacity:1}}
@keyframes gx-pulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes gx-flicker{0%,100%{opacity:.9}45%{opacity:.9}50%{opacity:.12}55%{opacity:.9}}
@keyframes gx-ring{from{transform:scale(.25);opacity:.9}to{transform:scale(1.6);opacity:0}}
@keyframes gx-burst{from{transform:translate(0,0) scale(1);opacity:1}to{transform:translate(var(--dx),var(--dy)) scale(.2);opacity:0}}
@keyframes gx-rise{from{transform:translateY(0);opacity:0}15%{opacity:1}to{transform:translateY(-46px);opacity:0}}
@keyframes gx-march{to{stroke-dashoffset:-14}}
@keyframes gx-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes gx-beam{0%,100%{opacity:.25}50%{opacity:.75}}
@keyframes gx-slide{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes gx-banner{0%{transform:translateY(-16px) scale(.9);opacity:0}10%{transform:translateY(0) scale(1);opacity:1}85%{opacity:1}100%{opacity:0}}
@keyframes gx-shine{from{background-position:0 0}to{background-position:200% 0}}
@media (prefers-reduced-motion:reduce){.gx-root *{animation:none!important}}
`;
