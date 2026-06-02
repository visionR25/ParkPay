/* ── PARKPAY APP.JS ── */

// ── PCN PREFIX DATABASE ──
// Maps PCN prefixes to council name + payment portal URL
const PCN_ISSUERS = {
  CR: { name: 'Croydon Council',        url: 'https://www.croydon.gov.uk/parking/parking-fines-penalty-charge-notices-or-pcns/pay-parking-fine-penalty-charge-notice-or-pcn' },
  JK: { name: 'Southwark Council',      url: 'https://pcnevidence.southwarkparking.co.uk/pcnonline/' },
  XY: { name: 'Barnet Council',         url: 'https://www.barnet.gov.uk/parking/pay-penalty-charge-notice-pcn' },
  TF: { name: 'Haringey Council',       url: 'https://haringey.gov.uk/parking/pcns-parking-traffic' },
  LJ: { name: 'Lambeth Council',        url: 'https://www.lambeth.gov.uk/parking/pay-parking-fine' },
  WX: { name: 'Westminster City Council', url: 'https://www.westminster.gov.uk/parking-and-streets/pay-parking-fine' },
  TK: { name: 'Tower Hamlets Council',  url: 'https://www.towerhamlets.gov.uk/lgnl/transport_and_streets/parking/parking_tickets.aspx' },
  HK: { name: 'Hackney Council',        url: 'https://hackney.gov.uk/parking-fines' },
  IS: { name: 'Islington Council',      url: 'https://www.islington.gov.uk/parking/pcns/pay-a-pcn' },
  CA: { name: 'Camden Council',         url: 'https://www.camden.gov.uk/pay-parking-fine' },
  KT: { name: 'Kingston Council',       url: 'https://www.kingston.gov.uk/parking-fines' },
  RB: { name: 'Richmond Council',       url: 'https://www.richmond.gov.uk/parking_fines' },
  BD: { name: 'Brent Council',          url: 'https://www.brent.gov.uk/parking/parking-fines' },
  EL: { name: 'Ealing Council',         url: 'https://www.ealing.gov.uk/info/201189/pay_a_parking_fine' },
  HL: { name: 'Hillingdon Council',     url: 'https://www.hillingdon.gov.uk/article/2049/Pay-a-parking-fine' },
  HW: { name: 'Hounslow Council',       url: 'https://www.hounslow.gov.uk/info/20073/parking_and_traffic_fines' },
  MR: { name: 'Merton Council',         url: 'https://www.merton.gov.uk/parking/pcns.htm' },
  ST: { name: 'Sutton Council',         url: 'https://www.sutton.gov.uk/parking/pay-penalty-charge-notice-pcn' },
  BM: { name: 'Birmingham City Council', url: 'https://www.birmingham.gov.uk/parking-fines' },
  MC: { name: 'Manchester City Council', url: 'https://www.manchester.gov.uk/info/500321/parking_fines' },
  LS: { name: 'Leeds City Council',     url: 'https://www.leeds.gov.uk/parking/pay-a-parking-fine' },
};

// Standard UK penalty charge amounts by band
const FINE_AMOUNTS = {
  bandA: 130, // London higher
  bandB: 80,  // London lower / outside London higher
  bandC: 70,  // Outside London lower
};

// Guess fine amount based on issuer (London vs outside)
function getFineAmount(issuerName) {
  const londonCouncils = ['Croydon','Southwark','Barnet','Haringey','Lambeth','Westminster','Tower Hamlets','Hackney','Islington','Camden','Kingston','Richmond','Brent','Ealing','Hillingdon','Hounslow','Merton','Sutton'];
  const isLondon = londonCouncils.some(c => issuerName.includes(c));
  return isLondon ? FINE_AMOUNTS.bandA : FINE_AMOUNTS.bandB;
}

// ── STATE ──
let state = {
  vehicles: [],
  activeVehicle: null,
  fines: [],
  currentFine: null,
  cameraStream: null,
  ocrWorker: null,
  scanning: false,
};

