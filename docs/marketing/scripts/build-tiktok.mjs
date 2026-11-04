// Generates TikTok Photo Mode slides (1080x1920) from data/tiktok.json into templates/tt-XX-<slug>-sN.html.
// Style: "Neo-Brutal" (light + blue themes) and "Neon Night" (dark + photo themes), with illustrations and shapes.
// Safe zones: content stays clear of the top 160px, bottom 440px and right 140px (TikTok UI overlays).
// Also writes data/deco-layout.json (where decorations sit on every slide) so the Remotion videos match the PNGs.
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const root = resolve(import.meta.dirname, '..');
const tiktok = JSON.parse(readFileSync(join(root, 'data/tiktok.json'), 'utf8'));
const videos = JSON.parse(readFileSync(join(root, 'data/videos.json'), 'utf8'));
const deco = JSON.parse(readFileSync(join(root, 'data/deco.json'), 'utf8'));
for (const f of readdirSync(join(root, 'templates'))) if (f.startsWith('tt-') || f.startsWith('_tmp-')) unlinkSync(join(root, 'templates', f));

const css = `
@import url('../node_modules/@fontsource/space-grotesk/latin-500.css');
@import url('../node_modules/@fontsource/space-grotesk/latin-700.css');
@import url('../node_modules/@fontsource/space-mono/latin-400.css');
@import url('../node_modules/@fontsource/space-mono/latin-700.css');
@import url('../node_modules/@fontsource/sora/latin-600.css');
@import url('../node_modules/@fontsource/sora/latin-700.css');
@import url('../node_modules/@fontsource/jetbrains-mono/latin-400.css');
@import url('../node_modules/@fontsource/jetbrains-mono/latin-500.css');
@import url('../node_modules/@fontsource/comic-neue/latin-400.css');
@import url('../node_modules/@fontsource/comic-neue/latin-700.css');
:root{--y:#ffe14d;--p:#ff5d8f;--b:#3d5afe;--m:#5de0b0;--o:#ff8a3d}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
.post{--ol:#111;--sh:#111;--text:#111;--muted:#2b2b2b;--hf:'Space Grotesk';--mf:'Space Mono';position:relative;width:1080px;height:1920px;padding:170px 150px 440px 72px;display:flex;flex-direction:column;overflow:hidden;font-family:var(--hf),Helvetica,Arial,sans-serif;color:var(--text);background:#fffdf5 radial-gradient(rgba(17,17,17,.14) 2px,transparent 2px) 0 0/36px 36px;-webkit-font-smoothing:antialiased}
.post.blue{--muted:#eef1ff;--text:#fff;background:#3d5afe radial-gradient(rgba(255,255,255,.22) 2px,transparent 2px) 0 0/36px 36px}
.post.dark,.post.photo{--ol:#f2f4ff;--sh:rgba(0,0,0,.55);--text:#f2f4ff;--muted:#aeb6d8;--hf:'Sora';--mf:'JetBrains Mono';background:#0d1030}
.post.photo{background:#0b1426}
.post.dark:before{content:'';position:absolute;inset:0;z-index:0;background:radial-gradient(circle at 90% 4%,rgba(61,90,254,.55),transparent 42%),radial-gradient(circle at 4% 96%,rgba(255,93,143,.3),transparent 40%),radial-gradient(rgba(255,255,255,.09) 1.5px,transparent 1.5px) 0 0/48px 48px}
.post>*{position:relative;z-index:1}
.post>.bgimg{position:absolute;inset:-40px;z-index:0;background-size:cover;background-position:center;filter:blur(36px) brightness(.22) saturate(1.2);transform:scale(1.1)}
.post>.dc{position:absolute;z-index:2}
.top{display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:12px}
.lm{width:56px;height:56px;border-radius:13px;background:url(../assets/brand/mark.png) center/contain no-repeat;border:4px solid #111}
.lw{width:143px;height:31px;margin-top:4px;background:url(../assets/brand/wordmark.png) left center/contain no-repeat}
.blue .lw,.dark .lw,.photo .lw{background-image:url(../assets/brand/wordmark-white.png)}
.blue .lm{border-color:#fff}.dark .lm,.photo .lm{border:2px solid rgba(255,255,255,.25)}
.count{font:700 24px var(--mf),monospace;background:var(--y);color:#111;border:4px solid #111;padding:4px 14px;box-shadow:5px 5px 0 #111}
.dark .count,.photo .count{background:none;border:0;box-shadow:none;color:var(--y);letter-spacing:.08em}
.body{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;position:relative}
.k{align-self:flex-start;font:700 24px var(--mf),monospace;letter-spacing:.06em;text-transform:uppercase;background:#111;color:var(--y);padding:6px 16px;margin-bottom:18px}
.dark .k,.photo .k{background:none;color:var(--m);padding:0}
.dark .k:before,.photo .k:before{content:'// '}
.hcard,.pcard,.ccard{position:relative;border:6px solid #111;box-shadow:14px 14px 0 #111;border-radius:6px;padding:48px 46px;color:#111}
.hcard,.ccard{background:var(--y);transform:rotate(-1.5deg)}
.pcard{background:#fff;transform:rotate(1deg)}
.dark .hcard,.dark .pcard,.dark .ccard,.photo .hcard,.photo .pcard,.photo .ccard{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);box-shadow:none;border-radius:28px;transform:none;color:var(--text);backdrop-filter:blur(8px)}
.dark .hcard:before,.photo .hcard:before,.dark .ccard:before,.photo .ccard:before,.dark .pcard:before,.photo .pcard:before,.dark .hcard:after,.photo .hcard:after,.dark .ccard:after,.photo .ccard:after,.dark .pcard:after,.photo .pcard:after{content:'';position:absolute;width:56px;height:56px;border:4px solid var(--y)}
.dark .hcard:before,.photo .hcard:before,.dark .ccard:before,.photo .ccard:before,.dark .pcard:before,.photo .pcard:before{top:-3px;left:-3px;border-right:0;border-bottom:0;border-radius:28px 0 0 0}
.dark .hcard:after,.photo .hcard:after,.dark .ccard:after,.photo .ccard:after,.dark .pcard:after,.photo .pcard:after{bottom:-3px;right:-3px;border-left:0;border-top:0;border-radius:0 0 28px 0;border-color:var(--p)}
.stk{position:absolute;top:-34px;right:-14px;transform:rotate(6deg);background:var(--p);color:#111;border:5px solid #111;box-shadow:6px 6px 0 #111;padding:8px 20px;font:700 26px var(--mf),monospace;text-transform:uppercase}
.dark .stk,.photo .stk{position:static;transform:none;background:none;border:0;box-shadow:none;padding:0;color:var(--m);font-size:24px;margin-bottom:22px;display:block}
.dark .stk:before,.photo .stk:before{content:'// '}
.t,.pt{overflow-wrap:anywhere}
.t{font-size:104px;line-height:1.1;letter-spacing:-.035em;font-weight:700}
.t i,.pt i{font-style:normal;color:#111;background:var(--p);border:5px solid #111;padding:0 .1em;box-decoration-break:clone;-webkit-box-decoration-break:clone;box-shadow:6px 6px 0 #111}
.blue .t i,.blue .pt i{background:var(--y)}
.hcard .t i,.ccard .t i{background:var(--p)}
.dark .t i,.dark .pt i,.photo .t i,.photo .pt i{border:0;box-shadow:none;padding:0;background:linear-gradient(90deg,#ffe14d,#ff5d8f);-webkit-background-clip:text;background-clip:text;color:transparent}
.s{font-size:38px;line-height:1.35;margin-top:44px;color:var(--muted);font-weight:500}
.hcard .s,.ccard .s{margin-top:28px;color:#2b2b2b}
.dark .hcard .s,.photo .hcard .s,.dark .ccard .s,.photo .ccard .s{color:var(--muted)}
.s i,.pb i{font-style:normal;font-weight:700;color:var(--b)}
.dark .s i,.dark .pb i,.photo .s i,.photo .pb i,.blue .s i{color:var(--y)}
.num{width:fit-content;min-width:150px;height:150px;padding:0 30px;border-radius:75px;background:var(--b);color:#fff;border:6px solid #111;box-shadow:8px 8px 0 #111;display:flex;align-items:center;justify-content:center;font-size:76px;font-weight:700;margin:-104px 0 26px -26px;letter-spacing:-.02em;line-height:1}
.num.n2{font-size:60px}.num.n3{font-size:46px}
.dark .num,.photo .num{min-width:0;height:auto;padding:0;margin:0 0 14px;border:0;box-shadow:none;border-radius:0;font-size:140px;justify-content:flex-start;background:linear-gradient(90deg,#ffe14d,#ff5d8f);-webkit-background-clip:text;background-clip:text;color:transparent}
.pt{font-size:80px;line-height:1.05;letter-spacing:-.03em;font-weight:700}
.dark .num.emo,.photo .num.emo{background:none;-webkit-background-clip:border-box;background-clip:border-box;color:var(--text)}
.pb{font-size:38px;line-height:1.4;margin-top:26px;font-weight:500;color:#2b2b2b}
.dark .pb,.photo .pb{color:var(--muted)}
.fix{margin-top:36px;padding:22px 26px;border:4px solid #111;background:#fff3a6;font-size:34px;line-height:1.3;font-weight:700;box-shadow:6px 6px 0 #111;color:#111}
.fix span{display:block;width:fit-content;font:700 20px var(--mf),monospace;letter-spacing:.08em;background:var(--p);border:3px solid #111;padding:3px 12px;margin-bottom:12px}
.dark .fix,.photo .fix{background:rgba(255,225,77,.1);border:1px solid rgba(255,225,77,.5);box-shadow:none;border-radius:18px;color:var(--text)}
.dark .fix span,.photo .fix span{background:none;border:0;color:var(--y);padding:0;display:block;margin-bottom:8px}
.list{margin-top:36px;display:flex;flex-direction:column;gap:22px}
.li{display:grid;grid-template-columns:64px 1fr;gap:22px;align-items:center;font-size:36px;line-height:1.3;font-weight:700;padding:24px 26px;background:#fff;color:#111;border:5px solid #111;box-shadow:8px 8px 0 #111}
.li b{width:64px;height:64px;background:var(--b);color:#fff;border:4px solid #111;display:grid;place-items:center;font-size:30px;border-radius:50%}
.dark .li,.photo .li{background:rgba(255,255,255,.07);color:var(--text);border:1px solid rgba(255,255,255,.16);box-shadow:none;border-radius:22px;font-weight:600}
.dark .li b,.photo .li b{background:linear-gradient(135deg,#ffe14d,#ff5d8f);color:#111;border:0}
.shot{margin-top:36px;height:520px;overflow:hidden;background:#fff;border:6px solid #111;box-shadow:12px 12px 0 #111;border-radius:6px}
.dark .shot,.photo .shot{border:1px solid rgba(255,255,255,.25);box-shadow:0 30px 70px rgba(0,0,0,.5);border-radius:18px}
.shot img{width:100%;height:100%;object-fit:cover;object-position:left top;display:block}
.chips{margin-top:30px;display:flex;flex-direction:column;gap:14px}
.chip{font-size:34px;font-weight:700}
.chip:before{content:'✓  ';color:var(--p);-webkit-text-stroke:1px #111}
.dark .chip:before,.photo .chip:before{color:var(--m);-webkit-text-stroke:0}
.cbtn{display:inline-block;align-self:flex-start;margin-top:56px;background:#fff;color:#111;border:6px solid #111;box-shadow:10px 10px 0 #111;font-size:38px;font-weight:700;padding:24px 42px}
.dark .cbtn,.photo .cbtn{background:linear-gradient(90deg,#3d5afe,#ff5d8f);border:0;border-radius:999px;color:#fff;box-shadow:0 0 50px rgba(255,93,143,.4)}
.vs{margin-top:34px;display:flex;flex-direction:column;gap:20px}
.side{padding:30px 34px;font-size:50px;line-height:1.15;font-weight:700;letter-spacing:-.02em;border:6px solid #111;box-shadow:10px 10px 0 #111;color:#111}
.side small{display:block;font:700 20px var(--mf),monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px;opacity:.7}
.side.l{background:#fff}.side.r{background:var(--y)}
.arrow{font-size:60px;line-height:1;text-align:center;font-weight:700}
.dark .side.l,.photo .side.l{background:rgba(255,255,255,.06);color:var(--text);border:1px solid rgba(255,255,255,.16);box-shadow:none;border-radius:24px}
.dark .side.r,.photo .side.r{background:linear-gradient(135deg,#ffe14d,#ff5d8f);color:#111;border:0;box-shadow:none;border-radius:24px}
.browser{margin-top:36px;background:#fff;border:6px solid #111;box-shadow:12px 12px 0 #111;border-radius:6px;overflow:hidden}
.browser .bar{height:44px;display:flex;align-items:center;gap:9px;padding:0 16px;background:var(--y);border-bottom:5px solid #111}
.browser .bar i{width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid #111;display:block}
.browser .bar span{margin-left:10px;font:700 15px var(--mf),monospace;color:#111}
.browser img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top}
.dark .browser,.photo .browser{border:1px solid rgba(255,255,255,.25);box-shadow:0 40px 90px rgba(0,0,0,.55);border-radius:18px}
.dark .browser .bar,.photo .browser .bar{background:#eef2f9;border-bottom:0}
.dark .browser .bar i,.photo .browser .bar i{background:#c9d3e4;border:0}
.dark .browser .bar span,.photo .browser .bar span{color:#637391}
.ask{margin-top:30px;display:inline-block;align-self:flex-start;padding:18px 30px;background:var(--y);border:5px solid #111;box-shadow:6px 6px 0 #111;font-size:34px;font-weight:700;color:#111}
.dark .ask,.photo .ask{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);box-shadow:none;border-radius:999px;color:var(--text)}
.collage{margin-top:20px;position:relative;height:700px;flex:none}
.collage .browser{position:absolute;width:560px;margin:0}
.collage .c0{left:0;top:0;transform:rotate(-5deg)}
.collage .c1{right:0;top:140px;transform:rotate(4deg);z-index:2}
.collage .c2{left:40px;top:290px;transform:rotate(-2deg);z-index:3}
.splitw{margin-top:30px;display:flex;flex-direction:column;gap:18px}
.splitw .browser{margin:0}
.splitw .lab{margin-top:12px;font-size:28px;font-weight:700}
.guess{margin-top:36px;height:560px;overflow:hidden;border:6px solid #111;box-shadow:12px 12px 0 #111;border-radius:6px;position:relative;flex:none}
.dark .guess,.photo .guess{border:1px solid rgba(255,255,255,.25);box-shadow:0 40px 90px rgba(0,0,0,.55);border-radius:28px}
.guess img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.guess .q{position:absolute;right:20px;top:20px;width:84px;height:84px;border-radius:50%;background:var(--p);border:5px solid #111;color:#111;display:grid;place-items:center;font-size:52px;font-weight:700}
.opts{margin-top:28px;display:flex;flex-direction:column;gap:16px}
.opt{padding:20px 26px;background:#fff;color:#111;border:4px solid #111;box-shadow:6px 6px 0 #111;font-size:34px;font-weight:700}
.dark .opt,.photo .opt{background:rgba(255,255,255,.1);color:var(--text);border:1px solid rgba(255,255,255,.22);box-shadow:none;border-radius:20px;font-weight:600}
.phone{margin-top:32px;border:6px solid #111;box-shadow:12px 12px 0 #111;background:#fff;border-radius:34px;padding:24px 22px 28px;color:#111;flex:none}
.dark .phone,.photo .phone{border:1px solid rgba(255,255,255,.25);box-shadow:0 40px 90px rgba(0,0,0,.45);background:#e9eef6}
.phone .who{display:flex;align-items:center;gap:16px;padding-bottom:18px;border-bottom:4px solid #111;font-size:28px;font-weight:700}
.phone .who b{width:60px;height:60px;border-radius:50%;background:var(--b);color:#fff;border:4px solid #111;display:grid;place-items:center;font-size:26px}
.phone .who small{display:block;font-size:20px;font-weight:500;color:#555}
.bub{margin-top:18px;max-width:86%;padding:20px 24px;border-radius:24px 24px 24px 6px;background:#eef1ff;border:3px solid #111;color:#111;font-size:30px;line-height:1.35;font-weight:500}
.bub time{display:block;text-align:right;font-size:18px;color:#666;margin-top:6px}
.annot{position:relative;line-height:0}
.annot img{width:100%;display:block}
.box{position:absolute;border:6px solid var(--p);border-radius:10px;box-shadow:0 0 0 3px #111}
.box b{position:absolute;left:-24px;top:-24px;width:52px;height:52px;border-radius:50%;background:var(--y);border:4px solid #111;color:#111;display:grid;place-items:center;font-size:28px;font-weight:800;line-height:1}
.notes{margin-top:30px;display:flex;flex-direction:column;gap:16px}
.note{display:grid;grid-template-columns:52px 1fr;gap:18px;align-items:start;font-size:32px;line-height:1.3;font-weight:700}
.note b{width:52px;height:52px;border-radius:50%;background:var(--y);border:4px solid #111;color:#111;display:grid;place-items:center;font-size:28px;font-weight:800}
.swipe{font:700 26px var(--mf),monospace;letter-spacing:.06em;text-transform:uppercase;margin-top:22px}
.dark .swipe,.photo .swipe{color:var(--muted)}
.o{stroke:var(--ol);stroke-width:6;stroke-linejoin:round;stroke-linecap:round}
.fy{fill:var(--y)}.fp{fill:var(--p)}.fb{fill:var(--b)}.fm{fill:var(--m)}.fo{fill:var(--o)}.fw{fill:#fff}.fk{fill:var(--ol)}
.dc svg{width:100%;height:100%;overflow:visible;display:block}
.dc.il svg{filter:drop-shadow(8px 8px 0 var(--sh))}
.dc.sh svg{filter:drop-shadow(5px 5px 0 var(--sh))}
.retro{width:100%;aspect-ratio:16/10;background:#000080 url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Ctext y=%2228%22 font-size=%2220%22 fill=%22%23ffffff22%22%3E%E2%98%85%3C/text%3E%3C/svg%3E');font-family:'Comic Sans MS','Comic Neue',cursive;color:#ffff00;padding:14px;display:flex;flex-direction:column;gap:10px}
.rt-head{text-align:center;font-size:26px;font-weight:700;color:#ff00ff;text-shadow:2px 2px #00ffff}
.rt-marq{background:#ffff00;color:#ff0000;font-size:18px;font-weight:700;padding:4px 8px;white-space:nowrap;overflow:hidden}
.rt-body{flex:1;display:grid;grid-template-columns:150px 1fr;gap:12px}
.rt-side{background:#c0c0c0;color:#0000ee;padding:10px;font-size:18px;line-height:1.7;border:3px outset #fff}
.rt-main{background:#fff;color:#000;padding:14px;font-size:19px;border:3px inset #888}
.rt-blink{color:#ff0000;font-weight:700;font-size:22px}
.rt-count{font-family:'Courier New',monospace;background:#000;color:#00ff00;padding:2px 6px;font-size:16px}
`;

