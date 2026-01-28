#!/usr/bin/env node
/**
 * Fetch chargers from OpenChargeMap along the Rotterdam-Santa Pola corridor
 * and add new ones to Airtable.
 *
 * Usage:
 *   node scripts/fetch-chargers.mjs --dry-run
 *   node scripts/fetch-chargers.mjs
 *   node scripts/fetch-chargers.mjs --segment NL-BE
 *
 * Environment:
 *   AIRTABLE_API_KEY - Required
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app0Kjcpj3ZTF0UuN';
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'tbl9jT8gYPbQvzZkn';
const OPENCHARGE_API_KEY = process.env.OPENCHARGE_API_KEY || '';

// Route segments with bounding boxes
const SEGMENTS = [
  { id: 'NL-BE', name: 'Rotterdam - Belgium', bbox: { minLat: 51.4, maxLat: 52.0, minLng: 4.0, maxLng: 5.0 }, country: 'NL' },
  { id: 'BE-FR', name: 'Belgium - France', bbox: { minLat: 49.5, maxLat: 51.4, minLng: 3.0, maxLng: 5.0 }, country: 'BE' },
  { id: 'FR-Paris', name: 'France - Paris', bbox: { minLat: 48.5, maxLat: 49.5, minLng: 2.0, maxLng: 4.5 }, country: 'FR' },
  { id: 'Paris-Orleans', name: 'Paris - Orleans', bbox: { minLat: 47.5, maxLat: 48.5, minLng: 1.5, maxLng: 3.0 }, country: 'FR' },
  { id: 'Orleans-Clermont', name: 'Orleans - Clermont', bbox: { minLat: 46.0, maxLat: 47.5, minLng: 2.0, maxLng: 3.5 }, country: 'FR' },
  { id: 'Clermont-Millau', name: 'Clermont - Millau', bbox: { minLat: 44.0, maxLat: 46.0, minLng: 2.5, maxLng: 3.5 }, country: 'FR' },
  { id: 'Millau-ES', name: 'Millau - Spain Border', bbox: { minLat: 42.3, maxLat: 44.0, minLng: 2.5, maxLng: 3.5 }, country: 'FR' },
  { id: 'ES-Valencia', name: 'Spain Border - Valencia', bbox: { minLat: 39.0, maxLat: 42.5, minLng: -0.5, maxLng: 3.0 }, country: 'ES' },
  { id: 'Valencia-SantaPola', name: 'Valencia - Santa Pola', bbox: { minLat: 38.0, maxLat: 39.5, minLng: -1.0, maxLng: 0.5 }, country: 'ES' },
];

async function fetchExistingChargers() {
  const chargers = [];
  let offset;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`);
    url.searchParams.set('fields[]', 'Name');
    url.searchParams.append('fields[]', 'latitude');
    url.searchParams.append('fields[]', 'longitude');
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    const data = await res.json();
    chargers.push(...data.records);
    offset = data.offset;
  } while (offset);

  return chargers;
}

async function fetchOpenChargeMap(segment) {
  const { bbox } = segment;
  const url = new URL('https://api.openchargemap.io/v3/poi');

  url.searchParams.set('output', 'json');
  url.searchParams.set('boundingbox', `(${bbox.minLat},${bbox.minLng}),(${bbox.maxLat},${bbox.maxLng})`);
  url.searchParams.set('minpowerkw', '100');
  url.searchParams.set('maxresults', '200');
  url.searchParams.set('compact', 'false');
  url.searchParams.set('verbose', 'false');
  if (OPENCHARGE_API_KEY) url.searchParams.set('key', OPENCHARGE_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error(`OpenChargeMap error for ${segment.id}: ${res.status}`);
    return [];
  }
  return res.json();
}

function getMaxPower(connections) {
  return Math.max(...connections.map(c => c.PowerKW || 0), 0);
}

function getConnectorTypes(connections) {
  const types = new Set();
  for (const conn of connections) {
    if (conn.ConnectionTypeID === 33 || conn.ConnectionTypeID === 32) types.add('CCS');
    if (conn.ConnectionTypeID === 2) types.add('CHAdeMO');
  }
  return Array.from(types).join(',') || 'CCS';
}

function isDuplicate(charger, existing) {
  const lat = charger.AddressInfo.Latitude;
  const lng = charger.AddressInfo.Longitude;
  const name = charger.AddressInfo.Title.toLowerCase();

  for (const e of existing) {
    const latDiff = Math.abs((e.fields.latitude || 0) - lat);
    const lngDiff = Math.abs((e.fields.longitude || 0) - lng);
    if (latDiff < 0.005 && lngDiff < 0.005) return true;

    const existingName = (e.fields.Name || '').toLowerCase();
    if (existingName && name && (existingName.includes(name.slice(0, 15)) || name.includes(existingName.slice(0, 15)))) {
      return true;
    }
  }
  return false;
}

async function addToAirtable(chargers) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

  for (let i = 0; i < chargers.length; i += 10) {
    const batch = chargers.slice(i, i + 10).map(c => ({
      fields: {
        Name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
        network: c.network,
        power_kw: c.power_kw,
        country: c.country,
        route_segment: c.route_segment,
        ocm_id: c.ocm_id,
        connector_types: c.connector_types,
        num_chargers: c.num_chargers,
        highway_proximity: 'near_exit',
        charger_status: 'untested',
        charger_notes: `Auto-imported from OpenChargeMap. Needs verification.`,
      },
    }));

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: batch }),
    });

    if (!res.ok) {
      console.error(`Airtable error: ${res.status}`, await res.text());
    } else {
      console.log(`  Added batch of ${batch.length} chargers`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const segmentIdx = args.indexOf('--segment');
  const segmentFilter = segmentIdx !== -1 ? args[segmentIdx + 1] : null;

  console.log('🔌 ECharger Route Fetcher');
  console.log('========================\n');

  if (!AIRTABLE_API_KEY) {
    console.error('❌ AIRTABLE_API_KEY not set. Run with:');
    console.error('   AIRTABLE_API_KEY=pat... node scripts/fetch-chargers.mjs');
    process.exit(1);
  }

  console.log('📋 Fetching existing chargers from Airtable...');
  const existing = await fetchExistingChargers();
  console.log(`   Found ${existing.length} existing chargers\n`);

  const segments = segmentFilter
    ? SEGMENTS.filter(s => s.id === segmentFilter)
    : SEGMENTS;

  const allNew = [];

  for (const segment of segments) {
    console.log(`🔍 Searching ${segment.id} (${segment.name})...`);

    const results = await fetchOpenChargeMap(segment);
    console.log(`   Found ${results.length} chargers from OpenChargeMap`);

    const filtered = results.filter(r => {
      const power = getMaxPower(r.Connections || []);
      return power >= 150 && !isDuplicate(r, existing);
    });

    console.log(`   ${filtered.length} new 150kW+ chargers after filtering`);

    for (const charger of filtered) {
      const newCharger = {
        name: charger.AddressInfo.Title,
        latitude: charger.AddressInfo.Latitude,
        longitude: charger.AddressInfo.Longitude,
        network: charger.OperatorInfo?.Title || 'Unknown',
        power_kw: getMaxPower(charger.Connections || []),
        country: segment.country,
        route_segment: segment.id,
        ocm_id: charger.ID,
        connector_types: getConnectorTypes(charger.Connections || []),
        num_chargers: charger.NumberOfPoints || 1,
      };
      allNew.push(newCharger);

      if (dryRun) {
        console.log(`   + ${newCharger.name} (${newCharger.power_kw}kW)`);
      }
    }

    existing.push(...filtered.map(f => ({
      id: '',
      fields: {
        Name: f.AddressInfo.Title,
        latitude: f.AddressInfo.Latitude,
        longitude: f.AddressInfo.Longitude,
      },
    })));

    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 Summary: ${allNew.length} new chargers found`);

  if (dryRun) {
    console.log('\n⚠️  Dry run - no changes made');
    console.log('   Run without --dry-run to add to Airtable');
  } else if (allNew.length > 0) {
    console.log('\n📤 Adding to Airtable...');
    await addToAirtable(allNew);
    console.log('✅ Done!');
  } else {
    console.log('\n✅ No new chargers to add');
  }
}

main().catch(console.error);
