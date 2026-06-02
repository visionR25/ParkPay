/* ── PARKPAY APP.JS ── */

// ── PCN PREFIX DATABASE ──
// Sources: PATROL authority directory (patrol.gov.uk) + London borough portals
// payUrl:     direct payment portal for that issuer
// confidence: 'high' (stated on an official source) | 'med' (single source) | 'low'
//             (unverified inference). Issuers learned from scanned tickets are stored
//             separately in state.learnedIssuers (confidence 'learned').

const PCN_ISSUERS = {
  // ── LONDON BOROUGHS (confirmed only) ──
  // Prefix = first 2 letters of the PCN reference. Every entry below was verified
  // against the council's own pay portal / official page. Unconfirmed boroughs were
  // removed — they self-learn per device when a real ticket is scanned.
  BZ: { name: 'London Borough of Barking and Dagenham', payUrl: 'https://parkingpayments.lbbd.gov.uk/3sc/', confidence: 'high' },
  BU: { name: 'London Borough of Barking and Dagenham', payUrl: 'https://parkingpayments.lbbd.gov.uk/3sc/', confidence: 'high' }, // legacy series, no longer issued
  XL: { name: 'London Borough of Bexley', payUrl: 'https://pcn.bexley.gov.uk/', confidence: 'high' },
  BT: { name: 'London Borough of Brent', payUrl: 'https://www.e-paycobalt.com/brent', confidence: 'high' },
  BY: { name: 'London Borough of Bromley', payUrl: 'https://parking.bromley.gov.uk/live-3sc-user/', confidence: 'high' },
  CU: { name: 'London Borough of Camden', payUrl: 'https://camden.tarantoportal.com/', confidence: 'high' },
  CL: { name: 'City of London', payUrl: 'https://cityoflondon.tarantoportal.com/PCNs', confidence: 'high' },
  CR: { name: 'London Borough of Croydon', payUrl: 'https://ocmlive.xrxpsc.com/Croydon/OCM-FE/OCM/', confidence: 'high' },
  EA: { name: 'London Borough of Ealing', payUrl: 'https://ealing.tarantoportal.com/', confidence: 'high' },
  AO: { name: 'London Borough of Ealing', payUrl: 'https://ealing.tarantoportal.com/', confidence: 'high' }, // alt series (EA/AO both valid)
  QZ: { name: 'London Borough of Hackney', payUrl: 'https://parkingdisputes.hackney.gov.uk/pcnonline/index.php', confidence: 'high' },
  HZ: { name: 'London Borough of Hammersmith and Fulham', payUrl: 'https://ocmlive.xrxpsc.com/lbhf/ocm-fe/ocm/', confidence: 'high' },
  ZN: { name: 'London Borough of Haringey', payUrl: 'https://haringey.tarantoportal.com/', confidence: 'high' },
  HR: { name: 'London Borough of Harrow', payUrl: 'https://www.harrow.gov.uk/parking-permits/parking-fines-traffic-violations', confidence: 'high' },
  HG: { name: 'London Borough of Havering', payUrl: 'https://parking.havering.gov.uk/pages/home.aspx', confidence: 'high' },
  NJ: { name: 'London Borough of Hounslow', payUrl: 'https://hounslow.tarantoportal.com/', confidence: 'high' },
  KE: { name: 'Royal Borough of Kensington and Chelsea', payUrl: 'https://ocmlive.xrxpsc.com/rbkc/ocm-fe/ocm/', confidence: 'high' }, // KE verified RBKC (Kent's real prefix unverified — see note in non-London section)
  QT: { name: 'Royal Borough of Kingston upon Thames', payUrl: 'https://kingston.tarantoportal.com/', confidence: 'high' },
  LJ: { name: 'London Borough of Lambeth', payUrl: 'https://pcnevidence.lambeth.gov.uk/pcnonline/index.php', confidence: 'high' },
  ZY: { name: 'London Borough of Lewisham', payUrl: 'https://pcnevidence.lewisham.gov.uk/pcnonline/', confidence: 'high' },
  LX: { name: 'London Borough of Lewisham', payUrl: 'https://pcnevidence.lewisham.gov.uk/pcnonline/', confidence: 'high' }, // alt series (ZY/LX both valid)
  MT: { name: 'London Borough of Merton', payUrl: 'https://parking.merton.gov.uk/PCNs/Ticket/FindTicket', confidence: 'high' },
  AF: { name: 'London Borough of Redbridge', payUrl: 'https://enforcement.redbridge.gov.uk/', confidence: 'high' },
  RT: { name: 'London Borough of Richmond upon Thames', payUrl: 'https://www.richmond.gov.uk/how_to_pay_pcn', confidence: 'high' },
  JK: { name: 'London Borough of Southwark', payUrl: 'https://pcnevidence.southwarkparking.co.uk/pcnonline/', confidence: 'high' },
  TT: { name: 'London Borough of Tower Hamlets', payUrl: 'https://towerhamlets.tarantoportal.com/', confidence: 'high' },
  FR: { name: 'London Borough of Waltham Forest', payUrl: 'https://waltham-forest.keyivr.com/', confidence: 'high' },
  WE: { name: 'Westminster City Council', payUrl: 'https://pcnpayment.westminster.gov.uk', confidence: 'high' },
  WS: { name: 'Westminster City Council', payUrl: 'https://pcnpayment.westminster.gov.uk', confidence: 'high' },
  WM: { name: 'Westminster City Council', payUrl: 'https://pcnpayment.westminster.gov.uk', confidence: 'high' },

  // ── ENGLAND OUTSIDE LONDON (PATROL members) ──
  AD: { name: 'Adur District Council', payUrl: 'https://www.adur-worthing.gov.uk/parking/pay-a-penalty-charge-notice/' },
  AX: { name: 'Adur District Council', payUrl: 'https://www.adur-worthing.gov.uk/parking/pay-a-penalty-charge-notice/' },
  AV: { name: 'Amber Valley Borough Council', payUrl: 'https://www.parksmarter.org.uk/' },
  AR: { name: 'Arun District Council', payUrl: 'https://www.arun.gov.uk/pcn' },
  AZ: { name: 'Arun District Council', payUrl: 'https://www.arun.gov.uk/pcn' },
  AQ: { name: 'Ashfield District Council', payUrl: 'https://www.nottinghamshire.gov.uk/transport/parking/challenge-parking-fine' },
  AS: { name: 'Ashford Borough Council', payUrl: 'https://pcnpayappeal.ashford.gov.uk/' },
  KF: { name: 'Ashford Borough Council', payUrl: 'https://pcnpayappeal.ashford.gov.uk/' },
  BG: { name: 'Basingstoke and Deane Borough Council', payUrl: 'https://www.basingstoke.gov.uk/pcn' },
  PA: { name: 'Basingstoke and Deane Borough Council', payUrl: 'https://www.basingstoke.gov.uk/pcn' },
  BJ: { name: 'Barnsley Metropolitan Borough Council', payUrl: 'https://www.councilparking.org/barnsley/pages/OnlinePCNEntry.aspx' },
  BI: { name: 'Basildon Borough Council', payUrl: 'https://www.chelmsford.gov.uk/parking-and-travel/parking-fines/' },
  BF: { name: 'Bedford Borough Council', payUrl: 'https://www.bedford.gov.uk/parking-roads-and-travel/parking/street-parking/fines/' },
  BM: { name: 'Birmingham City Council', payUrl: 'https://www.birmingham.gov.uk/info/20221/penalty_charge_notices_pcn' },
  JJ: { name: 'Birmingham City Council', payUrl: 'https://www.birmingham.gov.uk/info/20221/penalty_charge_notices_pcn' },
  BN: { name: 'Bath and North East Somerset Council', payUrl: 'https://parking.bathnes.gov.uk/pages/OnlinePCNEntry.aspx' },
  DB: { name: 'Blackburn with Darwen Borough Council', payUrl: 'https://ocmlive.xrxpsc.com/blackburn/ocm-fe/ocm/default.aspx' },
  BP: { name: 'Blackpool Council', payUrl: 'https://www.blackpool.gov.uk/Residents/Parking-roads-and-transport/Parking/Parking-fine-tickets.aspx' },
  BO: { name: 'Bolton Council', payUrl: 'https://www.bolton.gov.uk/parking-permits' },
  BH: { name: 'Brighton and Hove City Council', payUrl: 'https://www.brighton-hove.gov.uk/parking-and-travel/parking/challenge-or-appeal-your-penalty-charge-notice-pcn-including-bus' },
  BS: { name: 'Bristol City Council', payUrl: 'https://www.bristol.gov.uk/parking/appeal-a-parking-or-bus-lane-fine' },
  OB: { name: 'Bristol City Council', payUrl: 'https://www.bristol.gov.uk/parking/appeal-a-parking-or-bus-lane-fine' },
  BC: { name: 'Bury Metropolitan Borough Council', payUrl: 'http://www.bury.gov.uk/parkingappeals' },
  YB: { name: 'Cambridge City Council', payUrl: 'https://www.cambridge.gov.uk/parking' },
  FC: { name: 'Cambridgeshire County Council', payUrl: 'https://ocmlive.xrxpsc.com/cambridge/ocm-fe/ocm/Default.aspx' },
  CT: { name: 'Canterbury City Council', payUrl: 'http://www.canterbury.gov.uk/parking' },
  KB: { name: 'Canterbury City Council', payUrl: 'http://www.canterbury.gov.uk/parking' },
  QC: { name: 'Cardiff Council', payUrl: 'https://www.cardiff.gov.uk/ENG/resident/Parking-roads-and-travel/Parking-fines/Pages/default.aspx' },
  CX: { name: 'Calderdale Borough Council', payUrl: 'https://parkinggw.calderdale.gov.uk/pcn/' },
  CH: { name: 'Cheshire East Council', payUrl: 'https://www.cheshireeast.gov.uk/parking/penalty_charge_notice_pcn.aspx' },
  CV: { name: 'Coventry City Council', payUrl: 'https://www.coventry.gov.uk/parking-fines' },
  DA: { name: 'Darlington Borough Council', payUrl: 'https://www.darlington.gov.uk/transport-and-streets/parking/penalty-charge-notices-pcns/' },
  DE: { name: 'Derby City Council', payUrl: 'https://www.derby.gov.uk/transport-and-streets/parking/penalty-charge-notices/' },
  DO: { name: 'Doncaster Metropolitan Borough Council', payUrl: 'https://www.doncaster.gov.uk/services/transport-and-streets/parking-fine-pcn' },
  DU: { name: 'Durham County Council', payUrl: 'https://www.durham.gov.uk/pcn' },
  EX: { name: 'Exeter City Council', payUrl: 'https://www.exeter.gov.uk/parking/penalty-charge-notices/' },
  GA: { name: 'Gateshead Council', payUrl: 'https://www.gateshead.gov.uk/article/1673/Penalty-Charge-Notices' },
  GL: { name: 'Gloucester City Council', payUrl: 'https://www.gloucester.gov.uk/parking/penalty-charge-notice/' },
  HX: { name: 'Hartlepool Borough Council', payUrl: 'https://www.hartlepool.gov.uk/info/200059/parking/1056/penalty_charge_notices' },
  HE: { name: 'Herefordshire Council', payUrl: 'https://www.herefordshire.gov.uk/parking-1/penalty-charge-notices' },
  HU: { name: 'Hull City Council', payUrl: 'https://www.hull.gov.uk/parking/parking-fines' },
  IP: { name: 'Ipswich Borough Council', payUrl: 'https://www.ipswich.gov.uk/pcn' },
  GB: { name: 'Ipswich Borough Council', payUrl: 'https://www.ipswich.gov.uk/pcn' },
  // KE reassigned to Kensington & Chelsea (verified). Kent's real prefix is unverified — needs checking before re-adding:
  // Kent County Council → https://www.kent.gov.uk/roads-and-travel/parking/penalty-charge-notices
  KI: { name: 'Kirklees Council', payUrl: 'https://www.kirklees.gov.uk/beta/parking-penalty-notices/pay-parking-penalty.aspx' },
  KN: { name: 'Knowsley Metropolitan Borough Council', payUrl: 'https://www.knowsley.gov.uk/residents/roads-parking-and-transport/parking-penalty-charge-notices' },
  LA: { name: 'Lancashire County Council', payUrl: 'https://www.lancashire.gov.uk/roads-parking-and-travel/parking/penalty-charge-notices/' },
  LD: { name: 'Leeds City Council', payUrl: 'https://www.leeds.gov.uk/parking/pay-a-parking-fine' },
  LE: { name: 'Leicester City Council', payUrl: 'https://www.leicester.gov.uk/transport-and-streets/parking/parking-fines/' },
  LI: { name: 'Lincolnshire County Council', payUrl: 'https://www.lincolnshire.gov.uk/parking/penalty-charge-notices' },
  LV: { name: 'Liverpool City Council', payUrl: 'https://parking.liverpool.gov.uk/pcn/' },
  LU: { name: 'Luton Borough Council', payUrl: 'https://www.luton.gov.uk/Transport_and_streets/Parking/Pages/PenaltyChargeNotice.aspx' },
  MA: { name: 'Manchester City Council', payUrl: 'https://www.manchester.gov.uk/info/500321/parking_fines' },
  MD: { name: 'Medway Council', payUrl: 'https://www.medway.gov.uk/info/200165/parking/331/parking_fines' },
  MI: { name: 'Middlesbrough Council', payUrl: 'https://www.middlesbrough.gov.uk/open-data-foi-and-have-your-say/parking/penalty-charge-notices-pcns' },
  MK: { name: 'Milton Keynes City Council', payUrl: 'https://www.milton-keynes.gov.uk/parking/penalty-charge-notices' },
  NA: { name: 'Newcastle upon Tyne City Council', payUrl: 'https://www.newcastle.gov.uk/services/parking/penalty-charge-notices-pcns' },
  NO: { name: 'Norfolk County Council', payUrl: 'https://parking.west-norfolk.gov.uk/pages/OnlinePCNEntry.aspx' },
  NH: { name: 'Northampton Borough Council', payUrl: 'https://www.northamptonshire.gov.uk/councilservices/roads-and-transport/parking/pages/parking-fines.aspx' },
  NU: { name: 'Northumberland County Council', payUrl: 'https://www.northumberland.gov.uk/Transport/Parking/Penalties.aspx' },
  NG: { name: 'Nottingham City Council', payUrl: 'https://www.nottinghamcity.gov.uk/parking' },
  NY: { name: 'North Yorkshire Council', payUrl: 'https://www.northyorks.gov.uk/roads-and-transport/parking/penalty-charge-notices' },
  OX: { name: 'Oxford City Council', payUrl: 'https://www.oxford.gov.uk/info/20180/parking_fines' },
  PE: { name: 'Peterborough City Council', payUrl: 'https://www.peterborough.gov.uk/residents/parking/penalty-charge-notices' },
  PL: { name: 'Plymouth City Council', payUrl: 'https://www.plymouth.gov.uk/parkingfines' },
  PO: { name: 'Portsmouth City Council', payUrl: 'https://www.portsmouth.gov.uk/services/parking/penalty-charge-notices/' },
  PR: { name: 'Preston City Council', payUrl: 'https://www.chipsidelancashire.org/' },
  RD: { name: 'Bournemouth, Christchurch and Poole Council', payUrl: 'https://www.bcpcouncil.gov.uk/Quicklinks/fwlanding/parking.aspx' },
  RO: { name: 'Rochdale Metropolitan Borough Council', payUrl: 'https://www.rochdale.gov.uk/parking/penalty-charge-notices/' },
  RU: { name: 'Rugby Borough Council', payUrl: 'https://www.rugby.gov.uk/parking/penalty-charge-notices' },
  SA: { name: 'Salford City Council', payUrl: 'https://www.salford.gov.uk/roads-travel-and-parking/parking/parking-fines/' },
  SB: { name: 'Sandwell Metropolitan Borough Council', payUrl: 'https://www.sandwell.gov.uk/parking/article/1055/Penalty_charge_notices' },
  SE: { name: 'Sefton Council', payUrl: 'https://www.sefton.gov.uk/parking/penalty-charge-notices.aspx' },
  SF: { name: 'Sheffield City Council', payUrl: 'https://www.sheffield.gov.uk/home/parking/penalty-charge-notice' },
  SH: { name: 'Shropshire Council', payUrl: 'https://www.shropshire.gov.uk/parking/penalty-charge-notices/' },
  SK: { name: 'Slough Borough Council', payUrl: 'https://www.slough.gov.uk/parking/penalty-charge-notices-1' },
  SL: { name: 'Solihull Metropolitan Borough Council', payUrl: 'https://www.solihull.gov.uk/Resident/ParkingandTravel/Parking/parkingfines' },
  SO: { name: 'Southampton City Council', payUrl: 'https://www.southampton.gov.uk/parking/parking-fines/' },
  SN: { name: 'Sunderland City Council', payUrl: 'https://www.sunderland.gov.uk/article/12531/Penalty-charge-notices' },
  SW: { name: 'Swindon Borough Council', payUrl: 'https://www.swindon.gov.uk/info/20025/roads_and_transport/89/parking_fines' },
  TM: { name: 'Tameside Metropolitan Borough Council', payUrl: 'https://www.tameside.gov.uk/parking/pcn' },
  TE: { name: 'Tees Valley / Stockton-on-Tees', payUrl: 'https://www.stockton.gov.uk/parking-and-roads/parking/penalty-charge-notices/' },
  TN: { name: 'Trafford Council', payUrl: 'https://www.trafford.gov.uk/residents/transport-and-streets/parking/Penalty-Charge-Notices.aspx' },
  WA: { name: 'Wakefield Metropolitan District Council', payUrl: 'https://www.wakefield.gov.uk/streets-and-travel/parking/fines-and-enforcement' },
  WL: { name: 'Walsall Council', payUrl: 'https://www.walsall.gov.uk/article/1505/Parking-fines-penalty-charge-notices-PCNs' },
  WR: { name: 'Warrington Borough Council', payUrl: 'https://www.warrington.gov.uk/pcn' },
  WI: { name: 'Wigan Council', payUrl: 'https://www.wigan.gov.uk/Resident/Parking/Penalty-Charge-Notices.aspx' },
  WO: { name: 'Wolverhampton City Council', payUrl: 'https://www.wolverhampton.gov.uk/article/1398/Penalty-charge-notices' },
  WC: { name: 'Worcester City Council', payUrl: 'https://www.worcester.gov.uk/parking' },
  YK: { name: 'York City Council', payUrl: 'https://www.york.gov.uk/ParkingFines' },

  // ── WALES (PATROL members) ──
  ZB: { name: 'Blaenau Gwent County Borough Council', payUrl: 'https://www.swpg.co.uk/' },
  PT: { name: 'Bridgend County Borough Council', payUrl: 'https://www.wppp.org.uk/' },
  CM: { name: 'Carmarthenshire County Council', payUrl: 'https://www.carmarthenshire.gov.wales/home/council-services/travel-roads-parking/parking/' },
  XC: { name: 'Caerphilly County Borough Council', payUrl: 'https://www.swpg.co.uk/' },
  CF: { name: 'Cardiff Council', payUrl: 'https://www.cardiff.gov.uk/ENG/resident/Parking-roads-and-travel/Parking-fines/Pages/default.aspx' },
  CG: { name: 'Ceredigion County Council', payUrl: 'https://www.ceredigion.gov.uk/resident/travel-roads-and-parking/parking/penalty-charge-notices/' },
  WP: { name: 'Wales Parking Partnership', payUrl: 'https://www.wppp.org.uk/' },
};

