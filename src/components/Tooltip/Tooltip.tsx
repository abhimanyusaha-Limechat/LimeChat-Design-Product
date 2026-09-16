/**
 * Tooltip — LimeChat design system (Figma node 31:59, Mantine-based).
 *
 * Wraps a single interactive child and shows a small dark label on hover / focus.
 * The bubble is portalled to `document.body` and positioned with fixed
 * coordinates, so it never gets clipped by a scrolling or `overflow: hidden`
 * ancestor (e.g. the sidebar rail).
 *
 *   <Tooltip label="Tickets" position="right">
 *     <button aria-label="Tickets">…</button>
 *   </Tooltip>
 *
 * Props mirror the Figma component: `position` (12 placements), `arrowPosition`
 * (`center` | `side`), `withArrow` (= Figma "Show Polygon"), `label`, and an
 * optional `link` line.
 */
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipPosition = TooltipSide | `${TooltipSide}-start` | `${TooltipSide}-end`;

export interface TooltipLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface TooltipProps {
  /** Tooltip body text (or any node). */
  label: ReactNode;
  /** Optional underlined link rendered below the label. */
  link?: TooltipLink;
  /** One of 12 placements around the trigger. Default `top`. */
  position?: TooltipPosition;
  /** Where the arrow sits along the tooltip edge. Default `center`. */
  arrowPosition?: 'center' | 'side';
  /** Render the arrow (Figma "Show Polygon"). Default `true`. */
  withArrow?: boolean;
  /** ms to wait before showing. Default `300`. */
  openDelay?: number;
  /** ms to wait before hiding. Default `50`. */
  closeDelay?: number;
  /** Gap in px between trigger and bubble (before the arrow). Default `8`. */
  offset?: number;
  /** Allow the label to wrap instead of staying on one line. Default `false`. */
  multiline?: boolean;
  /**
   * Skip the open delay when a nearby tooltip closed less than 400ms ago —
   * lets hopping between adjacent triggers (e.g. chips in a row) feel instant.
   * Set `false` so every hover always waits the full `openDelay`. Default `true`.
   */
  instantGrace?: boolean;
  /** Disable the tooltip entirely (child still renders). */
  disabled?: boolean;
  /** The single element the tooltip describes. */
  children: ReactElement;
}

const ARROW = 8; // rotated-square arrow, px
const EDGE_INSET = 12; // min distance of arrow centre from a bubble corner

// Module-scope so any two tooltips on the page share the same "just closed"
// grace window — hovering from one trigger to an adjacent one (e.g. across a
// row of chips) should feel instant, not re-run the full open delay + animation.
const INSTANT_GRACE_MS = 400;
let lastTooltipCloseAt = 0;

interface Coords {
  top: number;
  left: number;
  arrow: { left?: number; top?: number };
  side: TooltipSide;
}

function compute(
  trigger: DOMRect,
  bubble: { width: number; height: number },
  position: TooltipPosition,
  arrowPosition: 'center' | 'side',
  offset: number,
): Coords {
  const [side, align = 'center'] = position.split('-') as [TooltipSide, 'start' | 'end' | 'center'];
  const gap = offset + ARROW / 2;
  const tCx = trigger.left + trigger.width / 2;
  const tCy = trigger.top + trigger.height / 2;

  let top = 0;
  let left = 0;

  if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? trigger.top - bubble.height - gap : trigger.bottom + gap;
    left =
      align === 'start'
        ? trigger.left
        : align === 'end'
          ? trigger.right - bubble.width
          : tCx - bubble.width / 2;
  } else {
    left = side === 'left' ? trigger.left - bubble.width - gap : trigger.right + gap;
    top =
      align === 'start'
        ? trigger.top
        : align === 'end'
          ? trigger.bottom - bubble.height
          : tCy - bubble.height / 2;
  }

  const arrow: Coords['arrow'] = {};
  if (side === 'top' || side === 'bottom') {
    const raw = arrowPosition === 'center' ? bubble.width / 2 : tCx - left;
    arrow.left = Math.min(Math.max(raw, EDGE_INSET), bubble.width - EDGE_INSET);
  } else {
    const raw = arrowPosition === 'center' ? bubble.height / 2 : tCy - top;
    arrow.top = Math.min(Math.max(raw, EDGE_INSET), bubble.height - EDGE_INSET);
  }

  return { top, left, arrow, side };
}

export function Tooltip({
  label,
  link,
  position = 'top',
  arrowPosition = 'center',
  withArrow = true,
  openDelay = 300,
  closeDelay = 50,
  offset = 8,
  multiline = false,
  instantGrace = true,
  disabled = false,
  children,
}: TooltipProps) {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [instant, setInstant] = useState(false);

  const canShow = !disabled && label != null && label !== '';

  const schedule = useCallback((next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    if (delay > 0) timer.current = window.setTimeout(() => setOpen(next), delay);
    else setOpen(next);
  }, []);

  const show = () => {
    if (!canShow) return;
    const sinceLastClose = Date.now() - lastTooltipCloseAt;
    if (instantGrace && sinceLastClose < INSTANT_GRACE_MS) {
      setInstant(true);
      schedule(true, 0);
    } else {
      setInstant(false);
      schedule(true, openDelay);
    }
  };
  const hide = () => {
    schedule(false, closeDelay);
    lastTooltipCloseAt = Date.now();
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const bubble = bubbleRef.current;
    if (!anchor || !bubble) return;
    setCoords(
      compute(
        anchor.getBoundingClientRect(),
        { width: bubble.offsetWidth, height: bubble.offsetHeight },
        position,
        arrowPosition,
        offset,
      ),
    );
  }, [position, arrowPosition, offset]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    reposition();
    const onScroll = () => reposition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': open && canShow ? id : undefined,
      })
    : children;

  return (
    <>
      <span
        ref={anchorRef}
        className="lc-tooltip-anchor"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocusCapture={show}
        onBlurCapture={hide}
      >
        {child}
      </span>

      {open &&
        canShow &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={bubbleRef}
            id={id}
            role="tooltip"
            className={`lc-tooltip__bubble lc-tooltip__bubble--${coords?.side ?? position}${
              multiline ? ' lc-tooltip__bubble--multiline' : ''
            }`}
            data-instant={instant || undefined}
            style={
              coords
                ? { top: coords.top, left: coords.left, visibility: 'visible' }
                : { top: 0, left: 0, visibility: 'hidden' }
            }
          >
            <span className="lc-tooltip__label">{label}</span>
            {link &&
              (link.href ? (
                <a className="lc-tooltip__link" href={link.href} onClick={link.onClick}>
                  {link.label}
                </a>
              ) : (
                <button type="button" className="lc-tooltip__link" onClick={link.onClick}>
                  {link.label}
                </button>
              ))}
            {withArrow && coords && (
              <span
                className="lc-tooltip__arrow"
                style={
                  coords.arrow.left != null
                    ? { left: coords.arrow.left }
                    : { top: coords.arrow.top }
                }
              />
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export default Tooltip;
