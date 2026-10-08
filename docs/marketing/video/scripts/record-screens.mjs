// Screen-records real pages with Playwright (smooth auto-scroll) into public/recordings/*.webm.
// Those clips are then used inside Remotion compositions (ScreenTour) with <OffthreadVideo>.
//   npm run record                 # all targets
//   npm run record -- aura         # only targets whose name contains "aura"
import { chromium } from 'playwright-core';
import { mkdirSync, renameSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'public/recordings');
const tmpDir = join(outDir, '.tmp');
mkdirSync(tmpDir, { recursive: true });

// Records the real Vanaila site. Start it first from the repo root: `npm run dev` (or set SITE_URL).
// External CDNs (Tailwind CDN, Google image hosting) may be blocked in some environments,
// so the default targets are pages of this Next.js app, which use local assets only.
const SITE = process.env.SITE_URL || 'http://localhost:3000';
export const targets = [
  { name: 'site-home', url: `${SITE}/`, seconds: 14 },
  { name: 'site-hris', url: `${SITE}/hris`, seconds: 14 },
  { name: 'site-flowraze', url: `${SITE}/flowraze`, seconds: 14 },
  { name: 'site-psikotest', url: `${SITE}/psikotest`, seconds: 14 },
  { name: 'site-templates', url: `${SITE}/templates`, seconds: 12 },
];

const only = process.argv[2];
const executablePath = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', process.env.CHROMIUM_PATH].find((p) => p && existsSync(p));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
// Phone-sized viewport so the clip sits naturally inside a 9:16 video.
const size = { width: 540, height: 1080 };

for (const t of targets.filter((t) => !only || t.name.includes(only))) {
  // Warm-up visit (Next dev compiles a page on first request) without recording.
  const warm = await browser.newPage({ viewport: size });
  await warm.goto(t.url, { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {});
  await warm.close();

  const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1, recordVideo: { dir: tmpDir, size } });
  const page = await context.newPage();
  await page.goto(t.url, { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {});
  // Scroll-reveal sections stay hidden in headless capture; show them as fully revealed.
  await page.addStyleTag({ content: '.reveal-motion{opacity:1!important;transform:none!important;transition:none!important}' });
  await page.waitForTimeout(1500); // let fonts/images settle
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const steps = t.seconds * 60;
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(eased * Math.min(total, 9000)));
    await page.waitForTimeout(1000 / 60);
  }
  await page.waitForTimeout(800);
  const video = page.video();
  await context.close();
  const src = await video.path();
  const dest = join(outDir, `${t.name}.webm`);
  if (existsSync(dest)) unlinkSync(dest);
  renameSync(src, dest);
  console.log('recorded', dest.replace(root + '/', ''));
}
await browser.close();
for (const f of readdirSync(tmpDir)) unlinkSync(join(tmpDir, f));
