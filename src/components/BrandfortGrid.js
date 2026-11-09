// src/components/BrandfortGrid.js
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { questEvent } from "@/lib/questEvent";

// ---------- map size ----------
const TW = 44; // tile width on screen
const TH = 22; // tile height on screen
const N = 20; // the town is N x N tiles
const ROADS = [5, 10, 15]; // roads run along these rows and columns
const MAIN_ROAD = 10;

// ---------- the buildings the community funds with BB (in build-queue order) ----------
const SLOTS = [
  { gx: 16, gy: 1, w: 3, d: 3, h: 56 }, // Power Grid
  { gx: 2, gy: 2, w: 2, d: 2, h: 96 }, // Water Tower
  { gx: 17, gy: 17, w: 2, d: 2, h: 120 }, // Radio Tower
  { gx: 6, gy: 6, w: 3, d: 3, h: 44 }, // Glitch Cafe Arcade
  { gx: 11, gy: 11, w: 4, d: 3, h: 70 }, // Town Hall
  { gx: 6, gy: 16, w: 2, d: 2, h: 36 },
  { gx: 11, gy: 17, w: 2, d: 2, h: 36 },
  { gx: 1, gy: 17, w: 2, d: 2, h: 36 },
];

// ---------- future districts: drawn now so the scale of the plan is visible ----------
const DISTRICTS = [
  {
    id: "food",
    color: "#fb923c",
    name: { af: "Eetplek", en: "Food Court" },
    blurb: {
      af: "Restaurante, wegneemetes, bakkerye, kafees en spyskaarte.",
      en: "Restaurants, takeaways, bakeries, cafes and menus.",
    },
    blocks: [[1, 11, 2, 2, 20], [3, 11, 1, 2, 30], [1, 13, 1, 2, 26], [2, 13, 2, 1, 16], [2, 14, 2, 1, 22]],
  },
  {
    id: "auto",
    color: "#a78bfa",
    name: { af: "Motordistrik", en: "Automotive District" },
    blurb: {
      af: "Werkswinkels, bandewinkels, onderdele en voertuigdienste.",
      en: "Mechanics, panel beaters, tyres, parts and vehicle services.",
    },
    blocks: [[6, 11, 3, 1, 18], [6, 12, 1, 2, 26], [8, 12, 1, 2, 22], [7, 13, 1, 1, 12], [6, 14, 3, 1, 20]],
  },
  {
    id: "retail",
    color: "#f472b6",
    name: { af: "Kleinhandelsdistrik", en: "Retail District" },
    blurb: {
      af: "Klere, algemene handelaars, elektronika en plaaslike winkels.",
      en: "Clothing, general dealers, electronics and local retailers.",
    },
    blocks: [[16, 6, 2, 2, 24], [18, 6, 1, 3, 32], [16, 8, 2, 1, 16], [17, 9, 2, 1, 20], [19, 6, 1, 1, 12]],
  },
  {
    id: "services",
    color: "#2dd4bf",
    name: { af: "Diensdistrik", en: "Services District" },
    blurb: {
      af: "Rekenmeesters, kontrakteurs, elektrisiëns, loodgieters en ander professionele mense.",
      en: "Accountants, contractors, electricians, plumbers and other professionals.",
    },
    blocks: [[11, 1, 2, 2, 34], [13, 1, 2, 1, 22], [13, 3, 1, 2, 28], [11, 3, 2, 1, 18], [12, 4, 2, 1, 14]],
  },
  {
    id: "homesA",
    color: "#60a5fa",
    name: { af: "Woongebied", en: "Residential" },
    blurb: {
      af: "Huise en huurplekke uit die Bulletin se behuisingslys.",
      en: "Homes and rentals from the Bulletin's housing listings.",
    },
    blocks: [[1, 6, 1, 1, 10], [3, 6, 1, 1, 14], [1, 8, 1, 1, 12], [3, 8, 1, 1, 10], [2, 7, 1, 1, 16]],
  },
  {
    id: "homesB",
    color: "#60a5fa",
    name: { af: "Woongebied", en: "Residential" },
    blurb: {
      af: "Huise en huurplekke uit die Bulletin se behuisingslys.",
      en: "Homes and rentals from the Bulletin's housing listings.",
    },
    blocks: [[16, 11, 1, 1, 12], [18, 11, 1, 1, 10], [16, 13, 1, 1, 14], [18, 13, 1, 1, 12], [17, 12, 1, 1, 18]],
  },
  {
    id: "windmill",
    color: "#22d3ee",
    name: { af: "Windpomp", en: "Windmill" },
    blurb: {
      af: "Brandfort se windpomp. 'n Landmerk van die dorp.",
      en: "Brandfort's windmill. A landmark of the town.",
    },
    blocks: [[7, 2, 1, 1, 78]],
  },
];

