'use client';

import { useState, useEffect } from 'react';
import { ChargerRecord, ChargerWithDistance } from '@/types/corridor';
import { filterChargersByRange } from '@/lib/utils/charger-filter';
import { RangeInput } from '@/components/corridor/RangeInput';
import { LocationSelector } from '@/components/corridor/LocationSelector';
import { ChargerList } from '@/components/corridor/ChargerList';

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null);
  const [range, setRange] = useState<number | null>(null);
  const [chargers, setChargers] = useState<ChargerRecord[]>([]);
  const [results, setResults] = useState<ChargerWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chargers on mount
  useEffect(() => {
    async function fetchChargers() {
      try {
        const response = await fetch('/api/chargers');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setChargers(data.chargers);

        // Cache in localStorage
        localStorage.setItem('chargers_cache', JSON.stringify({
          data: data.chargers,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Fetch error:', err);
        // Try loading from cache
        const cached = localStorage.getItem('chargers_cache');
        if (cached) {
          const { data } = JSON.parse(cached);
          setChargers(data);
          setError('Using cached data');
        } else {
          setError('Failed to load chargers');
        }
      } finally {
        setInitialLoading(false);
      }
    }

    // Load saved preferences
    const savedRange = localStorage.getItem('last_range');
    if (savedRange) setRange(Number(savedRange));

    const savedLocation = localStorage.getItem('last_location');
    if (savedLocation) setLocation(JSON.parse(savedLocation));

    fetchChargers();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (range) localStorage.setItem('last_range', String(range));
  }, [range]);

  useEffect(() => {
    if (location) localStorage.setItem('last_location', JSON.stringify(location));
  }, [location]);

  const handleSearch = () => {
    if (!location || !range) return;

    setLoading(true);
    setError(null);

    // Simulate brief loading for UX
    setTimeout(() => {
      const filtered = filterChargersByRange(
        chargers,
        location.lat,
        location.lng,
        range,
        3
      );
      setResults(filtered);
      setLoading(false);
    }, 300);
  };

  const canSearch = location && range && range > 0 && chargers.length > 0;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-5 sticky top-0 z-50 shadow-lg">
        <h1 className="text-xl font-bold">ECharger Helper</h1>
        <p className="text-sm opacity-90">Rotterdam ↔ Santa Pola</p>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Location */}
        <LocationSelector location={location} onLocationChange={setLocation} />

        {/* Range */}
        <RangeInput value={range} onChange={setRange} />

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!canSearch || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            canSearch && !loading
              ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {initialLoading ? 'Loading chargers...' : loading ? 'Searching...' : 'Find Chargers'}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            {error}
          </div>
        )}

        {/* Results */}
        {(results.length > 0 || loading) && (
          <ChargerList chargers={results} loading={loading} rangeKm={range} />
        )}

        {/* Stats */}
        {!loading && chargers.length > 0 && (
          <div className="text-center text-sm text-gray-500 py-4">
            {chargers.length} chargers loaded • 150-400kW
          </div>
        )}
      </main>
    </div>
  );
}
