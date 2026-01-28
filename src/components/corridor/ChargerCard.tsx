'use client';

import { ChargerWithDistance } from '@/types/corridor';
import {
  getNetworkColor,
  getProximityStyle,
  parseAmenities,
  getAmenityEmoji,
} from '@/lib/utils/charger-filter';

interface ChargerCardProps {
  charger: ChargerWithDistance;
}

export function ChargerCard({ charger }: ChargerCardProps) {
  const proximityStyle = getProximityStyle(charger.highway_proximity);
  const amenities = parseAmenities(charger.amenities);

  const getRangeColor = () => {
    if (charger.rangeAfterKm < 50) return 'text-red-600 bg-red-50';
    if (charger.rangeAfterKm < 100) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getNavUrl = () => {
    const coords = `${charger.latitude},${charger.longitude}`;
    // iOS detection happens client-side
    if (typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      return `https://maps.apple.com/?daddr=${coords}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white ${getNetworkColor(
              charger.network
            )}`}
          >
            {charger.network}
          </span>
          <h3 className="font-semibold text-gray-900 mt-1 truncate">{charger.name}</h3>
          <p className="text-xs text-gray-500">
            {charger.num_chargers} chargers | {charger.connector_types}
          </p>
        </div>
        <div
          className={`text-xl font-bold px-3 py-1 rounded-lg ${
            charger.power_kw >= 300 ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'
          }`}
        >
          {charger.power_kw}kW
        </div>
      </div>

      {/* Distance & Range */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-2xl font-bold text-blue-600">{charger.distanceKm}</div>
          <div className="text-xs text-blue-600">km away</div>
        </div>
        <div className={`flex-1 rounded-lg p-2 text-center ${getRangeColor()}`}>
          <div className="text-2xl font-bold">{charger.rangeAfterKm}</div>
          <div className="text-xs">km left after</div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${proximityStyle.bg} ${proximityStyle.text}`}
        >
          {proximityStyle.label}
        </span>
        <span className="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600">
          {charger.country}
        </span>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="flex gap-2 mb-3 text-xl">
          {amenities.map((a, i) => (
            <span key={i} title={a}>
              {getAmenityEmoji(a)}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {charger.notes && (
        <div className="bg-slate-50 border-l-3 border-blue-500 rounded-lg p-3 mb-3 text-sm text-gray-600">
          {charger.notes}
        </div>
      )}

      {/* Navigate button */}
      <a
        href={getNavUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-center py-4 rounded-xl font-semibold text-lg transition-colors"
      >
        Navigate
      </a>
    </div>
  );
}
