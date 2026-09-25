// Renders every templates/*.html to output/<name>.png at 1080x1350 (Instagram/LinkedIn portrait).
import { chromium } from 'playwright-core';
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const templatesDir = join(root, 'templates');
const outDir = join(root, 'output');
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

const executablePath = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', process.env.CHROMIUM_PATH]
  .find((p) => p && existsSync(p));

mkdirSync(outDir, { recursive: true });
const files = readdirSync(templatesDir)
  .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
  .filter((f) => !only || f.includes(only));

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
for (const file of files) {
  await page.goto(pathToFileURL(join(templatesDir, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const out = join(outDir, basename(file, '.html') + '.png');
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  console.log('rendered', out.replace(root + '/', ''));
}
await browser.close();
