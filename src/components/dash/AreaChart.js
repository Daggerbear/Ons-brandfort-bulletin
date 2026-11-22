// src/components/dash/AreaChart.js
// A small smooth area chart in the accent colour. No chart library needed.

function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export default function AreaChart({ series, emptyText }) {
  const W = 300;
  const H = 120;
  const padX = 6;
  const top = 10;
  const bottom = 18;
  const max = Math.max(1, ...series.map((s) => s.y));
  const total = series.reduce((n, s) => n + s.y, 0);

  if (series.length === 0 || total === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-center text-sm" style={{ color: "var(--bz-muted)" }}>
        {emptyText}
      </div>
    );
  }

  const stepX = (W - padX * 2) / Math.max(1, series.length - 1);
  const pts = series.map((s, i) => [padX + i * stepX, top + (1 - s.y / max) * (H - top - bottom)]);
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1][0]} ${H - bottom} L ${pts[0][0]} ${H - bottom} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="chart">
      <defs>
        <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--bz-accent)", stopOpacity: 0.55 }} />
          <stop offset="100%" style={{ stopColor: "var(--bz-accent)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={padX}
          x2={W - padX}
          y1={top + f * (H - top - bottom)}
          y2={top + f * (H - top - bottom)}
          style={{ stroke: "rgba(255,255,255,0.07)", strokeWidth: 1 }}
        />
      ))}
      <path d={area} fill="url(#dashArea)" />
      <path d={line} style={{ fill: "none", stroke: "var(--bz-accent)", strokeWidth: 2.2, strokeLinecap: "round" }} />
      <circle cx={last[0]} cy={last[1]} r="4" style={{ fill: "var(--bz-accent)" }} />
      <circle cx={last[0]} cy={last[1]} r="8" style={{ fill: "var(--bz-accent)", opacity: 0.25 }} />
      <text x={padX} y={H - 4} style={{ fill: "var(--bz-muted)", fontSize: 9 }}>
        {series[0].x}
      </text>
      <text x={W - padX} y={H - 4} textAnchor="end" style={{ fill: "var(--bz-muted)", fontSize: 9 }}>
        {series[series.length - 1].x}
      </text>
      <text x={W - padX} y={top - 1} textAnchor="end" style={{ fill: "var(--bz-muted)", fontSize: 9 }}>
        {max}
      </text>
    </svg>
  );
}