const strip = (h = '') => String(h).replace(/<[^>]+>/g, '');
const fit = (html, size) => { const longest = Math.max(...strip(html).split(/\s+/).map((w) => w.length), 1); return Math.min(size, Math.floor(760 / (longest * 0.56))); };
const numClass = (n) => { const t = strip(n); const l = [...t].length; return (/\p{Extended_Pictographic}/u.test(t) ? 'emo ' : '') + (l > 4 ? 'n3' : l > 2 && !/\p{Extended_Pictographic}/u.test(t) ? 'n2' : ''); };

const render = (sl) => {
  switch (sl.type) {
    case 'hook': return `<div class="hcard"><div class="stk">${sl.kicker}</div><h1 class="t" style="font-size:${fit(sl.title, 104)}px">${sl.title}</h1></div><p class="s">${sl.sub}</p>`;
    case 'point': return `<div class="pcard"><div class="num ${numClass(sl.n)}">${sl.n}</div><h2 class="pt" style="font-size:${fit(sl.title, 80)}px">${sl.title}</h2><p class="pb">${sl.body}</p>${sl.fix ? `<div class="fix"><span>${sl.fixLabel || 'SOLUSI'}</span>${sl.fix}</div>` : ''}</div>`;
    case 'check': return `<h2 class="pt">${sl.title}</h2><div class="list">${sl.items.map((x, i) => `<div class="li"><b>${i + 1}</b><span>${x}</span></div>`).join('')}</div>`;
    case 'shot': return `<div class="k">${sl.kicker}</div><h2 class="pt">${sl.title}</h2><div class="shot"><img src="${sl.img}"></div><div class="chips">${sl.items.map((x) => `<div class="chip">${x}</div>`).join('')}</div>`;
    case 'vs': return `<div class="num ${numClass(sl.n)}" style="margin-top:0;margin-bottom:0;font-size:60px;height:110px;min-width:110px;border-radius:55px">${sl.n}</div><div class="vs"><div class="side l"><small>${sl.lt}</small>${sl.l}</div><div class="arrow">↓</div><div class="side r"><small>${sl.rt}</small>${sl.r}</div></div>`;
    case 'img': return `<div class="k">${sl.kicker}</div><h2 class="pt">${sl.title}</h2><div class="browser"><div class="bar"><i></i><i></i><i></i><span>${sl.label || (sl.html ? 'tokokami.blogspot.com' : 'Contoh desain')}</span></div>${sl.html || `<img src="${sl.img}"${sl.label ? ' style="object-position:left top"' : ''}>`}</div>${sl.ask ? `<div class="ask">${sl.ask}</div>` : ''}`;
    case 'collage': return `<div class="k">${sl.kicker}</div><h1 class="t" style="font-size:88px;line-height:1.02">${sl.title}</h1><div class="collage">${sl.imgs.map((x, i) => `<div class="browser c${i}"><div class="bar"><i></i><i></i><i></i></div><img src="${x}"></div>`).join('')}</div><p class="s" style="margin-top:8px">${sl.sub}</p>`;
    case 'split': return `<div class="k">${sl.kicker}</div><h1 class="t" style="font-size:64px">${sl.title}</h1><div class="splitw">${[[sl.imgA, sl.labelA, sl.htmlA], [sl.imgB, sl.labelB, sl.htmlB]].map(([im, lb, h]) => `<div><div class="browser"><div class="bar"><i></i><i></i><i></i><span>${h ? 'tokokami.blogspot.com' : 'Contoh desain'}</span></div>${h ? h.replace("class='retro'", "class='retro' style='aspect-ratio:16/6.4;font-size:.8em'") : `<img src="${im}" style="aspect-ratio:16/6.4">`}</div><div class="lab">${lb}</div></div>`).join('')}</div>`;
    case 'guess': return `<div class="k">${sl.kicker}</div><h2 class="pt">${sl.title}</h2><div class="guess"><img src="${sl.img}" style="object-position:${sl.pos};transform:scale(${sl.zoom});transform-origin:${sl.pos}"><div class="q">?</div></div><div class="opts">${sl.options.map((o) => `<div class="opt">${o}</div>`).join('')}</div>`;
    case 'chat': return `<div class="k">${sl.kicker}</div><h2 class="pt">${sl.title}</h2><div class="phone"><div class="who"><b>${sl.initial}</b><div>${sl.sender}<small>online</small></div></div>${sl.msgs.map(([m, t]) => `<div class="bub">${m}<time>${t}</time></div>`).join('')}</div>`;
    case 'annot': return `<div class="k">${sl.kicker}</div><h2 class="pt">${sl.title}</h2><div class="browser"><div class="bar"><i></i><i></i><i></i><span>${sl.label}</span></div><div class="annot"><img src="${sl.img}">${sl.boxes.map(([x, y, w, h], i) => `<div class="box" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"><b>${i + 1}</b></div>`).join('')}</div></div><div class="notes">${sl.notes.map((n, i) => `<div class="note"><b>${i + 1}</b><span>${n}</span></div>`).join('')}</div>`;
    case 'cta': return `<div class="ccard"><h2 class="t" style="font-size:${fit(sl.title, 92)}px">${sl.title}</h2><p class="s">${sl.sub}</p></div><div class="cbtn">${sl.handle}</div>`;
  }
};