// ── STATE ──
let state = {
  vehicles: [],
  activeVehicle: null,
  fines: [],
  currentFine: null,
  cameraStream: null,
  scanAttempts: 0,
  maxScanAttempts: 5,
  learnedIssuers: {}, // prefix -> { name, payUrl, confidence, updated } (this device)
  remindersEnabled: false,
  historyFilter: 'all', // all | unpaid | paid (transient)
};

// ── STORAGE ──
function save() {
  localStorage.setItem('parkpay_vehicles', JSON.stringify(state.vehicles));
  localStorage.setItem('parkpay_activeVehicle', state.activeVehicle || '');
  localStorage.setItem('parkpay_fines', JSON.stringify(state.fines));
  localStorage.setItem('parkpay_learned', JSON.stringify(state.learnedIssuers));
  localStorage.setItem('parkpay_reminders', state.remindersEnabled ? '1' : '');
}

function load() {
  state.vehicles = JSON.parse(localStorage.getItem('parkpay_vehicles') || '[]');
  state.activeVehicle = localStorage.getItem('parkpay_activeVehicle') || null;
  state.fines = JSON.parse(localStorage.getItem('parkpay_fines') || '[]');
  state.learnedIssuers = JSON.parse(localStorage.getItem('parkpay_learned') || '{}');
  state.remindersEnabled = localStorage.getItem('parkpay_reminders') === '1';
}

