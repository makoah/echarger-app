'use client';

import { useState } from 'react';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Check } from 'lucide-react';

const PRESETS = [50, 100, 150, 200, 250, 300];
const MAX_RANGE = 400;

interface RangeInputProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function RangeInput({ value, onChange }: RangeInputProps) {
  const [customValue, setCustomValue] = useState('');
  const range = value ?? 150;

  const getRangeColor = (val: number) => {
    if (val < 80) return { bg: 'from-red-500 to-red-600', text: 'text-red-600', border: 'border-red-200', bgLight: 'bg-red-50' };
    if (val < 150) return { bg: 'from-amber-500 to-amber-600', text: 'text-amber-600', border: 'border-amber-200', bgLight: 'bg-amber-50' };
    return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600', border: 'border-green-200', bgLight: 'bg-green-50' };
  };

  const getBatteryIcon = (val: number) => {
    if (val < 80) return BatteryLow;
    if (val < 150) return BatteryMedium;
    return BatteryFull;
  };

  const colors = getRangeColor(range);
  const BatteryIcon = getBatteryIcon(range);
  const batteryPercent = Math.min((range / MAX_RANGE) * 100, 100);

  const handlePresetClick = (preset: number) => {
    onChange(preset);
    setCustomValue('');
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onChange(val);
    setCustomValue('');
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    const numValue = parseInt(val);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= MAX_RANGE) {
      onChange(numValue);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Battery className={`w-5 h-5 ${colors.text}`} />
        <h2 className="font-semibold text-gray-900">Remaining Range</h2>
      </div>

      {/* Main Range Display */}
      <div className={`relative rounded-xl ${colors.bgLight} ${colors.border} border p-4 mb-4`}>
        <div className="flex items-center justify-center gap-3">
          <BatteryIcon className={`w-8 h-8 ${colors.text}`} />
          <div className="text-center">
            <span className={`text-4xl font-bold ${colors.text}`}>{range}</span>
            <span className={`text-xl font-medium ${colors.text} ml-1`}>km</span>
          </div>
        </div>

        {/* Battery fill indicator */}
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colors.bg} rounded-full transition-all duration-300`}
            style={{ width: `${batteryPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0 km</span>
          <span>{MAX_RANGE} km</span>
        </div>
      </div>

      {/* Slider Input */}
      <div className="mb-4">
        <input
          type="range"
          min="20"
          max={MAX_RANGE}
          value={range}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((range - 20) / (MAX_RANGE - 20)) * 100}%, #e5e7eb ${((range - 20) / (MAX_RANGE - 20)) * 100}%, #e5e7eb 100%)`,
          }}
        />
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((preset) => {
          const isActive = range === preset;
          return (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isActive && <Check className="w-4 h-4" />}
              <span>{preset}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Input */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Custom:</label>
        <input
          type="number"
          min="0"
          max={MAX_RANGE}
          value={customValue}
          onChange={handleCustomInput}
          placeholder={`${range}`}
          className="w-20 min-h-[44px] px-3 py-2 text-center rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <span className="text-sm text-gray-600">km</span>
      </div>
    </div>
  );
}
