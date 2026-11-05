/**
 * The row under the reply box that opens from the Aa button: text formatting in one pill, undo / redo in
 * another. It stays mounted so it can animate shut (`data-open` drives the collapse in the CSS), and its
 * formatting pill is shifted so its middle sits over the Aa button.
 */
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Icon } from '../icons';
import { TEXT_FORMATS, type TextFormat } from './textFormat';

interface FormattingToolbarProps {
  open: boolean;
  /** The Aa button the row is centred on. */
  toggleRef: RefObject<HTMLButtonElement | null>;
  /** The composer; its resizes move the Aa button, so the row re-measures. */
  containerRef: RefObject<HTMLElement | null>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFormat: (format: TextFormat) => void;
}

// mousedown would take focus (and the selection) away from the textarea.
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

export function FormattingToolbar({ open, toggleRef, containerRef, canUndo, canRedo, onUndo, onRedo, onFormat }: FormattingToolbarProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const toggle = toggleRef.current?.getBoundingClientRect();
      const row = rowRef.current?.getBoundingClientRect();
      const pill = pillRef.current?.offsetWidth ?? 0;
      if (toggle && row) setLeft(Math.max(0, toggle.left + toggle.width / 2 - pill / 2 - row.left));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef, toggleRef]);

  return (
    <div className="lc-ticket-composer__format-collapse" data-open={open || undefined}>
      <div className="lc-ticket-composer__format-clip">
        <div ref={rowRef} className="lc-ticket-composer__format-row">
          <div
            ref={pillRef}
            className="lc-ticket-composer__format"
            role="toolbar"
            aria-label="Text formatting"
            style={{ marginLeft: left }}
          >
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
          <div className="lc-ticket-composer__format" role="toolbar" aria-label="History">
            <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Undo" title="Undo" disabled={!canUndo} onMouseDown={keepFocus} onClick={onUndo}>
              <Icon name="undo" />
            </button>
            <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Redo" title="Redo" disabled={!canRedo} onMouseDown={keepFocus} onClick={onRedo}>
              <Icon name="redo" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
