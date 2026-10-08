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

/** The saved position, or `null` when missing, malformed or storage is unavailable. */
export function readStoredPosition(): Point | null {
  try {
    const { x, y }: Partial<Point> = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (Number.isFinite(x) && Number.isFinite(y)) return { x: x!, y: y! };
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

interface DraggableOptions {
  /** Keep the right edge in place when the element changes width (it opens leftward). */
  anchorRight: boolean;
  /** Changes whenever the element's size is about to change (e.g. expanded), to re-anchor before paint. */
  layoutKey: unknown;
}

/**
 * Makes a fixed-position element draggable by its handles. Keeps it inside the
 * viewport when dragged, resized (e.g. expanding) or when the window resizes,
 * and remembers where it was left. A drag never counts as a click.
 */
export function useDraggable(
  ref: RefObject<HTMLElement | null>,
  defaultPosition: (viewport: Size) => Point,
  { anchorRight, layoutKey }: DraggableOptions,
) {
  const [position, setPosition] = useState<Point>(() => readStoredPosition() ?? defaultPosition(viewport()));
  const suppressClick = useRef(false);
  /** True once a press has moved past the tap threshold, until release. */
  const [dragging, setDragging] = useState(false);
  // Updated with every setPosition, so handlers read the newest value between renders.
  const latest = useRef(position);

  const clamp = useCallback(
    (pos: Point) => {
      const el = ref.current;
      const size = el ? { width: el.offsetWidth, height: el.offsetHeight } : { width: 0, height: 0 };
      return clampToViewport(pos, size, viewport());
    },
    [ref],
  );

  const lastWidth = useRef<number | null>(null);

  // Re-anchor and re-clamp when the element changes width (expand/collapse) or
  // the window resizes. Runs as a layout effect on `layoutKey`, so an expand is
  // repositioned before it's painted; the observer covers any other resize.
  useLayoutEffect(() => {
    const reclamp = () => {
      const width = ref.current?.offsetWidth ?? 0;
      const grew = lastWidth.current === null ? 0 : width - lastWidth.current;
      lastWidth.current = width;
      const p = latest.current;
      const next = clamp({ x: anchorRight ? p.x - grew : p.x, y: p.y });
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
  }, [clamp, ref, anchorRight, layoutKey]);

  // The drag in progress: its pointer, and how to remove its window listeners.
  const drag = useRef<{ id: number; stop: () => void } | null>(null);
  useEffect(() => () => drag.current?.stop(), []);

  // After pointerdown the pointer is followed on `window`, not the handle: a
  // quick flick can leave a 32px button before the drag threshold is crossed,
  // and pointer capture can't start earlier without retargeting a plain tap's
  // click away from the button. Capture phase, so Inspect mode swallowing the
  // app's presses (same node, same phase) can't hide the release from us.
  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      // One pointer at a time: a second finger mid-drag must not restart it.
      // The same pointer pressing again means its release was missed (e.g.
      // let go outside the window), so start over.
      if (drag.current && drag.current.id !== e.pointerId) return;
      drag.current?.stop();
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
        if (!moved) {
          if (Math.hypot(dx, dy) < TAP_THRESHOLD) return;
          moved = true;
          setDragging(true);
        }
        const next = clamp({ x: origin.x + dx, y: origin.y + dy });
        latest.current = next;
        setPosition(next);
      };
      const finish = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        drag.current?.stop();
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
      drag.current = {
        id: pointerId,
        stop: () => {
          window.removeEventListener('pointermove', onMove, opts);
          window.removeEventListener('pointerup', finish, opts);
          window.removeEventListener('pointercancel', finish, opts);
          drag.current = null;
          setDragging(false);
        },
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

  return { position, dragging, handleProps: { onPointerDown }, onClickCapture };
}
