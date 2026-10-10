import { memo, type CSSProperties, type ReactElement, type RefObject } from 'react';
import { Icon } from '../icons';
import { Tooltip } from '../Tooltip';

/** Long enough that tooltips stay out of the way while you work the bar. */
const TOOLTIP_DELAY = 1000;

interface InspectorToolbarProps {
  /** The tools are mounted (also true while the close animation plays). */
  expanded: boolean;
  /** The close animation is playing: already reads as collapsed. */
  closing: boolean;
  /** Which open/close animation to play; `null` switches instantly (keyboard). */
  motion: 'open' | 'close' | null;
  /** Being dragged: tooltips would stay behind at the old spot, so they're off. */
  dragging: boolean;
  /** Tools sit on the ruler's left (the bar opens leftward), so the ruler never moves. */
  opensLeft: boolean;
  /** Which side of the bar tooltips open on; see `tooltipPlacement`. */
  tooltipPosition: 'top' | 'bottom';
  /** The pointer is on: hovering and clicking picks elements. */
  picking: boolean;
  /** The main (ruler) button — always mounted, so focus can return to it. */
  mainRef: RefObject<HTMLButtonElement>;
  onToggleExpanded: () => void;
  onTogglePicking: () => void;
  onScreenshot: () => void;
  onClose: () => void;
  /** The bar's own open/close animation finished. */
  onMotionEnd: () => void;
}

/** Position in the staggered reveal, read by the CSS. */
const step = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * The FAB, and the pill of tool toggles it expands into. Presentational.
 * Memoized: the Inspector re-renders as the hovered element changes, which
 * this doesn't depend on.
 */
export const InspectorToolbar = memo(function InspectorToolbar({
  expanded,
  closing,
  motion,
  dragging,
  opensLeft,
  tooltipPosition,
  picking,
  mainRef,
  onToggleExpanded,
  onTogglePicking,
  onScreenshot,
  onClose,
  onMotionEnd,
}: InspectorToolbarProps) {
  const tip = (label: string, button: ReactElement, key?: string) => (
    <Tooltip key={key} label={label} position={tooltipPosition} openDelay={TOOLTIP_DELAY} disabled={dragging}>
      {button}
    </Tooltip>
  );

  return (
    <div
      className="lc-inspector__bar"
      data-expanded={expanded || undefined}
      data-opens-left={(expanded && opensLeft) || undefined}
      data-motion={motion ?? undefined}
      onAnimationEnd={(e) => e.target === e.currentTarget && onMotionEnd()}
    >
      {tip(
        expanded && !closing ? 'Inspect mode (Shift+I)' : 'Inspect spacing & type (Shift+I)',
        <button
          ref={mainRef}
          type="button"
          className="lc-inspector__main"
          aria-label="Inspect spacing and type"
          aria-keyshortcuts="Shift+I"
          aria-expanded={expanded && !closing}
          onClick={onToggleExpanded}
        >
          <Icon name="ruler" size={20} />
        </button>,
      )}

      {expanded && (
        <div className="lc-inspector__extras" data-inspector-extras="">
          <div className="lc-inspector__tools" role="group" aria-label="Inspect tools">
            {tip(
              'Select element',
              <button
                type="button"
                className="lc-inspector__tool"
                style={step(0)}
                aria-label="Select element"
                aria-pressed={picking}
                onClick={onTogglePicking}
              >
                <Icon name="cursor" size={18} />
              </button>,
            )}
          </div>
          <span className="lc-inspector__divider" style={step(1)} aria-hidden="true" />
          {tip(
            'Download screenshot',
            <button
              type="button"
              className="lc-inspector__tool"
              style={step(2)}
              aria-label="Download screenshot"
              onClick={onScreenshot}
            >
              <Icon name="camera" size={18} />
            </button>,
          )}
          {tip(
            'Close (Esc)',
            <button
              type="button"
              className="lc-inspector__tool"
              style={step(3)}
              aria-label="Close inspect mode"
              aria-keyshortcuts="Escape"
              onClick={onClose}
            >
              <Icon name="close" size={18} />
            </button>,
          )}
        </div>
      )}
    </div>
  );
});
