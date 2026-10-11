import { forwardRef, type KeyboardEvent } from 'react';
import { Button } from '../components/Button';
import type { Point } from './placement';

const WIDTH = 280;
/** Roughly the composer's height with an error line; keeps it on screen without measuring. */
const HEIGHT = 190;
const GAP = 14;
const MARGIN = 8;

/** Beside the Pin, flipped left near the right edge and nudged up near the bottom. */
function placement(at: Point) {
  const right = at.left + GAP;
  const left = right + WIDTH > window.innerWidth - MARGIN ? Math.max(MARGIN, at.left - GAP - WIDTH) : right;
  const top = Math.max(MARGIN, Math.min(at.top - 24, window.innerHeight - HEIGHT - MARGIN));
  return { left, top, width: WIDTH };
}

interface CommentComposerProps {
  at: Point;
  text: string;
  posting: boolean;
  error: string | null;
  /** Esc was pressed once over unsent text; a second press discards it. */
  confirmDiscard: boolean;
  inOverlay: boolean;
  onChange: (text: string) => void;
  onPost: () => void;
  onCancel: () => void;
}

/** A non-modal dialog beside the draft Pin. Esc is handled by the Inspector's key chain. */
export const CommentComposer = forwardRef<HTMLTextAreaElement, CommentComposerProps>(function CommentComposer(
  { at, text, posting, error, confirmDiscard, inOverlay, onChange, onPost, onCancel },
  ref,
) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onPost();
    }
  };

  return (
    <div className="lc-inspector__panel lc-comments__popover" role="dialog" aria-label="New comment" style={placement(at)}>
      <textarea
        ref={ref}
        autoFocus
        className="lc-comments__input"
        aria-label="Comment"
        placeholder="Add a comment"
        rows={3}
        maxLength={5000}
        value={text}
        disabled={posting}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {inOverlay && <p className="lc-comments__hint">This is on a menu or dialog, so it won't get a Pin — it'll be in the list.</p>}
      {confirmDiscard && <p className="lc-comments__hint">Press Esc again to discard.</p>}
      {error && (
        <p className="lc-comments__error" role="alert">
          {error}
        </p>
      )}
      <div className="lc-comments__actions">
        <Button variant="subtle" color="gray" size="xs" textTransform="none" onClick={onCancel} disabled={posting}>
          Cancel
        </Button>
        <Button size="xs" textTransform="none" onClick={onPost} disabled={!text.trim()} loading={posting} title="Ctrl+Enter">
          Post
        </Button>
      </div>
    </div>
  );
});
