import { existsSync } from 'node:fs';

import { config as loadEnv } from 'dotenv';

let loaded = false;

export function loadLocalEnvFiles() {
  if (loaded) return;

  for (const file of ['.env.local', '.env']) {
    if (existsSync(file)) {
      loadEnv({ path: file, override: false, quiet: true });
    }
  }

  loaded = true;
}

loadLocalEnvFiles();
