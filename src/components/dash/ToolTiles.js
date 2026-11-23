// src/components/dash/ToolTiles.js
// The tools as glowing tiles. Free, paid and coming-soon are clearly different.
import Link from "next/link";
import { Glass, SectionLabel } from "./dashUi";

function Tile({ tool, badge, onPick }) {
  const soon = tool.state === "soon";
  const locked = tool.state === "locked";
  const inner = (
    <Glass
      glow={tool.state === "open"}
      className={`flex flex-col items-center gap-2 px-2 py-4 text-center ${soon ? "opacity-50" : ""}`}
      style={locked ? { borderStyle: "dashed" } : undefined}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
        style={{
          background: "var(--bz-accent-soft)",
          border: `1.5px solid ${locked || soon ? "var(--bz-border)" : "var(--bz-accent)"}`,
          boxShadow: tool.state === "open" ? "0 0 18px -2px var(--bz-accent)" : "none",
          filter: locked ? "grayscale(0.7)" : "none",
        }}
      >
        {tool.icon}
      </span>
      <span className="text-sm font-semibold leading-tight">{tool.label}</span>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide"
        style={
          tool.tier === "free" && !soon
            ? { background: "rgba(34,197,94,0.2)", color: "#86efac" }
            : soon
              ? { background: "rgba(255,255,255,0.08)", color: "var(--bz-muted)" }
              : locked
                ? { background: "rgba(255,255,255,0.08)", color: "var(--bz-muted)" }
                : { background: "var(--bz-accent-soft)", color: "var(--bz-accent-text)" }
        }
      >
        {locked ? "🔒 " : ""}
        {badge}
      </span>
    </Glass>
  );

  if (soon) return <div>{inner}</div>;
  if (tool.state === "open" && tool.href) {
    return (
      <Link href={tool.href} className="block transition hover:opacity-90">
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => onPick(tool)} className="block w-full transition hover:opacity-90">
      {inner}
    </button>
  );
}

export default function ToolTiles({ tools, d, t, onPick }) {
  const badgeFor = (tool) => (tool.state === "soon" ? d.soon : tool.tier === "free" ? t.freeBadge : t.paidBadge);
  // Free tools in one row, paid tools in the next (anything "coming soon" stays with its tier)
  const rows = [
    { key: "free", label: t.freeBadge, items: tools.filter((x) => x.tier === "free") },
    { key: "paid", label: t.paidBadge, items: tools.filter((x) => x.tier !== "free") },
  ].filter((r) => r.items.length > 0);
  return (
    <div>
      <SectionLabel>{d.toolsTitle}</SectionLabel>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.key}>
            <p className="mb-2 text-[11px] font-extrabold tracking-widest" style={{ color: "var(--bz-muted)" }}>
              {row.label}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {row.items.map((tool) => (
                <Tile key={tool.key} tool={tool} badge={badgeFor(tool)} onPick={onPick} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
