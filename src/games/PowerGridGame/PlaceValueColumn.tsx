import { ChevronUp, ChevronDown } from 'lucide-react';
import type { PlaceColumn } from '../../constants';

type PlaceValueColumnProps = {
  col: PlaceColumn;
  value: number;
  disabled: boolean;
  focused?: boolean;
  onFocus?: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function PlaceValueColumn({ col, value, disabled, focused, onFocus, onIncrement, onDecrement }: PlaceValueColumnProps) {
  const isAtMax = value === 9;
  const isAtMin = value === 0;

  return (
    <div
      onClick={onFocus}
      className={`relative flex flex-col justify-between items-center flex-1 w-0 max-w-[120px] min-w-[32px] ${col.bgLight} ${col.border} border sm:border-2 p-0.5 sm:p-1 md:p-2 rounded-lg sm:rounded-xl transition-all duration-500 ${focused ? `ring-2 ${col.ring}` : ''}`}
    >
      <div className="text-center h-6 sm:h-10 md:h-12 flex flex-col justify-end w-full mb-0.5 sm:mb-1 px-0.5 overflow-hidden">
        <span className="text-[5px] sm:text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-tight mb-0.5 truncate">
          {col.type === 'whole' ? 'WHOLE' : 'PIECES'}
        </span>
        <span className={`text-[6px] sm:text-[9px] md:text-xs font-black ${col.color} truncate leading-tight`}>
          {col.title}
        </span>
      </div>

      <div className="flex flex-col flex-1 items-center justify-center w-full min-h-0 py-0.5">
        <button
          onClick={onIncrement}
          disabled={isAtMax || disabled}
          className={`w-full flex-none flex justify-center items-center h-5 sm:h-8 md:h-10 rounded-sm sm:rounded-md md:rounded-lg transition-all active:scale-95 ${isAtMax || disabled ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-white shadow-md'}`}
        >
          <ChevronUp className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>

        <div className="my-0.5 sm:my-1.5 md:my-2 w-full flex-1 flex items-center justify-center min-h-[20px] sm:min-h-[30px] md:min-h-[40px] text-base sm:text-2xl md:text-3xl font-black bg-slate-900 rounded-sm sm:rounded-md md:rounded-lg shadow-inner border border-slate-800">
          <span className={col.color}>{value}</span>
        </div>

        <button
          onClick={onDecrement}
          disabled={isAtMin || disabled}
          className={`w-full flex-none flex justify-center items-center h-5 sm:h-8 md:h-10 rounded-sm sm:rounded-md md:rounded-lg transition-all active:scale-95 ${isAtMin || disabled ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-white shadow-md'}`}
        >
          <ChevronDown className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <div className="text-center mt-0.5 sm:mt-1 text-[5px] sm:text-[7px] md:text-[9px] font-bold text-slate-500 opacity-80 h-3 sm:h-4 truncate w-full px-0.5">
        {col.label}
      </div>
    </div>
  );
}