// ── STORAGE ──
function save() {
  localStorage.setItem('parkpay_vehicles', JSON.stringify(state.vehicles));
  localStorage.setItem('parkpay_activeVehicle', state.activeVehicle || '');
  localStorage.setItem('parkpay_fines', JSON.stringify(state.fines));
  const notifSettings = {
    n7: document.getElementById('notif-7')?.checked ?? true,
    n3: document.getElementById('notif-3')?.checked ?? true,
    n1: document.getElementById('notif-1')?.checked ?? true,
    n0: document.getElementById('notif-0')?.checked ?? false,
  };
  localStorage.setItem('parkpay_notifs', JSON.stringify(notifSettings));
}

function load() {
  state.vehicles = JSON.parse(localStorage.getItem('parkpay_vehicles') || '[]');
  state.activeVehicle = localStorage.getItem('parkpay_activeVehicle') || null;
  state.fines = JSON.parse(localStorage.getItem('parkpay_fines') || '[]');
  const notifs = JSON.parse(localStorage.getItem('parkpay_notifs') || '{}');
  if (document.getElementById('notif-7')) {
    document.getElementById('notif-7').checked = notifs.n7 ?? true;
    document.getElementById('notif-3').checked = notifs.n3 ?? true;
    document.getElementById('notif-1').checked = notifs.n1 ?? true;
    document.getElementById('notif-0').checked = notifs.n0 ?? false;
  }
}

// ── NAVIGATION ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + id);
  if (screen) screen.classList.add('active');

  // Update nav active states
  document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === id);
  });

  if (id === 'home') renderHome();
  if (id === 'history') renderHistory();
  if (id === 'settings') renderSettingsVehicles();
  if (id === 'scan') startCamera();
}

// ── TOAST ──
function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), duration);
}

// ── GREETING ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// ── HOME RENDER ──
function renderHome() {
  document.getElementById('home-greeting').textContent = getGreeting();
  document.getElementById('home-reg').textContent = state.activeVehicle || '—';
  document.getElementById('history-reg-sub').textContent = state.activeVehicle || '';

  const unpaid = state.fines.filter(f => !f.paid);
  const sub = unpaid.length > 0
    ? `${unpaid.length} fine${unpaid.length > 1 ? 's' : ''} need${unpaid.length === 1 ? 's' : ''} attention`
    : 'No unpaid fines';
  document.getElementById('home-sub').textContent = sub;

  // Notification dot
  const dot = document.getElementById('notif-dot');
  const urgent = unpaid.filter(f => {
    const days = daysUntil(f.deadline);
    return days !== null && days <= 3;
  });
  dot.classList.toggle('hidden', urgent.length === 0);

  // Render unpaid cards
  const section = document.getElementById('unpaid-section');
  section.innerHTML = '';
  if (unpaid.length > 0) {
    unpaid.forEach(fine => {
      const days = daysUntil(fine.deadline);
      const daysText = days !== null ? (days === 0 ? 'Today!' : `${days} day${days !== 1 ? 's' : ''} left`) : '';
      const div = document.createElement('div');
      div.className = 'unpaid-card';
      div.innerHTML = `
        <div class="unpaid-header">Unpaid fine${daysText ? ' · ' + daysText : ''}</div>
        <div class="unpaid-inner">
          <div>
            <div class="unpaid-ref">${fine.pcn}</div>
            <div class="unpaid-council">${fine.issuer}</div>
          </div>
          <div class="unpaid-amt">£${fine.amount}</div>
        </div>
      `;
      div.addEventListener('click', () => openFineDetail(fine));
      section.appendChild(div);
    });
  }
}