// ── NAVIGATION ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + id);
  if (screen) screen.classList.add('active');
  document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === id);
  });
  if (id === 'home') renderHome();
  if (id === 'history') renderHistory();
  if (id === 'settings') renderSettingsVehicles();
  if (id === 'scan') initScan();
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

// ── LOOKUP COUNCIL FROM PREFIX ──
// Verified table first, then issuers this device has learned from scanned tickets.
function lookupCouncil(pcn) {
  const prefix = pcn.substring(0, 2).toUpperCase();
  return PCN_ISSUERS[prefix] || state.learnedIssuers[prefix] || null;
}

// ── LEARNED ISSUERS (discovered from tickets, stored per-device) ──

function normalizeUrl(raw) {
  if (!raw) return null;
  let url = String(raw).trim().replace(/\s+/g, '');
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url.replace(/^\/+/, '');
  try {
    const u = new URL(url);
    return u.hostname.includes('.') ? u.href : null;
  } catch (e) {
    return null;
  }
}

// Record a council's pay URL for an unrecognised prefix, stored on this device.
function learnIssuer(prefix, { name, payUrl }) {
  prefix = (prefix || '').toUpperCase();
  const url = normalizeUrl(payUrl);
  if (prefix.length !== 2 || !url) return null;
  const existing = state.learnedIssuers[prefix];
  const entry = {
    name: (name && name.trim()) || existing?.name || 'Council (added from ticket)',
    payUrl: url,
    confidence: 'learned',
    updated: new Date().toISOString(),
  };
  state.learnedIssuers[prefix] = entry;
  save();
  return entry;
}

