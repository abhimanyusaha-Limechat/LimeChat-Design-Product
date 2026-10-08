/**
 * Drag-and-drop for tree rows (Tags), driven from a handle. Unlike `useDragReorder` the list
 * doesn't move while dragging: the dragged row stays put (dimmed) and the row under the pointer
 * shows where the drop will land — top quarter "before", bottom quarter "after", middle "inside".
 *
 * Rows must carry `data-tree-id`. Move/up are tracked on `window` so leaving the handle doesn't
 * end the drag.
 */
import { useRef, useState, type PointerEvent } from 'react';
import type { DropPosition, DropTarget } from '../SettingsScreen/tagTree';

/** Which part of a row the pointer is over: top quarter, bottom quarter, or the middle. */
function dropPosition(pointerY: number, rowTop: number, rowHeight: number): DropPosition {
  const ratio = (pointerY - rowTop) / rowHeight;
  return ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside';
}

/**
 * @param resolve turns the raw row/zone under the pointer into the drop it means, or null if that drop isn't allowed.
 * @param onDrop  called once on release over an allowed target.
 */
export function useTreeDrag(
  resolve: (dragId: string, raw: DropTarget) => DropTarget | null,
  onDrop: (dragId: string, target: DropTarget) => void,
) {
  const [drag, setDrag] = useState<{ id: string; target: DropTarget | null } | null>(null);
  const dragging = useRef(false);
  // Window listeners outlive the render that added them; read the latest callbacks through refs.
  const latest = useRef({ resolve, onDrop });
  latest.current = { resolve, onDrop };

  const handleProps = (id: string) => ({
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button !== 0 || dragging.current) return;
      e.preventDefault(); // no text selection while dragging
      const { pointerId } = e;
      let target: DropTarget | null = null;
      dragging.current = true;
      document.documentElement.style.cursor = 'grabbing';
      setDrag({ id, target });

      const onPointerMove = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        const row = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>('[data-tree-id]');
        const rowId = row?.dataset.treeId;
        if (!row || !rowId || rowId === id) {
          target = null;
        } else {
          const rect = row.getBoundingClientRect();
          target = latest.current.resolve(id, { id: rowId, position: dropPosition(ev.clientY, rect.top, rect.height) });
        }
        setDrag({ id, target });
      };
      const onPointerEnd = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerEnd);
        window.removeEventListener('pointercancel', onPointerEnd);
        document.documentElement.style.cursor = '';
        dragging.current = false;
        setDrag(null);
        if (ev.type === 'pointerup' && target) latest.current.onDrop(id, target);
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerEnd);
      window.addEventListener('pointercancel', onPointerEnd);
    },
  });

  return { draggingId: drag?.id, dropTarget: drag?.target ?? null, handleProps };
}
