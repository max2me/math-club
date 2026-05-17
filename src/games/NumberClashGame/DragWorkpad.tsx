import { useDroppable } from '@dnd-kit/core';
import { DraggableNumberBlock } from './DraggableNumberBlock';
import type { PlacedItem } from './types';

type DropZoneProps = {
  id: string;
  isHighlighted?: boolean;
};

function DropZone({ id, isHighlighted }: DropZoneProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full rounded-xl border-2 transition-colors ${isHighlighted ? 'border-teal-400 bg-teal-400/20 shadow-[0_0_15px_rgba(45,212,191,0.2)] z-10' : 'border-dashed border-slate-600/50 bg-slate-800/30'}`}
    />
  );
}

type DragWorkpadProps = {
  placedItems: PlacedItem[];
  activeNode: { id: string; value: number } | null;
  overZone: { row: number; col: number } | null;
};

export function DragWorkpad({ placedItems, activeNode, overZone }: DragWorkpadProps) {
  const getDropZoneHighlight = (row: number, col: number) => {
    if (!activeNode || !overZone) return false;
    if (overZone.row !== row) return false;

    const valLen = new Intl.NumberFormat('en-US').format(activeNode.value).length;
    let startCol = overZone.col;
    if (startCol + valLen > 9) {
      startCol = 9 - valLen;
    }
    return col >= startCol && col < startCol + valLen;
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-2xl mx-auto px-2 sm:px-4 pb-4 sm:pb-6 mt-4">
      {[0, 1].map(row => (
        <div key={`row-${row}`} className="relative grid grid-cols-9 gap-1 sm:gap-2 h-10 sm:h-12 md:h-14 w-full">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => (
            <DropZone
              key={`zone-${row}-${col}`}
              id={`zone-${row}-${col}`}
              isHighlighted={getDropZoneHighlight(row, col)}
            />
          ))}
          {placedItems.filter(item => item.row === row).map(item => (
            <div
              key={item.id}
              style={{
                gridColumnStart: item.col + 1,
                gridColumnEnd: `span ${new Intl.NumberFormat('en-US').format(item.value).length}`,
              }}
              className="row-start-1 h-full z-10"
            >
              <DraggableNumberBlock id={item.id} value={item.value} fluid colorClass={item.colorClass} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
