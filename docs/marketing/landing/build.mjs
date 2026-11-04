// Builds the landing-page templates: landing/sites/<slug>.mjs  ->  public/templates-static/<slug>.html (one self-contained file each).
//   node landing/build.mjs [slug]            # write real pages (Google Fonts)
//   node landing/build.mjs [slug] --local    # write landing/.preview/<slug>.html with local fonts (for screenshots in offline sandboxes)
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const here = import.meta.dirname;
const outDir = resolve(here, '../../../public/templates-static');
const prevDir = join(here, '.preview');
const css = readFileSync(join(here, 'base.css'), 'utf8');
const js = readFileSync(join(here, 'base.js'), 'utf8');
const args = process.argv.slice(2);
const local = args.includes('--local');
const only = args.find((a) => !a.startsWith('--'));

const P = {
  check: '<polyline points="20 6 9 17 4 12"/>', star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>', shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>', bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>', award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>', sparkle: '<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>', arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  left: '<polyline points="15 18 9 12 15 6"/>', right: '<polyline points="9 18 15 12 9 6"/>', cup: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>', globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>', sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>',
};
const ic = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[n] || P.sparkle}</svg>`;
const WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.3L2 22l4.8-1.2A11 11 0 1 0 20.5 3.5zm-8.4 17a9.2 9.2 0 0 1-4.7-1.3l-.3-.2-2.8.7.8-2.7-.2-.3a9.2 9.2 0 1 1 7.2 3.8zm5-6.9c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.6.1a7.5 7.5 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z"/></svg>';
const e = (s = '') => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/"/g, '&quot;');
const wa = (t) => `data-wa="${e(t)}"`;

const head = (s, kicker, title, lead, center) => `<div class="sec-head rv${center ? ' center' : ''}">${kicker ? `<span class="kicker">${kicker}</span>` : ''}<h2 class="h2">${title}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}</div>`;
const sec = (s, inner) => `<section class="sec${s.alt ? ' alt' : ''}" id="${s.id}"${s.style ? ` style="${s.style}"` : ''}><div class="wrap">${inner}</div></section>`;

const R = {
  features: (s) => sec(s, head(s, s.kicker, s.title, s.lead, s.center) + (s.variant === 'rows'
    ? `<div class="lrows">${s.items.map((i, n) => `<div class="lrow rv"><b>0${n + 1}</b><div><h3>${i.title}</h3><p>${i.text}</p></div>${i.wa ? `<button class="btn ghost sm" type="button" ${wa(i.wa)}>${i.cta || 'Tanya'}</button>` : '<span></span>'}</div>`).join('')}</div>`
    : `<div class="cards${s.variant === 'bento' ? ' bento' : ''}">${s.items.map((i) => `<article class="card rv"><div class="ico">${ic(i.icon)}</div><h3>${i.title}</h3><p>${i.text}</p></article>`).join('')}</div>`)),
  about: (s) => sec(s, `<div class="split${s.rev ? ' rev' : ''}"><div class="rv">${s.kicker ? `<span class="kicker">${s.kicker}</span>` : ''}<h2 class="h2">${s.title}</h2>${(s.text || []).map((t) => `<p class="lead" style="margin-bottom:14px">${t}</p>`).join('')}${s.checks ? `<ul class="checks">${s.checks.map((c) => `<li>${ic('check')}<span>${c}</span></li>`).join('')}</ul>` : ''}${s.cta ? `<a class="btn" href="${s.cta.href}">${s.cta.label}${ic('arrow')}</a>` : ''}${s.stats ? `<div class="stats">${s.stats.map((t) => `<div class="stat"><b data-count="${t.n}" data-suf="${t.suf || ''}">0</b><span>${t.l}</span></div>`).join('')}</div>` : ''}</div><div class="art rv" ${s.artStyle ? `style="${s.artStyle}"` : ''}>${s.art}</div></div>`),
  showcase: (s) => {
    const cats = [...new Set(s.items.map((i) => i.cat).filter(Boolean))];
    return sec(s, head(s, s.kicker, s.title, s.lead, s.center) + `<div data-tabs>${cats.length > 1 ? `<div class="tabs" role="tablist"><button class="tab on" data-cat="all" type="button">Semua</button>${cats.map((c) => `<button class="tab" data-cat="${e(c)}" type="button">${c}</button>`).join('')}</div>` : ''}<div class="items">${s.items.map((i) => `<article class="item rv" data-cat="${e(i.cat || '')}"><div class="pic" style="background:${i.bg || 'var(--acc-soft)'};color:${i.fg || 'var(--acc)'}">${i.tag ? `<em>${i.tag}</em>` : ''}${i.art || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[i.icon] || P.sparkle}</svg>`}</div><div class="bd"><h3>${i.name}</h3><p>${i.desc}</p><div class="ft"><span class="price">${i.price || ''}</span><button class="btn sm" type="button" ${wa(i.wa || `Halo, saya tertarik dengan ${i.name}.`)}>${s.btn || 'Pesan'}</button></div></div></article>`).join('')}</div></div>`);
  },
  pricing: (s) => sec(s, head(s, s.kicker, s.title, s.lead, true) + `<div data-pricing><div style="text-align:center">${s.toggle ? `<div class="toggle"><button class="on" data-k="m" type="button">Bulanan</button><button data-k="y" type="button">Tahunan</button></div>` : ''}</div><div class="plans">${s.plans.map((p) => `<article class="card plan rv${p.hot ? ' hot' : ''}"><div><h3 style="margin:0 0 6px">${p.name}${p.badge ? ` <small style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${p.badge}</small>` : ''}</h3><p>${p.desc}</p></div><div><span class="amt" ${p.y ? `data-m="${p.m}" data-y="${p.y}"` : ''}>${p.m}</span> <small>${p.unit || (p.y ? '/ bulan' : '')}</small></div><ul class="checks">${p.feats.map((f) => `<li>${ic('check')}<span>${f}</span></li>`).join('')}</ul><button class="btn" type="button" ${wa(p.wa || `Halo, saya tertarik paket ${p.name}.`)}>${p.cta || 'Pilih Paket'}</button></article>`).join('')}</div></div>`),
  steps: (s) => sec(s, head(s, s.kicker, s.title, s.lead, s.center) + `<div class="steps">${s.items.map((i) => `<div class="step rv"><h3>${i.title}</h3><p>${i.text}</p></div>`).join('')}</div>`),
  testimonials: (s) => sec(s, head(s, s.kicker, s.title, null, true) + `<div class="tm rv"><div class="tm-track">${s.items.map((t) => `<figure class="tm-slide"><div class="stars" aria-label="5 dari 5 bintang">${'<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'.repeat(5)}</div><blockquote>“${t.q}”</blockquote><cite><b>${t.n}</b>${t.r}</cite></figure>`).join('')}</div><div class="tm-nav"><button class="prev" type="button" aria-label="Sebelumnya">${ic('left')}</button><div class="dots"></div><button class="next" type="button" aria-label="Berikutnya">${ic('right')}</button></div></div>${s.note ? `<p class="note" style="text-align:center;margin-top:24px">${s.note}</p>` : ''}`),
  faq: (s) => sec(s, head(s, s.kicker, s.title, s.lead, true) + `<div class="faq">${s.items.map((i, n) => `<details class="rv"${n === 0 ? ' open' : ''}><summary>${i.q}</summary><p>${i.a}</p></details>`).join('')}</div>`),
  band: (s) => `<section class="sec" id="${s.id || 'ajakan'}" style="padding-top:0"><div class="wrap"><div class="band rv"><h2>${s.title}</h2><a class="btn" href="${s.href || '#kontak'}">${s.label}${ic('arrow')}</a></div></div></section>`,
  contact: (s) => {
    const f = s.fields, out = [];
    for (let i = 0; i < f.length; i++) {
      const fld = (x) => `<div class="fld"><label for="f-${x.name}">${x.label}${x.required ? ' *' : ''}</label>${x.type === 'select' ? `<select id="f-${x.name}" name="${x.name}"${x.required ? ' required' : ''}>${x.options.map((o) => `<option>${o}</option>`).join('')}</select>` : x.type === 'textarea' ? `<textarea id="f-${x.name}" name="${x.name}"${x.required ? ' required' : ''} placeholder="${e(x.ph || '')}"></textarea>` : `<input id="f-${x.name}" name="${x.name}" type="${x.type || 'text'}"${x.required ? ' required' : ''} placeholder="${e(x.ph || '')}"${x.min ? ` min="${x.min}"` : ''}>`}<span class="err">Wajib diisi</span></div>`;
      if (f[i].half && f[i + 1] && f[i + 1].half) { out.push(`<div class="two">${fld(f[i])}${fld(f[i + 1])}</div>`); i++; } else out.push(fld(f[i]));
    }
    return sec(s, `<div class="contact"><div class="rv">${s.kicker ? `<span class="kicker">${s.kicker}</span>` : ''}<h2 class="h2">${s.title}</h2><p class="lead">${s.lead}</p><div class="info">${s.info.map((i) => `<div><span class="ico">${ic(i.icon)}</span><p><b>${i.t}</b><span>${i.v}</span></p></div>`).join('')}</div></div><form class="card form rv" data-form data-intro="${e(s.intro)}" data-subject="${e(s.subject || 'Pesan dari website')}" novalidate>${out.join('')}<button class="btn" type="submit">${s.submit}${ic('arrow')}</button><p class="note">${s.note || 'Pesan akan dibuka di WhatsApp, tinggal kirim.'}</p><p class="ok" role="status"></p></form></div>`);
  },
};

