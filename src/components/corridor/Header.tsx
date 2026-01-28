'use client';

import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 backdrop-blur-sm">
      <div className="px-4 py-4 safe-area-inset-top">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              ECharger Helper
            </h1>
            <p className="text-sm text-white/70">
              Rotterdam ↔ Santa Pola
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
