export interface ChargerRecord {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  network: string;
  power_kw: number;
  highway_proximity: 'at_exit' | 'near_exit' | 'town';
  amenities: string;
  ocm_id?: number;
  country: string;
  route_segment: string;
  notes?: string;
  reliability?: number;
  status?: string;
  connector_types: string;
  num_chargers: number;
}

export interface ChargerWithDistance extends ChargerRecord {
  distanceKm: number;
  rangeAfterKm: number;
}

export type RouteSegment =
  | 'NL-BE'
  | 'BE-FR'
  | 'FR-Paris'
  | 'Paris-Orleans'
  | 'Orleans-Clermont'
  | 'Clermont-Millau'
  | 'Millau-ES'
  | 'ES-Valencia'
  | 'Valencia-SantaPola';

export const ROUTE_SEGMENTS: RouteSegment[] = [
  'NL-BE',
  'BE-FR',
  'FR-Paris',
  'Paris-Orleans',
  'Orleans-Clermont',
  'Clermont-Millau',
  'Millau-ES',
  'ES-Valencia',
  'Valencia-SantaPola',
];

export const SEGMENT_INFO: Record<RouteSegment, { name: string; highway: string }> = {
  'NL-BE': { name: 'Rotterdam - Belgium', highway: 'A16 / E19' },
  'BE-FR': { name: 'Belgium - France', highway: 'E19 / A2' },
  'FR-Paris': { name: 'France - Paris', highway: 'A1 / A104' },
  'Paris-Orleans': { name: 'Paris - Orleans', highway: 'A10' },
  'Orleans-Clermont': { name: 'Orleans - Clermont', highway: 'A71' },
  'Clermont-Millau': { name: 'Clermont - Millau', highway: 'A75' },
  'Millau-ES': { name: 'Millau - Spain', highway: 'A75 / A9' },
  'ES-Valencia': { name: 'Spain - Valencia', highway: 'AP-7 / A-7' },
  'Valencia-SantaPola': { name: 'Valencia - Santa Pola', highway: 'A-7' },
};
