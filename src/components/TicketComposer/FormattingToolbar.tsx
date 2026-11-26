/**
 * The text formatting pill that opens from the Aa button. It renders inline, right
 * after the Aa button in the composer's options row, and only while `open`.
 */
import { Icon } from '../icons';
import { TEXT_FORMATS, type TextFormat } from './textFormat';

interface FormattingToolbarProps {
  open: boolean;
  onFormat: (format: TextFormat) => void;
}

// mousedown would take focus (and the selection) away from the textarea. Shared with the Aa toggle that
// opens this pill, so the whole formatting flow leaves the caret, selection and Ctrl+Z/Y in the box.
export const keepFocus = (e: React.MouseEvent) => e.preventDefault();

export function FormattingToolbar({ open, onFormat }: FormattingToolbarProps) {
  if (!open) return null;
  return (
    <div className="lc-ticket-composer__format-options" role="toolbar" aria-label="Text formatting">
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
    </div>
  );
}
