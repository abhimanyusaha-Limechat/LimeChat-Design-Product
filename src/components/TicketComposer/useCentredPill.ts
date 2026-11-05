import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Left offset that puts the middle of a pill (inside a row) over a toggle button. Re-measures when the
 * container resizes, since that moves the button.
 */
export function useCentredPill(toggleRef: RefObject<HTMLElement | null>, containerRef: RefObject<HTMLElement | null>) {
  const rowRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const toggle = toggleRef.current?.getBoundingClientRect();
      const row = rowRef.current?.getBoundingClientRect();
      const pill = pillRef.current?.offsetWidth ?? 0;
      if (toggle && row) setLeft(Math.max(0, toggle.left + toggle.width / 2 - pill / 2 - row.left));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef, toggleRef]);

  return { rowRef, pillRef, left };
}
