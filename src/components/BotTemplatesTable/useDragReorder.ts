/**
 * Drag-to-reorder for a list of fixed-height rows, driven from a handle.
 *
 * Pointer drag (mouse, pen, touch): the row follows the pointer and the list
 * reorders live as the pointer passes half a row, calling `onMove(from, to)`.
 * Keyboard: ArrowUp / ArrowDown on the focused handle move the row one step.
 *
 * Move/up are tracked on `window`, not with pointer capture on the handle:
 * every live reorder moves the row's DOM node, and moving a node releases
 * its pointer capture, which would end the drag after the first swap.
 */
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

/** Index the dragged row should sit at for a pointer `dy` px from where it started, clamped to the list. */
export function dragTargetIndex(startIndex: number, dy: number, rowHeight: number, count: number): number {
  return Math.min(count - 1, Math.max(0, startIndex + Math.round(dy / rowHeight)));
}

export function useDragReorder(count: number, onMove: (from: number, to: number) => void) {
  const [drag, setDrag] = useState<{ id: string; offset: number } | null>(null);
  const dragging = useRef(false);
  // Window listeners outlive the render that added them; read the latest callback through a ref.
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const handleProps = (id: string, index: number) => ({
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button !== 0 || dragging.current) return;
      const row = e.currentTarget.closest('[role="row"]');
      if (!row) return;
      e.preventDefault(); // no text selection while dragging

      const { pointerId, clientY: startY } = e;
      const rowHeight = row.getBoundingClientRect().height;
      let current = index;
      dragging.current = true;
      setDrag({ id, offset: 0 });

      const onPointerMove = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        // Clamp so the row can't be dragged past either end of the list.
        const dy = Math.min((count - 1 - index) * rowHeight, Math.max(-index * rowHeight, ev.clientY - startY));
        const target = dragTargetIndex(index, dy, rowHeight, count);
        if (target !== current) {
          onMoveRef.current(current, target);
          current = target;
        }
        // The row now lives at `current`; offset it so it stays under the pointer.
        setDrag({ id, offset: dy - (current - index) * rowHeight });
      };
      const onPointerEnd = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerEnd);
        window.removeEventListener('pointercancel', onPointerEnd);
        dragging.current = false;
        setDrag(null);
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerEnd);
      window.addEventListener('pointercancel', onPointerEnd);
    },
    onKeyDown(e: KeyboardEvent<HTMLElement>) {
      const to = e.key === 'ArrowUp' ? index - 1 : e.key === 'ArrowDown' ? index + 1 : null;
      if (to === null) return;
      e.preventDefault();
      if (to < 0 || to >= count) return;
      onMove(index, to);
      // Reordering moves the row's DOM node, which drops focus; put it back on the same handle.
      const handle = e.currentTarget;
      requestAnimationFrame(() => handle.focus());
    },
  });

  return { draggingId: drag?.id, dragOffset: drag?.offset ?? 0, handleProps };
}
