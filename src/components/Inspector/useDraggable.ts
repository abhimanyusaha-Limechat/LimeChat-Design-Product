import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Closest distance the element may sit from a viewport edge. */
const EDGE_MARGIN = 8;
/** Pointer travel under this many px is a tap, not a drag. */
const TAP_THRESHOLD = 4;

const STORAGE_KEY = 'lc-inspector:position';

/** Moves `pos` (top-left corner) so a box of `size` stays fully inside `viewport`. */
export function clampToViewport(pos: Point, size: Size, viewport: Size, margin = EDGE_MARGIN): Point {
  const maxX = Math.max(margin, viewport.width - size.width - margin);
  const maxY = Math.max(margin, viewport.height - size.height - margin);
  return {
    x: Math.min(Math.max(pos.x, margin), maxX),
    y: Math.min(Math.max(pos.y, margin), maxY),
  };
}

/**
 * When an element in the right half of the screen grows (or shrinks) by
 * `delta`, keep its right edge in place so it opens leftward — toward the
 * room it has, and away from whatever is docked in the corner.
 */
export function growTowardsRoom(x: number, delta: number, width: number, viewportWidth = window.innerWidth): number {
  if (delta === 0) return x;
  const centerBefore = x + (width - delta) / 2;
  return centerBefore > viewportWidth / 2 ? x - delta : x;
}

/** The saved position, or `null` when missing, malformed or storage is unavailable. */
export function readStoredPosition(): Point | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      'x' in value &&
      'y' in value &&
      typeof value.x === 'number' &&
      typeof value.y === 'number' &&
      Number.isFinite(value.x) &&
      Number.isFinite(value.y)
    ) {
      return { x: value.x, y: value.y };
    }
  } catch {
    // Private mode, blocked storage or bad JSON: fall back to the default.
  }
  return null;
}

function storePosition(pos: Point) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // Not persisting is fine; the position still applies for this page view.
  }
}

const viewport = (): Size => ({ width: window.innerWidth, height: window.innerHeight });

/**
 * Makes a fixed-position element draggable by its handles. Keeps it inside the
 * viewport when dragged, resized (e.g. expanding) or when the window resizes,
 * and remembers where it was left. A drag never counts as a click.
 */
export function useDraggable(ref: RefObject<HTMLElement | null>, defaultPosition: (viewport: Size) => Point) {
  const [position, setPosition] = useState<Point>(() => readStoredPosition() ?? defaultPosition(viewport()));
  const suppressClick = useRef(false);
  const latest = useRef(position);
  useEffect(() => {
    latest.current = position;
  }, [position]);

  const clamp = useCallback(
    (pos: Point) => {
      const el = ref.current;
      const size = el ? { width: el.offsetWidth, height: el.offsetHeight } : { width: 0, height: 0 };
      return clampToViewport(pos, size, viewport());
    },
    [ref],
  );

  // Re-clamp when the element changes size (expand/collapse) or the window does.
  useLayoutEffect(() => {
    let width = ref.current?.offsetWidth ?? 0;
    const reclamp = () => {
      const nextWidth = ref.current?.offsetWidth ?? 0;
      const grew = nextWidth - width;
      width = nextWidth;
      const p = latest.current;
      const next = clamp({ x: growTowardsRoom(p.x, grew, nextWidth), y: p.y });
      if (next.x === p.x && next.y === p.y) return;
      latest.current = next;
      setPosition(next);
    };
    reclamp();
    window.addEventListener('resize', reclamp);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(reclamp) : null;
    if (ref.current) observer?.observe(ref.current);
    return () => {
      window.removeEventListener('resize', reclamp);
      observer?.disconnect();
    };
  }, [clamp, ref]);

  // Removes the window listeners of a drag in progress (also on unmount).
  const stopTracking = useRef<() => void>(() => {});
  useEffect(() => () => stopTracking.current(), []);

  // After pointerdown the pointer is followed on `window`, not the handle: a
  // quick flick can leave a 32px button before the drag threshold is crossed,
  // and pointer capture can't start earlier without retargeting a plain tap's
  // click away from the button. Capture phase, so Inspect mode swallowing the
  // app's presses (same node, same phase) can't hide the release from us.
  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      stopTracking.current();
      const pointerId = e.pointerId;
      const start = { x: e.clientX, y: e.clientY };
      const origin = latest.current;
      let moved = false;

      const onMove = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        // Released outside the window: no pointerup reached us.
        if (ev.buttons === 0) return finish(ev);
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        if (!moved && Math.hypot(dx, dy) < TAP_THRESHOLD) return;
        moved = true;
        const next = clamp({ x: origin.x + dx, y: origin.y + dy });
        latest.current = next;
        setPosition(next);
      };
      const finish = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        stopTracking.current();
        if (!moved) return;
        storePosition(latest.current);
        // The browser fires `click` right after `pointerup` when the drag ends
        // on the handle; swallow that one only. Touch drags fire no click, so
        // the flag must not outlive this task or it would eat a later real click.
        suppressClick.current = true;
        window.setTimeout(() => {
          suppressClick.current = false;
        }, 0);
      };

      const opts = { capture: true } as const;
      window.addEventListener('pointermove', onMove, opts);
      window.addEventListener('pointerup', finish, opts);
      window.addEventListener('pointercancel', finish, opts);
      stopTracking.current = () => {
        window.removeEventListener('pointermove', onMove, opts);
        window.removeEventListener('pointerup', finish, opts);
        window.removeEventListener('pointercancel', finish, opts);
        stopTracking.current = () => {};
      };
    },
    [clamp],
  );

  /** Put on the handle (capture phase): swallows the click that ends a drag. */
  const onClickCapture = (e: { preventDefault(): void; stopPropagation(): void }) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return { position, handleProps: { onPointerDown }, onClickCapture };
}