// ── HISTORY RENDER ──
function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  list.innerHTML = '';

  if (state.fines.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const unpaid = state.fines.filter(f => !f.paid);
  const paid = state.fines.filter(f => f.paid);

  if (unpaid.length > 0) {
    const label = document.createElement('div');
    label.className = 'history-section-label';
    label.textContent = 'Unpaid';
    list.appendChild(label);

    const card = document.createElement('div');
    card.className = 'card';
    unpaid.forEach(fine => {
      const row = createHistoryRow(fine);
      card.appendChild(row);
    });
    list.appendChild(card);
  }

  if (paid.length > 0) {
    const label = document.createElement('div');
    label.className = 'history-section-label';
    label.textContent = 'Paid';
    list.appendChild(label);

    const card = document.createElement('div');
    card.className = 'card';
    paid.forEach(fine => {
      const row = createHistoryRow(fine);
      card.appendChild(row);
    });
    list.appendChild(card);
  }
}

function createHistoryRow(fine) {
  const row = document.createElement('div');
  row.className = 'history-row';
  const days = daysUntil(fine.deadline);
  const badge = fine.paid
    ? `<span class="badge badge-paid">paid</span>`
    : `<span class="badge badge-unpaid">${days !== null && days <= 14 ? days + ' days left' : 'unpaid'}</span>`;
  row.innerHTML = `
    <div>
      <div class="hist-ref">${fine.pcn}</div>
      <div class="hist-meta">${fine.issuer} · ${formatDate(fine.dateAdded)}</div>
    </div>
    <div style="text-align:right;">
      <div class="hist-amt">£${fine.paid ? fine.paidAmount || fine.amount : fine.amount}</div>
      ${badge}
    </div>
  `;
  row.addEventListener('click', () => openFineDetail(fine));
  return row;
}