// ---- decoration placement -------------------------------------------------------------------
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const re = deco.keywords.map(([n, r]) => [n, new RegExp(r, 'i')]);
const pick = (text) => { for (const [n, r] of re) if (r.test(text)) return n; return null; };
const BIG = { hook: 300, cta: 280, point: 230, check: 200, vs: 200 };
const SHAPES = Object.keys(deco.shapes);
const colorsFor = (theme) => (theme === 'blue' ? ['y', 'p', 'm', 'o', 'w'] : ['y', 'p', 'b', 'm', 'o', 'w']);
const hit = (a, b, m = 0) => a[0] < b[0] + b[2] + m && a[0] + a[2] > b[0] - m && a[1] < b[1] + b[3] + m && a[1] + a[3] > b[1] - m;

function place(set, sl, j, rects, usedIll, texts = [], visuals = []) {
  const r = rng(hash(set.slug + j));
  const items = [];
  const taken = [...rects];
  const free = (box, m = 36) => !taken.some((t) => hit(box, t, m));
  const big = BIG[sl.type];
  if (big) {
    const text = strip(`${sl.title || ''} ${sl.body || ''} ${sl.kicker || ''} ${sl.sub || ''}`).toLowerCase();
    let name = sl.type === 'cta' ? (/komen|comment/i.test(`${sl.sub} ${sl.handle}`) ? 'chat' : 'cursor') : pick(text + (sl.type === 'hook' ? ` ${set.slug.replace(/-/g, ' ')}` : ''));
    if (!name || (sl.type !== 'hook' && usedIll.has(name))) {
      const cyc = deco.cycle.filter((n) => !usedIll.has(n));
      name = cyc[(hash(set.slug) + j) % cyc.length] || deco.cycle[j % deco.cycle.length];
    }
    const order = [['TR', 'BL', 'BR', 'TL'], ['BR', 'TL', 'TR', 'BL'], ['TL', 'BR', 'BL', 'TR']][j % 3];
    done: for (const f of [1, 0.78, 0.6]) {
      const s = Math.round(big * f);
      const pos = { TR: [930 - s, 250], TL: [72, 250], BR: [930 - s, 1440 - s], BL: [72, 1440 - s] };
      for (const slot of order) {
        const [x, y] = pos[slot];
        if (free([x + s * 0.1, y + s * 0.1, s * 0.8, s * 0.8])) {
          items.push({ k: 'ill', n: name, x, y, s, r: Math.round((r() - 0.5) * 16) });
          taken.push([x, y, s, s]);
          usedIll.add(name);
          break done;
        }
      }
    }
  }
  const want = sl.type === 'hook' || sl.type === 'cta' ? 3 : 2;
  const cols = colorsFor(set.theme);
  const cand = [];
  for (const y of [255, 330, 1330, 1380]) for (const x of [72, 200, 340, 480, 620, 760, 850]) cand.push([x, y]);
  for (let i = cand.length - 1; i > 0; i--) { const k = Math.floor(r() * (i + 1)); [cand[i], cand[k]] = [cand[k], cand[i]]; }
  let n = 0;
  for (const [x, y] of cand) {
    if (n >= want) break;
    const s = 56 + Math.floor(r() * 44);
    if (x + s > 930 || y + s > 1440 || !free([x, y, s, s], 24)) continue;
    items.push({ k: 'shp', n: SHAPES[Math.floor(r() * SHAPES.length)], x, y, s, r: Math.round((r() - 0.5) * 50), c: cols[Math.floor(r() * cols.length)] });
    taken.push([x, y, s, s]);
    n++;
  }
  if (visuals.length && !big) {
    // sticker overlapping a corner of the main visual (screenshot / phone / photo frame)
    const v = visuals[0];
    const sz = 120 + Math.floor(r() * 30);
    const spots = [[Math.min(v[0] + v[2] - sz * 0.55, 930 - sz), v[1] - sz * 0.5], [Math.min(v[0] + v[2] - sz * 0.55, 930 - sz), v[1] + v[3] - sz * 0.5], [v[0] - sz * 0.35, v[1] + v[3] - sz * 0.5], [v[0] - sz * 0.35, v[1] - sz * 0.5]];
    for (const [x, y] of sl.type === 'guess' || sl.type === 'annot' ? spots.slice(1) : spots) {
      if (y < 250 || y + sz > 1450 || x < 40) continue;
      if (texts.some((t) => hit([x + sz * 0.12, y + sz * 0.12, sz * 0.76, sz * 0.76], t, 14))) continue;
      items.push({ k: 'shp', n: r() > 0.5 ? 'burst' : 'star4', x: Math.round(x), y: Math.round(y), s: sz, r: Math.round((r() - 0.5) * 30), c: cols[Math.floor(r() * cols.length)] });
      break;
    }
  }
  return items;
}

