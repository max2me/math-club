import { Star } from 'lucide-react';
import { useScore } from '../hooks/useScore';

export function ScoreDisplay() {
  const { streak, totalStars } = useScore();

  return (
    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40 flex items-center gap-3 bg-slate-800/90 backdrop-blur-md border-2 border-slate-700 rounded-xl px-3 py-2 sm:py-2.5 shadow-xl">
      <div className="flex items-center gap-1.5">
        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
        <span className="text-xs sm:text-sm font-black text-amber-400 tabular-nums">{streak}</span>
      </div>
      <div className="w-px h-4 bg-slate-600" />
      <div className="flex items-center gap-1">
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Total</span>
        <span className="text-xs sm:text-sm font-black text-slate-200 tabular-nums">{totalStars}</span>
      </div>
    </div>
  );
}
