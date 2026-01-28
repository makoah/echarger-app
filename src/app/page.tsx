'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ChargerRecord, ChargerWithDistance } from '@/types/corridor';
import { filterChargersByRange } from '@/lib/utils/charger-filter';
import { Header } from '@/components/corridor/Header';
import { RangeInput } from '@/components/corridor/RangeInput';
import { LocationSelector } from '@/components/corridor/LocationSelector';
import { ChargerList } from '@/components/corridor/ChargerList';
import { OnRouteToggle } from '@/components/corridor/OnRouteToggle';

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
  const [onRouteOnly, setOnRouteOnly] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch chargers on mount
  useEffect(() => {
    async function fetchChargers() {
      try {
        const response = await fetch('/api/chargers');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setChargers(data.chargers);

        // Cache in localStorage
        localStorage.setItem(
          'chargers_cache',
          JSON.stringify({
            data: data.chargers,
            timestamp: Date.now(),
          })
        );
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

    const savedOnRouteOnly = localStorage.getItem('on_route_only');
    if (savedOnRouteOnly !== null) setOnRouteOnly(savedOnRouteOnly === 'true');

    fetchChargers();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (range) localStorage.setItem('last_range', String(range));
  }, [range]);

  useEffect(() => {
    if (location) localStorage.setItem('last_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem('on_route_only', String(onRouteOnly));
  }, [onRouteOnly]);

  const handleSearch = () => {
    if (!location || !range) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    setTimeout(() => {
      // Filter by on_route if enabled
      const filteredByRoute = onRouteOnly
        ? chargers.filter((c) => c.on_route === 'yes' || c.on_route === 'nearby')
        : chargers;

      const filtered = filterChargersByRange(filteredByRoute, location.lat, location.lng, range, 3);
      setResults(filtered);
      setLoading(false);
    }, 300);
  };

  const canSearch = location && range && range > 0 && chargers.length > 0 && !loading;
  const onRouteCount = chargers.filter((c) => c.on_route === 'yes' || c.on_route === 'nearby').length;
  const totalCount = chargers.length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Location */}
        <LocationSelector location={location} onLocationChange={setLocation} />

        {/* Range */}
        <RangeInput value={range} onChange={setRange} />

        {/* Route Filter Toggle */}
        <OnRouteToggle
          onRouteOnly={onRouteOnly}
          onToggle={setOnRouteOnly}
          onRouteCount={onRouteCount}
          totalCount={totalCount}
        />

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!canSearch}
          className={`w-full min-h-[56px] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-[0.98] ${
            canSearch
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {initialLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading chargers...</span>
            </>
          ) : loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Find Chargers</span>
            </>
          )}
        </button>

        {/* Error */}
        {error && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">{error}</div>
        )}

        {/* Results */}
        {hasSearched && (
          <ChargerList
            chargers={results}
            loading={loading}
            error={null}
            rangeKm={range}
            onRetry={handleSearch}
          />
        )}

        {/* Stats */}
        {!loading && chargers.length > 0 && (
          <p className="text-center text-xs text-gray-500 pt-2">
            {onRouteOnly ? onRouteCount : totalCount} chargers • 150-400kW • Updated just now
          </p>
        )}
      </main>
    </div>
  );
}
