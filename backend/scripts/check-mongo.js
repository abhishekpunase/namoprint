import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const uri = process.env.MONGO_URI;

function maskUri(value = '') {
  return value.replace(/\/\/[^@]+@/, '//<username>:<password>@');
}

if (!uri) {
  console.error('❌ MONGO_URI missing in backend/.env');
  process.exit(1);
}

if (uri.includes('<credentials>') || uri.includes('%3Ccredentials%3E')) {
  console.error('❌ MONGO_URI still has placeholder <credentials>');
  console.error('   Replace with real Atlas username & password from Database Access.');
  console.error('   Example: mongodb+srv://myuser:myPass%23123@cluster0....mongodb.net/printingwatch?...');
  process.exit(1);
}

console.log('Testing:', maskUri(uri));

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000, family: 4 });
  console.log('✅ MongoDB connected successfully!');
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  const msg = err.message || String(err);
  console.error('❌ Connection failed:', msg);

  if (msg.includes('authentication failed') || msg.includes('bad auth')) {
    console.error('\n→ Wrong username or password.');
    console.error('  Atlas → Database Access → verify user exists.');
    console.error('  Special chars in password must be URL-encoded (# → %23).');
    console.error('  Compass: paste full URI, do NOT use <credentials> placeholder.');
  } else if (msg.includes('whitelist') || msg.includes('Could not connect to any servers')) {
    console.error('\n→ IP not allowed on Atlas (most common).');
    console.error('  1. https://cloud.mongodb.com → your project');
    console.error('  2. Network Access → Add IP Address');
    console.error('  3. "Add Current IP Address" OR "Allow Access from Anywhere" (0.0.0.0/0) for dev');
    console.error('  4. Wait 1–2 minutes, then retry.');
  }

  console.error('\nCompass connection string format:');
  console.error('  mongodb+srv://USERNAME:ENCODED_PASSWORD@cluster0.qc0uwof.mongodb.net/printingwatch?retryWrites=true&w=majority');
  console.error('  (Get exact string: Atlas → Connect → Compass → Copy connection string → replace <password>)');
  console.error('\nTemporary dev option in backend/.env: USE_MEMORY_MONGO=true\n');
  process.exit(1);
}
