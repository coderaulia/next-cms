// Renders Remotion compositions to ../output/video/<id>.mp4 (1080x1920, H.264, silent).
//   npm run render                    # every composition (52 carousels + tours + meme) — slow
//   npm run render -- tt-13 tour      # only ids containing any of the given words
//   npm run render -- --list          # list composition ids
//   npm run render -- --skip-existing # don't re-render ids that already have an mp4
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, '../output/video');
mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2).filter((a) => a !== '--only');
const list = args.includes('--list');
const skipExisting = args.includes('--skip-existing');
const filters = args.filter((a) => !a.startsWith('--'));

const shell = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.REMOTION_BROWSER || (existsSync(shell) ? shell : null);

console.log('bundling…');
const serveUrl = await bundle({ entryPoint: join(root, 'src/index.ts'), publicDir: join(root, 'public') });
const comps = await getCompositions(serveUrl, { browserExecutable });
const chosen = comps.filter((c) => !filters.length || filters.some((f) => c.id.includes(f)));
if (list) {
  for (const c of comps) console.log(c.id, `${(c.durationInFrames / c.fps).toFixed(1)}s`);
  process.exit(0);
}
for (const c of chosen) {
  const out = join(outDir, `${c.id}.mp4`);
  if (skipExisting && existsSync(out)) continue;
  const t0 = Date.now();
  await renderMedia({
    serveUrl,
    composition: c,
    codec: 'h264',
    crf: 23,
    outputLocation: out,
    browserExecutable,
    imageFormat: 'jpeg',
    jpegQuality: 90,
    concurrency: Number(process.env.CONCURRENCY) || null,
    chromiumOptions: { gl: 'swangle' },
  });
  console.log('rendered', out.replace(resolve(root, '..') + '/', ''), `${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
