import { useCallback, useEffect, useRef, useState } from 'react';
import { measureElement, resolveTarget, type Spec } from './measure';

/**
 * Elements Inspect mode never targets or blocks: its own UI, and Agentation's
 * (dev only), which uses the same capture-phase interception.
 */
const IGNORED_UI = '[data-inspector-ui], [data-agentation-root], [data-feedback-toolbar], [data-annotation-marker]';

export function isIgnoredUi(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(IGNORED_UI) !== null;
}

/** Every event the app would use to react to a press. Swallowed while inspecting. */
const PRESS_EVENTS = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'dblclick'] as const;

export interface InspectView {
  hovered: Spec | null;
  pinned: Spec | null;
  /** False with nothing pinned, or when the pin is already `body`. */
  canSelectParent: boolean;
}

const EMPTY: InspectView = { hovered: null, pinned: null, canSelectParent: false };

/** Specs are plain data, so equal JSON means nothing on screen would change. */
function sameSpec(a: Spec | null, b: Spec | null): boolean {
  return a === b || (a !== null && b !== null && JSON.stringify(a) === JSON.stringify(b));
}

/**
 * Tracks the hovered and pinned elements while `active`, and measures them on
 * every animation frame something moved. All listeners live only while
 * active; while active, the app sees no presses outside the inspector's UI.
 */
export function useInspectTarget(active: boolean) {
  const [view, setView] = useState<InspectView>(EMPTY);
  const rawHover = useRef<Element | null>(null);
  const pinned = useRef<Element | null>(null);
  const frame = useRef(0);
  const observer = useRef<ResizeObserver | null>(null);

  const measure = useCallback(() => {
    frame.current = 0;
    if (pinned.current && !pinned.current.isConnected) pinned.current = null;
    const raw = rawHover.current?.isConnected ? rawHover.current : null;
    const hovered = raw ? resolveTarget(raw) : null;
    const pin = pinned.current;
    // The pinned element already shows its full layers; don't stack a hover on it.
    const nextHovered = hovered && hovered !== pin ? measureElement(hovered) : null;
    const nextPinned = pin ? measureElement(pin) : null;
    const canSelectParent = pin !== null && pin !== document.body && pin.parentElement !== null;
    // Most frames (the pointer moving within one element) measure the same
    // values. Keep the old objects then, so nothing re-renders, and so memoized
    // parts (the panel) skip renders when only the other spec changed.
    setView((prev) => {
      const next = {
        hovered: sameSpec(prev.hovered, nextHovered) ? prev.hovered : nextHovered,
        pinned: sameSpec(prev.pinned, nextPinned) ? prev.pinned : nextPinned,
        canSelectParent,
      };
      const unchanged =
        next.hovered === prev.hovered && next.pinned === prev.pinned && canSelectParent === prev.canSelectParent;
      return unchanged ? prev : next;
    });
  }, []);

  const schedule = useCallback(() => {
    if (frame.current === 0) frame.current = window.requestAnimationFrame(measure);
  }, [measure]);

  const pin = useCallback(
    (el: Element | null) => {
      pinned.current = el ? resolveTarget(el) : null;
      observer.current?.disconnect();
      if (pinned.current) observer.current?.observe(pinned.current);
      schedule();
    },
    [schedule],
  );

  /** Unpins; returns whether anything was pinned (so Escape knows whether it acted). */
  const unpin = useCallback(() => {
    if (!pinned.current) return false;
    pin(null);
    return true;
  }, [pin]);

  /** Moves the pin to its parent; returns whether it moved. */
  const selectParent = useCallback(() => {
    const current = pinned.current;
    if (!current || current === document.body || !current.parentElement) return false;
    pin(current.parentElement);
    return true;
  }, [pin]);

  /** Pins the keyboard-focused element; returns whether there was one to pin. */
  const pinFocused = useCallback(() => {
    const focused = document.activeElement;
    if (!focused || focused === document.body || isIgnoredUi(focused)) return false;
    pin(focused);
    return true;
  }, [pin]);

  useEffect(() => {
    if (!active) return;

    const onPointerMove = (e: PointerEvent) => {
      rawHover.current = isIgnoredUi(e.target) || !(e.target instanceof Element) ? null : e.target;
      schedule();
    };
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        rawHover.current = null;
        schedule();
      }
    };
    const onFocusIn = (e: FocusEvent) => {
      if (isIgnoredUi(e.target) || !(e.target instanceof Element)) return;
      rawHover.current = e.target;
      schedule();
    };
    const onPress = (e: Event) => {
      if (isIgnoredUi(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'pointerdown' && (e as PointerEvent).button === 0 && e.target instanceof Element) {
        pin(e.target);
      }
    };

    // Window + capture phase: ahead of React's root listeners and any app
    // handler, so pinning inside an open Menu or Modal doesn't close it.
    const opts = { capture: true } as const;
    const passive = { capture: true, passive: true } as const;
    window.addEventListener('pointermove', onPointerMove, passive);
    window.addEventListener('mouseout', onLeave, passive);
    window.addEventListener('focusin', onFocusIn, passive);
    window.addEventListener('scroll', schedule, passive);
    window.addEventListener('resize', schedule, passive);
    for (const type of PRESS_EVENTS) window.addEventListener(type, onPress, opts);
    observer.current = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (pinned.current) observer.current?.observe(pinned.current);

    return () => {
      window.removeEventListener('pointermove', onPointerMove, passive);
      window.removeEventListener('mouseout', onLeave, passive);
      window.removeEventListener('focusin', onFocusIn, passive);
      window.removeEventListener('scroll', schedule, passive);
      window.removeEventListener('resize', schedule, passive);
      for (const type of PRESS_EVENTS) window.removeEventListener(type, onPress, opts);
      observer.current?.disconnect();
      observer.current = null;
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
      rawHover.current = null;
      pinned.current = null;
      setView(EMPTY);
    };
  }, [active, pin, schedule]);

  return { ...view, unpin, selectParent, pinFocused };
}
