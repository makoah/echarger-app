'use client';

import { Zap, Navigation, ExternalLink } from 'lucide-react';
import { ChargerWithDistance } from '@/types/corridor';

const NETWORK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Ionity: { bg: 'bg-[#0047AB]', text: 'text-white', border: 'border-l-[#0047AB]' },
  IONITY: { bg: 'bg-[#0047AB]', text: 'text-white', border: 'border-l-[#0047AB]' },
  Fastned: { bg: 'bg-[#FFC300]', text: 'text-gray-900', border: 'border-l-[#FFC300]' },
  Tesla: { bg: 'bg-[#CC0000]', text: 'text-white', border: 'border-l-[#CC0000]' },
  'Shell Recharge': { bg: 'bg-[#FFD700]', text: 'text-gray-900', border: 'border-l-[#FFD700]' },
  Electra: { bg: 'bg-[#7C3AED]', text: 'text-white', border: 'border-l-[#7C3AED]' },
  TotalEnergies: { bg: 'bg-[#FF6B35]', text: 'text-white', border: 'border-l-[#FF6B35]' },
  default: { bg: 'bg-gray-500', text: 'text-white', border: 'border-l-gray-500' },
};

const HIGHWAY_BADGES: Record<string, { label: string; icon: string; color: string }> = {
  at_exit: { label: 'At Exit', icon: '🛣️', color: 'bg-green-100 text-green-800' },
  near_exit: { label: 'Near Exit', icon: '🅿️', color: 'bg-amber-100 text-amber-800' },
  town: { label: 'In Town', icon: '🏘️', color: 'bg-orange-100 text-orange-800' },
};

const AMENITY_ICONS: Record<string, { icon: string; label: string }> = {
  food: { icon: '🍔', label: 'Food' },
  toilets: { icon: '🚻', label: 'Toilets' },
  coffee: { icon: '☕', label: 'Coffee' },
  shop: { icon: '🛒', label: 'Shop' },
  seating: { icon: '🪑', label: 'Seating' },
  wifi: { icon: '📶', label: 'WiFi' },
  indoor_seating: { icon: '🪑', label: 'Indoor Seating' },
  shopping: { icon: '🛍️', label: 'Shopping' },
};

interface ChargerCardProps {
  charger: ChargerWithDistance;
}

export function ChargerCard({ charger }: ChargerCardProps) {
  const networkStyle = NETWORK_COLORS[charger.network] || NETWORK_COLORS.default;
  const highwayBadge = HIGHWAY_BADGES[charger.highway_proximity];
  const amenityList = charger.amenities
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

  const getRangeColor = (rangeAfter: number) => {
    if (rangeAfter < 50) return 'bg-red-100 text-red-700 border-red-200';
    if (rangeAfter < 100) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const formatConnectors = () => {
    const types = charger.connector_types.split(',').map((t) => t.trim());
    const numPerType = Math.ceil(charger.num_chargers / types.length);
    return types.map((t) => `${numPerType}× ${t}`).join(', ');
  };

  const handleNavigate = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const coords = `${charger.latitude},${charger.longitude}`;
    const url = isIOS
      ? `maps://maps.apple.com/?daddr=${coords}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-md overflow-hidden border-l-4 ${networkStyle.border} transition-all duration-200 active:scale-[0.99]`}
    >
      {/* Header Row */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${networkStyle.bg} ${networkStyle.text}`}>
              {charger.network}
            </span>
            <span className="text-sm font-semibold text-gray-900 line-clamp-1">{charger.name}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
            <span className="text-xs font-bold text-gray-800">{charger.power_kw} kW</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">{charger.distanceKm}</span>
            <span className="text-sm text-gray-500 ml-1">km away</span>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getRangeColor(charger.rangeAfterKm)}`}
          >
            <span className="text-xs">→</span>
            <span className="text-sm font-semibold">{charger.rangeAfterKm} km left</span>
          </div>
        </div>
      </div>

      {/* Highway Badge & Amenities */}
      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        {highwayBadge && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${highwayBadge.color}`}
          >
            <span>{highwayBadge.icon}</span>
            {highwayBadge.label}
          </span>
        )}
        <div className="flex items-center gap-1">
          {amenityList.map((amenity) => {
            const amenityInfo = AMENITY_ICONS[amenity];
            if (!amenityInfo) return null;
            return (
              <span
                key={amenity}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 text-sm"
                title={amenityInfo.label}
              >
                {amenityInfo.icon}
              </span>
            );
          })}
        </div>
      </div>

      {/* Connector Info */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-500">{formatConnectors()}</p>
      </div>

      {/* Notes */}
      {charger.notes && (
        <div className="px-4 pb-3">
          <div className="bg-slate-50 border-l-2 border-blue-400 rounded-r-lg p-3 text-xs text-gray-600">
            {charger.notes}
          </div>
        </div>
      )}

      {/* Navigate Button */}
      <div className="p-4 pt-0">
        <button
          onClick={handleNavigate}
          className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md shadow-blue-500/25 transition-all duration-200 active:scale-[0.98]"
        >
          <Navigation className="w-5 h-5" />
          <span>Navigate</span>
          <ExternalLink className="w-4 h-4 opacity-70" />
        </button>
      </div>
    </div>
  );
}
