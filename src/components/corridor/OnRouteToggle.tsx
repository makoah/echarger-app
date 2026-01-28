'use client';

import { useState } from 'react';
import { Route, Info, X } from 'lucide-react';

interface OnRouteToggleProps {
  onRouteOnly: boolean;
  onToggle: (value: boolean) => void;
  onRouteCount: number;
  totalCount: number;
}

export function OnRouteToggle({ onRouteOnly, onToggle, onRouteCount, totalCount }: OnRouteToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Route className="w-5 h-5 text-blue-600" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">On-route only</span>
              <button
                onClick={() => setShowTooltip(true)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="What is on-route?"
              >
                <Info className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {onRouteOnly ? (
                <span className="text-green-600 font-medium">{onRouteCount} verified chargers</span>
              ) : (
                <span>{totalCount} total chargers</span>
              )}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(!onRouteOnly)}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
            onRouteOnly ? 'bg-green-500' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={onRouteOnly}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
              onRouteOnly ? 'translate-x-8' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Tooltip Modal */}
      {showTooltip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowTooltip(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">On-route Chargers</h3>
              <button
                onClick={() => setShowTooltip(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              On-route chargers are located directly along the Rotterdam-Santa Pola corridor,
              typically at highway exits or rest areas. These are verified for easy highway access
              and minimal detour time.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
              Disable this to see all chargers within your range, including those in nearby towns.
            </p>
            <button
              onClick={() => setShowTooltip(false)}
              className="mt-4 w-full min-h-[44px] px-4 py-2 bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