const decoHTML = (items) => items.map((d) => d.k === 'ill'
  ? `<div class="dc il" style="left:${d.x}px;top:${d.y}px;width:${d.s}px;height:${d.s}px;transform:rotate(${d.r}deg)"><svg viewBox="0 0 200 200">${deco.illustrations[d.n]}</svg></div>`
  : `<div class="dc sh" style="left:${d.x}px;top:${d.y}px;width:${d.s}px;height:${d.s}px;transform:rotate(${d.r}deg)"><svg viewBox="0 0 100 100" class="f${d.c}">${deco.shapes[d.n]}</svg></div>`).join('');

const slideHTML = (set, j, items) => {
  const sl = set.slides[j];
  const total = set.slides.length;
  const cls = set.theme === 'light' ? '' : ` ${set.theme}`;
  const last = j === total - 1;
  const bg = set.theme === 'photo' ? `<div class="bgimg" style="background-image:url('${sl.img || sl.imgA || sl.imgB || (sl.imgs && sl.imgs[0]) || set.slides[0].imgs?.[0] || ''}')"></div>` : '';
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="size" content="1080x1920"><style>${css}</style></head><body>
<div class="post${cls}">
  ${bg}
  <div class="top"><div class="brand" aria-label="Vanaila"><span class="lm"></span><span class="lw"></span></div><div class="count">${j + 1}/${total}</div></div>
  <div class="body">${render(sl)}</div>
  ${last ? '' : '<div class="swipe">Geser →</div>'}
  ${decoHTML(items)}
</div></body></html>`;
};

const executablePath = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => p && existsSync(p));
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const layout = {};
const problems = [];

async function measure(file) {
  await page.goto('file://' + file);
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const body = document.querySelector('.body').getBoundingClientRect();
    const els = [...document.querySelectorAll('.body > *, .body .num, .body .stk')];
    const rects = els.map((e) => { const q = e.getBoundingClientRect(); return [q.left, q.top, q.width, q.height]; });
    const top = Math.min(...rects.map((q) => q[1])), bottom = Math.max(...rects.map((q) => q[1] + q[3]));
    const VIS = '.browser,.shot,.guess,.phone,.collage';
    const visuals = [...document.querySelectorAll('.body .shot,.body .guess,.body .phone,.body .collage,.body > .browser')].map((e) => { const q = e.getBoundingClientRect(); return [q.left, q.top, q.width, q.height]; });
    const texts = [];
    const w = document.createTreeWalker(document.querySelector('.body'), NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode()); ) {
      if (!n.textContent.trim() || n.parentElement.closest(VIS)) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const q of r.getClientRects()) texts.push([q.left, q.top, q.width, q.height]);
    }
    return { rects, texts, visuals, overflow: bottom - top - body.height, bodyH: body.height };
  });
}

const jobs = [
  ...tiktok.map((set, i) => ({ set, id: `tt-${String(i + 1).padStart(2, '0')}-${set.slug}`, write: true })),
  ...videos.map((set, i) => ({ set, id: `vid-${String(i + 1).padStart(2, '0')}-${set.slug}`, write: false })),
];
for (const { set, id, write } of jobs) {
  const used = new Set();
  layout[id] = [];
  for (let j = 0; j < set.slides.length; j++) {
    const file = join(root, 'templates', write ? `${id}-s${j + 1}.html` : `_tmp-${id}-s${j + 1}.html`);
    writeFileSync(file, slideHTML(set, j, []));
    const m = await measure(file);
    if (m.overflow > 0) problems.push(`${id} s${j + 1} (${set.slides[j].type}) overflows by ${Math.round(m.overflow)}px`);
    const items = place(set, set.slides[j], j, m.rects, used, m.texts, m.visuals);
    layout[id].push(items);
    if (write) writeFileSync(file, slideHTML(set, j, items)); else unlinkSync(file);
  }
  console.log('built', id, set.slides.length, 'slides');
}
await browser.close();
writeFileSync(join(root, 'data/deco-layout.json'), JSON.stringify(layout));
if (problems.length) console.log('\nOVERFLOW:\n' + problems.join('\n'));
