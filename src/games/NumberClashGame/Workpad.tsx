import type { PlacedItem } from './types';

type WorkpadProps = {
  placedItems: PlacedItem[];
  onRemove: (id: string) => void;
};

export function Workpad({ placedItems, onRemove }: WorkpadProps) {
  const isCellOccupied = (row: number, col: number) => {
    return placedItems.some(item => {
      if (item.row !== row) return false;
      const len = new Intl.NumberFormat('en-US').format(item.value).length;
      return col >= item.col && col < item.col + len;
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-2xl mx-auto px-2 sm:px-4 pb-4 sm:pb-6 mt-4">
      {[0, 1].map(row => (
        <div key={`row-${row}`} className="relative grid grid-cols-9 gap-1 sm:gap-2 h-10 sm:h-12 md:h-14 w-full">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => (
            <div
              key={`zone-${row}-${col}`}
              className="row-start-1 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-600/50 bg-slate-800/30"
              style={{ gridColumnStart: col + 1 }}
            >
              {!isCellOccupied(row, col) && (
                <span className="text-slate-600/30 font-black text-xl sm:text-2xl tabular-nums select-none pointer-events-none">0</span>
              )}
            </div>
          ))}
          {placedItems.filter(item => item.row === row).map(item => {
            const formatted = new Intl.NumberFormat('en-US').format(item.value);
            const digits = formatted.split('');
            return (
              <div
                key={item.id}
                onClick={() => onRemove(item.id)}
                style={{
                  gridColumnStart: item.col + 1,
                  gridColumnEnd: `span ${digits.length}`,
                }}
                className="row-start-1 h-full z-10 flex gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {digits.map((d, i) => {
                  const isComma = d === ',';
                  return (
                    <div
                      key={i}
                      className={`flex-1 border-2 border-slate-500/50 bg-slate-800/80 ${item.colorClass || 'text-slate-100'} flex items-center justify-center font-black ${isComma ? 'text-2xl sm:text-3xl items-end pb-1 sm:pb-2 bg-transparent border-transparent' : 'text-xl sm:text-2xl'} tabular-nums shadow-sm select-none`}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
