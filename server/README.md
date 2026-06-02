# ParkPay fine-lookup spike (Taranto)

A time-boxed proof of concept that fetches **live fine details** (amount, status,
deadline) from a council portal, instead of just deep-linking out. Scope: the six
**Taranto** boroughs, which share one portal system — Camden, Haringey, Hounslow,
Kingston, Tower Hamlets, City of London.

Zero dependencies — built-in `http` + global `fetch` (needs **Node 18+**).

## Run

```bash
# MOCK (default) — realistic sample data, no live council traffic. Use this to demo the app.
node server/server.js

# LIVE — attempts the real Tier-A scrape against the Taranto portal.
MOCK_MODE=0 node server/server.js
```

Then in `app.js` ensure `FINE_LOOKUP_ENDPOINT = 'http://localhost:3000'` (or your URL).
Open a fine for a Taranto borough → **Fetch live details**.

## API

```
POST /api/fine-lookup   { pcn, vrm }
  -> { supported, found, status, amountDue, discountAmount,
       contraventionDate, dueDate, council, source, fetchedAt }
     amounts are in PENCE. supported:false => app deep-links instead.
GET  /health -> { ok, mode }
```

## ⚠️ Status: spike, not production

- **MOCK mode works fully** and demonstrates the app integration cleanly.
- **LIVE mode is unverified against the real portal.** The POST field names
  (`PcnReference`, `Vrm`) and the results-page parsing in `taranto.js` are
  best-effort guesses. The first job before trusting LIVE is to open DevTools →
  Network on a real submission, copy the exact field names + result markup, and
  tune `lookupLive()` / `parseResult()`. That confirmation **is** the spike.

## Go / no-go questions this spike exists to answer

1. Can we POST the form (with cookie + anti-forgery token) and read the result?
2. Does the results page expose the data without a headless browser (Tier A)?
3. Do they rate-limit / block / CAPTCHA us once they see automated traffic?

If all green → extend to all six Taranto boroughs. If any red → stop and keep
deep-linking. See the in-app deep-link fallback (`supported:false`).

## Caveats before going beyond a spike

- **Legal/ToS:** automating a council/Taranto portal likely breaches their terms,
  even for the user's own PCN. See the "cleaner version" notes from the team.
- **Privacy/GDPR:** this sends VRM + PCN (personal data) through your server — you
  need a privacy policy and lawful-basis handling before real use.
- **Fragility:** any portal redesign breaks the parser; budget for maintenance.
