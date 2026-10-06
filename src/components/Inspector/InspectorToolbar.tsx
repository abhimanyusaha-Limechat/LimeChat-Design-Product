import type { RefObject } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';
import { Tooltip } from '../Tooltip';
import type { Tool, ToolSet } from './report';

const TOOLS: { tool: Tool; label: string; icon: IconName }[] = [
  { tool: 'type', label: 'Type', icon: 'typography' },
  { tool: 'padding', label: 'Padding', icon: 'box-padding' },
  { tool: 'gap', label: 'Gap', icon: 'spacing-horizontal' },
];

interface InspectorToolbarProps {
  expanded: boolean;
  tools: ToolSet;
  /** The main (ruler) button — always mounted, so focus can return to it. */
  mainRef: RefObject<HTMLButtonElement>;
  onToggleExpanded: () => void;
  onToggleTool: (tool: Tool) => void;
  onClose: () => void;
}

/** The FAB, and the pill of tool toggles it expands into. Presentational. */
export function InspectorToolbar({
  expanded,
  tools,
  mainRef,
  onToggleExpanded,
  onToggleTool,
  onClose,
}: InspectorToolbarProps) {
  return (
    <div className="lc-inspector__bar" data-expanded={expanded || undefined}>
      <Tooltip label={expanded ? 'Inspect mode (Shift+I)' : 'Inspect spacing & type (Shift+I)'} position="top">
        <button
          ref={mainRef}
          type="button"
          className="lc-inspector__main"
          aria-label="Inspect spacing and type"
          aria-expanded={expanded}
          onClick={onToggleExpanded}
        >
          <Icon name="ruler" size={20} />
        </button>
      </Tooltip>

      {expanded && (
        <>
          <div className="lc-inspector__tools" role="group" aria-label="Inspect tools">
            {TOOLS.map(({ tool, label, icon }) => (
              <Tooltip key={tool} label={label} position="top">
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
          <Tooltip label="Close (Esc)" position="top">
            <button type="button" className="lc-inspector__tool" aria-label="Close inspect mode" onClick={onClose}>
              <Icon name="close" size={18} />
            </button>
          </Tooltip>
        </>
      )}
    </div>
  );
}
