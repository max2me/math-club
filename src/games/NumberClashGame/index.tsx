import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { RefreshCw, PenTool, Trash2 } from 'lucide-react';
import { Confetti } from '../../components/Confetti';
import { useShakeOnError } from '../../hooks/useShakeOnError';
import { MainDraggableNumberBlock } from './DraggableNumberBlock';
import { DragWorkpad } from './DragWorkpad';
import { DragOverlayContent } from './DragOverlayContent';
import { generatePair } from './generatePair';
import type { PlacedItem, CompareOp } from './types';

export function NumberClashGame() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [selectedOp, setSelectedOp] = useState<CompareOp | null>(null);
  const [clearCount, setClearCount] = useState(0);
  const { isError, triggerError, shakeAnimation } = useShakeOnError(1000);

  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [activeNode, setActiveNode] = useState<{ id: string; value: number; colorClass?: string } | null>(null);
  const [overZone, setOverZone] = useState<{ row: number; col: number } | null>(null);

  const startNewRound = () => {
    const [n1, n2] = generatePair();
    setNum1(n1);
    setNum2(n2);
    setIsWin(false);
    setSelectedOp(null);
    setClearCount(c => c + 1);
  };

  useEffect(() => { startNewRound(); }, []);
  useEffect(() => { setPlacedItems([]); }, [clearCount, num1, num2]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter' && isWin) {
        e.preventDefault();
        startNewRound();
        return;
      }

      if (e.key === '<' || e.key === ',') {
        e.preventDefault();
        handleCompare('<');
        return;
      }
      if (e.key === '>' || e.key === '.') {
        e.preventDefault();
        handleCompare('>');
        return;
      }
      if (e.key === '=' || e.key === 'e') {
        e.preventDefault();
        handleCompare('=');
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWin, num1, num2]);

  const handleCompare = (op: CompareOp) => {
    if (isWin) return;
    const correct =
      (op === '<' && num1 < num2) ||
      (op === '>' && num1 > num2) ||
      (op === '=' && num1 === num2);

    setSelectedOp(op);
    if (correct) {
      setIsWin(true);
    } else {
      triggerError();
      setTimeout(() => setSelectedOp(null), 1000);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.value !== undefined) {
      setActiveNode({ id: active.id as string, value: active.data.current.value, colorClass: active.data.current.colorClass });
    }
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (over && over.id.toString().startsWith('zone-')) {
      const parts = over.id.toString().split('-');
      setOverZone({ row: parseInt(parts[1], 10), col: parseInt(parts[2], 10) });
    } else {
      setOverZone(null);
    }
  };

  const handleDragEnd = (event: any) => {
    const { over, active } = event;
    setActiveNode(null);
    setOverZone(null);

    if (!over || !over.id.toString().startsWith('zone-')) {
      setPlacedItems(items => items.filter(item => item.id !== active.id));
      return;
    }

    if (active.data.current?.type === 'number') {
      const parts = over.id.toString().split('-');
      const row = parseInt(parts[1], 10);
      const col = parseInt(parts[2], 10);
      const valStrLen = new Intl.NumberFormat('en-US').format(active.data.current.value).length;

      let adjustedCol = col;
      if (col + valStrLen > 9) adjustedCol = 9 - valStrLen;
      if (adjustedCol < 0) adjustedCol = 0;

      setPlacedItems(items => {
        let targetId = active.id as string;
        const targetColorClass = active.data.current?.colorClass || 'text-slate-100';
        const newItems = items.filter(item => item.id !== active.id);

        if (targetId.startsWith('src-')) {
          targetId = `placed-${targetId}-${Date.now()}`;
        }

        newItems.push({ id: targetId, value: active.data.current.value, row, col: adjustedCol, colorClass: targetColorClass });
        return newItems;
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <motion.div
        animate={shakeAnimation}
        transition={{ duration: 0.4 }}
        className="w-full shrink-0 flex flex-col flex-1 items-center justify-start gap-6 px-2 pb-20 relative overflow-y-auto"
      >
        <Confetti active={isWin} />

        <div className="text-center mt-4">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-200 uppercase tracking-widest drop-shadow-lg mb-2">Number Clash</h2>
          <p className="text-slate-400 text-sm sm:text-base font-medium">Which power level is greater?</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 w-full max-w-4xl">
          <MainDraggableNumberBlock
            id="src-1"
            value={num1}
            colorClass="text-amber-400"
            dropShadowClass="drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
          />

          <div className="flex justify-center shrink-0 w-full md:w-32 z-10 md:-mx-4 -my-4 md:my-0">
            {isWin ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-emerald-500 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 border-4 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] z-10"
              >
                {selectedOp}
              </motion.div>
            ) : (
              <div className="flex md:flex-col gap-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border-2 border-slate-700 shadow-2xl">
                {(['<', '=', '>'] as const).map(op => (
                  <button
                    key={op}
                    onClick={() => handleCompare(op)}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black transition-all active:scale-95 ${selectedOp === op && isError ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600'}`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>

          <MainDraggableNumberBlock
            id="src-2"
            value={num2}
            colorClass="text-cyan-400"
            dropShadowClass="drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
          />
        </div>

        <div className="w-full max-w-2xl mt-4 sm:mt-8 bg-slate-900 rounded-3xl p-4 sm:p-6 border-4 border-slate-700 shadow-2xl relative select-none">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-300 font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2">
              <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" /> Workpad (Align your digits)
            </h3>
            <button
              onClick={() => setClearCount(c => c + 1)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> CLEAR
            </button>
          </div>
          <div className="relative w-full border-2 border-slate-700 rounded-xl bg-slate-800 shadow-inner p-2 sm:p-4">
            <DragWorkpad placedItems={placedItems} activeNode={activeNode} overZone={overZone} />
          </div>
        </div>

        {isWin && (
          <button
            type="button"
            onClick={startNewRound}
            className="mt-8 px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl md:text-2xl shadow-xl active:scale-95 transition-all text-slate-900 flex justify-center items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
            NEXT COLLISION
          </button>
        )}
      </motion.div>

      <DragOverlay dropAnimation={null}>
        {activeNode !== null && activeNode.value !== undefined ? (
          <DragOverlayContent value={activeNode.value} colorClass={activeNode.colorClass} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