// ── FINE DETAIL ──
function openFineDetail(fine) {
  state.currentFine = fine;
  const days = daysUntil(fine.deadline);
  const discounted = Math.round(fine.amount / 2);

  document.getElementById('detail-council').textContent = fine.issuer;
  document.getElementById('detail-ref-sub').textContent = `${fine.pcn} · ${fine.reg}`;
  document.getElementById('detail-amount').textContent = `£${fine.amount}.00`;
  document.getElementById('detail-discount').textContent =
    days !== null && days >= 0
      ? `£${discounted}.00 if paid within ${days} day${days !== 1 ? 's' : ''}`
      : `Discount period may have expired`;
  document.getElementById('detail-contravention').textContent = fine.contravention || 'Parking contravention';
  document.getElementById('detail-date').textContent = formatDate(fine.dateAdded);
  document.getElementById('detail-deadline').textContent = fine.deadline ? formatDate(fine.deadline) : 'Within 14 days of issue';
  document.getElementById('detail-days').textContent =
    days !== null ? (days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : 'Today — last chance!') : '—';

  const payBtn = document.getElementById('pay-now-btn');
  payBtn.textContent = `Pay now · ${fine.issuer}`;
  payBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Pay now · ${fine.issuer}`;

  document.getElementById('mark-paid-btn').style.display = fine.paid ? 'none' : 'flex';

  showScreen('detail');
}

// ── CAMERA ──
async function startCamera() {
  stopCamera();
  const video = document.getElementById('camera-feed');
  document.getElementById('extracted-card').style.display = 'none';
  document.getElementById('scan-actions').style.display = 'none';
  document.getElementById('manual-form').style.display = 'none';
  document.getElementById('scan-status').textContent = 'Starting camera...';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    state.cameraStream = stream;
    video.srcObject = stream;
    document.getElementById('scan-status').textContent = 'Hold steady over the ticket...';

    // Auto-capture after 2.5 seconds
    setTimeout(() => captureAndOCR(), 2500);
  } catch (err) {
    console.error('Camera error:', err);
    document.getElementById('scan-status').textContent = 'Camera unavailable — use manual entry below';
    document.getElementById('manual-form').style.display = 'block';
  }
}

function stopCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(t => t.stop());
    state.cameraStream = null;
  }
}

async function captureAndOCR() {
  if (!state.cameraStream) return;
  document.getElementById('scan-status').textContent = 'Reading ticket...';

  const video = document.getElementById('camera-feed');
  const canvas = document.getElementById('scan-canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  try {
    const worker = await Tesseract.createWorker('eng');
    const { data: { text } } = await worker.recognize(canvas);
    await worker.terminate();
    processOCRText(text);
  } catch (err) {
    console.error('OCR error:', err);
    document.getElementById('scan-status').textContent = 'Could not read ticket — try manual entry';
    document.getElementById('manual-form').style.display = 'block';
  }
}

function processOCRText(text) {
  // Try to extract PCN reference (2 letters + 8 digits, common UK format)
  const pcnMatch = text.match(/\b([A-Z]{2}[0-9]{8})\b/i)
    || text.match(/\b([A-Z]{2}[0-9]{6,10})\b/i)
    || text.match(/\bPCN[:\s#]*([A-Z0-9]{6,12})\b/i)
    || text.match(/\bReference[:\s]*([A-Z0-9]{6,12})\b/i);

  // Try to extract vehicle registration
  const regMatch = text.match(/\b([A-Z]{2}[0-9]{2}\s?[A-Z]{3})\b/i)
    || text.match(/\b([A-Z][0-9]{1,3}\s?[A-Z]{3})\b/i);

  const pcn = pcnMatch ? pcnMatch[1].toUpperCase().replace(/\s/g, '') : null;
  const reg = regMatch ? regMatch[1].toUpperCase().replace(/\s/g, ' ').trim() : null;

  if (pcn) {
    const prefix = pcn.substring(0, 2).toUpperCase();
    const issuerInfo = PCN_ISSUERS[prefix] || { name: 'Unknown issuer — check ticket', url: '' };

    document.getElementById('ext-pcn').textContent = pcn;
    document.getElementById('ext-reg').innerHTML = reg
      ? `${reg} ${reg === state.activeVehicle ? '<span style="color:#2E7D32;font-size:11px;">✓ matches</span>' : ''}`
      : (state.activeVehicle || '—');
    document.getElementById('ext-issuer').textContent = issuerInfo.name;

    document.getElementById('extracted-card').style.display = 'block';
    document.getElementById('scan-actions').style.display = 'block';
    document.getElementById('scan-status').textContent = 'Details found — please confirm';
    stopCamera();
  } else {
    document.getElementById('scan-status').textContent = 'Could not find PCN number — try manual entry';
    document.getElementById('manual-form').style.display = 'block';
  }
}

// ── FINE BUILD ──
function buildFine(pcn, reg) {
  const prefix = pcn.substring(0, 2).toUpperCase();
  const issuerInfo = PCN_ISSUERS[prefix] || { name: 'Parking authority', url: '' };
  const amount = getFineAmount(issuerInfo.name);
  const now = new Date();
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + 14);

  return {
    id: Date.now().toString(),
    pcn: pcn.toUpperCase(),
    reg: reg || state.activeVehicle || '—',
    issuer: issuerInfo.name,
    paymentUrl: issuerInfo.url,
    amount: amount,
    contravention: 'Parking contravention',
    dateAdded: now.toISOString(),
    deadline: deadline.toISOString(),
    paid: false,
    paidAmount: null,
  };
}

function saveFine(fine) {
  // Avoid duplicate PCN
  const exists = state.fines.find(f => f.pcn === fine.pcn);
  if (!exists) {
    state.fines.unshift(fine);
    save();
  }
  return exists || fine;
}

// ── DATE HELPERS ──
function daysUntil(isoDate) {
  if (!isoDate) return null;
  const now = new Date();
  const target = new Date(isoDate);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatDate(isoDate) {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── VEHICLE SHEET ──
function openVehicleSheet() {
  renderVehicleSheet();
  document.getElementById('sheet-overlay').classList.remove('hidden');
  document.getElementById('vehicle-sheet').classList.remove('hidden');
  document.getElementById('add-vehicle-form').style.display = 'none';
}

function closeVehicleSheet() {
  document.getElementById('sheet-overlay').classList.add('hidden');
  document.getElementById('vehicle-sheet').classList.add('hidden');
}

function renderVehicleSheet() {
  const list = document.getElementById('sheet-vehicles-list');
  list.innerHTML = '';
  state.vehicles.forEach(reg => {
    const row = document.createElement('div');
    row.className = 'sheet-vehicle-row';
    const isActive = reg === state.activeVehicle;
    row.innerHTML = `
      <div>
        <div class="reg-plate ${isActive ? '' : 'inactive'}">${reg}</div>
        <div style="font-size:11px;color:#888;margin-top:4px;">${isActive ? 'Active' : 'Tap to switch'}</div>
      </div>
      <div style="display:flex;gap:12px;align-items:center;">
        ${isActive ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5A623" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        ${state.vehicles.length > 1 ? `<button class="btn-ghost" style="padding:4px;width:auto;color:#ccc;" data-delete="${reg}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>` : ''}
      </div>
    `;
    row.querySelector('.reg-plate')?.addEventListener('click', () => {
      state.activeVehicle = reg;
      save();
      renderVehicleSheet();
      renderHome();
      showToast(`Switched to ${reg}`);
    });
    row.querySelector('[data-delete]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      state.vehicles = state.vehicles.filter(v => v !== reg);
      if (state.activeVehicle === reg) state.activeVehicle = state.vehicles[0] || null;
      save();
      renderVehicleSheet();
      renderHome();
      showToast(`${reg} removed`);
    });
    list.appendChild(row);
  });
}

function renderSettingsVehicles() {
  const list = document.getElementById('settings-vehicles-list');
  if (!list) return;
  list.innerHTML = '';
  state.vehicles.forEach(reg => {
    const row = document.createElement('div');
    row.className = 'detail-row';
    const isActive = reg === state.activeVehicle;
    row.innerHTML = `
      <span class="det-key">${reg}</span>
      <span class="det-val" style="color:${isActive ? '#F5A623' : '#888'}">${isActive ? 'Active' : ''}</span>
    `;
    list.appendChild(row);
  });
}

// ── EVENT LISTENERS ──
document.addEventListener('DOMContentLoaded', () => {
  load();

  // Show onboarding or home
  if (state.vehicles.length === 0) {
    showScreen('onboarding');
  } else {
    showScreen('home');
  }

  // ── ONBOARDING ──
  document.getElementById('onboarding-btn').addEventListener('click', () => {
    const reg = document.getElementById('onboarding-reg').value.trim().toUpperCase();
    if (reg.length < 2) { showToast('Please enter your registration'); return; }
    state.vehicles = [reg];
    state.activeVehicle = reg;
    save();
    showScreen('home');
  });
  document.getElementById('onboarding-reg').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('onboarding-btn').click();
  });

  // ── BOTTOM NAV ──
  document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.screen;
      if (target === 'scan') { stopCamera(); startCamera(); }
      showScreen(target);
    });
  });

  // ── BACK BUTTONS ──
  document.querySelectorAll('.back-btn[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      stopCamera();
      showScreen(btn.dataset.back);
    });
  });

  // ── HOME ──
  document.getElementById('scan-btn').addEventListener('click', () => showScreen('scan'));
  document.getElementById('history-nav-btn').addEventListener('click', () => showScreen('history'));
  document.getElementById('vehicle-card').addEventListener('click', openVehicleSheet);
  document.getElementById('notif-btn').addEventListener('click', () => showScreen('settings'));

  // ── VEHICLE SHEET ──
  document.getElementById('sheet-overlay').addEventListener('click', closeVehicleSheet);
  document.getElementById('close-sheet').addEventListener('click', closeVehicleSheet);
  document.getElementById('add-vehicle-toggle').addEventListener('click', () => {
    const form = document.getElementById('add-vehicle-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') document.getElementById('new-reg-input').focus();
  });
  document.getElementById('save-new-reg').addEventListener('click', () => {
    const reg = document.getElementById('new-reg-input').value.trim().toUpperCase();
    if (reg.length < 2) { showToast('Please enter a valid registration'); return; }
    if (state.vehicles.includes(reg)) { showToast('Vehicle already saved'); return; }
    state.vehicles.push(reg);
    state.activeVehicle = reg;
    document.getElementById('new-reg-input').value = '';
    save();
    renderVehicleSheet();
    renderHome();
    showToast(`${reg} added`);
  });

  // ── SCAN ──
  document.getElementById('confirm-scan-btn').addEventListener('click', () => {
    const pcn = document.getElementById('ext-pcn').textContent.trim();
    const reg = state.activeVehicle;
    if (!pcn || pcn === '—') { showToast('No PCN found — try again'); return; }
    const fine = buildFine(pcn, reg);
    saveFine(fine);
    openFineDetail(fine);
  });

  document.getElementById('rescan-btn').addEventListener('click', () => {
    document.getElementById('extracted-card').style.display = 'none';
    document.getElementById('scan-actions').style.display = 'none';
    startCamera();
  });

  document.getElementById('manual-btn').addEventListener('click', () => {
    const form = document.getElementById('manual-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') {
      document.getElementById('manual-reg-input').value = state.activeVehicle || '';
    }
  });

  document.getElementById('manual-submit-btn').addEventListener('click', () => {
    const pcn = document.getElementById('manual-pcn').value.trim().toUpperCase();
    const reg = document.getElementById('manual-reg-input').value.trim().toUpperCase() || state.activeVehicle;
    if (!pcn) { showToast('Please enter a PCN reference'); return; }
    const fine = buildFine(pcn, reg);
    saveFine(fine);
    stopCamera();
    openFineDetail(fine);
  });

  // ── FINE DETAIL ──
  document.getElementById('pay-now-btn').addEventListener('click', () => {
    if (!state.currentFine) return;
    const url = state.currentFine.paymentUrl;
    if (url) {
      window.open(url, '_blank');
      showToast('Opening payment portal...');
    } else {
      showToast('Payment portal not found — search council website');
    }
  });

  document.getElementById('mark-paid-btn').addEventListener('click', () => {
    if (!state.currentFine) return;
    const fine = state.fines.find(f => f.id === state.currentFine.id);
    if (fine) {
      fine.paid = true;
      fine.paidAmount = Math.round(fine.amount / 2); // Assume discount was taken
      save();
      showToast('Marked as paid');
      showScreen('history');
    }
  });

  document.getElementById('challenge-btn').addEventListener('click', () => {
    showToast('Search your council website to challenge a fine');
  });

  // ── SETTINGS ──
  document.getElementById('settings-add-vehicle').addEventListener('click', () => {
    openVehicleSheet();
    setTimeout(() => {
      document.getElementById('add-vehicle-form').style.display = 'block';
      document.getElementById('new-reg-input').focus();
    }, 100);
  });

  ['notif-7','notif-3','notif-1','notif-0'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', save);
  });

  // ── NOTIFICATIONS ──
  scheduleNotificationCheck();
});

// ── NOTIFICATION CHECK ──
function scheduleNotificationCheck() {
  checkDeadlines();
  // Re-check every hour
  setInterval(checkDeadlines, 60 * 60 * 1000);
}

function checkDeadlines() {
  const notifSettings = {
    7: document.getElementById('notif-7')?.checked ?? true,
    3: document.getElementById('notif-3')?.checked ?? true,
    1: document.getElementById('notif-1')?.checked ?? true,
    0: document.getElementById('notif-0')?.checked ?? false,
  };

  const unpaid = state.fines.filter(f => !f.paid);
  unpaid.forEach(fine => {
    const days = daysUntil(fine.deadline);
    if (days === null) return;

    const thresholds = [7, 3, 1, 0].filter(t => notifSettings[t]);
    if (thresholds.includes(days)) {
      const alreadyShown = sessionStorage.getItem(`notif_${fine.id}_${days}`);
      if (!alreadyShown) {
        sessionStorage.setItem(`notif_${fine.id}_${days}`, '1');
        const msg = days === 0
          ? `Last chance! ${fine.pcn} discount expires today`
          : `Reminder: ${fine.pcn} discount expires in ${days} day${days !== 1 ? 's' : ''}`;
        showToast(msg, 5000);
      }
    }
  });
}

// ── SERVICE WORKER REGISTRATION ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('ParkPay SW registered'))
      .catch(err => console.log('SW error:', err));
  });
}
