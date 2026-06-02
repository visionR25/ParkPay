# ParkPay

Scan parking tickets and pay fines faster. A Progressive Web App (PWA) for UK drivers.

## Features

- Save your vehicle registration — set it once, never type it again
- Scan a parking ticket with your camera — OCR extracts the PCN reference automatically
- Manual entry fallback if scanning doesn't work
- Identifies the issuing council from the PCN prefix
- Shows fine amount, 50% discount deadline, and days remaining
- One tap to the correct council payment portal
- Fine history with paid/unpaid tracking
- Deadline reminder notifications (7 days, 3 days, 1 day before)
- Works offline after first load
- Installable to home screen on iOS and Android

## Project structure

```
parkpay/
├── index.html      — all screens and markup
├── style.css       — all styles
├── app.js          — all logic (navigation, OCR, storage, notifications)
├── manifest.json   — PWA install config
├── sw.js           — service worker (offline caching)
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Running locally

Because the app uses camera access and a service worker, it needs HTTPS or localhost. The easiest way:

```bash
# If you have Python installed (you almost certainly do):
cd parkpay
python3 -m http.server 8080
# Then open http://localhost:8080 in your browser
```

Or use the VS Code Live Server extension.

## Deploying to GitHub Pages

1. Create a new repository on GitHub (e.g. `parkpay`)
2. Push all files to the `main` branch
3. Go to Settings → Pages → Source: Deploy from branch → main → / (root)
4. Your app will be live at `https://yourusername.github.io/parkpay`

## Adding more councils

Open `app.js` and add entries to the `PCN_ISSUERS` object:

```js
AB: { name: 'Your Council', url: 'https://council-payment-portal-url' },
```

The key is the 2-letter prefix at the start of the PCN reference number.

## Notes

- No backend, no database, no accounts — all data is stored locally on the device
- The app never handles payment itself — it redirects to official council portals
- Camera OCR uses Tesseract.js loaded from CDN (cached after first use)
