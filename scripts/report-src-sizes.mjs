import { gzipSync } from 'node:zlib';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const SOURCE_ROOT = resolve('src');
const FILE_LIMIT = 20;
const EXTENSIONS = new Set(['.ts', '.tsx', '.css']);

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (![...EXTENSIONS].some((extension) => entry.name.endsWith(extension))) {
      continue;
    }

    const [details, content] = await Promise.all([stat(fullPath), readFile(fullPath)]);
    files.push({
      path: fullPath,
      size: details.size,
      gzipSize: gzipSync(content, { level: 9 }).length
    });
  }

  return files;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = units[0];

  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024;
    unit = units[index];
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${unit}`;
}

function summarize(files) {
  return [...files]
    .sort((left, right) => right.size - left.size)
    .slice(0, FILE_LIMIT)
    .map((file) => ({
      path: relative(SOURCE_ROOT, file.path).replace(/\\/g, '/'),
      size: file.size,
      gzipSize: file.gzipSize,
      ratio: file.size === 0 ? 0 : file.gzipSize / file.size
    }));
}

const files = await walkFiles(SOURCE_ROOT);
const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
const totalGzipBytes = files.reduce((sum, file) => sum + file.gzipSize, 0);
const summary = summarize(files);

console.log(`src/: ${formatBytes(totalBytes)} raw, ${formatBytes(totalGzipBytes)} gzip across ${files.length} files`);
console.log('');

for (const file of summary) {
  console.log(
    `${formatBytes(file.size).padStart(8)} raw  ${formatBytes(file.gzipSize).padStart(8)} gzip  ${(file.ratio * 100)
      .toFixed(0)
      .padStart(3)}%  ${file.path}`
  );
}