// ── BUILD FINE RECORD (only real known data) ──
// `extra` may carry { payUrl, councilName } supplied by the user for an
// unrecognised prefix — when present, the issuer is learned before lookup.
function buildFine(pcn, reg, extra = {}) {
  const cleanPcn = pcn.trim().toUpperCase().replace(/\s/g, '');
  const cleanReg = (reg || state.activeVehicle || '').trim().toUpperCase();
  if (extra.payUrl && !lookupCouncil(cleanPcn)) {
    learnIssuer(cleanPcn.substring(0, 2), { name: extra.councilName, payUrl: extra.payUrl });
  }
  const council = lookupCouncil(cleanPcn);
  return {
    id: Date.now().toString(),
    pcn: cleanPcn,
    reg: cleanReg,
    councilName: council ? council.name : 'Unknown council',
    payUrl: council ? council.payUrl : (normalizeUrl(extra.payUrl) || null),
    confidence: council ? (council.confidence || 'high') : null,
    dateScanned: new Date().toISOString(),
    issueDate: extra.issueDate || null, // PCN date of issue; null => fall back to dateScanned
    paid: false,
    paidDate: null,
    known: !!council,
  };
}

function saveFine(fine) {
  const exists = state.fines.find(f => f.pcn === fine.pcn);
  if (!exists) {
    state.fines.unshift(fine);
    save();
    return fine;
  }
  return exists;
}

// ── FORMAT DATE ──
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// 'YYYY-MM-DD' for <input type="date">
function toDateInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}

// ── FINE-DETAILS LOOKUP (spike) ──
// Backend that fetches live fine details from the council portal. '' disables it.
const FINE_LOOKUP_ENDPOINT = 'http://localhost:3000';
const LOOKUP_PREFIXES = ['CU', 'ZN', 'NJ', 'QT', 'TT', 'CL']; // Taranto boroughs (one shared portal)
function isLookupSupported(pcn) {
  return LOOKUP_PREFIXES.includes(String(pcn || '').slice(0, 2).toUpperCase());
}

function formatMoney(pence) {
  return pence == null ? '—' : '£' + (pence / 100).toFixed(2);
}

// Whole days from today to an ISO date (negative = past).
function daysUntil(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return null;
  d.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
}

// ── DEADLINE / STATUS ──
const DISCOUNT_DAYS = 14; // standard 50% discount window from the PCN date of issue

function discountDeadline(fine) {
  const issue = fine.issueDate || fine.dateScanned;
  if (!issue) return null;
  const dl = new Date(issue);
  if (isNaN(dl)) return null;
  dl.setHours(0, 0, 0, 0);
  dl.setDate(dl.getDate() + DISCOUNT_DAYS);
  return dl;
}

// Whole days from today to the 50% discount deadline (negative = past).
function daysToDiscountDeadline(fine) {
  const dl = discountDeadline(fine);
  if (!dl) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((dl - today) / 86400000);
}

// Display status for a fine: { label, short, tone }. tone styles pills/banners.
function fineStatus(fine) {
  if (fine.paid) {
    return { label: `Paid${fine.paidDate ? ' · ' + formatDate(fine.paidDate) : ''}`, short: 'Paid', tone: 'paid' };
  }
  const d = daysToDiscountDeadline(fine);
  if (d === null) return { label: 'Tracked', short: '—', tone: 'neutral' };
  if (d < 0) return { label: 'Discount expired — full charge applies', short: 'Expired', tone: 'expired' };
  if (d === 0) return { label: 'Discount ends today', short: 'Today', tone: 'urgent' };
  if (d <= 5) return { label: `${d} day${d !== 1 ? 's' : ''} left for 50% discount`, short: `${d}d`, tone: 'urgent' };
  return { label: `${d} days left for 50% discount`, short: `${d}d`, tone: 'ok' };
}

