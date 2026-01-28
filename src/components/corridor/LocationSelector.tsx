'use client';

import { useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

interface LocationSelectorProps {
  location: Location | null;
  onLocationChange: (location: Location) => void;
}

const CITIES: { name: string; lat: number; lng: number }[] = [
  { name: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
  { name: 'Breda', lat: 51.5719, lng: 4.7683 },
  { name: 'Antwerp', lat: 51.2194, lng: 4.4025 },
  { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Orleans', lat: 47.9029, lng: 1.9092 },
  { name: 'Clermont-Ferrand', lat: 45.7772, lng: 3.0870 },
  { name: 'Millau', lat: 44.0969, lng: 3.0833 },
  { name: 'Montpellier', lat: 43.6108, lng: 3.8767 },
  { name: 'Perpignan', lat: 42.6887, lng: 2.8948 },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
  { name: 'Alicante', lat: 38.3452, lng: -0.4815 },
  { name: 'Santa Pola', lat: 38.1911, lng: -0.5566 },
];

export function LocationSelector({ location, onLocationChange }: LocationSelectorProps) {
  const [mode, setMode] = useState<'gps' | 'manual'>('manual');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Current Location',
        });
        setGpsLoading(false);
        setMode('gps');
      },
      (error) => {
        setGpsError('Unable to get location');
        setGpsLoading(false);
        console.error('GPS error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = CITIES.find((c) => c.name === e.target.value);
    if (city) {
      onLocationChange({ lat: city.lat, lng: city.lng, name: city.name });
      setMode('manual');
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <label className="block text-sm font-medium text-gray-600 mb-2">
        Your Location
      </label>

      <div className="flex gap-2 mb-3">
        <button
          onClick={handleGPS}
          disabled={gpsLoading}
          className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            mode === 'gps' && location
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {gpsLoading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>📍</span>
          )}
          {gpsLoading ? 'Getting...' : 'Use GPS'}
        </button>

        <select
          value={mode === 'manual' && location?.name ? location.name : ''}
          onChange={handleCitySelect}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all cursor-pointer ${
            mode === 'manual' && location
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <option value="">Select city...</option>
          {CITIES.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {gpsError && (
        <p className="text-sm text-red-600 mb-2">{gpsError}</p>
      )}

      {location && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
          📍 {location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
        </div>
      )}
    </div>
  );
}
