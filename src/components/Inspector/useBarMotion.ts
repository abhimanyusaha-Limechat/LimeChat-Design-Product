import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';

const OPEN_MS = 200;
const CLOSE_MS = 160;
/** Strong ease-out: enter and exit both start fast, so the bar answers the click at once. */
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
/** How far the tools travel out of the ruler, px. */
const TOOLS_SHIFT = 8;

/**
 * The open/close motion of the Inspect bar. The pill is laid out at its full
 * width at once (so dragging and clamping see the real size); a `clip-path`
 * reveals it from the ruler button outward, and the tools fade in sliding
 * away from the ruler. Closing plays it backward, then calls `onDone` to
 * unmount. Only `clip-path`, `opacity` and `transform` animate.
 *
 * A new play retargets from wherever the running one is, so a quick
 * re-click reverses smoothly instead of jumping. Reduced motion keeps the
 * fade and drops the movement. Where WAAPI is missing (jsdom), it's instant.
 */
export function useBarMotion(barRef: RefObject<HTMLElement>, buttonSize: number) {
  const running = useRef<Animation[]>([]);

  const cancel = useCallback(() => {
    for (const a of running.current) a.cancel();
    running.current = [];
  }, []);

  useEffect(() => cancel, [cancel]);

  const play = useCallback(
    (direction: 'open' | 'close', opensLeft: boolean, onDone?: () => void) => {
      const bar = barRef.current;
      const extras = bar?.querySelector<HTMLElement>('[data-inspector-extras]');
      if (!bar || !extras || typeof bar.animate !== 'function') {
        cancel();
        onDone?.();
        return;
      }

      // Read where an interrupted animation is before cancelling it.
      const interrupted = running.current.length > 0;
      const fromClip = getComputedStyle(bar).clipPath;
      const fromExtras = getComputedStyle(extras);
      const from = { opacity: fromExtras.opacity, transform: fromExtras.transform };
      cancel();

      const radius = `round ${buttonSize / 2}px`;
      const hidden = Math.max(0, bar.offsetWidth - buttonSize);
      const shut = opensLeft ? `inset(0 0 0 ${hidden}px ${radius})` : `inset(0 ${hidden}px 0 0 ${radius})`;
      const full = `inset(0 0 0 0 ${radius})`;
      const tucked = `translateX(${opensLeft ? TOOLS_SHIFT : -TOOLS_SHIFT}px)`;
      const opening = direction === 'open';
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const timing = { duration: opening ? OPEN_MS : CLOSE_MS, easing: EASE_OUT };

      const toolsStart = interrupted
        ? from
        : { opacity: opening ? '0' : '1', transform: opening && !reduce ? tucked : 'none' };
      const toolsEnd = { opacity: opening ? '1' : '0', transform: opening || reduce ? 'none' : tucked };
      const animations = [extras.animate([toolsStart, toolsEnd], timing)];
      if (!reduce) {
        const clipStart = interrupted && fromClip && fromClip !== 'none' ? fromClip : opening ? shut : full;
        animations.push(bar.animate([{ clipPath: clipStart }, { clipPath: opening ? full : shut }], timing));
      }
      running.current = animations;

      Promise.all(animations.map((a) => a.finished)).then(
        () => {
          running.current = [];
          onDone?.();
        },
        // Cancelled by a newer play, which owns what happens next.
        () => {},
      );
    },
    [barRef, buttonSize, cancel],
  );

  return useMemo(() => ({ play, cancel }), [play, cancel]);
}