function setFinePaid(id, paid) {
  const f = state.fines.find(x => x.id === id);
  if (!f) return;
  f.paid = paid;
  f.paidDate = paid ? new Date().toISOString() : null;
  save();
}

function setFineIssueDate(id, isoDate) {
  const f = state.fines.find(x => x.id === id);
  if (!f) return;
  f.issueDate = isoDate || null;
  save();
}

// ── REMINDER NOTIFICATIONS ──
// Web PWAs can't reliably fire notifications while fully closed (that needs push
// infrastructure). So we check when the app is opened and notify for unpaid fines
// whose discount deadline is near or passed — at most once per fine per day.
async function enableReminders() {
  if (!('Notification' in window)) { showToast('Notifications aren’t supported here'); return false; }
  let perm = Notification.permission;
  if (perm === 'default') perm = await Notification.requestPermission();
  if (perm !== 'granted') { showToast('Notifications are blocked — enable them in your browser'); return false; }
  state.remindersEnabled = true;
  save();
  checkReminders();
  showToast('Deadline reminders on');
  return true;
}

function disableReminders() {
  state.remindersEnabled = false;
  save();
}

function checkReminders() {
  if (!state.remindersEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
  const todayKey = new Date().toISOString().slice(0, 10);
  state.fines.forEach(fine => {
    if (fine.paid) return;
    const d = daysToDiscountDeadline(fine);
    if (d === null || d > 3) return;            // only within 3 days of (or past) the deadline
    if (fine.lastNotified === todayKey) return; // once per fine per day
    try {
      new Notification('Parking fine deadline', {
        body: `${fine.councilName} · ${fine.pcn} — ${fineStatus(fine).label}`,
        icon: './icons/icon-192.png',
        tag: 'parkpay-' + fine.id,
      });
      fine.lastNotified = todayKey;
      save();
    } catch (e) { /* ignore */ }
  });
}

// ── HOME ──
function renderHome() {
  document.getElementById('home-greeting').textContent = getGreeting();
  document.getElementById('home-reg').textContent = state.activeVehicle || '—';
  document.getElementById('history-reg-sub').textContent = state.activeVehicle || '';
  const unpaid = state.fines
    .filter(f => !f.paid)
    .sort((a, b) => (daysToDiscountDeadline(a) ?? 9999) - (daysToDiscountDeadline(b) ?? 9999));
  document.getElementById('home-sub').textContent =
    unpaid.length > 0 ? `${unpaid.length} fine${unpaid.length !== 1 ? 's' : ''} to pay` : 'No fines to pay';

  const section = document.getElementById('fines-section');
  section.innerHTML = '';
  if (unpaid.length === 0) {
    section.innerHTML = `
      <div class="all-clear">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>
        <div class="all-clear-title">You're all caught up</div>
        <div class="all-clear-sub">${state.fines.length ? 'No fines to pay right now' : 'Scan a ticket to get started'}</div>
      </div>`;
    return;
  }
  unpaid.slice(0, 3).forEach(fine => {
    const st = fineStatus(fine);
    const div = document.createElement('div');
    div.className = 'unpaid-card';
    div.innerHTML = `
      <div class="unpaid-header">${fine.councilName}</div>
      <div class="unpaid-inner">
        <div>
          <div class="unpaid-ref">${fine.pcn}</div>
          <div class="unpaid-council">${fine.reg} · ${formatDate(fine.dateScanned)}</div>
        </div>
        <span class="status-pill ${st.tone}">${st.short}</span>
      </div>
    `;
    div.addEventListener('click', () => openFineDetail(fine));
    section.appendChild(div);
  });
}

// ── HISTORY ──
function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  const filterBar = document.getElementById('history-filter');
  list.innerHTML = '';
  if (state.fines.length === 0) {
    empty.style.display = 'block';
    if (filterBar) filterBar.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  if (filterBar) filterBar.style.display = 'flex';

  const filter = state.historyFilter || 'all';
  const fines = state.fines.filter(f => filter === 'paid' ? f.paid : filter === 'unpaid' ? !f.paid : true);
  if (fines.length === 0) {
    list.innerHTML = `<div class="empty-inline">No ${filter === 'paid' ? 'paid' : 'unpaid'} fines</div>`;
    return;
  }

  const card = document.createElement('div');
  card.className = 'card';
  fines.forEach(fine => {
    const st = fineStatus(fine);
    const row = document.createElement('div');
    row.className = 'history-row' + (fine.paid ? ' is-paid' : '');
    row.innerHTML = `
      <div>
        <div class="hist-ref">${fine.pcn}</div>
        <div class="hist-meta">${fine.councilName}</div>
        <div class="hist-meta">${fine.reg} · ${formatDate(fine.dateScanned)}</div>
      </div>
      <span class="status-pill ${st.tone}">${st.short}</span>
    `;
    row.addEventListener('click', () => openFineDetail(fine));
    card.appendChild(row);
  });
  list.appendChild(card);
}

// ── FINE DETAIL ──
function openFineDetail(fine) {
  state.currentFine = fine;
  document.getElementById('detail-council').textContent = fine.councilName;
  document.getElementById('detail-ref-sub').textContent = `${fine.pcn} · ${fine.reg}`;
  document.getElementById('detail-pcn-val').textContent = fine.pcn;
  document.getElementById('detail-reg-val').textContent = fine.reg;
  document.getElementById('detail-council-val').textContent = fine.councilName;
  document.getElementById('detail-date-val').textContent = formatDate(fine.dateScanned);
  document.getElementById('detail-issue-date').value = toDateInput(fine.issueDate || fine.dateScanned);

  // Countdown / status banner — prefers live council data when present
  const banner = document.getElementById('detail-countdown');
  if (fine.live && fine.live.found && !fine.paid) {
    const days = fine.live.dueDate ? daysUntil(fine.live.dueDate) : null;
    const tone = days === null ? 'neutral' : days < 0 ? 'expired' : days <= 5 ? 'urgent' : 'ok';
    banner.className = 'countdown-banner ' + tone;
    const amt = formatMoney(fine.live.amountDue);
    banner.textContent = fine.live.dueDate
      ? `${amt} due · pay by ${formatDate(fine.live.dueDate)} (from council)`
      : `${amt} due (from council)`;
  } else {
    const st = fineStatus(fine);
    banner.className = 'countdown-banner ' + st.tone;
    banner.textContent = (fine.paid || daysToDiscountDeadline(fine) === null)
      ? st.label
      : `${st.label} · pay by ${formatDate(discountDeadline(fine).toISOString())}`;
  }

  // Live details card + fetch button
  renderLiveDetails(fine);
  const fetchBtn = document.getElementById('fetch-live-btn');
  const supported = fine.known && FINE_LOOKUP_ENDPOINT && isLookupSupported(fine.pcn);
  fetchBtn.style.display = supported ? 'block' : 'none';
  fetchBtn.textContent = (fine.live && fine.live.found) ? 'Refresh live details' : 'Fetch live details';

  // Mark paid / unpaid button reflects current state
  const markBtn = document.getElementById('mark-paid-btn');
  markBtn.textContent = fine.paid ? 'Mark as unpaid' : 'Mark as paid';
  markBtn.classList.toggle('is-paid', !!fine.paid);

  const payBtn = document.getElementById('pay-now-btn');
  if (fine.payUrl) {
    payBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View &amp; pay fine`;
    payBtn.disabled = false;
  } else {
    payBtn.innerHTML = `Council portal not found`;
    payBtn.disabled = true;
  }

  const unknownMsg = document.getElementById('unknown-council-msg');
  unknownMsg.style.display = fine.known ? 'none' : 'block';

  // For recognised-but-not-high-confidence issuers, warn that the link is a best guess.
  const confMsg = document.getElementById('detail-confidence-msg');
  const confNotes = {
    med: 'This council was matched with medium confidence — please check the payment page shows your PCN before paying.',
    low: 'This council match is unverified — please check the payment page shows your PCN before paying.',
    learned: 'This payment link was added from a scanned ticket — please check it shows your PCN before paying.',
  };
  const note = fine.known ? confNotes[fine.confidence] : null;
  if (note) {
    document.getElementById('detail-confidence-text').textContent = note;
    confMsg.style.display = 'flex';
  } else {
    confMsg.style.display = 'none';
  }

  showScreen('detail');
}

// Ask the backend to fetch live fine details from the council portal.
async function fetchLiveDetails(fine) {
  if (!FINE_LOOKUP_ENDPOINT) return;
  const btn = document.getElementById('fetch-live-btn');
  btn.disabled = true;
  btn.textContent = 'Fetching…';
  try {
    const res = await fetch(`${FINE_LOOKUP_ENDPOINT}/api/fine-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pcn: fine.pcn, vrm: fine.reg }),
    });
    const data = await res.json();
    if (!data.supported) {
      showToast('Live details aren’t available for this council yet');
    } else if (data.found) {
      fine.live = data;
      save();
      showToast('Live details updated');
    } else {
      showToast('Couldn’t find this PCN on the council portal');
    }
  } catch (e) {
    showToast('Couldn’t reach the lookup service');
  } finally {
    btn.disabled = false;
    openFineDetail(fine); // refresh card + button label
  }
}

