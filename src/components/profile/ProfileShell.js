// src/components/profile/ProfileShell.js
// The frame around every profile page. It sets the skin's colours as CSS variables and holds
// the shared .pf-* classes, so the pages themselves never hard-code a colour.
"use client";
import { skinVars } from "@/lib/profileSkins";

const PF_CSS = `
.pf-root{color:var(--pf-text)}
.pf-card{background:var(--pf-card);border:1px solid var(--pf-line);border-radius:var(--pf-radius);backdrop-filter:blur(6px)}
.pf-banner{height:92px;background:var(--pf-banner)}
.pf-avatar{display:inline-block;border-radius:9999px;padding:3px;background:var(--pf-frame);box-shadow:0 0 24px var(--pf-glow)}
.pf-avatar>span,.pf-avatar>div{display:block;border-radius:9999px;overflow:hidden;border:3px solid #0a0a0a}
.pf-eyebrow{font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--pf-accent-text)}
.pf-link{color:var(--pf-accent-text)}
.pf-link:hover{color:var(--pf-text)}
.pf-muted{color:var(--pf-muted)}
.pf-faint{color:var(--pf-faint)}
.pf-chip{display:inline-flex;align-items:center;gap:.35rem;padding:.28rem .7rem;border-radius:9999px;font-size:.75rem;font-weight:600;background:var(--pf-chip-bg);color:var(--pf-accent-text);border:1px solid var(--pf-chip-line);max-width:100%}
.pf-label{display:block;margin-bottom:.3rem;font-size:.75rem;font-weight:600;color:var(--pf-muted)}
.pf-input{width:100%;background:var(--pf-input);color:var(--pf-text);border:1px solid var(--pf-line-strong);border-radius:.75rem;padding:.75rem .85rem;outline:none;transition:border-color .15s,box-shadow .15s}
.pf-input:focus{border-color:var(--pf-accent);box-shadow:0 0 0 3px var(--pf-glow-soft)}
.pf-btn{width:100%;background:var(--pf-accent);color:var(--pf-on-accent);font-weight:700;border-radius:.75rem;padding:.8rem 1rem;transition:filter .15s,transform .1s;box-shadow:0 0 22px var(--pf-glow-soft)}
.pf-btn:hover{filter:brightness(1.08)}
.pf-btn:active{transform:scale(.99)}
.pf-btn:disabled{opacity:.5}
.pf-btn-ghost{width:100%;background:transparent;color:var(--pf-muted);border:1px solid var(--pf-line-strong);border-radius:.75rem;padding:.7rem 1rem;font-size:.875rem;transition:border-color .15s,color .15s}
.pf-btn-ghost:hover{border-color:var(--pf-accent);color:var(--pf-accent-text)}
.pf-btn-ghost:disabled{opacity:.5}
.pf-row{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.85rem 1rem;border-radius:var(--pf-radius);background:var(--pf-chip-bg);border:1px solid var(--pf-chip-line);color:var(--pf-accent-text);font-weight:600;font-size:.875rem;transition:border-color .15s}
.pf-row:hover{border-color:var(--pf-accent)}
.pf-ok{color:#4ade80}
.pf-bad{color:#fca5a5}
`;

export default function ProfileShell({ skin, children }) {
  return (
    <main className="pf-root bg-carbon min-h-screen px-5 pb-12 pt-6" style={skinVars(skin)}>
      <style>{PF_CSS}</style>
      <div className="mx-auto max-w-md">{children}</div>
    </main>
  );
}
