import { spawn } from 'node:child_process';

const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm.cmd run build'] : ['run', 'build'];

const child = spawn(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    ANALYZE: 'true'
  }
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