// Render the live-details card from cached council data on the fine.
function renderLiveDetails(fine) {
  const el = document.getElementById('live-details');
  if (!fine.live || !fine.live.found) { el.style.display = 'none'; return; }
  const l = fine.live;
  const rows = [];
  if (l.amountDue != null) rows.push(['Amount due', formatMoney(l.amountDue)]);
  if (l.discountAmount != null && l.discountAmount !== l.amountDue) rows.push(['If paid now', formatMoney(l.discountAmount)]);
  if (l.status) rows.push(['Status', l.status]);
  if (l.contraventionDate) rows.push(['Contravention', formatDate(l.contraventionDate)]);
  if (l.dueDate) rows.push(['Pay by', formatDate(l.dueDate)]);
  el.innerHTML = `
    <div class="card-label" style="margin-bottom:8px;">From the council portal${l.note === 'mock' ? ' · sample data' : ''}</div>
    ${rows.map(([k, v]) => `<div class="detail-row"><span class="det-key">${k}</span><span class="det-val">${v}</span></div>`).join('')}
    <p class="field-hint">Fetched ${formatDate(l.fetchedAt)}. Always confirm on the council page before paying.</p>`;
  el.style.display = 'block';
}

// ── CAMERA / SCAN ──
function initScan() {
  state.scanAttempts = 0;
  resetScanUI();
  startCamera();
}

function resetScanUI() {
  document.getElementById('extracted-card').style.display = 'none';
  document.getElementById('scan-actions').style.display = 'none';
  document.getElementById('manual-form').style.display = 'none';
  document.getElementById('manual-btn').style.display = 'flex';
  setScanStatus('Hold camera steady over the ticket...');
  document.getElementById('manual-pcn').value = '';
  document.getElementById('manual-reg-input').value = state.activeVehicle || '';
}

function setScanStatus(msg) {
  document.getElementById('scan-status').textContent = msg;
}

async function startCamera() {
  stopCamera();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    state.cameraStream = stream;
    const video = document.getElementById('camera-feed');
    video.srcObject = stream;
    await video.play();
    setScanStatus('Hold camera steady over the ticket...');
    // Auto-attempt after 2 seconds to allow camera to focus
    setTimeout(() => attemptCapture(), 2000);
  } catch (err) {
    setScanStatus('Camera unavailable — please use manual entry below');
    document.getElementById('manual-form').style.display = 'block';
    document.getElementById('manual-btn').style.display = 'none';
  }
}

function stopCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(t => t.stop());
    state.cameraStream = null;
  }
}

async function attemptCapture() {
  if (!state.cameraStream) return;
  state.scanAttempts++;
  setScanStatus(`Scanning... (attempt ${state.scanAttempts} of ${state.maxScanAttempts})`);

  const video = document.getElementById('camera-feed');
  const canvas = document.getElementById('scan-canvas');

  // Crop to the scan frame area (centre 75% x 55% of frame)
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const cropX = Math.floor(vw * 0.125);
  const cropY = Math.floor(vh * 0.225);
  const cropW = Math.floor(vw * 0.75);
  const cropH = Math.floor(vh * 0.55);

  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  try {
    const worker = await Tesseract.createWorker('eng');
    await worker.setParameters({
      // Allow lowercase + URL punctuation so a printed pay link survives OCR
      // (PCN/reg matching upper-cases the text first, so this doesn't affect them).
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ./:-?=',
    });
    const { data } = await worker.recognize(canvas);
    await worker.terminate();

    const result = extractPCNFromText(data.text);

    if (result.pcn) {
      stopCamera();
      showExtractedDetails(result.pcn, result.reg, result.payUrl, result.issueDate);
    } else if (state.scanAttempts < state.maxScanAttempts) {
      // Retry after 1.5 seconds
      setTimeout(() => attemptCapture(), 1500);
    } else {
      setScanStatus('Could not read PCN — please use manual entry');
      document.getElementById('manual-form').style.display = 'block';
      document.getElementById('manual-btn').style.display = 'none';
      stopCamera();
    }
  } catch (err) {
    console.error('OCR error:', err);
    if (state.scanAttempts < state.maxScanAttempts) {
      setTimeout(() => attemptCapture(), 1500);
    } else {
      setScanStatus('Scan failed — please use manual entry');
      document.getElementById('manual-form').style.display = 'block';
      document.getElementById('manual-btn').style.display = 'none';
      stopCamera();
    }
  }
}

