import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';

const SCREEN_MARGIN = 16;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

interface Start {
  pointerX: number;
  pointerY: number;
  offset: { x: number; y: number };
  rect: DOMRect;
}

/**
 * Lets the pinned panel be moved by its header. Returns an offset from where
 * the panel is placed beside the bar, so it still follows the bar when that
 * moves, and keeps the panel on screen.
 */
export function usePanelDrag(slotRef: RefObject<HTMLElement>) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef<Start | null>(null);
  const latest = useRef(offset);
  latest.current = offset;

  // Stable, so the memoized panel isn't re-rendered by every hover.
  const handleProps = useMemo(() => ({
    onPointerDown(e: ReactPointerEvent<HTMLElement>) {
      // The header's own buttons (close) keep working.
      if (e.button !== 0 || !slotRef.current || (e.target as Element).closest('button')) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      start.current = { pointerX: e.clientX, pointerY: e.clientY, offset: latest.current, rect: slotRef.current.getBoundingClientRect() };
      setDragging(true);
    },
    onPointerMove(e: ReactPointerEvent<HTMLElement>) {
      const s = start.current;
      if (!s) return;
      const dx = clamp(e.clientX - s.pointerX, SCREEN_MARGIN - s.rect.left, window.innerWidth - SCREEN_MARGIN - s.rect.right);
      const dy = clamp(e.clientY - s.pointerY, SCREEN_MARGIN - s.rect.top, window.innerHeight - SCREEN_MARGIN - s.rect.bottom);
      setOffset({ x: s.offset.x + dx, y: s.offset.y + dy });
    },
    onPointerUp() {
      start.current = null;
      setDragging(false);
    },
    onPointerCancel() {
      start.current = null;
      setDragging(false);
    },
  }), [slotRef]);

  return { offset, dragging, handleProps };
}
