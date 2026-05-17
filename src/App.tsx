import { useState, useEffect } from 'react';
import type { GameMode } from './constants';
import { GameMenu } from './components/GameMenu';
import { BackButton } from './components/BackButton';
import { ScoreDisplay } from './components/ScoreDisplay';
import { PowerGridGame } from './games/PowerGridGame';
import { ValueDecoderGame } from './games/ValueDecoderGame';
import { NumberClashGame } from './games/NumberClashGame';

function getInitialGameMode(): GameMode | null {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'value-decoder' || hash === 'number-clash' || hash === 'power-grid') return hash;
  return null;
}

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode | null>(getInitialGameMode);

  useEffect(() => {
    window.location.hash = gameMode ?? '';
  }, [gameMode]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as GameMode;
      if (hash === 'value-decoder' || hash === 'power-grid' || hash === 'number-clash') {
        setGameMode(hash);
      } else {
        setGameMode(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-slate-900 text-white font-sans flex flex-col relative selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none" />

      {gameMode && <BackButton onClick={() => setGameMode(null)} />}
      {gameMode && <ScoreDisplay />}

      <div className="relative z-10 flex flex-col min-h-0 w-full max-w-[1200px] mx-auto px-2 py-2 sm:py-4 pt-12 sm:pt-16 h-full">
        {!gameMode && <GameMenu onSelect={setGameMode} />}
        {gameMode === 'power-grid' && <PowerGridGame />}
        {gameMode === 'value-decoder' && <ValueDecoderGame />}
        {gameMode === 'number-clash' && <NumberClashGame />}
      </div>
    </div>
  );
}
