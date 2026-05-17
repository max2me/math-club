import { PLACE_COLORS } from '../../constants';

type ClickableNumberProps = {
  number: number;
  highlightedIndex: number | null;
  onDigitClick: (index: number) => void;
};

export function ClickableNumber({ number, highlightedIndex, onDigitClick }: ClickableNumberProps) {
  const numStr = number.toString();
  const totalDigits = numStr.length;
  const formatted = new Intl.NumberFormat('en-US').format(number);
  const chars = formatted.split('');

  let digitIndex = 0;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {chars.map((char, i) => {
        if (char === ',') {
          return (
            <span key={`comma-${i}`} className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-500">
              ,
            </span>
          );
        }

        const currentDigitIndex = digitIndex;
        digitIndex++;

        const isHighlighted = highlightedIndex === currentDigitIndex;
        // Position from right: ones=0, tens=1, hundreds=2, etc.
        const placeFromRight = totalDigits - 1 - currentDigitIndex;
        const placeStyle = PLACE_COLORS[placeFromRight % PLACE_COLORS.length];

        return (
          <button
            key={`digit-${i}`}
            onClick={() => onDigitClick(currentDigitIndex)}
            className={`w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-black rounded-xl border-2 transition-all active:scale-95 ${isHighlighted ? `${placeStyle.bgLight} ${placeStyle.border} ${placeStyle.color} ring-2 ${placeStyle.ring}` : 'bg-slate-800 border-slate-600 text-slate-200 hover:border-slate-400 hover:bg-slate-700'}`}
          >
            {char}
          </button>
        );
      })}
    </div>
  );
}
