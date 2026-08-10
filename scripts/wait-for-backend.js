import http from 'node:http';

const HEALTH_URL = process.env.DEV_HEALTH_URL || 'http://127.0.0.1:5000/health';
const MAX_WAIT_MS = Number(process.env.DEV_HEALTH_TIMEOUT_MS || 120000);
const INTERVAL_MS = 500;

function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get(HEALTH_URL, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

const start = Date.now();
console.log(`Waiting for API (${HEALTH_URL})…`);

while (Date.now() - start < MAX_WAIT_MS) {
  if (await checkHealth()) {
    console.log('API is ready — starting frontend.');
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
}

console.error(
  'Timed out waiting for the API. Check the backend terminal for MongoDB or port errors.',
);
process.exit(1);
