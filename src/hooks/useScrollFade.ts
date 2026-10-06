import { useEffect, useRef, useState } from 'react';

/** Flags `data-scrolling` for 600ms after each scroll, so CSS can fade the scrollbar thumb in. Spread the result onto the scroller. */
export function useScrollFade() {
  const [isScrolling, setIsScrolling] = useState(false);
  const timeout = useRef<number>();
  useEffect(() => () => window.clearTimeout(timeout.current), []);
  const onScroll = () => {
    setIsScrolling(true);
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setIsScrolling(false), 600);
  };
  return { 'data-scrolling': isScrolling || undefined, onScroll } as const;
}
