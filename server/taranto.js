/* ── TARANTO ADAPTER (Tier-A: plain HTTP, no headless browser) ──
 *
 * Flow:
 *   1) GET  https://{host}/PCNs/Ticket/FindTicket  → capture session cookie
 *      and the anti-forgery token from the form.
 *   2) POST the PCN reference + VRM back with that cookie/token.
 *   3) Parse the returned HTML for amount / status / dates.
 *
 * IMPORTANT — this is a SPIKE. The POST field names and the result-page
 * selectors below are best-effort and MUST be confirmed against the live form
 * (open DevTools → Network on a real submission and copy the exact field names
 * and the markup of the results page). That confirmation is the whole point of
 * the spike. Until then, `live` mode may return found:false; `mock` mode shows
 * the end-to-end app integration working cleanly.
 */

const UA = 'Mozilla/5.0 (compatible; ParkPay/0.1; +https://example.com)';

// Amounts are returned in pence to avoid floating-point money bugs.
function poundsToPence(str) {
  const n = Number(String(str).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

function ukDateToISO(str) {
  const m = String(str).match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!m) return null;
  const y = m[3].length === 2 ? '20' + m[3] : m[3];
  const d = new Date(Number(y), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

// Heuristic parser for the results page. Tune the regexes against the real HTML.
function parseResult(html, ctx) {
  if (!html || /no\s+(?:matching\s+)?(?:pcn|penalty|record|ticket)/i.test(html)) {
    return { found: false, ...ctx };
  }
  const amounts = [...html.matchAll(/£\s?(\d+(?:\.\d{2})?)/g)].map(m => poundsToPence(m[1]));
  const dates = [...html.matchAll(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/g)].map(m => ukDateToISO(m[1]));
  let status = 'open';
  if (/\b(paid|settled|cleared)\b/i.test(html)) status = 'paid';
  else if (/\b(cancelled|closed|written off)\b/i.test(html)) status = 'cancelled';
  else if (/\b(charge certificate|increased|debt|bailiff|enforcement)\b/i.test(html)) status = 'escalated';

  return {
    found: amounts.length > 0,
    status,
    amountDue: amounts.length ? Math.max(...amounts) : null,     // current amount payable
    discountAmount: amounts.length ? Math.min(...amounts) : null, // discounted amount, if shown
    contraventionDate: dates[0] || null,
    dueDate: dates.find(d => d && d > new Date().toISOString().slice(0, 10)) || null,
    ...ctx,
  };
}

async function lookupLive({ host, pcn, vrm }) {
  const formUrl = `https://${host}/PCNs/Ticket/FindTicket`;
  // 1) GET the form: cookie + anti-forgery token
  const getRes = await fetch(formUrl, { headers: { 'User-Agent': UA } });
  const formHtml = await getRes.text();
  const cookie = (getRes.headers.get('set-cookie') || '').split(',').map(c => c.split(';')[0]).join('; ');
  const token = (formHtml.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/) || [])[1];

  // 2) POST ref + vrm. NOTE: field names below are unverified guesses.
  const body = new URLSearchParams();
  if (token) body.set('__RequestVerificationToken', token);
  body.set('PcnReference', pcn);
  body.set('Vrm', vrm);

  const postRes = await fetch(formUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
      'Referer': formUrl,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body,
    redirect: 'follow',
  });
  const resultHtml = await postRes.text();
  return parseResult(resultHtml, { source: `taranto:${host}` });
}

// Deterministic, realistic sample so the app integration is demonstrable.
function lookupMock({ host, pcn }) {
  const now = new Date();
  const contravention = new Date(now); contravention.setDate(now.getDate() - 5);
  const discountDue = new Date(now); discountDue.setDate(now.getDate() + 9); // 14 days from issue
  return {
    found: true,
    status: 'open',
    amountDue: 13000,        // £130.00 full charge
    discountAmount: 6500,    // £65.00 if paid within discount window
    contraventionDate: contravention.toISOString().slice(0, 10),
    dueDate: discountDue.toISOString().slice(0, 10),
    source: `taranto:${host}`,
    note: 'mock',
  };
}

async function lookup(args, { mock = true } = {}) {
  return mock ? lookupMock(args) : lookupLive(args);
}

module.exports = { lookup, parseResult };
