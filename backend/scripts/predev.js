import { execSync } from 'node:child_process';
import net from 'node:net';

const API_PORT = Number(process.env.PORT || 5000);
const DEV_MONGO_PORT = Number(process.env.DEV_MONGO_PORT || 27027);

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const done = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    setTimeout(() => done(false), 1500);
  });
}

function killPortWindows(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      shell: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!/LISTENING/i.test(line)) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore', shell: true });
        console.log(`Killed PID ${pid} on port ${port}`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* nothing listening */
  }
}

function killPort(port) {
  try {
    execSync(`npx --yes kill-port ${port}`, { stdio: 'inherit', shell: true });
  } catch {
    /* may already be free */
  }
  if (process.platform === 'win32') {
    killPortWindows(port);
  }
}

async function waitUntilPortFree(port, maxWaitMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (!(await isPortOpen(port))) return true;
    killPort(port);
    await new Promise((r) => setTimeout(r, 800));
  }
  return !(await isPortOpen(port));
}

console.log(`Preparing API port ${API_PORT}…`);
killPort(API_PORT);
await new Promise((r) => setTimeout(r, 1000));

const free = await waitUntilPortFree(API_PORT);
if (!free) {
  console.error(`Port ${API_PORT} is still busy. Run: netstat -ano | findstr :${API_PORT}`);
  process.exit(1);
}
console.log(`Port ${API_PORT} is free.`);

if (await isPortOpen(DEV_MONGO_PORT)) {
  console.log(`Local MongoDB detected on port ${DEV_MONGO_PORT} — reusing existing database.`);
}
