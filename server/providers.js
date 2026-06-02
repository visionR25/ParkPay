/* Maps a PCN prefix to its portal provider + host.
 * Spike scope: Taranto boroughs only (they share one portal system, so one
 * adapter covers all six). Extend this map as more providers are added. */
const TARANTO = 'taranto';

const PROVIDERS = {
  CU: { provider: TARANTO, host: 'camden.tarantoportal.com',       council: 'Camden' },
  ZN: { provider: TARANTO, host: 'haringey.tarantoportal.com',     council: 'Haringey' },
  NJ: { provider: TARANTO, host: 'hounslow.tarantoportal.com',     council: 'Hounslow' },
  QT: { provider: TARANTO, host: 'kingston.tarantoportal.com',     council: 'Kingston upon Thames' },
  TT: { provider: TARANTO, host: 'towerhamlets.tarantoportal.com', council: 'Tower Hamlets' },
  CL: { provider: TARANTO, host: 'cityoflondon.tarantoportal.com', council: 'City of London' },
};

function providerFor(pcn) {
  const prefix = String(pcn || '').slice(0, 2).toUpperCase();
  return PROVIDERS[prefix] || null;
}

module.exports = { PROVIDERS, providerFor };
