// Renders websites/<slug>.html (fictional, modern concept sites used as examples in posts) to assets/websites/<slug>.png (1440x900).
//   node scripts/build-websites.mjs [slug-filter]
import { chromium } from 'playwright-core';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const only = process.argv[2];
mkdirSync(join(root, 'assets/websites'), { recursive: true });
const executablePath = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => p && existsSync(p));
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const f of readdirSync(join(root, 'websites')).filter((x) => x.endsWith('.html') && (!only || x.includes(only)))) {
  await page.goto('file://' + join(root, 'websites', f));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(root, 'assets/websites', f.replace('.html', '.png')) });
  console.log('site', f);
}
await browser.close();
