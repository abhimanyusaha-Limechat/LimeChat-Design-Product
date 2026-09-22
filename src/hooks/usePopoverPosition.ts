import { useLayoutEffect, useState, type RefObject } from 'react';

export interface PopoverCoords {
  top: number;
  left: number;
}

/**
 * Positions a portaled popover under its trigger — flush right for `align:
 * 'end'`, flush left for `'start'` — clamped so it never renders below the
 * viewport. Recomputes on scroll/resize while `open`.
 */
export function usePopoverPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  width: number,
  align: 'start' | 'end' = 'end',
) {
  const [coords, setCoords] = useState<PopoverCoords | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const reposition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const popoverHeight = popoverRef.current?.offsetHeight ?? 0;
      const maxTop = window.innerHeight - popoverHeight - 8;
      setCoords({
        top: popoverHeight > 0 ? Math.min(rect.bottom + 6, Math.max(8, maxTop)) : rect.bottom + 6,
        left: align === 'end' ? rect.right - width : rect.left,
      });
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, align, width]);

  return coords;
}
