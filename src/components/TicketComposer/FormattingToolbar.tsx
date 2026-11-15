/**
 * The Aa button's strip: it takes the place of the tools strip's icons, so the composer keeps its height.
 * Back arrow, then the four text formats and undo / redo.
 */
import { Icon } from '../icons';
import { Tooltip } from '../Tooltip';
import { TEXT_FORMATS, type TextFormat } from './textFormat';

interface FormattingToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFormat: (format: TextFormat) => void;
}

// mousedown would take focus (and the selection) away from the textarea.
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

export function FormattingToolbar({ canUndo, canRedo, onBack, onUndo, onRedo, onFormat }: FormattingToolbarProps) {
  return (
    <div className="lc-ticket-composer__tools" role="toolbar" aria-label="Text formatting">
      <Tooltip label="Back to tools (Esc)">
        <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Back to tools" onMouseDown={keepFocus} onClick={onBack}>
          <Icon name="chevron-left" />
        </button>
      </Tooltip>
      {TEXT_FORMATS.map(({ format, label }) => (
        <Tooltip key={format} label={`${label} the selected text`}>
          <button
            type="button"
            className="lc-ticket-composer__icon-btn"
            aria-label={label}
            onMouseDown={keepFocus}
            onClick={() => onFormat(format)}
          >
            <Icon name={format === 'monospace' ? 'code' : format} />
          </button>
        </Tooltip>
      ))}
      <Tooltip label={canUndo ? 'Undo (Ctrl/Cmd+Z)' : 'Nothing to undo'}>
        <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Undo" disabled={!canUndo} onMouseDown={keepFocus} onClick={onUndo}>
          <Icon name="undo" />
        </button>
      </Tooltip>
      <Tooltip label={canRedo ? 'Redo (Ctrl/Cmd+Y)' : 'Nothing to redo'}>
        <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Redo" disabled={!canRedo} onMouseDown={keepFocus} onClick={onRedo}>
          <Icon name="redo" />
        </button>
      </Tooltip>
    </div>
  );
}