const COLORS = {
  done: { line: "#22d3ee", glow: "grid-glow-cyan" },
  building: { line: "#f87171", glow: "grid-glow-red" },
  queued: { line: "#2563eb", glow: "" },
};

const TEXT = {
  af: {
    loading: "Laai die Grid...",
    failed: "Kon nie die Grid laai nie.",
    retry: "Probeer weer",
    concept:
      "Konsepvoorskou. Brandfort Grid is 'n eksperimentele konsep, nie 'n klaar produk nie. Spandeer BB om die eerste landmerke te help bou.",
    done: "Voltooi",
    building: "Word gebou",
    queued: "In die ry",
    soon: "Kom binnekort",
    myBB: "My BB",
    invested: "In die dorp",
    hunters: "Hunters",
    tap: "Tik op 'n gebou of distrik vir meer inligting.",
    funded: "Befonds",
    spend: "Spandeer BB",
    spendBtn: "Spandeer",
    max: "Maks",
    balance: "Jou saldo",
    noBB: "Jy het nog geen BB nie. Voltooi missies om BB te verdien.",
    needHunter: "Word 'n Hunter om BB te verdien en te spandeer.",
    becomeHunter: "Word 'n Hunter",
    signIn: "Teken in om BB te spandeer.",
    spent: "Dankie! Jou BB is by die gebou gevoeg.",
    full: "Hierdie gebou is al ten volle befonds.",
    notEnough: "Jy het nie genoeg BB nie.",
    errorSpend: "Kon nie spandeer nie. Probeer weer.",
    done2: "Hierdie gebou is voltooi.",
    top: "Top bouers",
    founders: "Stigters",
    backers: "Ondersteuners tot dusver",
    founderNote:
      "Almal wat bydra voordat 'n gebou 100% bereik, word as stigters van daardie gebou aangeteken. Ons beplan om stigters in die volle Brandfort Grid te noem.",
    firstFounder: "Wees die eerste stigter!",
    zoomIn: "Zoem in",
    zoomOut: "Zoem uit",
  },
  en: {
    loading: "Loading the Grid...",
    failed: "Couldn't load the Grid.",
    retry: "Try again",
    concept:
      "Concept preview. Brandfort Grid is an experimental concept, not a finished product. Spend BB to help build the first landmarks.",
    done: "Built",
    building: "Under construction",
    queued: "Queued",
    soon: "Coming soon",
    myBB: "My BB",
    invested: "In the town",
    hunters: "Hunters",
    tap: "Tap a building or district for details.",
    funded: "Funded",
    spend: "Spend BB",
    spendBtn: "Spend",
    max: "Max",
    balance: "Your balance",
    noBB: "You have no BB yet. Complete missions to earn some.",
    needHunter: "Become a Hunter to earn and spend BB.",
    becomeHunter: "Become a Hunter",
    signIn: "Sign in to spend BB.",
    spent: "Thank you! Your BB has been added to the building.",
    full: "This building is already fully funded.",
    notEnough: "You don't have enough BB.",
    errorSpend: "Couldn't spend. Please try again.",
    done2: "This building is complete.",
    top: "Top builders",
    founders: "Founders",
    backers: "Backers so far",
    founderNote:
      "Everyone who contributes before a building reaches 100% is recorded as a founder of it. We plan to name founders in the full Brandfort Grid.",
    firstFounder: "Be the first founder!",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
  },
};

