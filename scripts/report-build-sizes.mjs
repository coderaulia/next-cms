import { gzipSync } from 'node:zlib';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }

    if (entry.isFile()) {
      const [details, content] = await Promise.all([stat(fullPath), readFile(fullPath)]);
      files.push({ path: fullPath, size: details.size, gzipSize: gzipSync(content, { level: 9 }).length });
    }
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

function summarizeFiles(root, files) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalGzipSize = files.reduce((sum, file) => sum + file.gzipSize, 0);
  const largest = [...files]
    .sort((left, right) => right.size - left.size)
    .slice(0, 10)
    .map((file) => ({
      path: relative(root, file.path).replace(/\\/g, '/'),
      size: file.size,
      gzipSize: file.gzipSize
    }));

  return { totalSize, totalGzipSize, largest };
}

async function reportDirectory(rootPath, label) {
  const absolute = resolve(rootPath);
  const files = await walkFiles(absolute);
  const summary = summarizeFiles(absolute, files);

  console.log(
    `${label}: ${formatBytes(summary.totalSize)} raw, ${formatBytes(summary.totalGzipSize)} gzip across ${files.length} files`
  );
  for (const file of summary.largest) {
    console.log(`  ${formatBytes(file.size).padStart(8)} raw  ${formatBytes(file.gzipSize).padStart(8)} gzip  ${file.path}`);
  }
  console.log('');
}

await reportDirectory('public', 'public/');
await reportDirectory('.next/static', '.next/static/');
await reportDirectory('.next/server', '.next/server/');
