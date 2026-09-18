/**
 * EmailReplyComposer — LimeChat design system (Figma node 9504:30767,
 * a variant of "email-message" used for composing a reply in-thread).
 *
 *   <EmailReplyComposer
 *     cc={['contact@randommail.com', 'info@mywebsite.com']}
 *     bcc={['hello@samplemail.com']}
 *     value={draft} onChange={setDraft}
 *     quotedText="On Mar 2, 2026, Aditi Rao wrote: ..."
 *     onReply={() => send(draft)}
 *     onDelete={() => setDraft('')}
 *   />
 */
import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Button } from '../Button';
import './EmailMessage.css';

function iconProps() {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

const BoldIcon = () => (
  <svg {...iconProps()}>
    <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
    <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" />
  </svg>
);
const ItalicIcon = () => (
  <svg {...iconProps()}>
    <path d="M11 5l6 0" />
    <path d="M7 19l6 0" />
    <path d="M14 5l-4 14" />
  </svg>
);
const HighlightIcon = () => (
  <svg {...iconProps()}>
    <path d="M12.5 5.5l4 4" />
    <path d="M4 20l1.5 -5.5l9 -9l4 4l-9 9z" />
  </svg>
);
const LinkIcon = () => (
  <svg {...iconProps()}>
    <path d="M9 15l6 -6" />
    <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
    <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
  </svg>
);
const RedoIcon = () => (
  <svg {...iconProps()}>
    <path d="M15 14l4 -4l-4 -4" />
    <path d="M19 10h-11a4 4 0 1 0 0 8h1" />
  </svg>
);
const RepeatIcon = () => (
  <svg {...iconProps()}>
    <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
    <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
  </svg>
);
const ListIcon = () => (
  <svg {...iconProps()}>
    <path d="M9 6l11 0" />
    <path d="M9 12l11 0" />
    <path d="M9 18l11 0" />
    <path d="M5 6l0 .01" />
    <path d="M5 12l0 .01" />
    <path d="M5 18l0 .01" />
  </svg>
);
const PaperclipIcon = () => (
  <svg {...iconProps()}>
    <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
  </svg>
);
const WandIcon = () => (
  <svg {...iconProps()}>
    <path d="M6 21l15 -15l-3 -3l-15 15z" />
    <path d="M15 6l3 3" />
    <path d="M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
    <path d="M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
  </svg>
);
const TrashIcon = () => (
  <svg {...iconProps()}>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
  </svg>
);

const TOOLBAR_ICONS = [BoldIcon, ItalicIcon, HighlightIcon, LinkIcon, RedoIcon, RepeatIcon, ListIcon, PaperclipIcon];

export interface EmailReplyComposerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  cc?: string[];
  bcc?: string[];
  onAddCc?: () => void;
  onAddBcc?: () => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  quotedText?: ReactNode;
  onToggleAi?: () => void;
  aiActive?: boolean;
  onDelete?: () => void;
  onReply?: () => void;
  replyDisabled?: boolean;
}

export const EmailReplyComposer = forwardRef<HTMLDivElement, EmailReplyComposerProps>(function EmailReplyComposer(
  {
    cc,
    bcc,
    onAddCc,
    onAddBcc,
    value,
    onChange,
    placeholder = 'Write a reply...',
    quotedText,
    onToggleAi,
    aiActive = false,
    onDelete,
    onReply,
    replyDisabled,
    className,
    ...rest
  },
  ref,
) {
  const [showQuoted, setShowQuoted] = useState(false);

  return (
    <div {...rest} ref={ref} className={`lc-email-reply${className ? ` ${className}` : ''}`}>
      <div className="lc-email-reply__header">
        <div className="lc-email-reply__recipients">
          {cc && cc.length > 0 && <span className="lc-email-reply__recipients-list">{cc.join(' , ')}</span>}
          {bcc && bcc.length > 0 && (
            <span className="lc-email-reply__bcc">
              <span className="lc-email-reply__bcc-label">CC :</span> {bcc.join(', ')}
            </span>
          )}
        </div>
        <div className="lc-email-reply__header-actions">
          <button type="button" className="lc-email-reply__chip" onClick={onAddCc}>
            CC
          </button>
          <button type="button" className="lc-email-reply__chip" onClick={onAddBcc}>
            BCC
          </button>
        </div>
      </div>

      <div className="lc-email-reply__input-row">
        <textarea
          className="lc-email-reply__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      </div>

      {quotedText && (
        <>
          <button type="button" className="lc-email-message__quoted-toggle" onClick={() => setShowQuoted((v) => !v)}>
            {showQuoted ? 'Hide quoted text' : 'Show quoted text ...'}
          </button>
          {showQuoted && <div className="lc-email-message__quoted-text">{quotedText}</div>}
        </>
      )}

      <div className="lc-email-reply__toolbar">
        <div className="lc-email-reply__toolbar-buttons">
          {TOOLBAR_ICONS.map((Icon, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <button key={i} type="button" className="lc-email-reply__icon-btn">
              <Icon />
            </button>
          ))}
          <button
            type="button"
            className="lc-email-reply__ai-btn"
            data-active={aiActive}
            onClick={onToggleAi}
          >
            <WandIcon />
            AI
          </button>
        </div>
        <div className="lc-email-reply__send-group">
          <button type="button" className="lc-email-reply__icon-btn" onClick={onDelete} aria-label="Delete draft">
            <TrashIcon />
          </button>
          <Button size="sm" onClick={onReply} disabled={replyDisabled}>
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
});

export default EmailReplyComposer;
