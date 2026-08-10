import { execSync } from 'node:child_process';
import net from 'node:net';

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
    setTimeout(() => done(false), 2000);
  });
}

try {
  execSync('npx --yes kill-port 5000', { stdio: 'inherit', shell: true });
} catch {
  /* port may already be free */
}

await new Promise((resolve) => setTimeout(resolve, 800));

if (await isPortOpen(DEV_MONGO_PORT)) {
  console.log(`Local MongoDB detected on port ${DEV_MONGO_PORT} — reusing existing database.`);
}
