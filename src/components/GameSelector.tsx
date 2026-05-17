import { ChevronDown } from 'lucide-react';
import type { GameMode } from '../constants';

type GameSelectorProps = {
  value: GameMode;
  onChange: (mode: GameMode) => void;
};

export function GameSelector({ value, onChange }: GameSelectorProps) {
  return (
    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as GameMode)}
          className="bg-slate-800/90 backdrop-blur-md text-slate-200 border-2 border-slate-700 rounded-xl pl-3 pr-10 py-2 sm:py-3 text-xs sm:text-sm font-bold outline-none hover:bg-slate-700 transition-all cursor-pointer appearance-none shadow-xl"
        >
          <option value="power-grid">Match Maker</option>
          <option value="value-decoder">Value Decoder</option>
          <option value="number-clash">Number Clash</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
