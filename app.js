/* ── PARKPAY APP.JS ── */

// ── PCN PREFIX DATABASE ──
// Sources: PATROL authority directory (patrol.gov.uk) + London borough portals
// payUrl: direct payment portal
// paramSupport: true = portal accepts ?pcn=XX&vrm=YY in URL (user lands on their fine)
//               false = portal is form-based only (user lands on payment homepage)

const PCN_ISSUERS = {
  // ── LONDON BOROUGHS ──
  // Many London boroughs use Taranto portal which supports PCN+VRM URL params
  BA: { name: 'London Borough of Barking and Dagenham', payUrl: 'https://barkinganddagenham.tarantoportal.com/', paramSupport: false },
  AC: { name: 'London Borough of Barnet', payUrl: 'https://barnet.tarantoportal.com/', paramSupport: false },
  AE: { name: 'London Borough of Bexley', payUrl: 'https://bexley.tarantoportal.com/', paramSupport: false },
  BD: { name: 'London Borough of Brent', payUrl: 'https://brent.tarantoportal.com/', paramSupport: false },
  BR: { name: 'London Borough of Bromley', payUrl: 'https://bromley.tarantoportal.com/', paramSupport: false },
  CA: { name: 'London Borough of Camden', payUrl: 'https://camden.tarantoportal.com/', paramSupport: false },
  CL: { name: 'City of London', payUrl: 'https://cityoflondon.tarantoportal.com/PCNs', paramSupport: false },
  CR: { name: 'London Borough of Croydon', payUrl: 'https://www.croydon.gov.uk/parking/parking-fines-penalty-charge-notices-or-pcns/pay-parking-fine-penalty-charge-notice-or-pcn', paramSupport: false },
  EA: { name: 'London Borough of Ealing', payUrl: 'https://ealing.tarantoportal.com/', paramSupport: false },
  AO: { name: 'London Borough of Ealing', payUrl: 'https://ealing.tarantoportal.com/', paramSupport: false },
  AK: { name: 'London Borough of Enfield', payUrl: 'https://enfield.tarantoportal.com/', paramSupport: false },
  GD: { name: 'Royal Borough of Greenwich', payUrl: 'https://www.royalgreenwich.gov.uk/parking-fines', paramSupport: false },
  QZ: { name: 'London Borough of Hackney', payUrl: 'https://parkingdisputes.hackney.gov.uk/pcnonline', paramSupport: false },
  HF: { name: 'London Borough of Hammersmith and Fulham', payUrl: 'https://hammersmithandfulham.tarantoportal.com/', paramSupport: false },
  HA: { name: 'London Borough of Haringey', payUrl: 'https://www.haringey.gov.uk/parking/pcns-parking-traffic', paramSupport: false },
  HW: { name: 'London Borough of Harrow', payUrl: 'https://harrow.tarantoportal.com/', paramSupport: false },
  HV: { name: 'London Borough of Havering', payUrl: 'https://havering.tarantoportal.com/', paramSupport: false },
  HI: { name: 'London Borough of Hillingdon', payUrl: 'https://hillingdon.tarantoportal.com/', paramSupport: false },
  HO: { name: 'London Borough of Hounslow', payUrl: 'https://hounslow.tarantoportal.com/', paramSupport: false },
  IS: { name: 'London Borough of Islington', payUrl: 'https://islington.tarantoportal.com/', paramSupport: false },
  RK: { name: 'Royal Borough of Kensington and Chelsea', payUrl: 'https://www.rbkc.gov.uk/parking-permissions/parking-fines-and-penalty-charge-notices-pcns/help-your-penalty-charge-notice-pcn', paramSupport: false },
  KT: { name: 'Royal Borough of Kingston upon Thames', payUrl: 'https://kingston.tarantoportal.com/', paramSupport: false },
  LJ: { name: 'London Borough of Lambeth', payUrl: 'https://pcnevidence.lambeth.gov.uk/pcnonline/index.php', paramSupport: false },
  LW: { name: 'London Borough of Lewisham', payUrl: 'https://lewisham.tarantoportal.com/', paramSupport: false },
  MN: { name: 'London Borough of Merton', payUrl: 'https://merton.tarantoportal.com/', paramSupport: false },
  NW: { name: 'London Borough of Newham', payUrl: 'https://newham.tarantoportal.com/', paramSupport: false },
  RB: { name: 'London Borough of Redbridge', payUrl: 'https://redbridge.tarantoportal.com/', paramSupport: false },
  RT: { name: 'London Borough of Richmond upon Thames', payUrl: 'https://richmond.tarantoportal.com/', paramSupport: false },
  JK: { name: 'London Borough of Southwark', payUrl: 'https://pcnevidence.southwarkparking.co.uk/pcnonline/', paramSupport: false },
  ST: { name: 'London Borough of Sutton', payUrl: 'https://sutton.tarantoportal.com/', paramSupport: false },
  TH: { name: 'London Borough of Tower Hamlets', payUrl: 'https://towerhamlets.tarantoportal.com/', paramSupport: false },
  WF: { name: 'London Borough of Waltham Forest', payUrl: 'https://walthamforest.tarantoportal.com/', paramSupport: false },
  WD: { name: 'London Borough of Wandsworth', payUrl: 'https://wandsworth.tarantoportal.com/', paramSupport: false },
  WX: { name: 'City of Westminster', payUrl: 'https://westminster.tarantoportal.com/', paramSupport: false },
  // TfL (red routes, bus lanes, moving traffic)
  TL: { name: 'Transport for London', payUrl: 'https://tfl.gov.uk/modes/driving/pay-a-pcn', paramSupport: false },

  // ── ENGLAND OUTSIDE LONDON (PATROL members) ──
  AD: { name: 'Adur District Council', payUrl: 'https://www.adur-worthing.gov.uk/parking/pay-a-penalty-charge-notice/', paramSupport: false },
  AX: { name: 'Adur District Council', payUrl: 'https://www.adur-worthing.gov.uk/parking/pay-a-penalty-charge-notice/', paramSupport: false },
  AV: { name: 'Amber Valley Borough Council', payUrl: 'https://www.parksmarter.org.uk/', paramSupport: false },
  AR: { name: 'Arun District Council', payUrl: 'https://www.arun.gov.uk/pcn', paramSupport: false },
  AZ: { name: 'Arun District Council', payUrl: 'https://www.arun.gov.uk/pcn', paramSupport: false },
  AQ: { name: 'Ashfield District Council', payUrl: 'https://www.nottinghamshire.gov.uk/transport/parking/challenge-parking-fine', paramSupport: false },
  AS: { name: 'Ashford Borough Council', payUrl: 'https://pcnpayappeal.ashford.gov.uk/', paramSupport: false },
  KF: { name: 'Ashford Borough Council', payUrl: 'https://pcnpayappeal.ashford.gov.uk/', paramSupport: false },
  BG: { name: 'Basingstoke and Deane Borough Council', payUrl: 'https://www.basingstoke.gov.uk/pcn', paramSupport: false },
  PA: { name: 'Basingstoke and Deane Borough Council', payUrl: 'https://www.basingstoke.gov.uk/pcn', paramSupport: false },
  BJ: { name: 'Barnsley Metropolitan Borough Council', payUrl: 'https://www.councilparking.org/barnsley/pages/OnlinePCNEntry.aspx', paramSupport: false },
  BI: { name: 'Basildon Borough Council', payUrl: 'https://www.chelmsford.gov.uk/parking-and-travel/parking-fines/', paramSupport: false },
  BF: { name: 'Bedford Borough Council', payUrl: 'https://www.bedford.gov.uk/parking-roads-and-travel/parking/street-parking/fines/', paramSupport: false },
  BM: { name: 'Birmingham City Council', payUrl: 'https://www.birmingham.gov.uk/info/20221/penalty_charge_notices_pcn', paramSupport: false },
  JJ: { name: 'Birmingham City Council', payUrl: 'https://www.birmingham.gov.uk/info/20221/penalty_charge_notices_pcn', paramSupport: false },
  BN: { name: 'Bath and North East Somerset Council', payUrl: 'https://parking.bathnes.gov.uk/pages/OnlinePCNEntry.aspx', paramSupport: false },
  DB: { name: 'Blackburn with Darwen Borough Council', payUrl: 'https://ocmlive.xrxpsc.com/blackburn/ocm-fe/ocm/default.aspx', paramSupport: false },
  BP: { name: 'Blackpool Council', payUrl: 'https://www.blackpool.gov.uk/Residents/Parking-roads-and-transport/Parking/Parking-fine-tickets.aspx', paramSupport: false },
  BO: { name: 'Bolton Council', payUrl: 'https://www.bolton.gov.uk/parking-permits', paramSupport: false },
  BH: { name: 'Brighton and Hove City Council', payUrl: 'https://www.brighton-hove.gov.uk/parking-and-travel/parking/challenge-or-appeal-your-penalty-charge-notice-pcn-including-bus', paramSupport: false },
  BS: { name: 'Bristol City Council', payUrl: 'https://www.bristol.gov.uk/parking/appeal-a-parking-or-bus-lane-fine', paramSupport: false },
  OB: { name: 'Bristol City Council', payUrl: 'https://www.bristol.gov.uk/parking/appeal-a-parking-or-bus-lane-fine', paramSupport: false },
  BC: { name: 'Bury Metropolitan Borough Council', payUrl: 'http://www.bury.gov.uk/parkingappeals', paramSupport: false },
  YB: { name: 'Cambridge City Council', payUrl: 'https://www.cambridge.gov.uk/parking', paramSupport: false },
  FC: { name: 'Cambridgeshire County Council', payUrl: 'https://ocmlive.xrxpsc.com/cambridge/ocm-fe/ocm/Default.aspx', paramSupport: false },
  CT: { name: 'Canterbury City Council', payUrl: 'http://www.canterbury.gov.uk/parking', paramSupport: false },
  KB: { name: 'Canterbury City Council', payUrl: 'http://www.canterbury.gov.uk/parking', paramSupport: false },
  QC: { name: 'Cardiff Council', payUrl: 'https://www.cardiff.gov.uk/ENG/resident/Parking-roads-and-travel/Parking-fines/Pages/default.aspx', paramSupport: false },
  CX: { name: 'Calderdale Borough Council', payUrl: 'https://parkinggw.calderdale.gov.uk/pcn/', paramSupport: false },
  CH: { name: 'Cheshire East Council', payUrl: 'https://www.cheshireeast.gov.uk/parking/penalty_charge_notice_pcn.aspx', paramSupport: false },
  CV: { name: 'Coventry City Council', payUrl: 'https://www.coventry.gov.uk/parking-fines', paramSupport: false },
  DA: { name: 'Darlington Borough Council', payUrl: 'https://www.darlington.gov.uk/transport-and-streets/parking/penalty-charge-notices-pcns/', paramSupport: false },
  DE: { name: 'Derby City Council', payUrl: 'https://www.derby.gov.uk/transport-and-streets/parking/penalty-charge-notices/', paramSupport: false },
  DO: { name: 'Doncaster Metropolitan Borough Council', payUrl: 'https://www.doncaster.gov.uk/services/transport-and-streets/parking-fine-pcn', paramSupport: false },
  DU: { name: 'Durham County Council', payUrl: 'https://www.durham.gov.uk/pcn', paramSupport: false },
  EX: { name: 'Exeter City Council', payUrl: 'https://www.exeter.gov.uk/parking/penalty-charge-notices/', paramSupport: false },
  GA: { name: 'Gateshead Council', payUrl: 'https://www.gateshead.gov.uk/article/1673/Penalty-Charge-Notices', paramSupport: false },
  GL: { name: 'Gloucester City Council', payUrl: 'https://www.gloucester.gov.uk/parking/penalty-charge-notice/', paramSupport: false },
  HX: { name: 'Hartlepool Borough Council', payUrl: 'https://www.hartlepool.gov.uk/info/200059/parking/1056/penalty_charge_notices', paramSupport: false },
  HE: { name: 'Herefordshire Council', payUrl: 'https://www.herefordshire.gov.uk/parking-1/penalty-charge-notices', paramSupport: false },
  HU: { name: 'Hull City Council', payUrl: 'https://www.hull.gov.uk/parking/parking-fines', paramSupport: false },
  IP: { name: 'Ipswich Borough Council', payUrl: 'https://www.ipswich.gov.uk/pcn', paramSupport: false },
  GB: { name: 'Ipswich Borough Council', payUrl: 'https://www.ipswich.gov.uk/pcn', paramSupport: false },
  KE: { name: 'Kent County Council', payUrl: 'https://www.kent.gov.uk/roads-and-travel/parking/penalty-charge-notices', paramSupport: false },
  KI: { name: 'Kirklees Council', payUrl: 'https://www.kirklees.gov.uk/beta/parking-penalty-notices/pay-parking-penalty.aspx', paramSupport: false },
  KN: { name: 'Knowsley Metropolitan Borough Council', payUrl: 'https://www.knowsley.gov.uk/residents/roads-parking-and-transport/parking-penalty-charge-notices', paramSupport: false },
  LA: { name: 'Lancashire County Council', payUrl: 'https://www.lancashire.gov.uk/roads-parking-and-travel/parking/penalty-charge-notices/', paramSupport: false },
  LD: { name: 'Leeds City Council', payUrl: 'https://www.leeds.gov.uk/parking/pay-a-parking-fine', paramSupport: false },
  LE: { name: 'Leicester City Council', payUrl: 'https://www.leicester.gov.uk/transport-and-streets/parking/parking-fines/', paramSupport: false },
  LI: { name: 'Lincolnshire County Council', payUrl: 'https://www.lincolnshire.gov.uk/parking/penalty-charge-notices', paramSupport: false },
  LV: { name: 'Liverpool City Council', payUrl: 'https://parking.liverpool.gov.uk/pcn/', paramSupport: false },
  LU: { name: 'Luton Borough Council', payUrl: 'https://www.luton.gov.uk/Transport_and_streets/Parking/Pages/PenaltyChargeNotice.aspx', paramSupport: false },
  MA: { name: 'Manchester City Council', payUrl: 'https://www.manchester.gov.uk/info/500321/parking_fines', paramSupport: false },
  MD: { name: 'Medway Council', payUrl: 'https://www.medway.gov.uk/info/200165/parking/331/parking_fines', paramSupport: false },
  MI: { name: 'Middlesbrough Council', payUrl: 'https://www.middlesbrough.gov.uk/open-data-foi-and-have-your-say/parking/penalty-charge-notices-pcns', paramSupport: false },
  MK: { name: 'Milton Keynes City Council', payUrl: 'https://www.milton-keynes.gov.uk/parking/penalty-charge-notices', paramSupport: false },
  NA: { name: 'Newcastle upon Tyne City Council', payUrl: 'https://www.newcastle.gov.uk/services/parking/penalty-charge-notices-pcns', paramSupport: false },
  NO: { name: 'Norfolk County Council', payUrl: 'https://parking.west-norfolk.gov.uk/pages/OnlinePCNEntry.aspx', paramSupport: false },
  NH: { name: 'Northampton Borough Council', payUrl: 'https://www.northamptonshire.gov.uk/councilservices/roads-and-transport/parking/pages/parking-fines.aspx', paramSupport: false },
  NU: { name: 'Northumberland County Council', payUrl: 'https://www.northumberland.gov.uk/Transport/Parking/Penalties.aspx', paramSupport: false },
  NG: { name: 'Nottingham City Council', payUrl: 'https://www.nottinghamcity.gov.uk/parking', paramSupport: false },
  NY: { name: 'North Yorkshire Council', payUrl: 'https://www.northyorks.gov.uk/roads-and-transport/parking/penalty-charge-notices', paramSupport: false },
  OX: { name: 'Oxford City Council', payUrl: 'https://www.oxford.gov.uk/info/20180/parking_fines', paramSupport: false },
  PE: { name: 'Peterborough City Council', payUrl: 'https://www.peterborough.gov.uk/residents/parking/penalty-charge-notices', paramSupport: false },
  PL: { name: 'Plymouth City Council', payUrl: 'https://www.plymouth.gov.uk/parkingfines', paramSupport: false },
  PO: { name: 'Portsmouth City Council', payUrl: 'https://www.portsmouth.gov.uk/services/parking/penalty-charge-notices/', paramSupport: false },
  PR: { name: 'Preston City Council', payUrl: 'https://www.chipsidelancashire.org/', paramSupport: false },
  RD: { name: 'Bournemouth, Christchurch and Poole Council', payUrl: 'https://www.bcpcouncil.gov.uk/Quicklinks/fwlanding/parking.aspx', paramSupport: false },
  RO: { name: 'Rochdale Metropolitan Borough Council', payUrl: 'https://www.rochdale.gov.uk/parking/penalty-charge-notices/', paramSupport: false },
  RU: { name: 'Rugby Borough Council', payUrl: 'https://www.rugby.gov.uk/parking/penalty-charge-notices', paramSupport: false },
  SA: { name: 'Salford City Council', payUrl: 'https://www.salford.gov.uk/roads-travel-and-parking/parking/parking-fines/', paramSupport: false },
  SB: { name: 'Sandwell Metropolitan Borough Council', payUrl: 'https://www.sandwell.gov.uk/parking/article/1055/Penalty_charge_notices', paramSupport: false },
  SE: { name: 'Sefton Council', payUrl: 'https://www.sefton.gov.uk/parking/penalty-charge-notices.aspx', paramSupport: false },
  SF: { name: 'Sheffield City Council', payUrl: 'https://www.sheffield.gov.uk/home/parking/penalty-charge-notice', paramSupport: false },
  SH: { name: 'Shropshire Council', payUrl: 'https://www.shropshire.gov.uk/parking/penalty-charge-notices/', paramSupport: false },
  SK: { name: 'Slough Borough Council', payUrl: 'https://www.slough.gov.uk/parking/penalty-charge-notices-1', paramSupport: false },
  SL: { name: 'Solihull Metropolitan Borough Council', payUrl: 'https://www.solihull.gov.uk/Resident/ParkingandTravel/Parking/parkingfines', paramSupport: false },
  SO: { name: 'Southampton City Council', payUrl: 'https://www.southampton.gov.uk/parking/parking-fines/', paramSupport: false },
  SN: { name: 'Sunderland City Council', payUrl: 'https://www.sunderland.gov.uk/article/12531/Penalty-charge-notices', paramSupport: false },
  SW: { name: 'Swindon Borough Council', payUrl: 'https://www.swindon.gov.uk/info/20025/roads_and_transport/89/parking_fines', paramSupport: false },
  TM: { name: 'Tameside Metropolitan Borough Council', payUrl: 'https://www.tameside.gov.uk/parking/pcn', paramSupport: false },
  TE: { name: 'Tees Valley / Stockton-on-Tees', payUrl: 'https://www.stockton.gov.uk/parking-and-roads/parking/penalty-charge-notices/', paramSupport: false },
  TN: { name: 'Trafford Council', payUrl: 'https://www.trafford.gov.uk/residents/transport-and-streets/parking/Penalty-Charge-Notices.aspx', paramSupport: false },
  WA: { name: 'Wakefield Metropolitan District Council', payUrl: 'https://www.wakefield.gov.uk/streets-and-travel/parking/fines-and-enforcement', paramSupport: false },
  WL: { name: 'Walsall Council', payUrl: 'https://www.walsall.gov.uk/article/1505/Parking-fines-penalty-charge-notices-PCNs', paramSupport: false },
  WR: { name: 'Warrington Borough Council', payUrl: 'https://www.warrington.gov.uk/pcn', paramSupport: false },
  WI: { name: 'Wigan Council', payUrl: 'https://www.wigan.gov.uk/Resident/Parking/Penalty-Charge-Notices.aspx', paramSupport: false },
  WO: { name: 'Wolverhampton City Council', payUrl: 'https://www.wolverhampton.gov.uk/article/1398/Penalty-charge-notices', paramSupport: false },
  WC: { name: 'Worcester City Council', payUrl: 'https://www.worcester.gov.uk/parking', paramSupport: false },
  YK: { name: 'York City Council', payUrl: 'https://www.york.gov.uk/ParkingFines', paramSupport: false },

  // ── WALES (PATROL members) ──
  ZB: { name: 'Blaenau Gwent County Borough Council', payUrl: 'https://www.swpg.co.uk/', paramSupport: false },
  PT: { name: 'Bridgend County Borough Council', payUrl: 'https://www.wppp.org.uk/', paramSupport: false },
  CM: { name: 'Carmarthenshire County Council', payUrl: 'https://www.carmarthenshire.gov.wales/home/council-services/travel-roads-parking/parking/', paramSupport: false },
  XC: { name: 'Caerphilly County Borough Council', payUrl: 'https://www.swpg.co.uk/', paramSupport: false },
  CF: { name: 'Cardiff Council', payUrl: 'https://www.cardiff.gov.uk/ENG/resident/Parking-roads-and-travel/Parking-fines/Pages/default.aspx', paramSupport: false },
  CG: { name: 'Ceredigion County Council', payUrl: 'https://www.ceredigion.gov.uk/resident/travel-roads-and-parking/parking/penalty-charge-notices/', paramSupport: false },
  WP: { name: 'Wales Parking Partnership', payUrl: 'https://www.wppp.org.uk/', paramSupport: false },
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
};

