// src/components/dash/QrPanel.js
// QR code for the menu or the business page, with download and a printable poster.
"use client";
import { useEffect, useState } from "react";
import { SCHEMES, safeScheme } from "@/lib/bizTheme";

const SITE = "https://ons-brandfort-bulletin.vercel.app";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "qr";

export default function QrPanel({ biz, menuEnabled, scheme, d }) {
  const [target, setTarget] = useState(menuEnabled ? "menu" : "page");
  const [png, setPng] = useState("");

  // src=qr lets the dashboard count scans
  const url =
    target === "menu"
      ? `${SITE}/business/${biz.id}/menu?src=qr`
      : `${SITE}/business/${biz.id}?src=qr`;

  useEffect(() => {
    let alive = true;
    setPng("");
    (async () => {
      const QR = (await import("qrcode")).default;
      const img = await QR.toDataURL(url, {
        width: 720,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: SCHEMES[safeScheme(scheme)].dark, light: "#ffffff" },
      });
      if (alive) setPng(img);
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, [url, scheme]);

  const printPoster = () => {
    if (!png) return;
    const line = target === "menu" ? d.posterMenu : d.posterPage;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(biz.name)}</title>
<style>
@page { margin: 0; }
body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #fff; color: #111; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
.box { padding: 40px; max-width: 680px; }
h1 { font-size: 46px; margin: 0 0 10px; }
p { font-size: 24px; color: #333; margin: 0; }
img { width: 440px; height: 440px; margin: 30px 0; }
.foot { font-size: 16px; color: #888; }
</style></head><body><div class="box">
<h1>${escapeHtml(biz.name)}</h1>
<p>${escapeHtml(line)}</p>
<img src="${png}" alt="QR">
<p class="foot">${escapeHtml(d.posterFoot)}</p>
</div><script>window.onload = function () { setTimeout(function () { window.print(); }, 300); };<\/script></body></html>`);
    win.document.close();
  };

  const chip = (on) => ({
    background: on ? "var(--bz-accent)" : "transparent",
    color: on ? "var(--bz-on-accent)" : "var(--bz-text)",
    border: "1px solid var(--bz-accent-line)",
  });

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--bz-muted)" }}>
        {d.qrHelp}
      </p>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--bz-muted)" }}>
          {d.qrTarget}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!menuEnabled}
            onClick={() => setTarget("menu")}
            className="rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-40"
            style={chip(target === "menu")}
          >
            📋 {d.qrMenu}
          </button>
          <button
            type="button"
            onClick={() => setTarget("page")}
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={chip(target === "page")}
          >
            🏪 {d.qrPage}
          </button>
        </div>
        {!menuEnabled && (
          <p className="mt-2 text-xs" style={{ color: "var(--bz-muted)" }}>
            {d.qrNoMenu}
          </p>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-[280px] items-center justify-center rounded-2xl bg-white p-3" style={{ aspectRatio: "1 / 1" }}>
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={png} alt="QR code" className="h-full w-full" />
        ) : (
          <span className="text-sm text-neutral-500">{d.qrMaking}</span>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <a
          href={png || undefined}
          download={`${slug(biz.name)}-qr.png`}
          aria-disabled={!png}
          className="rounded-lg px-4 py-3 text-sm font-semibold"
          style={{ background: "var(--bz-accent)", color: "var(--bz-on-accent)", opacity: png ? 1 : 0.4 }}
        >
          ⬇ {d.qrDownload}
        </a>
        <button
          type="button"
          onClick={printPoster}
          disabled={!png}
          className="rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-40"
          style={{ border: "1px solid var(--bz-accent-line)", color: "var(--bz-text)" }}
        >
          🖨️ {d.qrPrint}
        </button>
      </div>
    </div>
  );
}
