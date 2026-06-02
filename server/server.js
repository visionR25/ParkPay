/* ── PARKPAY FINE-LOOKUP SPIKE ──
 * Zero-dependency Node server (built-in http + global fetch; needs Node 18+).
 *
 *   MOCK_MODE=1 node server/server.js   # default — returns realistic sample data
 *   MOCK_MODE=0 node server/server.js   # LIVE — attempts the real Taranto scrape
 *
 * Endpoint:
 *   POST /api/fine-lookup  { pcn, vrm }
 *     -> { supported, found, status, amountDue, discountAmount,
 *          contraventionDate, dueDate, source, fetchedAt }
 *     amounts are in pence. supported:false  => app should deep-link instead.
 *   GET  /health -> { ok: true, mode }
 */

const http = require('http');
const { providerFor } = require('./providers');
const taranto = require('./taranto');

const PORT = process.env.PORT || 3000;
const MOCK = process.env.MOCK_MODE !== '0'; // default to mock

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function readJson(req, cb) {
  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 10_000) req.destroy(); });
  req.on('end', () => { try { cb(null, raw ? JSON.parse(raw) : {}); } catch (e) { cb(e); } });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return send(res, 200, { ok: true, mode: MOCK ? 'mock' : 'live' });
  }

  if (req.method === 'POST' && url.pathname === '/api/fine-lookup') {
    return readJson(req, async (err, body) => {
      if (err) return send(res, 400, { error: 'invalid JSON' });
      const pcn = String(body.pcn || '').toUpperCase().replace(/\s/g, '');
      const vrm = String(body.vrm || '').toUpperCase().replace(/\s/g, '');
      if (!/^[A-Z]{2}[A-Z0-9]{4,}$/.test(pcn)) return send(res, 400, { error: 'invalid pcn' });
      if (!vrm) return send(res, 400, { error: 'missing vrm' });

      const prov = providerFor(pcn);
      if (!prov) return send(res, 200, { supported: false }); // not a Taranto borough → deep-link

      try {
        const result = await taranto.lookup({ host: prov.host, pcn, vrm }, { mock: MOCK });
        return send(res, 200, { supported: true, fetchedAt: new Date().toISOString(), council: prov.council, ...result });
      } catch (e) {
        console.error('lookup failed:', e.message);
        return send(res, 200, { supported: true, found: false, error: 'lookup_failed' });
      }
    });
  }

  send(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`ParkPay fine-lookup spike on http://localhost:${PORT}  (mode: ${MOCK ? 'MOCK' : 'LIVE'})`);
});
