import { memo, type RefObject } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';
import { Tooltip } from '../Tooltip';
import type { Tool, ToolSet } from './report';

const TOOLS: { tool: Tool; label: string; icon: IconName }[] = [
  { tool: 'type', label: 'Type', icon: 'typography' },
  { tool: 'padding', label: 'Padding', icon: 'box-padding' },
  { tool: 'gap', label: 'Gap', icon: 'spacing-horizontal' },
];

/** Long enough that tooltips stay out of the way while you work the bar. */
const TOOLTIP_DELAY = 1000;

interface InspectorToolbarProps {
  /** The tools are mounted (also true while the close animation plays). */
  expanded: boolean;
  /** The close animation is playing: already reads as collapsed. */
  closing: boolean;
  /** Being dragged: tooltips would stay behind at the old spot, so they're off. */
  dragging: boolean;
  /** Tools sit on the ruler's left (the bar opens leftward), so the ruler never moves. */
  opensLeft: boolean;
  /** Which side of the bar tooltips open on; see `tooltipPlacement`. */
  tooltipPosition: 'top' | 'bottom';
  tools: ToolSet;
  barRef: RefObject<HTMLDivElement>;
  /** The main (ruler) button — always mounted, so focus can return to it. */
  mainRef: RefObject<HTMLButtonElement>;
  onToggleExpanded: () => void;
  onToggleTool: (tool: Tool) => void;
  onClose: () => void;
}

/**
 * The FAB, and the pill of tool toggles it expands into. Presentational.
 * Memoized: the Inspector re-renders as the hovered element changes, which
 * this doesn't depend on.
 */
export const InspectorToolbar = memo(function InspectorToolbar({
  expanded,
  closing,
  dragging,
  opensLeft,
  tooltipPosition,
  tools,
  barRef,
  mainRef,
  onToggleExpanded,
  onToggleTool,
  onClose,
}: InspectorToolbarProps) {
  return (
    <div
      ref={barRef}
      className="lc-inspector__bar"
      data-expanded={expanded || undefined}
      data-opens-left={(expanded && opensLeft) || undefined}
    >
      <Tooltip
        label={expanded && !closing ? 'Inspect mode (Shift+I)' : 'Inspect spacing & type (Shift+I)'}
        position={tooltipPosition}
        openDelay={TOOLTIP_DELAY}
        disabled={dragging}
      >
        <button
          ref={mainRef}
          type="button"
          className="lc-inspector__main"
          aria-label="Inspect spacing and type"
          aria-expanded={expanded && !closing}
          onClick={onToggleExpanded}
        >
          <Icon name="ruler" size={20} />
        </button>
      </Tooltip>

      {expanded && (
        <div className="lc-inspector__extras" data-inspector-extras="">
          <div className="lc-inspector__tools" role="group" aria-label="Inspect tools">
            {TOOLS.map(({ tool, label, icon }) => (
              <Tooltip
                key={tool}
                label={label}
                position={tooltipPosition}
                openDelay={TOOLTIP_DELAY}
                disabled={dragging}
              >
                <button
                  type="button"
                  className="lc-inspector__tool"
                  aria-label={label}
                  aria-pressed={tools[tool]}
                  onClick={() => onToggleTool(tool)}
                >
                  <Icon name={icon} size={18} />
                </button>
              </Tooltip>
            ))}
          </div>
          <span className="lc-inspector__divider" aria-hidden="true" />
          <Tooltip label="Close (Esc)" position={tooltipPosition} openDelay={TOOLTIP_DELAY} disabled={dragging}>
            <button type="button" className="lc-inspector__tool" aria-label="Close inspect mode" onClick={onClose}>
              <Icon name="close" size={18} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
});