function page(def) {
  const fontsG = def.fonts.map((f) => `family=${f.g}`).join('&');
  const fontLinks = local
    ? `<style>${def.fonts.map((f) => f.w.map((w) => `@import url('../../node_modules/@fontsource/${f.pkg}/${w}.css');`).join('') + (f.i ? `@import url('../../node_modules/@fontsource/${f.pkg}/400-italic.css');` : '')).join('')}</style>`
    : `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${fontsG}&display=swap" rel="stylesheet">`;
  const vars = Object.entries(def.vars).map(([k, v]) => `--${k}:${v}`).join(';');
  const ld = { '@context': 'https://schema.org', '@type': def.schema || 'LocalBusiness', name: def.name, description: def.description, telephone: def.phone || undefined, address: def.address ? { '@type': 'PostalAddress', streetAddress: def.address } : undefined };
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(def.title)}</title>
<meta name="description" content="${e(def.description)}">
<meta property="og:title" content="${e(def.title)}"><meta property="og:description" content="${e(def.description)}"><meta property="og:type" content="website">
<meta name="theme-color" content="${def.vars.bg}">
${fontLinks}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${css}:root{${vars}}${def.css || ''}</style>
</head>
<body data-style="${def.style || 'soft'}" data-wa-number="${def.wa}" data-mail="${def.mail || ''}">
<a class="skip" href="#main">Lewati ke konten</a>
<header class="hdr"><div class="wrap"><a class="brand" href="#top" aria-label="${e(def.name)}">${def.brand}</a><nav aria-label="Menu utama"><ul class="links">${def.nav.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}<li class="m-only"><a class="btn sm" href="${def.cta.href}">${def.cta.label}</a></li></ul></nav><a class="btn sm cta-top" href="${def.cta.href}">${def.cta.label}</a><button class="burger" type="button" aria-label="Menu" aria-expanded="false"><span></span></button></div></header>
<main id="main"><div id="top"></div>
${def.hero}
${def.sections.map((s) => R[s.type](s)).join('\n')}
</main>
<footer class="ftr"><div class="wrap"><div class="ftr-grid"><div><a class="brand" href="#top">${def.brand}</a><p>${def.footer.about}</p></div>${def.footer.cols.map((c) => `<div><h4>${c.t}</h4><ul>${c.links.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`).join('')}</div><div class="copy"><span>© <span data-year>2026</span> ${def.name}. Hak cipta dilindungi.</span><span>${def.footer.credit || 'Template oleh Vanaila Digital'}</span></div></div></footer>
<button class="wa" type="button" aria-label="Chat WhatsApp" ${wa(def.waText || 'Halo, saya ingin bertanya.')}>${WA_SVG}</button>
<script>${js}</script>
</body>
</html>
`;
}

mkdirSync(outDir, { recursive: true });
if (local) mkdirSync(prevDir, { recursive: true });
for (const f of readdirSync(join(here, 'sites')).filter((x) => x.endsWith('.mjs') && (!only || x.startsWith(only)))) {
  const def = (await import(join(here, 'sites', f))).default;
  const html = page(def);
  writeFileSync(join(local ? prevDir : outDir, `${def.slug}.html`), html);
  console.log(local ? 'preview' : 'built', def.slug, `${(html.length / 1024).toFixed(0)} KB`);
}
