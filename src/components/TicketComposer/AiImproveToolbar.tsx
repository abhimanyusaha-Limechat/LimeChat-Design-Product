/** The row under the reply box that opens from the AI button: two ways to rewrite the draft. Same collapse and centring as FormattingToolbar. */
import type { RefObject } from 'react';
import { useCentredPill } from './useCentredPill';

export type AiImproveStyle = 'shorter' | 'professional';

const OPTIONS: { style: AiImproveStyle; label: string }[] = [
  { style: 'shorter', label: 'Shorter' },
  { style: 'professional', label: 'Professional' },
];

interface AiImproveToolbarProps {
  open: boolean;
  /** The AI button the row is centred on. */
  toggleRef: RefObject<HTMLButtonElement | null>;
  containerRef: RefObject<HTMLElement | null>;
  onSelect: (style: AiImproveStyle) => void;
}

export function AiImproveToolbar({ open, toggleRef, containerRef, onSelect }: AiImproveToolbarProps) {
  const { rowRef, pillRef, left } = useCentredPill(toggleRef, containerRef);
  return (
    <div className="lc-ticket-composer__format-collapse" data-open={open || undefined}>
      <div className="lc-ticket-composer__format-clip">
        <div ref={rowRef} className="lc-ticket-composer__format-row">
          <div ref={pillRef} className="lc-ticket-composer__format" role="toolbar" aria-label="Improve with AI" style={{ marginLeft: left }}>
            {OPTIONS.map(({ style, label }) => (
              <button key={style} type="button" className="lc-ticket-composer__ai-option" onClick={() => onSelect(style)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
