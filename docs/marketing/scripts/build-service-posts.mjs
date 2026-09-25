// Generates templates/svc-XX-<slug>.html from data/services.json. Run `npm run build:services` then `npm run render`.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const services = JSON.parse(readFileSync(join(root, 'data/services.json'), 'utf8'));
const total = String(services.length).padStart(2, '0');

const css = `
.hook{margin-top:48px}
.h1 i{font-family:'Instrument Serif',Georgia,serif;font-weight:400;color:var(--accent);font-size:1.08em}
.dark .h1 i{color:var(--accent-soft)}
.for{margin-top:26px;font-size:24px;line-height:1.4;max-width:860px}
.for b{font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-right:12px;font-weight:500}
.dark .for b{color:var(--accent-soft)}
.vals{margin-top:40px;display:grid;gap:14px}
.v{display:grid;grid-template-columns:56px 1fr;gap:20px;align-items:start;padding:22px 26px;border-radius:20px;background:#fff;border:1px solid var(--line)}
.dark .v{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1)}
.ic{width:48px;height:48px;border-radius:14px;background:#eaf0ff;color:var(--accent);display:grid;place-items:center;font-size:22px;font-weight:700}
.dark .ic{background:rgba(163,192,255,.14);color:var(--accent-soft)}
.v b{font-size:30px;letter-spacing:-.02em;font-weight:600;display:block}
.v p{font-size:20px;line-height:1.4;margin-top:4px}
.ladder{margin-top:32px}
.ladder .lbl{font-family:'JetBrains Mono',monospace;font-size:16px;letter-spacing:.08em;text-transform:uppercase}
.steps{margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.steps div{padding:16px 18px;border-radius:14px;border:1px dashed var(--line-strong,#b9c7dd);font-size:18px;line-height:1.35;font-weight:500}
.dark .steps div{border-color:rgba(255,255,255,.2)}
.shot{margin-top:28px;flex:1;min-height:0;border-radius:18px 18px 0 0;overflow:hidden;border:1px solid rgba(255,255,255,.18);border-bottom:none;box-shadow:0 24px 60px rgba(8,15,30,.25)}
.shot img{width:100%;height:100%;object-fit:cover;object-position:top left;display:block}
.withshot .foot{margin-top:0}
.post:not(.withshot) .hook{margin-top:64px}
.post:not(.withshot) .for{margin-top:32px}
.post:not(.withshot) .vals{margin-top:48px;gap:18px}
.post:not(.withshot) .v{padding:28px 30px}
.post:not(.withshot) .v b{font-size:34px}
.post:not(.withshot) .v p{font-size:22px}
.post:not(.withshot) .ladder{margin-top:44px}
.post:not(.withshot) .steps div{font-size:20px;padding:18px 20px}
`;

services.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const muted = 'muted';
  const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="_brand.css"><style>${css}</style></head><body>
<div class="post${s.dark ? ' dark' : ''}${s.shot ? ' withshot' : ''}">
  <div class="glow" style="width:560px;height:560px;background:${s.dark ? '#2f6dff' : '#a3c0ff'};${i % 2 ? 'left:-240px;bottom:-260px' : 'right:-220px;top:-220px'};opacity:${s.dark ? .3 : .55}"></div>
  <div class="top"><div class="brand"><div class="mark">V</div>vanaila.</div><div class="mono ${muted}">${s.kicker} · ${n}/${total}</div></div>
  <div class="hook"><div class="mono ${muted}">${s.name}</div><h1 class="h1" style="margin-top:16px;font-size:${s.hook.replace(/<[^>]+>/g, '').length > 40 ? 68 : 80}px">${s.hook}</h1></div>
  <p class="for"><b>For</b>${s.for}</p>
  <div class="vals">${s.values.map(([t, d], k) => `<div class="v"><div class="ic">${['✓', '↗', '★'][k]}</div><div><b>${t}</b><p class="${muted}">${d}</p></div></div>`).join('')}</div>
  <div class="ladder"><div class="lbl ${muted}">${s.ladderLabel}</div><div class="steps">${s.ladder.map((l) => `<div>${l}</div>`).join('')}</div></div>
  ${s.shot ? `<div class="shot"><img src="${s.shot}"></div>` : ''}
  <div class="foot"><div class="mono ${muted}">${s.url}</div><div class="cta">${s.cta}</div></div>
</div></body></html>`;
  writeFileSync(join(root, 'templates', `svc-${n}-${s.slug}.html`), html);
  console.log('built', `svc-${n}-${s.slug}.html`);
});
