import { useCallback, useEffect, useRef, useState } from 'react';
import { isStyled, resetElement, setStyle } from './edits';
import { measureElement, resolveTarget, type Spec } from './measure';
import { isIgnoredUi, usePageCapture } from '../../hooks/usePageCapture';
import { downloadScreenshot } from './screenshot';

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

/** An element with a box of its own that isn't the inspector's: somewhere the pin can land. */
const isPinnable = (el: Element) => !isIgnoredUi(el) && resolveTarget(el) === el;

/** The nearest pinnable element from `el` along `next` (child list, or sibling chain). */
function firstPinnable(el: Element | null, next: (el: Element) => Element | null): Element | null {
  for (let cur = el; cur; cur = next(cur)) if (isPinnable(cur)) return cur;
  return null;
}

/** Specs are plain data, so equal JSON means nothing on screen would change. */
function sameSpec(a: Spec | null, b: Spec | null): boolean {
  return a === b || (a !== null && b !== null && JSON.stringify(a) === JSON.stringify(b));
}

/**
 * Tracks the hovered and pinned elements while `active`, and measures them on
 * every animation frame something moved. All listeners live only while
 * active; while active, the page is captured (see `usePageCapture`): a press pins.
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

  /** Moves the pin to its first child, or to the next/previous sibling; returns whether it moved. */
  const selectChild = useCallback(() => {
    const child = pinned.current && firstPinnable(pinned.current.firstElementChild, (e) => e.nextElementSibling);
    if (!child) return false;
    pin(child);
    return true;
  }, [pin]);

  const selectSibling = useCallback(
    (direction: 'previous' | 'next') => {
      const step = (e: Element) => (direction === 'next' ? e.nextElementSibling : e.previousElementSibling);
      const sibling = pinned.current && firstPinnable(step(pinned.current), step);
      if (!sibling) return false;
      pin(sibling);
      return true;
    },
    [pin],
  );

  /** Pins the keyboard-focused element; returns whether there was one to pin. */
  const pinFocused = useCallback(() => {
    const focused = document.activeElement;
    if (!focused || focused === document.body || isIgnoredUi(focused)) return false;
    pin(focused);
    return true;
  }, [pin]);

  usePageCapture(active, {
    onPress: (target) => pin(target),
    onHover: (target) => {
      rawHover.current = target && { el: target, byFocus: false };
      schedule();
    },
  });

  useEffect(() => {
    if (!active) return;

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

    const passive = { capture: true, passive: true } as const;
    window.addEventListener('mouseout', onLeave, passive);
    window.addEventListener('focusin', onFocusIn, passive);
    window.addEventListener('scroll', schedule, passive);
    window.addEventListener('resize', schedule, passive);
    observer.current = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (pinned.current) observer.current?.observe(pinned.current);

    return () => {
      window.removeEventListener('mouseout', onLeave, passive);
      window.removeEventListener('focusin', onFocusIn, passive);
      window.removeEventListener('scroll', schedule, passive);
      window.removeEventListener('resize', schedule, passive);
      observer.current?.disconnect();
      observer.current = null;
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
      rawHover.current = null;
      pinned.current = null;
      setView(EMPTY);
    };
  }, [active, schedule]);

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

  /** Downloads a PNG of just the pinned element, as drawn on screen. */
  const screenshotPinned = useCallback(() => {
    if (!pinned.current) return;
    downloadScreenshot(pinned.current).catch((err) => console.error('Screenshot failed', err));
  }, []);

  return { ...view, unpin, selectParent, selectChild, selectSibling, pinFocused, editPinned, resetPinned, screenshotPinned };
}
