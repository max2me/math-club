import { useDraggable } from '@dnd-kit/core';

export function MainDraggableNumberBlock({ id, value, colorClass, dropShadowClass }: { id: string; value: number; colorClass: string; dropShadowClass: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type: 'number', value, colorClass },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-slate-800 p-4 sm:p-6 md:p-8 rounded-3xl border-4 border-slate-700 shadow-2xl flex-1 flex justify-center items-center h-28 sm:h-36 md:h-48 w-full md:w-auto touch-none select-none ${isDragging ? 'opacity-50 scale-95 cursor-grabbing' : 'opacity-100 cursor-grab active:cursor-grabbing hover:bg-slate-700/50 transition-colors'}`}
    >
      <span className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black ${colorClass} tracking-widest ${dropShadowClass} tabular-nums pointer-events-none`}>
        {new Intl.NumberFormat('en-US').format(value)}
      </span>
    </div>
  );
}

export function DraggableNumberBlock({ id, value, fluid = false, colorClass = 'text-slate-100' }: { id: string; value: number; fluid?: boolean; colorClass?: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type: 'number', value, colorClass },
  });

  if (value === undefined || value === null) return null;

  const digits = new Intl.NumberFormat('en-US').format(value).split('');

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex touch-none select-none ${fluid ? 'w-full h-full' : 'p-1.5 sm:p-2 bg-slate-800/80 border-2 border-slate-600/50 rounded-2xl hover:border-teal-500/50 hover:bg-slate-700/80 transition-all shadow-md active:scale-95'} gap-1 sm:gap-2 ${isDragging ? 'opacity-0' : 'opacity-100 cursor-grab active:cursor-grabbing'}`}
    >
      {!fluid && (
        <div className="flex items-center justify-center px-1 text-slate-500 pointer-events-none">
          <div className="flex flex-col gap-1 w-2">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
          </div>
        </div>
      )}
      {digits.map((d, i) => {
        const isComma = d === ',';
        return (
          <div
            key={i}
            className={`${fluid ? 'flex-1 border-2 border-slate-500/50 bg-slate-800/80' : `w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 bg-slate-700 rounded-xl border border-slate-500`} ${colorClass} flex items-center justify-center font-black ${isComma ? 'text-2xl sm:text-3xl items-end pb-1 sm:pb-2 bg-transparent border-transparent' : 'text-xl sm:text-2xl'} tabular-nums shadow-sm pointer-events-none select-none delay-75`}
          >
            {d}
          </div>
        );
      })}
    </div>
  );
}
