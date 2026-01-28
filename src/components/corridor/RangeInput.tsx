'use client';

interface RangeInputProps {
  value: number | null;
  onChange: (value: number) => void;
}

const PRESETS = [50, 100, 150, 200, 250, 300];

export function RangeInput({ value, onChange }: RangeInputProps) {
  const getRangeColor = (km: number) => {
    if (km < 100) return 'text-red-600';
    if (km < 200) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <label className="block text-sm font-medium text-gray-600 mb-2">
        Remaining Range (km)
      </label>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="Enter km"
          min={0}
          max={500}
          className={`flex-1 text-3xl font-bold p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none ${
            value ? getRangeColor(value) : 'text-gray-400'
          }`}
        />
        <span className="text-2xl font-semibold text-gray-400">km</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={`py-3 px-4 rounded-lg font-semibold text-lg transition-all ${
              value === preset
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
