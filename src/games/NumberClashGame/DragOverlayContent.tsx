type DragOverlayContentProps = {
  value: number;
  colorClass?: string;
};

export function DragOverlayContent({ value, colorClass = 'text-slate-100' }: DragOverlayContentProps) {
  const digits = new Intl.NumberFormat('en-US').format(value).split('');

  return (
    <div className="flex p-1.5 sm:p-2 bg-slate-800 border-2 border-teal-500 rounded-2xl shadow-2xl opacity-90 cursor-grabbing gap-1 sm:gap-2 rotate-2 scale-105 pointer-events-none select-none">
      <div className="flex items-center justify-center px-1 text-teal-500 pointer-events-none">
        <div className="flex flex-col gap-1 w-2">
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
        </div>
      </div>
      {digits.map((d, i) => {
        const isComma = d === ',';
        return (
          <div
            key={i}
            className={`w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 ${isComma ? `bg-transparent border-transparent ${colorClass} items-end pb-1 sm:pb-2 text-2xl sm:text-3xl` : `bg-slate-700 rounded-xl border border-slate-500 ${colorClass} text-xl sm:text-2xl`} flex justify-center font-black tabular-nums shadow-sm items-center`}
          >
            {d}
          </div>
        );
      })}
    </div>
  );
}
