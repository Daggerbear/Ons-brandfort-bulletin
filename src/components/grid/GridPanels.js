// src/components/grid/GridPanels.js
"use client";
import { COLORS, QUICK, needOf, haveOf } from "./gridConfig";

const TOP_PAD = "max(env(safe-area-inset-top), 8px)";

// ---------- top bar: back, town progress, wallet ----------
export function Hud({ t, bb, townPct, townLevel, hunters, invested, onBack }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20" style={{ paddingTop: TOP_PAD }}>
      <div className="flex items-start gap-2 px-3">
        <button type="button" aria-label={t.back} onClick={onBack} className="gx-btn pointer-events-auto flex-shrink-0">
          ←
        </button>
        <div className="gx-panel min-w-0 flex-1 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-black tracking-[0.22em] text-cyan-300">BRANDFORT GRID</p>
            <span className="flex-shrink-0 rounded-full border border-amber-300/50 bg-amber-300/10 px-2 text-[9px] font-bold tracking-widest text-amber-200">
              {t.conceptTag}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded bg-cyan-400 px-1.5 text-[10px] font-black text-black">
              {t.level} {townLevel}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-cyan-950" aria-label={t.townProgress}>
              <div className="gx-bar h-full rounded-full" style={{ width: `${townPct}%` }} />
            </div>
            <span className="text-[10px] font-bold tabular-nums text-cyan-200">{townPct}%</span>
          </div>
        </div>
        <div className="gx-panel flex-shrink-0 px-3 py-2 text-right" style={{ borderColor: "rgba(250,204,21,.5)" }}>
          <p className="text-base font-black leading-none tabular-nums text-yellow-300">
            🪙 {bb === null ? "–" : bb}
          </p>
          <p className="mt-0.5 text-[9px] font-bold tracking-widest text-yellow-200/70">BB</p>
        </div>
      </div>
      <div className="mt-1.5 flex gap-3 px-4 text-[10px] font-semibold text-cyan-100/70">
        <span>🎯 {hunters} {t.hunters}</span>
        <span>🏗️ {invested} BB {t.invested.toLowerCase()}</span>
      </div>
    </div>
  );
}

// ---------- right-hand control stack ----------
export function SideButtons({ t, sound, onZoomIn, onZoomOut, onHome, onSound, onInfo }) {
  return (
    <div
      className="absolute right-3 z-20 flex flex-col gap-2"
      style={{ top: `calc(${TOP_PAD} + 84px)` }}
    >
      <button type="button" aria-label={t.zoomIn} onClick={onZoomIn} className="gx-btn">+</button>
      <button type="button" aria-label={t.zoomOut} onClick={onZoomOut} className="gx-btn">−</button>
      <button type="button" aria-label={t.home} onClick={onHome} className="gx-btn">⌖</button>
      <button type="button" aria-label={sound ? t.soundOff : t.soundOn} onClick={onSound} className="gx-btn">
        {sound ? "🔊" : "🔇"}
      </button>
      <button type="button" aria-label={t.info} onClick={onInfo} className="gx-btn">ⓘ</button>
    </div>
  );
}

