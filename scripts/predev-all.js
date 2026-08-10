import { execSync } from 'node:child_process';

const PORTS = [5000, 5173, 5174];

function killPort(port) {
  try {
    execSync(`npx --yes kill-port ${port}`, { stdio: 'inherit', shell: true });
  } catch {
    /* already free */
  }
}

console.log('Preparing dev environment…');
for (const port of PORTS) {
  killPort(port);
}

await new Promise((resolve) => setTimeout(resolve, 1200));
