import { Gamepad2, PenTool, Swords, Target } from 'lucide-react';
import type { GameMode } from '../constants';

type GameMenuProps = {
  onSelect: (mode: GameMode) => void;
};

const GAMES = [
  {
    id: 'power-grid' as GameMode,
    title: 'Match Maker',
    description: 'Set each digit to match the target number',
    icon: Gamepad2,
    color: 'from-blue-600 to-indigo-600',
    hoverColor: 'hover:from-blue-500 hover:to-indigo-500',
    shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  },
  {
    id: 'value-decoder' as GameMode,
    title: 'Value Decoder',
    description: 'Identify the value of a highlighted digit',
    icon: PenTool,
    color: 'from-emerald-600 to-teal-600',
    hoverColor: 'hover:from-emerald-500 hover:to-teal-500',
    shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
  },
  {
    id: 'number-clash' as GameMode,
    title: 'Number Clash',
    description: 'Compare two numbers and pick the correct operator',
    icon: Swords,
    color: 'from-amber-600 to-orange-600',
    hoverColor: 'hover:from-amber-500 hover:to-orange-500',
    shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]',
  },
  {
    id: 'number-rounder' as GameMode,
    title: 'Number Rounder',
    description: 'Round numbers to the nearest ten, hundred, or thousand',
    icon: Target,
    color: 'from-purple-600 to-fuchsia-600',
    hoverColor: 'hover:from-purple-500 hover:to-fuchsia-500',
    shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
  },
];

export function GameMenu({ onSelect }: GameMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto px-4 gap-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-widest drop-shadow-lg">
          Place Value Explorer
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-3 font-medium">Choose a game to play</p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {GAMES.map(game => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => onSelect(game.id)}
              className={`w-full flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r ${game.color} ${game.hoverColor} ${game.shadow} text-white font-bold shadow-xl active:scale-[0.98] transition-all`}
            >
              <Icon className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 stroke-[2.5]" />
              <div className="text-left">
                <div className="text-lg sm:text-2xl font-black">{game.title}</div>
                <div className="text-sm sm:text-base opacity-80 font-medium">{game.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
