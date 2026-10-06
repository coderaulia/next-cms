// Renders every templates/*.html to output/<name>.png. Default 1080x1350; override per file with <meta name="size" content="1080x1920">.
import { chromium } from 'playwright-core';
import { readdirSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
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
  const m = readFileSync(join(templatesDir, file), 'utf8').match(/<meta name="size" content="(\d+)x(\d+)"/);
  const [width, height] = m ? [Number(m[1]), Number(m[2])] : [1080, 1350];
  await page.setViewportSize({ width, height });
  await page.goto(pathToFileURL(join(templatesDir, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const out = join(outDir, basename(file, '.html') + '.png');
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height } });
  console.log('rendered', out.replace(root + '/', ''));
}
await browser.close();
