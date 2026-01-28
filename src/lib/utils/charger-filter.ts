import { ChargerRecord, ChargerWithDistance } from '@/types/corridor';
import { calculateDistance } from './distance';

export function filterChargersByRange(
  chargers: ChargerRecord[],
  userLat: number,
  userLng: number,
  rangeKm: number,
  limit: number = 3
): ChargerWithDistance[] {
  // Calculate distance to each charger
  const chargersWithDistance = chargers.map((charger) => {
    const distanceKm = calculateDistance(
      userLat,
      userLng,
      charger.latitude,
      charger.longitude
    );
    const rangeAfterKm = rangeKm - distanceKm;

    return {
      ...charger,
      distanceKm: Math.round(distanceKm * 10) / 10,
      rangeAfterKm: Math.round(rangeAfterKm * 10) / 10,
    };
  });

  // Filter chargers within range (with 10km buffer for safety)
  const inRange = chargersWithDistance.filter(
    (c) => c.distanceKm <= rangeKm - 10 && c.rangeAfterKm >= 0
  );

  // Sort by distance (closest first)
  inRange.sort((a, b) => a.distanceKm - b.distanceKm);

  // Return top N
  return inRange.slice(0, limit);
}

export function getNetworkColor(network: string): string {
  const colors: Record<string, string> = {
    Tesla: 'bg-red-600',
    Ionity: 'bg-blue-700',
    Fastned: 'bg-yellow-400 text-black',
    'Shell Recharge': 'bg-yellow-400 text-black',
    Shell: 'bg-yellow-400 text-black',
    TotalEnergies: 'bg-orange-500',
    Iberdrola: 'bg-green-600',
  };
  return colors[network] || 'bg-gray-500';
}

export function getProximityStyle(proximity: string): { bg: string; text: string; label: string } {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    at_exit: { bg: 'bg-green-100', text: 'text-green-800', label: 'At Exit' },
    near_exit: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Near Exit' },
    town: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'In Town' },
  };
  return styles[proximity] || styles.town;
}

export function parseAmenities(amenities: string): string[] {
  if (!amenities) return [];
  return amenities.split(',').map((a) => a.trim()).filter(Boolean);
}

export function getAmenityEmoji(amenity: string): string {
  const emojis: Record<string, string> = {
    food: '🍔',
    toilets: '🚻',
    coffee: '☕',
    shop: '🛒',
    seating: '💺',
    wifi: '📶',
    hotel: '🏨',
  };
  return emojis[amenity.toLowerCase()] || '✓';
}
