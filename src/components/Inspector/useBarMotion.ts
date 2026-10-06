import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';

const OPEN_MS = 200;
const CLOSE_MS = 160;
/** Strong ease-out: enter and exit both start fast, so the bar answers the click at once. */
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
/** How far the tools travel out of the ruler, px. */
const TOOLS_SHIFT = 8;
/** Delay between each item appearing: 5 items × 25ms + 200ms ends the open at 300ms. */
const STAGGER_MS = 25;
/** The bar's revealed contents, animated one by one. */
const STAGGERED = '[data-inspector-extras] .lc-inspector__tool, [data-inspector-extras] .lc-inspector__divider';

/**
 * The open/close motion of the Inspect bar. The pill is laid out at its full
 * width at once (so dragging and clamping see the real size); a `clip-path`
 * reveals it from the ruler button outward, and the tools fade in one after
 * another, sliding away from the ruler. Closing plays it backward, then calls `onDone` to
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
      // In DOM order: outward from the ruler, whichever side the bar opens to.
      const items = bar ? [...bar.querySelectorAll<HTMLElement>(STAGGERED)] : [];
      if (!bar || items.length === 0 || typeof bar.animate !== 'function') {
        cancel();
        onDone?.();
        return;
      }

      // Read where an interrupted animation is before cancelling it.
      const interrupted = running.current.length > 0;
      const fromClip = getComputedStyle(bar).clipPath;
      const fromItems = items.map((el) => {
        const style = getComputedStyle(el);
        return { opacity: style.opacity, transform: style.transform };
      });
      cancel();

      const radius = `round ${buttonSize / 2}px`;
      const hidden = Math.max(0, bar.offsetWidth - buttonSize);
      const shut = opensLeft ? `inset(0 0 0 ${hidden}px ${radius})` : `inset(0 ${hidden}px 0 0 ${radius})`;
      const full = `inset(0 0 0 0 ${radius})`;
      const tucked = `translateX(${opensLeft ? TOOLS_SHIFT : -TOOLS_SHIFT}px)`;
      const opening = direction === 'open';
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const duration = opening ? OPEN_MS : CLOSE_MS;

      const shown = { opacity: '1', transform: 'none' };
      const hiddenItem = { opacity: '0', transform: reduce ? 'none' : tucked };
      const animations = items.map((el, i) =>
        el.animate([interrupted ? fromItems[i] : opening ? hiddenItem : shown, opening ? shown : hiddenItem], {
          duration,
          easing: EASE_OUT,
          // Cascade outward on a fresh open; leave together (exits stay quick).
          delay: opening && !interrupted && !reduce ? i * STAGGER_MS : 0,
          // Hold the hidden first frame during the delay instead of flashing in.
          fill: 'backwards',
        }),
      );
      if (!reduce) {
        const clipStart = interrupted && fromClip && fromClip !== 'none' ? fromClip : opening ? shut : full;
        animations.push(
          bar.animate([{ clipPath: clipStart }, { clipPath: opening ? full : shut }], { duration, easing: EASE_OUT }),
        );
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