// ---------- bottom building picker ----------
export function Carousel({ cards, selectedId, onPick, refs, t }) {
  return (
    <div
      className="gx-noscroll pointer-events-auto flex snap-x gap-2 overflow-x-auto px-3 pt-1"
      style={{
        touchAction: "pan-x",
        overscrollBehaviorX: "contain",
        paddingBottom: "max(env(safe-area-inset-bottom), 10px)",
      }}
    >
      {cards.map((c) => {
        const color = c.type === "district" ? c.color : COLORS[c.status].line;
        const sel = selectedId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            ref={(el) => {
              if (el) refs.current[c.id] = el;
            }}
            onClick={() => onPick({ type: c.type, id: c.id })}
            className="gx-panel w-[136px] flex-shrink-0 snap-center p-2.5 text-left"
            style={{
              borderColor: sel ? "#fff" : `${color}88`,
              opacity: c.type === "district" ? 0.8 : 1,
              boxShadow: sel ? `0 0 18px ${color}88` : undefined,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{c.icon}</span>
              <span className="truncate text-[11px] font-bold text-white">{c.name}</span>
            </div>
            {c.type === "district" ? (
              <p className="mt-2 text-[10px] font-semibold" style={{ color }}>
                {t.soon}
              </p>
            ) : (
              <>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cyan-950">
                  <div className="h-full rounded-full" style={{ width: `${Math.round(c.pct * 100)}%`, background: color }} />
                </div>
                <p className="mt-1 text-[10px] font-semibold" style={{ color }}>
                  {c.status === "done" ? `✓ ${t.done}` : `${Math.round(c.pct * 100)}%`}
                </p>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------- the little name tag that floats over each building ----------
export function ProjectLabel({ name, icon, pct, status, selected, hint, hintText }) {
  const c = COLORS[status].line;
  const label = name.length > 20 ? `${name.slice(0, 19)}…` : name;
  const w = Math.max(74, 30 + label.length * 6.3);
  const bar = w * 0.64;
  return (
    <>
      {hint && (
        <g className="gx-bounce">
          <text
            y={-48}
            textAnchor="middle"
            fontSize="10"
            fontWeight="900"
            fill="#fde68a"
            stroke="#000"
            strokeWidth="3"
            paintOrder="stroke"
          >
            {hintText} ▾
          </text>
        </g>
      )}
      <rect
        x={-w / 2}
        y={-40}
        width={w}
        height={22}
        rx={11}
        fill="rgba(2,10,24,.86)"
        stroke={selected ? "#fff" : c}
        strokeWidth={selected ? 1.8 : 1.2}
      />
      <text y={-25} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        {icon} {label}
      </text>
      {status === "done" ? (
        <text y={-6} textAnchor="middle" fontSize="11" fontWeight="900" fill={c}>
          ✓
        </text>
      ) : (
        <>
          <rect x={-bar / 2} y={-14} width={bar} height={4} rx={2} fill="rgba(8,47,73,.9)" />
          <rect x={-bar / 2} y={-14} width={Math.max(0, bar * pct)} height={4} rx={2} fill={c} />
        </>
      )}
    </>
  );
}

// ---------- bottom sheet: building details, district details, how it works ----------
export function Sheet({
  t, L, mode, project, district, status, pct, bb, amount, setAmount, maxSpend, spendAmount,
  busy, msg, backers, top, onSpend, onClose,
}) {
  if (!mode) return null;
  const color = project ? COLORS[status].line : district ? district.color : "#22d3ee";
  const name = project
    ? (L === "af" ? project.name_af : project.name_en) || project.name_en
    : district
    ? district.name[L]
    : t.howTitle;
  const icon = project ? project.icon : district ? "🔒" : "ℹ️";
  const need = project ? needOf(project) : 0;
  const have = project ? haveOf(project) : 0;
  const isDone = !!project && project.status === "done";
  const step = (n) => setAmount(Math.max(1, Math.min(maxSpend, spendAmount + n)));

  return (
    <div
      className="gx-panel gx-slide pointer-events-auto mx-2 mb-2 max-h-[52dvh] overflow-y-auto p-4"
      style={{ borderColor: `${color}99`, boxShadow: `0 0 26px ${color}33` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{ background: `${color}22`, border: `1px solid ${color}88` }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black text-white">{name}</p>
          <p className="text-xs font-bold" style={{ color }}>
            {project ? `${t[status]} · ${Math.round(pct * 100)}%` : district ? `🔒 ${t.soon}` : t.conceptTag}
          </p>
        </div>
        <button
          type="button"
          aria-label={t.close}
          onClick={onClose}
          className="gx-btn flex-shrink-0"
          style={{ width: 36, height: 36, fontSize: 15 }}
        >
          ✕
        </button>
      </div>

      {project && (
        <>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-cyan-950">
            <div className="gx-bar h-full rounded-full" style={{ width: `${Math.round(pct * 100)}%`, background: undefined }} />
          </div>
          <div className="mt-1.5 flex justify-between text-xs tabular-nums text-cyan-100/70">
            <span>{t.funded}: {have} / {need} BB</span>
            {!isDone && <span>{t.needed}: {Math.max(0, need - have)} BB</span>}
          </div>

          <div className="mt-3 rounded-lg border border-yellow-300/25 bg-yellow-300/5 p-3">
            <p className="text-[11px] font-bold tracking-[0.2em] text-yellow-300">
              ★ {isDone ? t.founders : t.backers}
            </p>
            {backers && backers.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {backers.slice(0, 8).map((b) => (
                  <li key={b.gamer_name} className="flex justify-between text-xs">
                    <span className="text-neutral-200">{b.gamer_name}</span>
                    <span className="tabular-nums text-yellow-200">{b.total} BB</span>
                  </li>
                ))}
                {backers.length > 8 && <li className="text-[11px] text-neutral-500">+{backers.length - 8}</li>}
              </ul>
            ) : (
              !isDone && <p className="mt-2 text-xs text-yellow-100/80">{t.firstFounder}</p>
            )}
            {!isDone && <p className="mt-2 text-[10px] leading-snug text-neutral-500">{t.founderNote}</p>}
          </div>

          {isDone ? (
            <p className="mt-3 text-xs text-green-400">{t.done2}</p>
          ) : bb === null ? (
            <p className="mt-3 text-xs text-cyan-100/70">
              {t.signIn}{" "}
              <a href="/profile/hunter" className="text-cyan-300 underline">{t.becomeHunter}</a>
            </p>
          ) : bb <= 0 ? (
            <p className="mt-3 text-xs text-cyan-100/70">{t.noBB}</p>
          ) : need - have <= 0 ? (
            <p className="mt-3 text-xs text-cyan-100/70">{t.full}</p>
          ) : (
            <div className="mt-3 border-t border-cyan-400/20 pt-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-300">{t.spend.toUpperCase()}</p>
                <p className="text-[11px] text-cyan-100/60">
                  {t.balance}: <span className="font-bold text-cyan-200">{bb} BB</span>
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={() => step(-5)} className="gx-btn flex-shrink-0">−</button>
                <p className="flex-1 text-center text-3xl font-black tabular-nums text-white">
                  {spendAmount}
                  <span className="text-sm text-cyan-300"> BB</span>
                </p>
                <button type="button" onClick={() => step(5)} className="gx-btn flex-shrink-0">+</button>
              </div>
              <div className="mt-2 flex gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`flex-1 rounded-full border py-1.5 text-xs font-bold ${
                      amount === q ? "border-cyan-300 bg-cyan-400/20 text-cyan-200" : "border-cyan-400/30 text-cyan-300"
                    }`}
                  >
                    {q}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(maxSpend)}
                  className="flex-1 rounded-full border border-cyan-400/30 py-1.5 text-xs font-bold text-cyan-300"
                >
                  {t.max} ({maxSpend})
                </button>
              </div>
              <button
                type="button"
                disabled={busy || spendAmount <= 0}
                onClick={onSpend}
                className="gx-cta mt-3 w-full rounded-full py-3 text-sm font-black text-black disabled:opacity-40"
              >
                {t.buildBtn.replace("{n}", spendAmount)}
              </button>
            </div>
          )}

          {msg && (
            <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-xs ${msg.ok ? "text-green-400" : "text-red-300"}`}>
              {msg.text}
            </p>
          )}
          <p className="mt-3 text-[10px] leading-snug text-neutral-500">{t.concept}</p>
        </>
      )}

      {district && <p className="mt-3 text-sm text-cyan-100/80">{district.blurb[L]}</p>}

      {mode === "info" && (
        <>
          <ol className="mt-3 space-y-2">
            {t.how.map((line, i) => (
              <li key={i} className="flex gap-3 text-sm text-cyan-100/85">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-black">
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          {bb === null && (
            <a href="/profile/hunter" className="gx-cta mt-4 block rounded-full py-2.5 text-center text-sm font-black text-black">
              {t.becomeHunter}
            </a>
          )}
          {top && top.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-300">{t.top.toUpperCase()}</p>
              <ol className="mt-2 space-y-1">
                {top.map((h, i) => (
                  <li key={h.gamer_name} className="flex justify-between text-sm">
                    <span className="text-neutral-200">{i + 1}. {h.gamer_name}</span>
                    <span className="tabular-nums text-cyan-300">{h.total} BB</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <p className="mt-4 text-[10px] leading-snug text-neutral-500">{t.concept}</p>
        </>
      )}
    </div>
  );
}
