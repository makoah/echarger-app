'use client';

import { BatteryWarning, RefreshCw } from 'lucide-react';
import { ChargerWithDistance } from '@/types/corridor';
import { ChargerCard } from './ChargerCard';

interface ChargerListProps {
  chargers: ChargerWithDistance[];
  loading?: boolean;
  error?: string | null;
  rangeKm?: number | null;
  onRetry?: () => void;
}

export function ChargerList({ chargers, loading, error, rangeKm, onRetry }: ChargerListProps) {
  // Loading State
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Finding chargers...</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="ml-auto h-6 w-16 bg-gray-200 rounded-lg" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-28 bg-gray-200 rounded-lg" />
            </div>
            <div className="flex gap-2 mb-3">
              <div className="h-7 w-20 bg-gray-200 rounded-lg" />
              <div className="h-7 w-7 bg-gray-200 rounded-md" />
              <div className="h-7 w-7 bg-gray-200 rounded-md" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
          <BatteryWarning className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="font-semibold text-red-900 mb-1">Something went wrong</h3>
        <p className="text-sm text-red-700 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty State
  if (chargers.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <BatteryWarning className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">No chargers within range</h3>
        <p className="text-sm text-gray-600 mb-4">
          Try increasing your range{rangeKm ? ` above ${rangeKm} km` : ''} to see more options.
        </p>
      </div>
    );
  }

  // Results
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            Next {Math.min(chargers.length, 3)} Charging Options
          </h3>
          {rangeKm && <p className="text-sm text-gray-500">Within your {rangeKm} km range</p>}
        </div>
      </div>

      <div className="space-y-3">
        {chargers.slice(0, 3).map((charger) => (
          <ChargerCard key={charger.id} charger={charger} />
        ))}
      </div>

      {chargers.length > 3 && (
        <p className="text-center text-sm text-gray-500">+{chargers.length - 3} more chargers available</p>
      )}
    </div>
  );
}
