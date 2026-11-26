// src/components/BrandfortGrid.js
"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { questEvent } from "@/lib/questEvent";
import {
  SLOTS, DISTRICTS, TEXT, MAP, MAIN_ROAD, EXTRA_TOP,
  needOf, haveOf, percentOf, statusOf, boundsOf,
} from "./grid/gridConfig";
import { iso, poly, Box, Ground, GridDefs, Traffic, Starfield, GRID_CSS } from "./grid/gridDraw";
import { Structure } from "./grid/gridStructures";
import { Hud, SideButtons, Carousel, Sheet, ProjectLabel } from "./grid/GridPanels";
import { haptic, useSound } from "./grid/gridFx";

const K_MAX = 2.6;
const kMinOf = (w, h) => Math.max(0.2, Math.min(w / 960, h / 620) * 0.85);
const homeOf = (w, h) => {
  const k = Math.max(0.6, Math.min(w / 960, h / 620) * 1.5);
  return { k, x: w / 2, y: h * 0.46 - 200 * k };
};

export default function BrandfortGrid({ lang = "af" }) {
  const L = lang === "af" ? "af" : "en";
  const t = TEXT[L];
  const router = useRouter();

  const [state, setState] = useState(null);
  const [status, setStatus] = useState("loading");
  const [selected, setSelected] = useState(null); // { type: "project" | "district" | "info", id }
  const [bb, setBB] = useState(null); // null = not signed in or not a hunter
  const [amount, setAmount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [backers, setBackers] = useState(null);
  const [tick, setTick] = useState(0);
  const [bursts, setBursts] = useState([]);
  const [banner, setBanner] = useState(null);
  const [live, setLive] = useState(true);
  const [sound, setSound] = useState(false);
  const [hintSeen, setHintSeen] = useState(true);

  const { tap, chime } = useSound(sound);

  const stage = useRef(null);
  const world = useRef(null);
  const labels = useRef(new Map());
  const cardRefs = useRef({});
  const cam = useRef({ x: 0, y: 0, k: 0.8 });
  const size = useRef({ w: 0, h: 0 });
  const flyId = useRef(0);
  const pointers = useRef(new Map());
  const gesture = useRef({ moved: false, pinch: null, start: null });
  const picked = useRef(false);
  const prev = useRef(null);
  const fxId = useRef(0);
  const celebrateRef = useRef(null);

  // ---------- camera ----------
  const applyCam = useCallback(() => {
    const { x, y, k } = cam.current;
    if (world.current) {
      world.current.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(4)})`);
    }
    labels.current.forEach(({ el, wx, wy }) => {
      el.setAttribute("transform", `translate(${(wx * k + x).toFixed(1)} ${(wy * k + y).toFixed(1)})`);
    });
  }, []);

  const clampCam = useCallback((c) => {
    const { w, h } = size.current;
    if (!w) return c;
    const k = Math.min(K_MAX, Math.max(kMinOf(w, h), c.k));
    let { x, y } = c;
    const left = MAP.x0 * k + x;
    const right = MAP.x1 * k + x;
    const topEdge = MAP.y0 * k + y;
    const bottom = MAP.y1 * k + y;
    if (right < w * 0.3) x += w * 0.3 - right;
    if (left > w * 0.7) x -= left - w * 0.7;
    if (bottom < h * 0.3) y += h * 0.3 - bottom;
    if (topEdge > h * 0.7) y -= topEdge - h * 0.7;
    return { x, y, k };
  }, []);

  const fly = useCallback(
    (to, ms = 520) => {
      const id = ++flyId.current;
      const from = { ...cam.current };
      const target = clampCam(to);
      const t0 = performance.now();
      const step = (now) => {
        if (flyId.current !== id) return;
        const p = Math.min(1, (now - t0) / ms);
        const e = 1 - Math.pow(1 - p, 3);
        cam.current = {
          x: from.x + (target.x - from.x) * e,
          y: from.y + (target.y - from.y) * e,
          k: from.k + (target.k - from.k) * e,
        };
        applyCam();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    [applyCam, clampCam]
  );

  const focusOn = useCallback(
    (wx, wy, k, yFrac = 0.3) => {
      const { w, h } = size.current;
      fly({ x: w / 2 - wx * k, y: h * yFrac - wy * k, k });
    },
    [fly]
  );

  const zoomBy = (f) => {
    const { w, h } = size.current;
    const c = cam.current;
    const k = Math.min(K_MAX, Math.max(kMinOf(w, h), c.k * f));
    const px = w / 2;
    const py = h * 0.45;
    fly({ x: px - (px - c.x) * (k / c.k), y: py - (py - c.y) * (k / c.k), k }, 240);
  };

  const goHome = () => {
    const { w, h } = size.current;
    fly(homeOf(w, h));
  };

  // measure the stage and place the camera the first time
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      const h = e.contentRect.height;
      const first = size.current.w === 0;
      size.current = { w, h };
      cam.current = first && w ? clampCam(homeOf(w, h)) : clampCam(cam.current);
      applyCam();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [status, applyCam, clampCam]);

  // keep label positions correct after every render
  useLayoutEffect(() => {
    applyCam();
  });

  // ---------- gestures: drag, pinch, wheel ----------
  const startPinch = () => {
    const pts = [...pointers.current.values()];
    if (pts.length < 2) return;
    const [a, b] = pts;
    const rect = stage.current.getBoundingClientRect();
    const mx = (a.x + b.x) / 2 - rect.left;
    const my = (a.y + b.y) / 2 - rect.top;
    const c = cam.current;
    gesture.current.pinch = {
      dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      k: c.k,
      wx: (mx - c.x) / c.k,
      wy: (my - c.y) / c.k,
    };
  };

  const onDown = (e) => {
    flyId.current++; // a touch cancels any camera flight
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 1) {
      g.moved = false;
      g.pinch = null;
      g.start = { x: e.clientX, y: e.clientY };
    } else if (pointers.current.size === 2) {
      g.moved = true;
      try {
        stage.current.setPointerCapture(e.pointerId);
      } catch {}
      startPinch();
    }
  };

  const onMove = (e) => {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    const g = gesture.current;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;

    if (pointers.current.size >= 2 && g.pinch) {
      const [a, b] = [...pointers.current.values()];
      const rect = stage.current.getBoundingClientRect();
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mx = (a.x + b.x) / 2 - rect.left;
      const my = (a.y + b.y) / 2 - rect.top;
      const k = g.pinch.k * (dist / g.pinch.dist);
      cam.current = clampCam({ k, x: mx - g.pinch.wx * k, y: my - g.pinch.wy * k });
      applyCam();
      return;
    }

    if (!g.moved && g.start && Math.hypot(e.clientX - g.start.x, e.clientY - g.start.y) > 7) {
      g.moved = true;
      try {
        stage.current.setPointerCapture(e.pointerId);
      } catch {}
    }
    if (g.moved) {
      cam.current = clampCam({ ...cam.current, x: cam.current.x + dx, y: cam.current.y + dy });
      applyCam();
    }
  };

  const onUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.pinch = null;
  };

  const onWheel = (e) => {
    const rect = stage.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const c = cam.current;
    const { w, h } = size.current;
    const k = Math.min(K_MAX, Math.max(kMinOf(w, h), c.k * (e.deltaY < 0 ? 1.12 : 0.89)));
    cam.current = clampCam({ k, x: px - (px - c.x) * (k / c.k), y: py - (py - c.y) * (k / c.k) });
    applyCam();
  };

  // ---------- data ----------
  const loadBB = useCallback(async () => {
    const { data, error } = await supabase.from("hunter_inventory").select("item, qty");
    if (error) return;
    const row = (data || []).find((r) => r.item === "bb");
    setBB(row ? row.qty : 0);
  }, []);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("town_state");
    if (error || !data) {
      setStatus((s) => (s === "ready" ? s : "failed"));
      return;
    }
    const projs = data.projects || [];
    const next = {};
    projs.forEach((p) => {
      next[p.key] = statusOf(p);
    });
    if (prev.current) {
      projs.forEach((p, i) => {
        if (next[p.key] === "done" && prev.current[p.key] && prev.current[p.key] !== "done") {
          if (celebrateRef.current) celebrateRef.current(p, i);
        }
      });
    }
    prev.current = next;
    setState(data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
    loadBB();
    questEvent("town_visit");
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        load();
        loadBB();
      }
    }, 20000);
    return () => clearInterval(id);
  }, [load, loadBB]);

  // saved preferences + reduced motion
  useEffect(() => {
    try {
      setSound(localStorage.getItem("bgSound") === "1");
      setHintSeen(localStorage.getItem("bgHint") === "1");
    } catch {
      setHintSeen(false);
    }
    const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (mq) setLive(!mq.matches);
  }, []);

  const pickedKey = selected?.type === "project" ? selected.id : null;
  useEffect(() => {
    if (!pickedKey) {
      setBackers(null);
      return;
    }
    let active = true;
    supabase.rpc("town_project_backers", { p_key: pickedKey }).then(({ data, error }) => {
      if (active) setBackers(error ? [] : data || []);
    });
    return () => {
      active = false;
    };
  }, [pickedKey, tick]);

  // scroll the carousel to the selected card
  useEffect(() => {
    if (!selected || selected.type === "info") return;
    const el = cardRefs.current[selected.id];
    if (el && el.scrollIntoView) el.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selected]);

  // ---------- derived values ----------
  const projects = state?.projects || [];
  const shown = projects.slice(0, SLOTS.length);
  const pickedProject = selected?.type === "project" ? projects.find((p) => p.key === selected.id) : null;
  const pickedIndex = pickedProject ? projects.indexOf(pickedProject) : -1;
  const pickedDistrict = selected?.type === "district" ? DISTRICTS.find((d) => d.id === selected.id) : null;

  const invested = shown.reduce((sum, p) => sum + haveOf(p), 0);
  const totalNeed = shown.reduce((sum, p) => sum + needOf(p), 0);
  const totalDone = shown.reduce((sum, p) => sum + (p.status === "done" ? needOf(p) : haveOf(p)), 0);
  const townPct = totalNeed ? Math.round((totalDone / totalNeed) * 100) : 0;
  const townLevel = 1 + shown.filter((p) => p.status === "done").length;

  const remaining = pickedProject ? Math.max(0, needOf(pickedProject) - haveOf(pickedProject)) : 0;
  const maxSpend = Math.max(0, Math.min(bb ?? 0, remaining));
  const spendAmount = Math.max(0, Math.min(amount, maxSpend));

  // ---------- effects: bursts, celebration ----------
  const burst = (slot, color, n = 16, text) => {
    if (!slot) return;
    const [x, y] = iso(slot.gx + slot.w / 2, slot.gy + slot.d / 2, slot.h * 0.6);
    const id = ++fxId.current;
    const parts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const r = 30 + Math.random() * 50;
      return {
        dx: Math.cos(a) * r,
        dy: Math.sin(a) * r * 0.7 - 20,
        s: 1.6 + Math.random() * 2.2,
        delay: Math.random() * 0.12,
      };
    });
    setBursts((b) => [...b, { id, x, y, color, parts, text }]);
    setTimeout(() => setBursts((b) => b.filter((f) => f.id !== id)), 1700);
  };

  const celebrate = (p, i) => {
    const name = (L === "af" ? p.name_af : p.name_en) || p.name_en;
    const id = ++fxId.current;
    setBanner({ id, icon: p.icon, text: t.complete.replace("{name}", name) });
    burst(SLOTS[i], "#22d3ee", 28);
    haptic([30, 40, 30, 40, 90]);
    chime();
    setTimeout(() => setBanner((b) => (b && b.id === id ? null : b)), 3900);
  };
  celebrateRef.current = celebrate;

  // ---------- selecting ----------
  const select = (sel) => {
    setSelected(sel);
    setMsg(null);
    tap();
    haptic(8);
    try {
      localStorage.setItem("bgHint", "1");
    } catch {}
    setHintSeen(true);
    let target = null;
    if (sel.type === "project") {
      const s = SLOTS[projects.findIndex((p) => p.key === sel.id)];
      if (s) target = iso(s.gx + s.w / 2, s.gy + s.d / 2, s.h * 0.4);
    } else if (sel.type === "district") {
      const d = DISTRICTS.find((x) => x.id === sel.id);
      if (d) {
        const b = boundsOf(d);
        target = iso((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.hMax * 0.4);
      }
    }
    if (target) focusOn(target[0], target[1], Math.max(cam.current.k, 1.05), 0.3);
  };

  const pickFromMap = (sel) => {
    if (gesture.current.moved) return;
    picked.current = true;
    select(sel);
  };

  const onStageClick = () => {
    if (gesture.current.moved) return;
    if (picked.current) {
      picked.current = false;
      return;
    }
    setSelected(null);
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem("bgSound", next ? "1" : "0");
    } catch {}
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/profile/hunter");
  };

  // ---------- spending ----------
  const spend = async () => {
    if (!pickedProject || spendAmount <= 0 || busy) return;
    const amountNow = spendAmount;
    const slot = SLOTS[pickedIndex];
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.rpc("town_spend", {
      p_key: pickedProject.key,
      p_amount: amountNow,
    });
    setBusy(false);
    if (error) {
      const m = error.message || "";
      setMsg({
        ok: false,
        text: m.includes("not_enough") ? t.notEnough : m.includes("full") ? t.full : t.errorSpend,
      });
      haptic(60);
    } else {
      setMsg({ ok: true, text: t.spent });
      burst(slot, "#facc15", 18, `+${amountNow} BB`);
      haptic([20, 30, 20]);
      chime();
    }
    load();
    loadBB();
    setTick((n) => n + 1);
  };

  // ---------- loading and error screens ----------
  const shell = "gx-root fixed inset-0 z-[70] overflow-hidden text-white";
  const sky = { background: "radial-gradient(ellipse at 50% 38%, #0b2a4a 0%, #050d1c 45%, #02040a 100%)" };

  if (status === "loading") {
    return (
      <div className={shell} style={sky}>
        <style>{GRID_CSS}</style>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <div className="gx-bar h-1.5 w-40 rounded-full" />
          <p className="text-sm font-semibold tracking-wide text-cyan-300">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={shell} style={sky}>
        <style>{GRID_CSS}</style>
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <p role="alert" className="text-sm text-red-200">{t.failed}</p>
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              load();
            }}
            className="rounded-full border border-cyan-400 px-6 py-2 text-sm text-cyan-200"
          >
            {t.retry}
          </button>
          <button type="button" onClick={goBack} className="text-xs text-cyan-100/60 underline">
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  // ---------- scene ----------
  const projectItems = shown.map((p, i) => ({
    kind: "project",
    p,
    slot: SLOTS[i],
    depth: SLOTS[i].gx + SLOTS[i].gy + SLOTS[i].w + SLOTS[i].d,
  }));
  const districtItems = DISTRICTS.flatMap((dist) =>
    dist.blocks.map((block, bi) => ({
      kind: "district",
      dist,
      block,
      key: `${dist.id}-${bi}`,
      depth: block[0] + block[1] + block[2] + block[3],
    }))
  );
  const items = [...projectItems, ...districtItems, { kind: "beacon", depth: MAIN_ROAD * 2 + 2 }].sort(
    (a, b) => a.depth - b.depth
  );

  const hintKey = hintSeen ? null : (shown.find((p) => p.status !== "done") || {}).key;

  const regLabel = (key, wx, wy) => (el) => {
    if (el) labels.current.set(key, { el, wx, wy });
    else labels.current.delete(key);
  };

  const cards = [
    ...shown.map((p) => ({
      id: p.key,
      type: "project",
      icon: p.icon,
      name: (L === "af" ? p.name_af : p.name_en) || p.name_en,
      pct: percentOf(p),
      status: statusOf(p),
    })),
    ...DISTRICTS.filter((d) => d.id !== "homesB").map((d) => ({
      id: d.id,
      type: "district",
      icon: "🔒",
      name: d.name[L],
      color: d.color,
    })),
  ];

  const sheetMode = selected ? (pickedProject ? "project" : pickedDistrict ? "district" : selected.type === "info" ? "info" : null) : null;

  return (
    <div className={shell} style={sky}>
      <style>{GRID_CSS}</style>
      <Starfield />

      <div
        ref={stage}
        className="absolute inset-0"
        style={{ touchAction: "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
        onClick={onStageClick}
      >
        <svg width="100%" height="100%" style={{ display: "block" }} role="img" aria-label="Brandfort Grid">
          <GridDefs />
          <g ref={world}>
            <Ground live={live} />
            {live && <Traffic />}
            {items.map((it) => {
              if (it.kind === "beacon") {
                return (
                  <g key="beacon" filter="url(#gx-glow)">
                    <Box gx={MAIN_ROAD} gy={MAIN_ROAD} w={1} d={1} h={26} color="#22d3ee" alpha={0.35} className="gx-pulse" />
                  </g>
                );
              }
              if (it.kind === "project") {
                const { p, slot } = it;
                const sel = selected?.type === "project" && selected.id === p.key;
                const footprint = poly([
                  iso(slot.gx, slot.gy),
                  iso(slot.gx + slot.w, slot.gy),
                  iso(slot.gx + slot.w, slot.gy + slot.d),
                  iso(slot.gx, slot.gy + slot.d),
                ]);
                return (
                  <g key={p.key} onClick={() => pickFromMap({ type: "project", id: p.key })} style={{ cursor: "pointer" }}>
                    <polygon points={footprint} fill="rgba(0,0,0,0.001)" />
                    {sel && (
                      <polygon
                        points={footprint}
                        fill="rgba(255,255,255,0.06)"
                        stroke="#fff"
                        strokeWidth="1.6"
                        strokeDasharray="5 4"
                        className="gx-march"
                      />
                    )}
                    <Structure slot={slot} status={statusOf(p)} pct={percentOf(p)} live={live} />
                  </g>
                );
              }
              const sel = selected?.type === "district" && selected.id === it.dist.id;
              const [gx, gy, w, d, h] = it.block;
              return (
                <g key={it.key} onClick={() => pickFromMap({ type: "district", id: it.dist.id })} style={{ cursor: "pointer" }}>
                  <Box
                    gx={gx}
                    gy={gy}
                    w={w}
                    d={d}
                    h={h}
                    color={it.dist.color}
                    alpha={sel ? 0.26 : 0.1}
                    dash="2 3"
                    width={sel ? 1.5 : 0.9}
                  />
                </g>
              );
            })}

            {bursts.map((b) => (
              <g key={b.id} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`} style={{ pointerEvents: "none" }}>
                {b.parts.map((pt, i) => (
                  <circle
                    key={i}
                    r={pt.s}
                    fill={b.color}
                    className="gx-burst"
                    style={{ "--dx": `${pt.dx}px`, "--dy": `${pt.dy}px`, animationDelay: `${pt.delay}s` }}
                  />
                ))}
                {b.text && (
                  <text
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="900"
                    fill="#fde68a"
                    stroke="#000"
                    strokeWidth="3"
                    paintOrder="stroke"
                    className="gx-rise"
                  >
                    {b.text}
                  </text>
                )}
              </g>
            ))}
          </g>

          {/* name tags: kept in screen space so they stay readable at any zoom */}
          <g style={{ pointerEvents: "none" }}>
            {projectItems.map(({ p, slot }) => {
              const [wx, wy] = iso(slot.gx + slot.w / 2, slot.gy + slot.d / 2, slot.h + (EXTRA_TOP[slot.type] || 0) + 14);
              return (
                <g key={`lab-${p.key}`} ref={regLabel(`p-${p.key}`, wx, wy)}>
                  <ProjectLabel
                    name={(L === "af" ? p.name_af : p.name_en) || p.name_en}
                    icon={p.icon}
                    pct={percentOf(p)}
                    status={statusOf(p)}
                    selected={selected?.type === "project" && selected.id === p.key}
                    hint={hintKey === p.key}
                    hintText={t.tapHint}
                  />
                </g>
              );
            })}
            {DISTRICTS.filter((d) => d.id !== "homesB").map((d) => {
              const b = boundsOf(d);
              const [wx, wy] = iso((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.hMax + 12);
              return (
                <g key={`lab-${d.id}`} ref={regLabel(`d-${d.id}`, wx, wy)}>
                  <text
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="800"
                    fill={d.color}
                    fillOpacity="0.9"
                    stroke="#000"
                    strokeWidth="2.5"
                    paintOrder="stroke"
                  >
                    🔒 {d.name[L]}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%)" }}
      />

      <Hud
        t={t}
        bb={bb}
        townPct={townPct}
        townLevel={townLevel}
        hunters={state?.hunters ?? 0}
        invested={invested}
        onBack={goBack}
      />

      <SideButtons
        t={t}
        sound={sound}
        onZoomIn={() => zoomBy(1.35)}
        onZoomOut={() => zoomBy(1 / 1.35)}
        onHome={goHome}
        onSound={toggleSound}
        onInfo={() => select({ type: "info", id: "info" })}
      />

      {banner && (
        <div
          key={banner.id}
          className="gx-banner gx-panel pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap px-5 py-3 text-center"
          style={{ top: "calc(max(env(safe-area-inset-top), 8px) + 96px)", borderColor: "#facc15", boxShadow: "0 0 30px rgba(250,204,21,.45)" }}
        >
          <p className="text-sm font-black text-yellow-200">{banner.icon} {banner.text}</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col">
        <Sheet
          key={selected ? `${selected.type}-${selected.id}` : "none"}
          t={t}
          L={L}
          mode={sheetMode}
          project={pickedProject}
          district={pickedDistrict}
          status={pickedProject ? statusOf(pickedProject) : "queued"}
          pct={pickedProject ? percentOf(pickedProject) : 0}
          bb={bb}
          amount={amount}
          setAmount={setAmount}
          maxSpend={maxSpend}
          spendAmount={spendAmount}
          busy={busy}
          msg={msg}
          backers={backers}
          top={state?.top}
          onSpend={spend}
          onClose={() => setSelected(null)}
        />
        <Carousel cards={cards} selectedId={selected?.id} onPick={select} refs={cardRefs} t={t} />
      </div>
    </div>
  );
}