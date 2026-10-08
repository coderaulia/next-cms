import { Config } from '@remotion/cli/config';

// Use the Chromium headless shell that ships with this environment's Playwright, if present.
const shell = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (require('node:fs').existsSync(shell)) Config.setBrowserExecutable(shell);
} catch {}
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setCrf(22);