function extractPCNFromText(text) {
  const upper = text.toUpperCase();

  // PCN format: 2 letters + 6-10 digits (covers most UK council formats)
  const pcnPatterns = [
    /\b([A-Z]{2}[0-9]{8})\b/,
    /\b([A-Z]{2}[0-9]{7})\b/,
    /\b([A-Z]{2}[0-9]{6})\b/,
    /\b([A-Z]{2}[0-9]{9})\b/,
    /\b([A-Z]{2}[0-9]{10})\b/,
  ];

  let pcn = null;
  for (const pattern of pcnPatterns) {
    const match = upper.match(pattern);
    if (match) {
      // Verify the prefix is a known council
      const prefix = match[1].substring(0, 2);
      if (PCN_ISSUERS[prefix]) {
        pcn = match[1];
        break;
      }
    }
  }

  // If no known prefix found, still try any 2-letter + digit pattern
  if (!pcn) {
    for (const pattern of pcnPatterns) {
      const match = upper.match(pattern);
      if (match) { pcn = match[1]; break; }
    }
  }

  // Try to extract vehicle reg: standard UK formats
  const regPatterns = [
    /\b([A-Z]{2}[0-9]{2}\s?[A-Z]{3})\b/, // AB12 CDE (post-2001)
    /\b([A-Z][0-9]{1,3}\s?[A-Z]{3})\b/,   // A123 BCD (pre-2001 suffix)
    /\b([A-Z]{3}\s?[0-9]{1,3}[A-Z])\b/,   // ABC 123D (pre-2001 prefix)
  ];

  let reg = null;
  for (const pattern of regPatterns) {
    const match = upper.match(pattern);
    if (match) { reg = match[1].replace(/\s/g, ' ').trim(); break; }
  }

  // If no reg found from ticket, use saved vehicle
  if (!reg) reg = state.activeVehicle || null;

  // Best-effort: pull a payment URL printed on the ticket (used as a fallback
  // when the PCN prefix isn't recognised). OCR is noisy, so this is only a hint.
  const payUrl = extractPayUrl(text);
  const issueDate = extractIssueDate(text);

  return { pcn, reg, payUrl, issueDate };
}

// Best-effort date of issue from the ticket text. Returns ISO string or null.
function extractIssueDate(text) {
  if (!text) return null;
  const months = 'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';
  const now = new Date();
  const ok = d => !isNaN(d) && d.getFullYear() > 2015 && d <= now;
  // 12/03/2026 · 12-03-26 · 12.03.2026 (day first, UK format)
  let m = text.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/);
  if (m) {
    const y = m[3].length === 2 ? '20' + m[3] : m[3];
    const d = new Date(Number(y), Number(m[2]) - 1, Number(m[1]));
    if (ok(d)) return d.toISOString();
  }
  // 12 March 2026 · 12 Mar 2026
  m = text.match(new RegExp(`\\b(\\d{1,2})\\s+(${months})[a-z]*\\s+(\\d{4})\\b`, 'i'));
  if (m) {
    const d = new Date(`${m[1]} ${m[2]} ${m[3]}`);
    if (ok(d)) return d.toISOString();
  }
  return null;
}

// Find a council/portal pay link in the raw OCR text. Returns a normalized URL or null.
function extractPayUrl(text) {
  if (!text) return null;
  const m = text.match(
    /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9.\-]*\.(?:gov\.uk|gov\.wales|org\.uk|co\.uk|com|org)(?:\/[^\s]*)?)/i
  );
  return m ? normalizeUrl(m[1]) : null;
}

let pendingIssueDate = null; // issue date OCR'd on the current scan, applied on confirm

function showExtractedDetails(pcn, reg, ocrUrl, issueDate) {
  pendingIssueDate = issueDate || null;
  const council = lookupCouncil(pcn);
  document.getElementById('ext-pcn').textContent = pcn;
  document.getElementById('ext-reg').textContent = reg || '—';

  const issuerEl = document.getElementById('ext-issuer');
  const addBox = document.getElementById('ext-add-council');

  if (council) {
    issuerEl.textContent = council.name;
    issuerEl.style.color = '';
    applyConfidence(council.confidence || 'high');
    addBox.style.display = 'none';
  } else {
    issuerEl.textContent = 'Not recognised from this PCN';
    issuerEl.style.color = '#C62828';
    applyConfidence('unknown');
    // Let the user add the pay link from their ticket; prefill it if OCR caught one.
    addBox.style.display = 'block';
    document.getElementById('ext-pay-url').value = ocrUrl || '';
    document.getElementById('ext-council-name').value = '';
  }

  document.getElementById('extracted-card').style.display = 'block';
  document.getElementById('scan-actions').style.display = 'block';
  setScanStatus(council ? 'Details found — please confirm' : 'PCN found — add your council’s pay link');
}

