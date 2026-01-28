'use client';

import { ChargerWithDistance } from '@/types/corridor';
import { ChargerCard } from './ChargerCard';

interface ChargerListProps {
  chargers: ChargerWithDistance[];
  loading?: boolean;
  rangeKm?: number | null;
}

export function ChargerList({ chargers, loading, rangeKm }: ChargerListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 h-16 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (chargers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">⚠️</div>
        <h3 className="font-semibold text-yellow-800 mb-1">No chargers in range</h3>
        <p className="text-sm text-yellow-700">
          Try increasing your range or check your location.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-700">
          Next {chargers.length} Charging Options
        </h2>
        {rangeKm && (
          <span className="text-sm text-gray-500">within {rangeKm}km</span>
        )}
      </div>
      <div className="space-y-4">
        {chargers.map((charger) => (
          <ChargerCard key={charger.id} charger={charger} />
        ))}
      </div>
    </div>
  );
}
