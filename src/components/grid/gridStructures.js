// src/components/grid/gridStructures.js
"use client";
import { COLORS, EXTRA_TOP } from "./gridConfig";
import { Box, Windows, iso, poly } from "./gridDraw";

const seg = (key, a, b, color, width = 1.2, opacity = 1) => (
  <line
    key={key}
    x1={a[0]}
    y1={a[1]}
    x2={b[0]}
    y2={b[1]}
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeOpacity={opacity}
  />
);

// signal rings that spread out from a point
function Rings({ at, color, live }) {
  if (!live) return null;
  return (
    <g style={{ pointerEvents: "none" }}>
      {[0, 0.8, 1.6].map((d) => (
        <ellipse
          key={d}
          cx={at[0]}
          cy={at[1]}
          rx="12"
          ry="6"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          className="gx-ring"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </g>
  );
}

// Water tower: legs, cross-braces and a tank that fills up as BB comes in
function WaterBody({ slot, c, pct, done }) {
  const { gx, gy, w, d, h } = slot;
  const legTop = h * 0.55;
  const ins = 0.22;
  const k = [
    [gx + ins, gy + ins],
    [gx + w - ins, gy + ins],
    [gx + w - ins, gy + d - ins],
    [gx + ins, gy + d - ins],
  ];
  const tankH = h - legTop;
  const fillH = tankH * (done ? 1 : pct);
  const tank = { gx: gx + 0.05, gy: gy + 0.05, w: w - 0.1, d: d - 0.1, z: legTop };
  const parts = k.map(([x, y], i) => seg(`leg${i}`, iso(x, y, 0), iso(x, y, legTop), c, 1.5));
  parts.push(seg("x1", iso(k[3][0], k[3][1], 0), iso(k[2][0], k[2][1], legTop), c, 0.8, 0.7));
  parts.push(seg("x2", iso(k[2][0], k[2][1], 0), iso(k[3][0], k[3][1], legTop), c, 0.8, 0.7));
  parts.push(seg("x3", iso(k[2][0], k[2][1], 0), iso(k[1][0], k[1][1], legTop), c, 0.8, 0.7));
  parts.push(seg("x4", iso(k[1][0], k[1][1], 0), iso(k[2][0], k[2][1], legTop), c, 0.8, 0.7));
  return (
    <g filter={done || pct > 0 ? "url(#gx-glow)" : undefined}>
      {parts}
      <Box {...tank} h={tankH} color={c} alpha={0} dash="3 3" width={1} />
      {fillH > 0.5 && <Box {...tank} h={fillH} color={c} alpha={0.42} />}
    </g>
  );
}

// Radio tower: a tapering lattice that grows upward
function RadioBody({ slot, c, pct, done, live }) {
  const { gx, gy, w, d, h } = slot;
  const cx = gx + w / 2;
  const cy = gy + d / 2;
  const f = done ? 1 : pct;
  const base = [[gx, gy], [gx + w, gy], [gx + w, gy + d], [gx, gy + d]];
  const at = ([x, y], fr) => iso(x + (cx - x) * fr * 0.92, y + (cy - y) * fr * 0.92, h * fr);
  const parts = [];
  if (f > 0) {
    base.forEach((p, i) => parts.push(seg(`e${i}`, iso(p[0], p[1], 0), at(p, f), c, 1.4)));
    [0.2, 0.4, 0.6, 0.8].forEach((fr) => {
      if (fr > f) return;
      parts.push(
        <polygon
          key={`r${fr}`}
          points={poly(base.map((p) => at(p, fr)))}
          fill="none"
          stroke={c}
          strokeWidth="0.9"
          strokeOpacity="0.8"
        />
      );
    });
  }
  const tip = iso(cx, cy, h + 26);
  return (
    <g>
      <Box gx={gx - 0.1} gy={gy - 0.1} w={w + 0.2} d={d + 0.2} h={5} color={c} alpha={f > 0 ? 0.3 : 0} dash={f > 0 ? undefined : "3 4"} width={1} />
      <g filter={done || f > 0 ? "url(#gx-glow)" : undefined}>{parts}</g>
      {done && (
        <g>
          {seg("mast", iso(cx, cy, h), tip, c, 1.4)}
          <circle cx={tip[0]} cy={tip[1]} r="2.8" fill="#f87171" className="gx-pulse" />
          <Rings at={tip} color="#67e8f9" live={live} />
        </g>
      )}
    </g>
  );
}

// tower crane while a building is going up
function Crane({ slot, live }) {
  const { gx, gy, w, h } = slot;
  const top = h + 26;
  const mastBase = iso(gx, gy, 0);
  const mastTop = iso(gx, gy, top);
  const jibEnd = iso(gx + Math.max(1.6, w * 0.9), gy, top);
  const counter = iso(gx - 0.9, gy, top);
  const hookY = jibEnd[1];
  return (
    <g style={{ pointerEvents: "none" }}>
      {seg("m", mastBase, mastTop, "#fbbf24", 1.8)}
      {seg("j", counter, jibEnd, "#fbbf24", 1.6)}
      <line x1={jibEnd[0]} y1={hookY} x2={jibEnd[0]} y2={hookY + 12} stroke="#fde68a" strokeWidth="0.9">
        {live && (
          <animate attributeName="y2" values={`${hookY + 8};${hookY + 24};${hookY + 8}`} dur="3.2s" repeatCount="indefinite" />
        )}
      </line>
      <circle cx={mastTop[0]} cy={mastTop[1] - 2} r="2.4" fill="#ef4444">
        {live && <animate attributeName="opacity" values="1;0.15;1" dur="1.1s" repeatCount="indefinite" />}
      </circle>
    </g>
  );
}

// roofs and signs that only appear once a building is finished
function Extras({ slot, live }) {
  const { gx, gy, w, d, h, type } = slot;
  const cx = gx + w / 2;
  const cy = gy + d / 2;
  if (type === "power") {
    return (
      <g>
        <Box gx={cx - 0.5} gy={cy - 0.5} w={1} d={1} z={h} h={16} color="#facc15" alpha={0.5} className="gx-pulse" />
        <Rings at={iso(cx, cy, h + 16)} color="#fde047" live={live} />
      </g>
    );
  }
  if (type === "arcade") {
    return (
      <g>
        <Box gx={gx + 0.4} gy={gy + 0.4} w={w - 0.8} d={0.5} z={h} h={12} color="#e879f9" alpha={0.55} className="gx-pulse" />
        <Box gx={gx + 0.4} gy={gy + d - 0.9} w={w - 0.8} d={0.5} z={h} h={8} color="#22d3ee" alpha={0.5} className="gx-pulse" />
      </g>
    );
  }
  if (type === "hall") {
    const pole0 = iso(cx, cy, h + 18);
    const pole1 = iso(cx, cy, h + 44);
    return (
      <g>
        <Box gx={gx + 0.7} gy={gy + 0.7} w={w - 1.4} d={d - 1.4} z={h} h={18} color="#22d3ee" alpha={0.34} />
        {seg("pole", pole0, pole1, "#e0f2fe", 1.2)}
        <polygon points={poly([pole1, iso(cx + 0.8, cy, h + 40), iso(cx, cy, h + 36)])} fill="#f97316" />
      </g>
    );
  }
  if (type === "small") {
    const t = iso(cx, cy, h + 4);
    return <circle cx={t[0]} cy={t[1]} r="2.4" fill="#a5f3fc" className="gx-pulse" />;
  }
  return null;
}

// a light beam that shoots into the sky from every finished building
function Beam({ slot }) {
  const { gx, gy, w, d, h, type } = slot;
  const [x, y] = iso(gx + w / 2, gy + d / 2, h + (EXTRA_TOP[type] || 0));
  return (
    <polygon
      points={`${x - 5},${y} ${x + 5},${y} ${x + 1.5},${y - 150} ${x - 1.5},${y - 150}`}
      fill="url(#gx-beamgrad)"
      className="gx-beam"
      style={{ pointerEvents: "none" }}
    />
  );
}

export function Structure({ slot, status, pct, live }) {
  const c = COLORS[status].line;
  const light = COLORS[status].light;
  const done = status === "done";
  const { gx, gy, w, d, h, type } = slot;
  const lit = done ? h : status === "building" ? Math.max(6, h * pct) : 0;
  const custom = type === "water" || type === "radio";

  return (
    <g>
      {!done && !custom && <Box gx={gx} gy={gy} w={w} d={d} h={h} color={c} alpha={0} dash="3 4" width={1} />}
      {type === "water" && <WaterBody slot={slot} c={c} pct={pct} done={done} />}
      {type === "radio" && <RadioBody slot={slot} c={c} pct={pct} done={done} live={live} />}
      {!custom && lit > 0 && (
        <g filter="url(#gx-glow)">
          <Box gx={gx} gy={gy} w={w} d={d} h={lit} color={c} alpha={done ? 0.34 : 0.28} />
        </g>
      )}
      {!custom && lit > 0 && (
        <Windows gx={gx} gy={gy} w={w} d={d} h={h} lit={lit} color={light} seed={gx + gy} live={live} />
      )}
      {done && !custom && <Extras slot={slot} live={live} />}
      {status === "building" && <Crane slot={slot} live={live} />}
      {done && <Beam slot={slot} />}
    </g>
  );
}
