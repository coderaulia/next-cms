// Interaction tests for every landing template (uses landing/.preview/*.html built with --local).
//   node landing/test.mjs [slug]
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const here = import.meta.dirname;
const only = process.argv[2];
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].find((p) => p && existsSync(p));
const browser = await chromium.launch({ ...(exe ? { executablePath: exe } : {}), args: ['--no-sandbox'] });
let failed = 0;

for (const f of readdirSync(join(here, '.preview')).filter((x) => x.endsWith('.html') && (!only || x.startsWith(only)))) {
  const slug = f.replace('.html', '');
  const res = [];
  const t = (name, ok, extra = '') => {
    res.push(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' ' + extra}`);
    if (!ok) failed++;
  };
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + join(here, '.preview', f));
  await p.waitForTimeout(300);
  await p.evaluate(() => { window.__o = []; window.open = (u) => { window.__o.push(u); }; });
  t('no js errors', errs.length === 0, errs.join(';'));

  const bad = await p.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.querySelector(h)));
  t('all #anchors exist', bad.length === 0, bad.join(','));

  if (await p.$('[data-tabs] .tab')) {
    const total = await p.$$eval('[data-tabs] .item', (x) => x.length);
    await p.click('[data-tabs] .tab:nth-child(2)');
    const vis = await p.$$eval('[data-tabs] .item', (x) => x.filter((i) => !i.hidden).length);
    t('tabs filter items', vis > 0 && vis < total, `${vis}/${total}`);
    await p.click('[data-tabs] .tab:nth-child(1)');
  }

  if (await p.$('.toggle button')) {
    const before = await p.$eval('[data-m]', (e) => e.textContent);
    await p.click('.toggle button:nth-child(2)');
    const after = await p.$eval('[data-m]', (e) => e.textContent);
    t('pricing toggle', before !== after, `${before} -> ${after}`);
  }

  const faq = await p.$$('.faq summary');
  if (faq.length > 1) {
    await faq[1].click();
    t('faq opens', await p.$eval('.faq details:nth-child(2)', (d) => d.open));
  }

  const s0 = await p.$eval('.tm-slide.on', (e) => e.textContent.slice(0, 20));
  await p.click('.tm .next');
  await p.waitForTimeout(200);
  const s1 = await p.$eval('.tm-slide.on', (e) => e.textContent.slice(0, 20));
  t('testimonial slider', s0 !== s1);

  const wb = await p.$('.items .btn, .plan .btn, .lrow .btn');
  if (wb) {
    await wb.scrollIntoViewIfNeeded();
    await wb.click();
    const o = await p.evaluate(() => window.__o.slice(-1)[0] || '');
    t('item button opens wa.me link', /^https:\/\/wa\.me\/\d+\?text=.+/.test(o), o);
  }
  await p.click('.wa');
  t('floating WhatsApp button', (await p.evaluate(() => window.__o.slice(-1)[0] || '')).startsWith('https://wa.me/'));

  const form = await p.$('#kontak form[data-form]');
  await form.scrollIntoViewIfNeeded();
  await p.evaluate(() => { window.__o = []; });
  await form.$eval('button[type=submit]', (x) => x.click());
  await p.waitForTimeout(100);
  t('form blocks empty submit', (await p.$$('#kontak .fld.bad')).length > 0 && (await p.evaluate(() => window.__o.length)) === 0);
  for (const el of await form.$$('input,select,textarea')) {
    const type = await el.getAttribute('type');
    const tag = await el.evaluate((x) => x.tagName);
    if (tag === 'SELECT') continue;
    if (type === 'date') await el.fill('2030-01-15');
    else if (type === 'number') await el.fill('3');
    else if (type === 'tel') await el.fill('081234567890');
    else await el.fill('Tes pengujian');
  }
  await form.$eval('button[type=submit]', (x) => x.click());
  await p.waitForTimeout(150);
  const url = await p.evaluate(() => window.__o.slice(-1)[0] || '');
  t('form submit opens wa.me with the details', /^https:\/\/wa\.me\/\d+\?text=.*Tes%20pengujian/.test(url), url.slice(0, 80));
  t('success message shown', await p.$eval('#kontak .ok', (e) => e.classList.contains('show')));

  await p.setViewportSize({ width: 390, height: 844 });
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.click('.burger');
  t('mobile menu opens', await p.$eval('.hdr', (h) => h.classList.contains('menu-open')));
  t('mobile links visible', await p.$eval('.links', (l) => getComputedStyle(l).display !== 'none'));
  await p.click('.links li:first-child a');
  t('mobile menu closes on link', !(await p.$eval('.hdr', (h) => h.classList.contains('menu-open'))));

  console.log(`\n${slug}\n  ` + res.join('\n  '));
  await p.close();
}
await browser.close();
console.log(failed ? `\nFAILED checks: ${failed}` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