// ---------- drawing helpers ----------
const iso = (x, y, z = 0) => [(x - y) * (TW / 2), (x + y) * (TH / 2) - z];
const poly = (points) =>
  points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function boxFaces(gx, gy, w, d, h) {
  return {
    top: poly([iso(gx, gy, h), iso(gx + w, gy, h), iso(gx + w, gy + d, h), iso(gx, gy + d, h)]),
    left: poly([iso(gx, gy + d, 0), iso(gx + w, gy + d, 0), iso(gx + w, gy + d, h), iso(gx, gy + d, h)]),
    right: poly([iso(gx + w, gy + d, 0), iso(gx + w, gy, 0), iso(gx + w, gy, h), iso(gx + w, gy + d, h)]),
  };
}

function Box({ gx, gy, w, d, h, color, alpha = 0.3, dash, width = 1.2, className }) {
  const f = boxFaces(gx, gy, w, d, h);
  const common = { stroke: color, strokeWidth: width, strokeLinejoin: "round", strokeDasharray: dash };
  return (
    <g className={className}>
      <polygon points={f.left} fill={color} fillOpacity={alpha * 0.6} {...common} />
      <polygon points={f.right} fill={color} fillOpacity={alpha} {...common} />
      <polygon points={f.top} fill={color} fillOpacity={alpha * 1.4} {...common} />
    </g>
  );
}

function Ground() {
  const els = [];
  els.push(
    <polygon key="floor" points={poly([iso(0, 0), iso(N, 0), iso(N, N), iso(0, N)])} fill="#030a18" />
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
  return <g>{els}</g>;
}

// ---------- project helpers ----------
// BB is stored in the town's "materials" column
const needOf = (p) => p.needs_materials || 0;
const haveOf = (p) => Math.min(p.have_materials || 0, needOf(p));
const percentOf = (p) => {
  if (p.status === "done") return 1;
  const need = needOf(p);
  return need ? Math.min(1, haveOf(p) / need) : 0;
};
const statusOf = (p) =>
  p.status === "done" ? "done" : percentOf(p) > 0 || p.status === "building" ? "building" : "queued";

function Project({ project, slot, selected, onSelect, lang }) {
  const status = statusOf(project);
  const c = COLORS[status];
  const pct = percentOf(project);
  const lit = status === "done" ? slot.h : status === "building" ? Math.max(6, slot.h * pct) : 0;
  const name = (lang === "af" ? project.name_af : project.name_en) || project.name_en;
  const [lx, ly] = iso(slot.gx + slot.w / 2, slot.gy + slot.d / 2, slot.h + 14);
  const footprint = poly([
    iso(slot.gx, slot.gy),
    iso(slot.gx + slot.w, slot.gy),
    iso(slot.gx + slot.w, slot.gy + slot.d),
    iso(slot.gx, slot.gy + slot.d),
  ]);

  return (
    <g onClick={() => onSelect({ type: "project", id: project.key })} style={{ cursor: "pointer" }}>
      {selected && (
        <polygon points={footprint} fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 3" />
      )}
      {status !== "done" && <Box {...slot} color={c.line} alpha={0} dash="3 4" width={1} />}
      {lit > 0 && (
        <Box
          gx={slot.gx}
          gy={slot.gy}
          w={slot.w}
          d={slot.d}
          h={lit}
          color={c.line}
          alpha={status === "done" ? 0.34 : 0.28}
          className={`${c.glow} ${status === "building" ? "grid-building" : ""} ${
            status === "done" ? "grid-complete" : ""
          }`}
        />
      )}
      <text x={lx} y={ly} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.line}>
        {project.icon} {name}
      </text>
      {status === "building" && (
        <text x={lx} y={ly + 13} textAnchor="middle" fontSize="10" fill="#fecaca">
          {Math.round(pct * 100)}%
        </text>
      )}
    </g>
  );
}

