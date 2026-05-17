import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
  onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute top-2 left-2 sm:top-4 sm:left-4 z-40 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md border-2 border-slate-700 rounded-xl px-3 py-2 sm:py-3 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-700 transition-all shadow-xl active:scale-95"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Menu</span>
    </button>
  );
}