// Show a trust note under the council row for anything below 'high' confidence.
function applyConfidence(conf) {
  const el = document.getElementById('ext-confidence');
  if (!el) return;
  const notes = {
    high: '',
    med: 'Best guess — please check this matches your ticket.',
    low: 'Unverified — please check this matches your ticket.',
    learned: 'Learned from a previous ticket — please check it’s correct.',
    unknown: 'We don’t recognise this council yet — add its pay link below.',
  };
  const text = notes[conf] || '';
  el.textContent = text;
  el.style.display = text ? 'block' : 'none';
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
    const isActive = reg === state.activeVehicle;
    const row = document.createElement('div');
    row.className = 'sheet-vehicle-row';
    row.innerHTML = `
      <div>
        <div class="reg-plate ${isActive ? '' : 'inactive'}">${reg}</div>
        <div style="font-size:11px;color:#888;margin-top:4px;">${isActive ? 'Active' : 'Tap to switch'}</div>
      </div>
      <div style="display:flex;gap:12px;align-items:center;">
        ${isActive ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5A623" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        ${state.vehicles.length > 1 ? `<button class="btn-ghost" style="padding:4px;width:auto;color:#ccc;" data-delete="${reg}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>` : ''}
      </div>
    `;
    row.querySelector('.reg-plate')?.addEventListener('click', () => {
      state.activeVehicle = reg;
      save();
      renderVehicleSheet();
      renderHome();
      showToast(`Switched to ${reg}`);
    });
    row.querySelector('[data-delete]')?.addEventListener('click', e => {
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
    const isActive = reg === state.activeVehicle;
    const row = document.createElement('div');
    row.className = 'detail-row';
    row.innerHTML = `
      <span class="det-key">${reg}</span>
      <span class="det-val" style="color:${isActive ? '#F5A623' : '#888'}">${isActive ? 'Active' : ''}</span>
    `;
    list.appendChild(row);
  });

  const remToggle = document.getElementById('reminders-toggle');
  if (remToggle) {
    remToggle.checked = state.remindersEnabled
      && ('Notification' in window) && Notification.permission === 'granted';
  }
}

// ── EVENTS ──
document.addEventListener('DOMContentLoaded', () => {
  load();
  checkReminders(); // alert on open if any deadline is near/passed
  if (state.vehicles.length === 0) {
    showScreen('onboarding');
  } else {
    showScreen('home');
  }

  // Onboarding
  document.getElementById('onboarding-btn').addEventListener('click', () => {
    const reg = document.getElementById('onboarding-reg').value.trim().toUpperCase().replace(/\s+/g, ' ');
    if (reg.length < 2) { showToast('Please enter your registration'); return; }
    state.vehicles = [reg];
    state.activeVehicle = reg;
    save();
    showScreen('home');
  });
  document.getElementById('onboarding-reg').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('onboarding-btn').click();
  });

  // Nav
  document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
  });

  // Back buttons
  document.querySelectorAll('.back-btn[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      stopCamera();
      showScreen(btn.dataset.back);
    });
  });

  // Home
  document.getElementById('scan-btn').addEventListener('click', () => showScreen('scan'));
  document.getElementById('history-nav-btn').addEventListener('click', () => showScreen('history'));
  document.getElementById('vehicle-card').addEventListener('click', openVehicleSheet);

  // Vehicle sheet
  document.getElementById('sheet-overlay').addEventListener('click', closeVehicleSheet);
  document.getElementById('close-sheet').addEventListener('click', closeVehicleSheet);
  document.getElementById('add-vehicle-toggle').addEventListener('click', () => {
    const form = document.getElementById('add-vehicle-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') document.getElementById('new-reg-input').focus();
  });
  document.getElementById('save-new-reg').addEventListener('click', () => {
    const reg = document.getElementById('new-reg-input').value.trim().toUpperCase().replace(/\s+/g, ' ');
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

  // Scan — confirm
  document.getElementById('confirm-scan-btn').addEventListener('click', () => {
    const pcn = document.getElementById('ext-pcn').textContent.trim();
    const reg = document.getElementById('ext-reg').textContent.trim() || state.activeVehicle;
    if (!pcn || pcn === '—') { showToast('No PCN found — try again'); return; }
    const extra = {};
    const addBox = document.getElementById('ext-add-council');
    if (addBox && addBox.style.display !== 'none') {
      const payUrl = document.getElementById('ext-pay-url').value.trim();
      if (payUrl && !normalizeUrl(payUrl)) { showToast('That pay link doesn’t look valid'); return; }
      if (payUrl) {
        extra.payUrl = payUrl;
        extra.councilName = document.getElementById('ext-council-name').value.trim();
      }
    }
    if (pendingIssueDate) extra.issueDate = pendingIssueDate;
    const fine = buildFine(pcn, reg, extra);
    if (extra.payUrl && fine.known) showToast('Saved — we’ll recognise this council next time');
    saveFine(fine);
    stopCamera();
    openFineDetail(fine);
  });

  // Scan — rescan
  document.getElementById('rescan-btn').addEventListener('click', () => {
    state.scanAttempts = 0;
    resetScanUI();
    startCamera();
  });

  // Manual entry toggle
  document.getElementById('manual-btn').addEventListener('click', () => {
    const form = document.getElementById('manual-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });

  // Manual submit
  document.getElementById('manual-submit-btn').addEventListener('click', () => {
    const pcn = document.getElementById('manual-pcn').value.trim().toUpperCase().replace(/\s/g, '');
    const reg = document.getElementById('manual-reg-input').value.trim().toUpperCase() || state.activeVehicle;
    if (!pcn) { showToast('Please enter a PCN reference'); return; }
    if (pcn.length < 4) { showToast('PCN reference looks too short'); return; }
    const fine = buildFine(pcn, reg);
    saveFine(fine);
    stopCamera();
    openFineDetail(fine);
  });

  // Pay now
  document.getElementById('pay-now-btn').addEventListener('click', () => {
    if (!state.currentFine?.payUrl) return;
    window.open(state.currentFine.payUrl, '_blank');
  });

  // Fetch live details from the council portal
  document.getElementById('fetch-live-btn').addEventListener('click', () => {
    if (state.currentFine) fetchLiveDetails(state.currentFine);
  });

  // Mark paid / unpaid
  document.getElementById('mark-paid-btn').addEventListener('click', () => {
    if (!state.currentFine) return;
    setFinePaid(state.currentFine.id, !state.currentFine.paid);
    showToast(state.currentFine.paid ? 'Marked as paid' : 'Marked as unpaid');
    openFineDetail(state.currentFine); // refresh banner/button
  });

  // Edit the issue date (drives the discount countdown)
  document.getElementById('detail-issue-date').addEventListener('change', e => {
    if (!state.currentFine) return;
    const iso = e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : null;
    setFineIssueDate(state.currentFine.id, iso);
    openFineDetail(state.currentFine);
  });

  // Delete fine from detail screen
  document.getElementById('delete-fine-btn').addEventListener('click', () => {
    if (!state.currentFine) return;
    state.fines = state.fines.filter(f => f.id !== state.currentFine.id);
    save();
    showToast('Fine removed');
    showScreen('history');
  });

  // History — paid/unpaid filter
  document.querySelectorAll('#history-filter .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.historyFilter = btn.dataset.filter;
      document.querySelectorAll('#history-filter .seg-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderHistory();
    });
  });

  // Settings — deadline reminder toggle
  document.getElementById('reminders-toggle').addEventListener('change', async e => {
    if (e.target.checked) {
      e.target.checked = await enableReminders();
    } else {
      disableReminders();
    }
  });

  // Settings — add vehicle
  document.getElementById('settings-add-vehicle').addEventListener('click', () => {
    openVehicleSheet();
    setTimeout(() => {
      document.getElementById('add-vehicle-form').style.display = 'block';
      document.getElementById('new-reg-input').focus();
    }, 100);
  });
});

// Service worker
if ('serviceWorker' in navigator) {
  // If the page is already controlled, a later controllerchange means a NEW worker
  // took over (a fresh deploy) — reload once so the updated code shows immediately.
  // This makes updates automatic on mobile without clearing Safari's cache by hand.
  let refreshing = false;
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.update().catch(() => {}); // check for a new version each time the app opens
    }).catch(err => console.log('SW error:', err));
  });
}
