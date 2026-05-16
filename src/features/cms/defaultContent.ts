import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { CmsContent } from './types';

/**
 * Lazy-loaded default content fixture.
 *
 * The fixture data lives in `data/default-content.json` and is only read from
 * disk when explicitly requested via `getDefaultContent()`. This keeps the
 * server bundle lean and avoids allocating ~98 KB of fixture data at module
 * load time.
 */

let cached: CmsContent | null = null;

/**
 * Returns the default CMS content fixture, loading it lazily from disk on
 * first call. Subsequent calls return the cached copy.
 */
export function getDefaultContent(): CmsContent {
  if (cached) return cached;

  const filePath = join(process.cwd(), 'data', 'default-content.json');
  const raw = readFileSync(filePath, 'utf-8');
  cached = JSON.parse(raw) as CmsContent;
  return cached;
}
