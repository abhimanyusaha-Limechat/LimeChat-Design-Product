/**
 * EmailComposerBar — LimeChat design system (Figma node 9466:6879, "ticket_input"
 * component, `Property 1=Email zero state`).
 *
 * The default footer shown under an email ticket before a reply is started —
 * clicking Reply or Forward is what opens the full `EmailForwardComposer`.
 *
 *   <EmailComposerBar onMerge={merge} onNotes={openNotes} onReply={openReply} onForward={openForward} />
 */
import { forwardRef, type HTMLAttributes } from 'react';
import { Button } from '../Button';
import './EmailMessage.css';
import { iconProps } from '../iconProps';

const MergeIcon = () => (
  <svg {...iconProps()}>
    <path d="M12 20v-9" />
    <path d="M8 15l4 -4l4 4" />
    <path d="M6 4h3a3 3 0 0 1 3 3v4" />
    <path d="M18 4h-3a3 3 0 0 0 -3 3v1" />
  </svg>
);
const NotebookIcon = () => (
  <svg {...iconProps()}>
    <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1z" />
    <path d="M9.5 4v17" />
    <path d="M6.5 8h1" />
    <path d="M6.5 11h1" />
  </svg>
);
const ReplyIcon = () => (
  <svg {...iconProps()}>
    <path d="M9 14l-4 -4l4 -4" />
    <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
  </svg>
);
const ForwardIcon = () => (
  <svg {...iconProps()}>
    <path d="M15 14l4 -4l-4 -4" />
    <path d="M19 10h-11a4 4 0 1 0 0 8h1" />
  </svg>
);

export interface EmailComposerBarProps extends HTMLAttributes<HTMLDivElement> {
  onMerge?: () => void;
  mergeDisabled?: boolean;
  onNotes?: () => void;
  onReply?: () => void;
  onForward?: () => void;
}

export const EmailComposerBar = forwardRef<HTMLDivElement, EmailComposerBarProps>(function EmailComposerBar(
  { onMerge, mergeDisabled, onNotes, onReply, onForward, className, ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={`lc-email-composer-bar${className ? ` ${className}` : ''}`}>
      <div className="lc-email-composer-bar__left">
        <Button variant="outline" size="sm" leftSection={<MergeIcon />} onClick={onMerge} disabled={mergeDisabled}>
          Merge
        </Button>
        <button
          type="button"
          className="lc-email-composer-bar__icon-btn"
          aria-label="Private notes"
          onClick={onNotes}
        >
          <NotebookIcon />
        </button>
      </div>
      <div className="lc-email-composer-bar__right">
        <Button variant="outline" size="sm" rightSection={<ForwardIcon />} onClick={onForward}>
          Forward
        </Button>
        <Button variant="filled" size="sm" rightSection={<ReplyIcon />} onClick={onReply}>
          Reply
        </Button>
      </div>
    </div>
  );
});

export default EmailComposerBar;
