import ConfettiExplosion from 'react-confetti-explosion';

export function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
      <ConfettiExplosion force={0.8} duration={3000} particleCount={250} width={1600} />
    </div>
  );
}
