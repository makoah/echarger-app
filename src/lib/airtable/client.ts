import { ChargerRecord } from '@/types/corridor';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID!;

interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    latitude?: number;
    longitude?: number;
    network?: string;
    power_kw?: number;
    highway_proximity?: string;
    amenities?: string;
    ocm_id?: number;
    country?: string;
    route_segment?: string;
    charger_notes?: string;
    reliability?: number;
    charger_status?: string;
    connector_types?: string;
    num_chargers?: number;
    on_route?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export async function fetchAllChargers(): Promise<ChargerRecord[]> {
  const allRecords: ChargerRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`);
    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data: AirtableResponse = await response.json();

    for (const record of data.records) {
      const fields = record.fields;
      if (fields.Name && fields.latitude && fields.longitude) {
        allRecords.push({
          id: record.id,
          name: fields.Name,
          latitude: fields.latitude,
          longitude: fields.longitude,
          network: fields.network || 'Unknown',
          power_kw: fields.power_kw || 0,
          highway_proximity: (fields.highway_proximity as ChargerRecord['highway_proximity']) || 'town',
          amenities: fields.amenities || '',
          ocm_id: fields.ocm_id,
          country: fields.country || '',
          route_segment: fields.route_segment || '',
          notes: fields.charger_notes,
          reliability: fields.reliability,
          status: fields.charger_status,
          connector_types: fields.connector_types || '',
          num_chargers: fields.num_chargers || 1,
          on_route: (fields.on_route as 'yes' | 'no' | 'nearby') || 'no',
        });
      }
    }

    offset = data.offset;
  } while (offset);

  return allRecords;
}

export async function fetchChargersBySegment(segment: string): Promise<ChargerRecord[]> {
  const allChargers = await fetchAllChargers();
  return allChargers.filter((c) => c.route_segment === segment);
}