function District({ district, block, selected, onSelect }) {
  const [gx, gy, w, d, h] = block;
  return (
    <g onClick={() => onSelect({ type: "district", id: district.id })} style={{ cursor: "pointer" }}>
      <Box
        gx={gx}
        gy={gy}
        w={w}
        d={d}
        h={h}
        color={district.color}
        alpha={selected ? 0.22 : 0.1}
        dash="2 3"
        width={0.9}
      />
    </g>
  );
}

function boundsOf(district) {
  let x0 = 99, y0 = 99, x1 = 0, y1 = 0, hMax = 0;
  district.blocks.forEach(([gx, gy, w, d, h]) => {
    x0 = Math.min(x0, gx);
    y0 = Math.min(y0, gy);
    x1 = Math.max(x1, gx + w);
    y1 = Math.max(y1, gy + d);
    hMax = Math.max(hMax, h);
  });
  return { x0, y0, x1, y1, hMax };
}

function Bar({ pct, color }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-cyan-950">
      <div className="h-full rounded-full" style={{ width: `${Math.round(pct * 100)}%`, background: color }} />
    </div>
  );
}

const QUICK = [10, 25, 50];

export default function BrandfortGrid({ lang = "af" }) {
  const t = TEXT[lang === "af" ? "af" : "en"];
  const [state, setState] = useState(null);
  const [status, setStatus] = useState("loading");
  const [selected, setSelected] = useState(null); // { type, id }
  const [zoom, setZoom] = useState(1);
  const [bb, setBB] = useState(null); // null = not signed in or not a hunter
  const [amount, setAmount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [backers, setBackers] = useState(null);
  const [tick, setTick] = useState(0);
  const scroller = useRef(null);
  const centered = useRef(false);

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

  useEffect(() => {
    const el = scroller.current;
    if (status === "ready" && el && !centered.current) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      centered.current = true;
    }
  }, [status]);

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

  if (status === "loading") {
    return (
      <div className="mx-3 mt-4 h-96 animate-pulse rounded-2xl bg-cyan-950/40">
        <p className="p-6 text-sm text-cyan-300">{t.loading}</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="grid-panel grid-panel-red mx-3 mt-4 p-6 text-center">
        <p role="alert" className="text-sm text-red-200">{t.failed}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("loading");
            load();
          }}
          className="mt-4 rounded-full border border-cyan-400 px-5 py-2 text-sm text-cyan-200"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  const projects = state.projects || [];
  const projectItems = projects.slice(0, SLOTS.length).map((p, i) => ({
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
  const items = [
    ...projectItems,
    ...districtItems,
    { kind: "beacon", depth: MAIN_ROAD * 2 + 2 },
  ].sort((a, b) => a.depth - b.depth);

  const pickedProject =
    selected?.type === "project" ? projects.find((p) => p.key === selected.id) : null;
  const pickedDistrict =
    selected?.type === "district" ? DISTRICTS.find((d) => d.id === selected.id) : null;

  const invested = projects.reduce((sum, p) => sum + haveOf(p), 0);

  const remaining = pickedProject ? Math.max(0, needOf(pickedProject) - haveOf(pickedProject)) : 0;
  const maxSpend = Math.max(0, Math.min(bb ?? 0, remaining));
  const spendAmount = Math.max(0, Math.min(amount, maxSpend));

  const spend = async () => {
    if (!pickedProject || spendAmount <= 0) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.rpc("town_spend", {
      p_key: pickedProject.key,
      p_amount: spendAmount,
    });
    setBusy(false);
    if (error) {
      const m = error.message || "";
      setMsg({
        ok: false,
        text: m.includes("not_enough") ? t.notEnough : m.includes("full") ? t.full : t.errorSpend,
      });
    } else {
      setMsg({ ok: true, text: t.spent });
    }
    load();
    loadBB();
    setTick((n) => n + 1);
  };

  // Labels for districts sit above their tallest block
  const districtLabels = DISTRICTS.filter((d) => d.id !== "homesB").map((d) => {
    const b = boundsOf(d);
    const [x, y] = iso((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.hMax + 12);
    return { d, x, y };
  });

  const baseW = 900;

  return (
    <div className="pb-10">
      <div className="grid-panel mx-3 mt-3 px-3 py-2">
        <p className="text-[11px] leading-snug text-cyan-100/80">{t.concept}</p>
      </div>

      <div className="mx-3 mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="grid-panel px-2 py-2">
          <p className="text-lg font-black tabular-nums text-cyan-300">{bb === null ? "–" : bb} BB</p>
          <p className="text-[10px] uppercase tracking-wide text-cyan-100/60">{t.myBB}</p>
        </div>
        <div className="grid-panel px-2 py-2">
          <p className="text-lg font-black tabular-nums text-cyan-300">{invested} BB</p>
          <p className="text-[10px] uppercase tracking-wide text-cyan-100/60">{t.invested}</p>
        </div>
        <div className="grid-panel px-2 py-2">
          <p className="text-lg font-black tabular-nums text-cyan-300">🎯 {state.hunters ?? 0}</p>
          <p className="text-[10px] uppercase tracking-wide text-cyan-100/60">{t.hunters}</p>
        </div>
      </div>

      <div className="relative mt-3">
        <div className="absolute right-3 top-2 z-10 flex gap-2">
          <button
            type="button"
            aria-label={t.zoomOut}
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
            className="h-9 w-9 rounded-full border border-cyan-400/50 bg-black/70 text-lg font-bold text-cyan-300"
          >
            −
          </button>
          <button
            type="button"
            aria-label={t.zoomIn}
            onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.2).toFixed(1)))}
            className="h-9 w-9 rounded-full border border-cyan-400/50 bg-black/70 text-lg font-bold text-cyan-300"
          >
            +
          </button>
        </div>

        <div ref={scroller} className="overflow-auto" style={{ maxHeight: "70vh" }}>
          <svg
            viewBox="-450 -130 900 600"
            style={{ width: baseW * zoom, maxWidth: "none", display: "block", margin: "0 auto" }}
            role="img"
            aria-label="Brandfort Grid"
          >
            <Ground />
            {items.map((it) => {
              if (it.kind === "beacon") {
                return (
                  <Box
                    key="beacon"
                    gx={MAIN_ROAD}
                    gy={MAIN_ROAD}
                    w={1}
                    d={1}
                    h={26}
                    color="#22d3ee"
                    alpha={0.35}
                    className="grid-pulse grid-glow-cyan"
                  />
                );
              }
              if (it.kind === "project") {
                return (
                  <Project
                    key={it.p.key}
                    project={it.p}
                    slot={it.slot}
                    lang={lang}
                    selected={selected?.type === "project" && selected.id === it.p.key}
                    onSelect={setSelected}
                  />
                );
              }
              return (
                <District
                  key={it.key}
                  district={it.dist}
                  block={it.block}
                  selected={selected?.type === "district" && selected.id === it.dist.id}
                  onSelect={setSelected}
                />
              );
            })}
            {districtLabels.map(({ d, x, y }) => (
              <text
                key={`l-${d.id}`}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={d.color}
                fillOpacity="0.85"
                style={{ pointerEvents: "none" }}
              >
                {d.name[lang === "af" ? "af" : "en"]}
              </text>
            ))}
          </svg>
        </div>
      </div>

      <div className="mx-3 mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-cyan-100/70">
        <span><span style={{ color: COLORS.done.line }}>■</span> {t.done}</span>
        <span><span style={{ color: COLORS.building.line }}>■</span> {t.building}</span>
        <span><span style={{ color: COLORS.queued.line }}>■</span> {t.queued}</span>
        <span><span style={{ color: "#fb923c" }}>■</span> {t.soon}</span>
      </div>

      <div className="grid-panel mx-3 mt-4 p-4">
        {pickedProject ? (
          <>
            <p className="text-sm font-black text-white">
              {pickedProject.icon}{" "}
              {(lang === "af" ? pickedProject.name_af : pickedProject.name_en) || pickedProject.name_en}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: COLORS[statusOf(pickedProject)].line }}>
              {t[statusOf(pickedProject)]} · {Math.round(percentOf(pickedProject) * 100)}%
            </p>
            <div className="mt-2">
              <Bar pct={percentOf(pickedProject)} color={COLORS[statusOf(pickedProject)].line} />
            </div>
            <p className="mt-2 text-xs tabular-nums text-cyan-100/70">
              {t.funded}: {haveOf(pickedProject)} / {needOf(pickedProject)} BB
            </p>

            <div className="mt-3 rounded-lg border border-yellow-300/25 bg-yellow-300/5 p-3">
              <p className="text-[11px] font-bold tracking-[0.2em] text-yellow-300">
                ★ {pickedProject.status === "done" ? t.founders : t.backers}
              </p>
              {backers && backers.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {backers.slice(0, 8).map((b) => (
                    <li key={b.gamer_name} className="flex justify-between text-xs">
                      <span className="text-neutral-200">{b.gamer_name}</span>
                      <span className="tabular-nums text-yellow-200">{b.total} BB</span>
                    </li>
                  ))}
                  {backers.length > 8 && (
                    <li className="text-[11px] text-neutral-500">+{backers.length - 8}</li>
                  )}
                </ul>
              ) : (
                pickedProject.status !== "done" && (
                  <p className="mt-2 text-xs text-yellow-100/80">{t.firstFounder}</p>
                )
              )}
              {pickedProject.status !== "done" && (
                <p className="mt-2 text-[10px] leading-snug text-neutral-500">{t.founderNote}</p>
              )}
            </div>

            {pickedProject.status === "done" ? (
              <p className="mt-3 text-xs text-green-400">{t.done2}</p>
            ) : bb === null ? (
              <p className="mt-3 text-xs text-cyan-100/70">
                {t.signIn}{" "}
                <a href="/profile/hunter" className="text-cyan-300 underline">
                  {t.becomeHunter}
                </a>
              </p>
            ) : bb <= 0 ? (
              <p className="mt-3 text-xs text-cyan-100/70">{t.noBB}</p>
            ) : (
              <div className="mt-3 border-t border-cyan-400/20 pt-3">
                <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-300">
                  {t.spend}
                </p>
                <p className="mt-1 text-[11px] text-cyan-100/60">
                  {t.balance}: {bb} BB
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {QUICK.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q)}
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${
                        spendAmount === Math.min(q, maxSpend) && amount === q
                          ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                          : "border-cyan-400/30 text-cyan-300"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(maxSpend)}
                    className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs font-bold text-cyan-300"
                  >
                    {t.max} ({maxSpend})
                  </button>
                </div>
                <button
                  type="button"
                  disabled={busy || spendAmount <= 0}
                  onClick={spend}
                  className="mt-3 w-full rounded-full bg-cyan-400 py-2 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:opacity-40"
                >
                  {t.spendBtn} {spendAmount} BB
                </button>
              </div>
            )}

            {msg && (
              <p
                role={msg.ok ? "status" : "alert"}
                className={`mt-2 text-xs ${msg.ok ? "text-green-400" : "text-red-300"}`}
              >
                {msg.text}
              </p>
            )}
          </>
        ) : pickedDistrict ? (
          <>
            <p className="text-sm font-black" style={{ color: pickedDistrict.color }}>
              {pickedDistrict.name[lang === "af" ? "af" : "en"]}
            </p>
            <p className="mt-0.5 text-xs text-cyan-100/60">🔒 {t.soon}</p>
            <p className="mt-2 text-xs text-cyan-100/80">
              {pickedDistrict.blurb[lang === "af" ? "af" : "en"]}
            </p>
          </>
        ) : (
          <p className="text-xs text-cyan-100/60">{t.tap}</p>
        )}
      </div>

      {state.top && state.top.length > 0 && (
        <div className="grid-panel mx-3 mt-4 p-4">
          <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-300">{t.top}</p>
          <ol className="mt-2 space-y-1">
            {state.top.map((h, i) => (
              <li key={h.gamer_name} className="flex justify-between text-sm">
                <span className="text-neutral-200">
                  {i + 1}. {h.gamer_name}
                </span>
                <span className="tabular-nums text-cyan-300">{h.total} BB</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
