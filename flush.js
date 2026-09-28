const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const parts = line.split('=');
    const k = parts.shift();
    const v = parts.join('=');
    if(k && v) acc[k] = v.replace(/"/g, '').trim();
    return acc;
}, {});
process.env.KV_REST_API_URL = env.KV_REST_API_URL;
process.env.KV_REST_API_TOKEN = env.KV_REST_API_TOKEN;
const { kv } = require('@vercel/kv');
kv.flushdb().then(() => console.log('DB FLUSHED successfully.')).catch(console.error);
