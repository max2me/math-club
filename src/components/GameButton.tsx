import { RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

type GameButtonProps = {
  onClick: () => void;
  variant: 'next' | 'verify' | 'error';
  children: ReactNode;
  type?: 'button' | 'submit';
  className?: string;
};

const variantStyles = {
  next: 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
  verify: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white',
  error: 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] text-white',
};

export function GameButton({ onClick, variant, children, type = 'button', className = '' }: GameButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`mt-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm md:text-base lg:text-xl shadow-xl active:scale-95 transition-all w-full max-w-[320px] flex justify-center items-center gap-2 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function NextMissionButton({ onClick, label = 'NEXT MISSION' }: { onClick: () => void; label?: string }) {
  return (
    <GameButton onClick={onClick} variant="next">
      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
      {label}
    </GameButton>
  );
}
