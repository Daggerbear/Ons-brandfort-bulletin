// src/components/dash/dashUi.js
// The glass look: frosted cards with a soft glow in the business's accent colour.

export const glassStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.13)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 10px 30px -14px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
};

export const glowStyle = {
  boxShadow:
    "0 10px 30px -14px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 28px -10px var(--bz-accent)",
};

export function Glass({ children, className = "", glow = false, style, ...rest }) {
  return (
    <div
      {...rest}
      className={`rounded-2xl ${className}`}
      style={{ ...glassStyle, ...(glow ? glowStyle : null), ...style }}
    >
      {children}
    </div>
  );
}

// Big number with a soft gradient
export function BigNumber({ children }) {
  return (
    <span
      className="text-3xl font-black tabular-nums leading-none"
      style={{
        background: "linear-gradient(180deg, var(--bz-text), var(--bz-accent-text))",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }) {
  return (
    <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--bz-muted)" }}>
      {children}
    </p>
  );
}

export const dashBackground =
  "radial-gradient(900px 420px at 15% -8%, var(--bz-hero-from), transparent 62%), radial-gradient(700px 380px at 105% 35%, var(--bz-accent-soft), transparent 58%), var(--bz-bg)";
