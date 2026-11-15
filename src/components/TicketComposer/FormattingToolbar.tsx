/**
 * The Aa button's strip: it takes the place of the tools strip's icons, so the composer keeps its height.
 * Back arrow, then the four text formats and undo / redo.
 */
import { Icon } from '../icons';
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
      <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Back to tools" title="Back to tools" onMouseDown={keepFocus} onClick={onBack}>
        <Icon name="chevron-left" />
      </button>
      {TEXT_FORMATS.map(({ format, label }) => (
        <button
          key={format}
          type="button"
          className="lc-ticket-composer__icon-btn"
          aria-label={label}
          title={label}
          onMouseDown={keepFocus}
          onClick={() => onFormat(format)}
        >
          <Icon name={format === 'monospace' ? 'code' : format} />
        </button>
      ))}
      <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Undo" title="Undo" disabled={!canUndo} onMouseDown={keepFocus} onClick={onUndo}>
        <Icon name="undo" />
      </button>
      <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Redo" title="Redo" disabled={!canRedo} onMouseDown={keepFocus} onClick={onRedo}>
        <Icon name="redo" />
      </button>
    </div>
  );
}
