import { useCallback, useEffect, useRef, useState } from 'react';
import { isStyled, resetElement, setStyle } from './edits';
import { measureElement, resolveTarget, type Spec } from './measure';

/**
 * Elements Inspect mode never targets or blocks: its own UI, and in dev
 * Agentation's, which uses the same capture-phase interception.
 */
const IGNORED_UI = import.meta.env.DEV
  ? '[data-inspector-ui], [data-agentation-root], [data-feedback-toolbar], [data-annotation-marker]'
  : '[data-inspector-ui]';

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
  /** Changes whenever the pin moves, even to an element that measures the same. */
  pinId: number;
  /** The hovered element is the keyboard-focused one, not the one under the pointer. */
  hoveredByFocus: boolean;
}

const EMPTY: InspectView = { hovered: null, pinned: null, canSelectParent: false, pinId: 0, hoveredByFocus: false };

/** The element's parent, stopping at `body`. */
const parentOf = (el: Element) => (el === document.body ? null : el.parentElement);

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
  const rawHover = useRef<{ el: Element; byFocus: boolean } | null>(null);
  const pinned = useRef<Element | null>(null);
  const pinId = useRef(0);
  const frame = useRef(0);
  const observer = useRef<ResizeObserver | null>(null);

  const measure = useCallback(() => {
    frame.current = 0;
    if (pinned.current && !pinned.current.isConnected) {
      pinned.current = null;
      pinId.current += 1;
    }
    const raw = rawHover.current?.el.isConnected ? rawHover.current : null;
    const hovered = raw ? resolveTarget(raw.el) : null;
    const pin = pinned.current;
    // The pinned element already shows its full layers; don't stack a hover on it.
    const nextHovered = hovered && hovered !== pin ? measureElement(hovered) : null;
    const nextPinned = pin ? measureElement(pin) : null;
    const canSelectParent = pin !== null && parentOf(pin) !== null;
    const hoveredByFocus = nextHovered !== null && raw?.byFocus === true;
    // Most frames (the pointer moving within one element) measure the same
    // values. Keep the old objects then, so nothing re-renders, and so memoized
    // parts (the panel) skip renders when only the other spec changed.
    setView((prev) => {
      const next: InspectView = {
        hovered: sameSpec(prev.hovered, nextHovered) ? prev.hovered : nextHovered,
        pinned: sameSpec(prev.pinned, nextPinned) ? prev.pinned : nextPinned,
        canSelectParent,
        pinId: pinId.current,
        hoveredByFocus,
      };
      return (Object.keys(next) as (keyof InspectView)[]).every((k) => next[k] === prev[k]) ? prev : next;
    });
  }, []);

  const schedule = useCallback(() => {
    if (frame.current === 0) frame.current = window.requestAnimationFrame(measure);
  }, [measure]);

  const pin = useCallback(
    (el: Element | null) => {
      pinned.current = el ? resolveTarget(el) : null;
      pinId.current += 1;
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
    const parent = pinned.current && parentOf(pinned.current);
    if (!parent) return false;
    pin(parent);
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
      rawHover.current = isIgnoredUi(e.target) || !(e.target instanceof Element) ? null : { el: e.target, byFocus: false };
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
      rawHover.current = { el: e.target, byFocus: true };
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

  /** Live-preview a style on the pinned element (see `edits.ts`). */
  const editPinned = useCallback(
    (prop: string, value: string) => {
      if (!isStyled(pinned.current)) return;
      setStyle(pinned.current, prop, value);
      schedule();
    },
    [schedule],
  );

  const resetPinned = useCallback(() => {
    if (!isStyled(pinned.current)) return;
    resetElement(pinned.current);
    schedule();
  }, [schedule]);

  return { ...view, unpin, selectParent, pinFocused, editPinned, resetPinned };
}
