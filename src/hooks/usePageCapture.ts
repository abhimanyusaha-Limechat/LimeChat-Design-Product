import { useEffect, useRef } from 'react';

/**
 * Elements the page-capturing tools never target or block: their own UI, and in dev
 * Agentation's, which captures the same way.
 */
const TOOL_UI = import.meta.env.DEV
  ? '[data-inspector-ui], [data-agentation-root], [data-feedback-toolbar], [data-annotation-marker]'
  : '[data-inspector-ui]';

export function isIgnoredUi(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(TOOL_UI) !== null;
}

/** Every event the app would use to react to a press. */
const PRESS_EVENTS = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'dblclick'] as const;

export interface PageCaptureHandlers {
  /** A primary-button press on the page, at viewport point `x`, `y`. */
  onPress: (target: Element, x: number, y: number) => void;
  /** The element under the pointer; null over the tools' own UI. */
  onHover: (target: Element | null) => void;
}

/**
 * Takes the page over for Inspect mode or the Comment tool: while `active`, the app receives
 * no presses outside the tools' own UI, and presses and pointer moves go to `handlers` instead.
 * Listens on the window in the capture phase, ahead of React's root listeners and any app
 * handler, so pressing inside an open Menu or Modal doesn't close it.
 */
export function usePageCapture(active: boolean, handlers: PageCaptureHandlers) {
  // Read at event time, so callers can pass fresh closures without re-subscribing.
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    if (!active) return;
    const onPress = (e: Event) => {
      if (isIgnoredUi(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'pointerdown' && (e as PointerEvent).button === 0 && e.target instanceof Element) {
        const { clientX, clientY } = e as PointerEvent;
        latest.current.onPress(e.target, clientX, clientY);
      }
    };
    const onMove = (e: PointerEvent) =>
      latest.current.onHover(e.target instanceof Element && !isIgnoredUi(e.target) ? e.target : null);

    const opts = { capture: true } as const;
    const passive = { capture: true, passive: true } as const;
    for (const type of PRESS_EVENTS) window.addEventListener(type, onPress, opts);
    window.addEventListener('pointermove', onMove, passive);
    return () => {
      for (const type of PRESS_EVENTS) window.removeEventListener(type, onPress, opts);
      window.removeEventListener('pointermove', onMove, passive);
    };
  }, [active]);
}
