import { useEffect } from 'react';
import type { RefObject } from 'react';

interface DismissTarget {
  open: boolean;
  ref: RefObject<HTMLElement | null>;
  onClose: () => void;
}

/** Closes each open target on an outside mousedown or Escape. */
export function useDismiss(targets: DismissTarget[]) {
  const anyOpen = targets.some((t) => t.open);

  useEffect(() => {
    if (!anyOpen) return;
    const onDown = (e: MouseEvent) => {
      const node = e.target as Node;
      for (const target of targets) {
        if (target.open && !target.ref.current?.contains(node)) target.onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      for (const target of targets) {
        if (target.open) target.onClose();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyOpen, ...targets.map((t) => t.open)]);
}
