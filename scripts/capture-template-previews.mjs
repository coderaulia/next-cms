// Captures preview screenshots for the static template registry.
// Usage: node scripts/capture-template-previews.mjs
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const slugs = [
  'maritim-corp',
  'vela',
  'kantor-hukum',
  'dcosta',
  'aura-property',
  'javanesa',
  'bdo-clth'
];

const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
];

const { existsSync } = await import('node:fs');
const executablePath = chromePaths.find((p) => existsSync(p));
if (!executablePath) {
  console.error('No Chrome/Edge executable found.');
  process.exit(1);
}

const outDir = resolve('public/templates-static/previews');
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

for (const slug of slugs) {
  const url = pathToFileURL(resolve(`public/templates-static/${slug}.html`)).href;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  // let fonts and entry animations settle
  await page.evaluate(() => document.fonts?.ready);
  await new Promise((r) => setTimeout(r, 1500));
  const out = `${outDir}/${slug}.jpg`;
  await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
  console.log('captured', out);
}

await browser.close();