// ── STORAGE ──
function save() {
  localStorage.setItem('parkpay_vehicles', JSON.stringify(state.vehicles));
  localStorage.setItem('parkpay_activeVehicle', state.activeVehicle || '');
  localStorage.setItem('parkpay_fines', JSON.stringify(state.fines));
}

function load() {
  state.vehicles = JSON.parse(localStorage.getItem('parkpay_vehicles') || '[]');
  state.activeVehicle = localStorage.getItem('parkpay_activeVehicle') || null;
  state.fines = JSON.parse(localStorage.getItem('parkpay_fines') || '[]');
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
function lookupCouncil(pcn) {
  const prefix = pcn.substring(0, 2).toUpperCase();
  return PCN_ISSUERS[prefix] || null;
}

// ── BUILD FINE RECORD (only real known data) ──
function buildFine(pcn, reg) {
  const cleanPcn = pcn.trim().toUpperCase().replace(/\s/g, '');
  const cleanReg = (reg || state.activeVehicle || '').trim().toUpperCase();
  const council = lookupCouncil(cleanPcn);
  return {
    id: Date.now().toString(),
    pcn: cleanPcn,
    reg: cleanReg,
    councilName: council ? council.name : 'Unknown council',
    payUrl: council ? council.payUrl : null,
    paramSupport: council ? council.paramSupport : false,
    dateScanned: new Date().toISOString(),
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

// ── HOME ──
function renderHome() {
  document.getElementById('home-greeting').textContent = getGreeting();
  document.getElementById('home-reg').textContent = state.activeVehicle || '—';
  document.getElementById('history-reg-sub').textContent = state.activeVehicle || '';
  const count = state.fines.length;
  document.getElementById('home-sub').textContent =
    count > 0 ? `${count} fine${count !== 1 ? 's' : ''} tracked` : 'No fines tracked';

  const section = document.getElementById('fines-section');
  section.innerHTML = '';
  if (state.fines.length > 0) {
    state.fines.slice(0, 3).forEach(fine => {
      const div = document.createElement('div');
      div.className = 'unpaid-card';
      div.innerHTML = `
        <div class="unpaid-header">${fine.councilName}</div>
        <div class="unpaid-inner">
          <div>
            <div class="unpaid-ref">${fine.pcn}</div>
            <div class="unpaid-council">${fine.reg} · ${formatDate(fine.dateScanned)}</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5A623" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      `;
      div.addEventListener('click', () => openFineDetail(fine));
      section.appendChild(div);
    });
  }
}

// ── HISTORY ──
function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  list.innerHTML = '';
  if (state.fines.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  const card = document.createElement('div');
  card.className = 'card';
  state.fines.forEach(fine => {
    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `
      <div>
        <div class="hist-ref">${fine.pcn}</div>
        <div class="hist-meta">${fine.councilName}</div>
        <div class="hist-meta">${fine.reg} · ${formatDate(fine.dateScanned)}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
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

  showScreen('detail');
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
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
    });
    const { data } = await worker.recognize(canvas);
    await worker.terminate();

    const result = extractPCNFromText(data.text);

    if (result.pcn) {
      stopCamera();
      showExtractedDetails(result.pcn, result.reg);
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

  return { pcn, reg };
}

function showExtractedDetails(pcn, reg) {
  const council = lookupCouncil(pcn);
  document.getElementById('ext-pcn').textContent = pcn;
  document.getElementById('ext-reg').textContent = reg || '—';
  document.getElementById('ext-issuer').textContent = council ? council.name : 'Unknown — check your ticket';
  document.getElementById('ext-issuer').style.color = council ? '' : '#C62828';
  document.getElementById('extracted-card').style.display = 'block';
  document.getElementById('scan-actions').style.display = 'block';
  setScanStatus(council ? 'Details found — please confirm' : 'PCN found but council not recognised');
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
}

// ── EVENTS ──
document.addEventListener('DOMContentLoaded', () => {
  load();
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
    const fine = buildFine(pcn, reg);
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

  // Delete fine from detail screen
  document.getElementById('delete-fine-btn').addEventListener('click', () => {
    if (!state.currentFine) return;
    state.fines = state.fines.filter(f => f.id !== state.currentFine.id);
    save();
    showToast('Fine removed');
    showScreen('history');
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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
  });
}
