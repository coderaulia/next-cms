// Generates ad creatives (feed 1080x1350 + story 1080x1920) from data/ads.json into templates/ad-XX-<slug>-<format>.html.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const ads = JSON.parse(readFileSync(join(root, 'data/ads.json'), 'utf8'));
const formats = { feed: [1080, 1350], story: [1080, 1920] };

const css = (w, h, story) => `
html,body{width:${w}px;height:${h}px}
.post{width:${w}px;height:${h}px;${story ? 'padding:250px 72px 260px' : ''}}
.blue{background:linear-gradient(165deg,#2f6dff 0%,#1a47c4 55%,#14306f 100%);color:#fff}
.blue .muted{color:#dbe5ff}
.blue .brand .lw{background-image:url(../assets/brand/wordmark-white.png)}
.blue .brand .lm,.dark .brand .lm{box-shadow:0 0 0 2px rgba(255,255,255,.25)}
.hook{margin-top:${story ? 90 : 50}px;font-size:${story ? 32 : 27}px;font-weight:500;color:var(--muted)}
.dark .hook{color:#b8c6e0}.blue .hook{color:#dbe5ff}
.hl{margin-top:16px;font-size:${story ? 104 : 86}px;line-height:.98;letter-spacing:-.035em;font-weight:700}
.hl i{font-family:'Instrument Serif',Georgia,serif;font-weight:400;letter-spacing:-.01em;color:var(--accent)}
.dark .hl i{color:var(--accent-soft)}.blue .hl i{color:#fff;opacity:.85}
.vis{position:relative;flex:1;min-height:0;margin-top:${story ? 70 : 40}px}
.frame{position:absolute;background:#fff;border-radius:18px;overflow:hidden;border:1px solid rgba(17,37,73,.12);box-shadow:0 30px 70px rgba(8,15,30,.28);display:flex;flex-direction:column}
.frame img{flex:1;min-height:0;width:100%;object-fit:cover;object-position:top;display:block}
.bar{height:36px;flex:none;display:flex;align-items:center;gap:7px;padding:0 14px;background:#eef2f9;border-bottom:1px solid #d6dfed}
.bar i{width:10px;height:10px;border-radius:50%;background:#c9d3e4;display:block}
.bar span{margin-left:10px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#637391}
.main{left:0;top:0;width:78%;height:82%}
.side{right:0;bottom:0;width:46%;height:62%}
.chip{position:absolute;background:#fff;color:var(--ink);border-radius:16px;padding:16px 20px;font-size:20px;font-weight:600;box-shadow:0 20px 50px rgba(8,15,30,.25);border:1px solid #d6dfed}
.chip small{display:block;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:400;color:#1f8c47;margin-top:4px;letter-spacing:.04em}
.c1{left:4%;bottom:4%}
.p1{left:0;top:0;width:70%;height:62%;transform:rotate(-3deg)}
.p2{right:0;top:16%;width:70%;height:62%;transform:rotate(3deg)}
.p3{left:9%;bottom:0;width:78%;height:60%}
.bens{margin-top:${story ? 64 : 34}px;display:flex;gap:12px;flex-wrap:wrap}
.ben{padding:14px 20px;border-radius:999px;font-size:${story ? 24 : 21}px;font-weight:500;background:#fff;border:1px solid var(--line)}
.dark .ben,.blue .ben{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)}
.ben::before{content:'✓  ';color:var(--accent);font-weight:700}
.dark .ben::before{color:var(--accent-soft)}.blue .ben::before{color:#fff}
.ctabar{margin-top:${story ? 56 : 30}px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:${story ? 30 : 22}px ${story ? 30 : 22}px ${story ? 30 : 22}px 32px;border-radius:26px;background:var(--navy);color:#fff}
.dark .ctabar{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14)}
.blue .ctabar{background:rgba(8,15,30,.35)}
.offer{font-size:${story ? 27 : 23}px;line-height:1.3;font-weight:500}
.offer small{display:block;font-family:'JetBrains Mono',monospace;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#a3c0ff;margin-bottom:6px;font-weight:400}
.btn{flex:none;background:var(--accent);color:#fff;border-radius:999px;padding:${story ? '24px 40px' : '20px 34px'};font-size:${story ? 30 : 26}px;font-weight:700;box-shadow:0 14px 34px rgba(47,109,255,.4)}
.blue .btn{background:#fff;color:var(--accent)}
`;

ads.forEach((a, i) => {
  const n = String(i + 1).padStart(2, '0');
  for (const [fmt, [w, h]] of Object.entries(formats)) {
    const story = fmt === 'story';
    const cls = a.theme === 'light' ? '' : ` ${a.theme}`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="size" content="${w}x${h}"><link rel="stylesheet" href="_brand.css"><style>${css(w, h, story)}</style></head><body>
<div class="post${cls}">
  <div class="glow" style="width:640px;height:640px;background:${a.theme === 'light' ? '#a3c0ff' : '#2f6dff'};right:-240px;top:-260px;opacity:${a.theme === 'light' ? .55 : .3}"></div>
  <div class="top"><div class="brand" aria-label="Vanaila"><span class="lm"></span><span class="lw"></span></div><div class="mono muted">${a.pillar}</div></div>
  <p class="hook">${a.hook}</p>
  <h1 class="hl">${a.headline}</h1>
  <div class="vis">${a.visual}</div>
  <div class="bens">${a.benefits.map((b) => `<span class="ben">${b}</span>`).join('')}</div>
  <div class="ctabar"><div class="offer"><small>vanaila.com</small>${a.offer}</div><div class="btn">${a.cta}</div></div>
</div></body></html>`;
    const file = `ad-${n}-${a.slug}-${fmt}.html`;
    writeFileSync(join(root, 'templates', file), html);
    console.log('built', file);
  }
});
