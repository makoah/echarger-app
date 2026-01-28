'use client';

import { useState } from 'react';
import { MapPin, Navigation, ChevronDown, Check, Loader2 } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

interface LocationSelectorProps {
  location: Location | null;
  onLocationChange: (location: Location) => void;
}

const CITIES: { name: string; country: string; lat: number; lng: number }[] = [
  { name: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lng: 4.4777 },
  { name: 'Breda', country: 'Netherlands', lat: 51.5719, lng: 4.7683 },
  { name: 'Antwerp', country: 'Belgium', lat: 51.2194, lng: 4.4025 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Orleans', country: 'France', lat: 47.9029, lng: 1.9092 },
  { name: 'Clermont-Ferrand', country: 'France', lat: 45.7772, lng: 3.0870 },
  { name: 'Lyon', country: 'France', lat: 45.764, lng: 4.8357 },
  { name: 'Millau', country: 'France', lat: 44.0969, lng: 3.0833 },
  { name: 'Montpellier', country: 'France', lat: 43.6108, lng: 3.8767 },
  { name: 'Perpignan', country: 'France', lat: 42.6887, lng: 2.8948 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { name: 'Valencia', country: 'Spain', lat: 39.4699, lng: -0.3763 },
  { name: 'Alicante', country: 'Spain', lat: 38.3452, lng: -0.4815 },
  { name: 'Santa Pola', country: 'Spain', lat: 38.1911, lng: -0.5566 },
];

export function LocationSelector({ location, onLocationChange }: LocationSelectorProps) {
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleGpsClick = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported');
      return;
    }

    setIsGpsLoading(true);
    setIsGpsActive(false);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGpsLoading(false);
        setIsGpsActive(true);
        const nearestCity = findNearestCity(position.coords.latitude, position.coords.longitude);
        onLocationChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: nearestCity || 'Current Location',
        });
      },
      () => {
        setIsGpsLoading(false);
        setGpsError('Unable to get location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCitySelect = (city: (typeof CITIES)[0]) => {
    setIsGpsActive(false);
    onLocationChange({
      lat: city.lat,
      lng: city.lng,
      name: `${city.name}, ${city.country}`,
    });
    setShowDropdown(false);
  };

  const displayLocation = location?.name || (location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : null);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-gray-900">Your Location</h2>
      </div>

      {/* GPS Button */}
      <button
        onClick={handleGpsClick}
        disabled={isGpsLoading}
        className="w-full min-h-[48px] flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
      >
        {isGpsLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Detecting location...</span>
          </>
        ) : (
          <>
            <div className="relative">
              <Navigation className="w-5 h-5" />
              {isGpsActive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            <span>Use GPS Location</span>
          </>
        )}
      </button>

      {/* GPS Error */}
      {gpsError && (
        <p className="mt-2 text-sm text-red-600">{gpsError}</p>
      )}

      {/* Current Location Display */}
      {displayLocation && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">{displayLocation}</span>
        </div>
      )}

      {/* City Dropdown */}
      <div className="mt-4 relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full min-h-[44px] flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition-all duration-200 hover:bg-gray-100"
        >
          <span className="text-sm">or select a city</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10 max-h-64 overflow-y-auto">
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city)}
                className="w-full min-h-[44px] flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div>
                  <span className="font-medium text-gray-900">{city.name}</span>
                  <span className="text-sm text-gray-500 ml-2">{city.country}</span>
                </div>
                {location?.name === `${city.name}, ${city.country}` && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function findNearestCity(lat: number, lng: number): string | null {
  let nearest: string | null = null;
  let minDist = Infinity;

  for (const city of CITIES) {
    const dist = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = `${city.name}, ${city.country}`;
    }
  }

  return nearest;
}
