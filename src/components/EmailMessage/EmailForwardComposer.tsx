/**
 * EmailForwardComposer — LimeChat design system (Figma node 9504:20618
 * "Email Composer", `Default` / `Variant4` / `Variant5` / `Large` property
 * states).
 *
 * The "Forwarding to" / "Replying to" composer: a collapsed recipients
 * header that expands into editable To/CC/BCC chip rows (`mode="forward"`
 * only shows a To row — `mode="reply"` implies the recipient from the
 * thread), plus a maximize toggle that opens the composer in a full-viewport
 * modal.
 *
 *   <EmailForwardComposer
 *     mode="forward"
 *     to={['contact@randommail.com']}
 *     cc={['info@mywebsite.com']}
 *     bcc={['hello@samplemail.com']}
 *     onAddRecipient={(field, email) => addRecipient(field, email)}
 *     onRemoveRecipient={(field, email) => removeRecipient(field, email)}
 *     value={draft} onChange={setDraft}
 *     quotedText="On Mar 2, 2026, Aditi Rao wrote: ..."
 *     onSend={() => send(draft)}
 *     onDelete={() => setDraft('')}
 *   />
 */
import { forwardRef, useEffect, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button';
import './EmailMessage.css';

function iconProps(size = 24) {
  return {
    viewBox: '0 0 24 24',
    width: size,
    height: size,
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
const TrashIcon = ({ size }: { size?: number }) => (
  <svg {...iconProps(size)}>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
  </svg>
);
const MaximizeIcon = () => (
  <svg {...iconProps(16)}>
    <path d="M16 4l4 0l0 4" />
    <path d="M14 10l6 -6" />
    <path d="M8 20l-4 0l0 -4" />
    <path d="M4 20l6 -6" />
    <path d="M4 8l0 -4l4 0" />
    <path d="M4 4l6 6" />
    <path d="M16 20l4 0l0 -4" />
    <path d="M14 14l6 6" />
  </svg>
);
const MinimizeIcon = () => (
  <svg {...iconProps(16)}>
    <path d="M15 19v-2a2 2 0 0 1 2 -2h2" />
    <path d="M15 5v2a2 2 0 0 0 2 2h2" />
    <path d="M5 15h2a2 2 0 0 1 2 2v2" />
    <path d="M5 9h2a2 2 0 0 0 2 -2v-2" />
  </svg>
);

const TOOLBAR_ICONS = [BoldIcon, ItalicIcon, HighlightIcon, LinkIcon, RedoIcon, RepeatIcon, ListIcon, PaperclipIcon];

export type EmailRecipientField = 'to' | 'cc' | 'bcc';

const FIELD_LABEL: Record<EmailRecipientField, string> = { to: 'To', cc: 'CC', bcc: 'BCC' };

function RecipientRow({
  field,
  emails,
  onAdd,
  onRemove,
}: {
  field: EmailRecipientField;
  emails: string[];
  onAdd?: (field: EmailRecipientField, email: string) => void;
  onRemove?: (field: EmailRecipientField, email: string) => void;
}) {
  const [draft, setDraft] = useState('');

  function commit() {
    const email = draft.trim();
    if (email) onAdd?.(field, email);
    setDraft('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    }
  }

  return (
    <div className="lc-email-forward__recipient-row">
      <span className="lc-email-forward__recipient-label">{FIELD_LABEL[field]} :</span>
      {emails.map((email) => (
        <span key={email} className="lc-email-forward__chip">
          {email}
          <button
            type="button"
            className="lc-email-forward__chip-remove"
            aria-label={`Remove ${email}`}
            onClick={() => onRemove?.(field, email)}
          >
            <TrashIcon size={12} />
          </button>
        </span>
      ))}
      <input
        className="lc-email-forward__recipient-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={field === 'bcc' ? 'Type name of recipient' : 'Type to add'}
      />
    </div>
  );
}

export interface EmailForwardComposerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** `'forward'` shows an editable To field and titles the header "Forwarding to";
   * `'reply'` titles it "Replying to" and skips the To row, since the recipient is
   * already implied by the thread. Default `'forward'`. */
  mode?: 'reply' | 'forward';
  to?: string[];
  cc?: string[];
  bcc?: string[];
  onAddRecipient?: (field: EmailRecipientField, email: string) => void;
  onRemoveRecipient?: (field: EmailRecipientField, email: string) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  quotedText?: ReactNode;
  onToggleAi?: () => void;
  aiActive?: boolean;
  onDelete?: () => void;
  onSend?: () => void;
  sendLabel?: string;
  sendDisabled?: boolean;
  defaultMaximized?: boolean;
}

export const EmailForwardComposer = forwardRef<HTMLDivElement, EmailForwardComposerProps>(
  function EmailForwardComposer(
    {
      mode = 'forward',
      to = [],
      cc = [],
      bcc = [],
      onAddRecipient,
      onRemoveRecipient,
      value,
      onChange,
      placeholder = 'Write a message...',
      quotedText,
      onToggleAi,
      aiActive = false,
      onDelete,
      onSend,
      sendLabel,
      sendDisabled,
      defaultMaximized = false,
      className,
      ...rest
    },
    ref,
  ) {
    const isForward = mode === 'forward';
    const [editingAddresses, setEditingAddresses] = useState(isForward && to.length === 0);
    const [maximized, setMaximized] = useState(defaultMaximized);
    const [showQuoted, setShowQuoted] = useState(false);

    useEffect(() => {
      if (!maximized) return;
      const onKey = (e: globalThis.KeyboardEvent) => {
        if (e.key === 'Escape') setMaximized(false);
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [maximized]);

    const composer = (
      <div
        {...rest}
        ref={ref}
        className={`lc-email-forward${className ? ` ${className}` : ''}`}
        data-maximized={maximized || undefined}
      >
        <div className="lc-email-forward__title-row">
          <span className="lc-email-forward__title">{isForward ? 'Forwarding to' : 'Replying to'}</span>
          <div className="lc-email-forward__title-actions">
            <button
              type="button"
              className="lc-email-forward__title-icon-btn"
              aria-label={maximized ? 'Minimize composer' : 'Maximize composer'}
              onClick={() => setMaximized((v) => !v)}
            >
              {maximized ? <MinimizeIcon /> : <MaximizeIcon />}
            </button>
            <button
              type="button"
              className="lc-email-forward__title-icon-btn"
              aria-label="Delete draft"
              onClick={onDelete}
            >
              <TrashIcon size={16} />
            </button>
          </div>
        </div>

        <div className="lc-email-forward__card">
          {editingAddresses ? (
            <div className="lc-email-forward__address-editor">
              {isForward && <RecipientRow field="to" emails={to} onAdd={onAddRecipient} onRemove={onRemoveRecipient} />}
              <RecipientRow field="cc" emails={cc} onAdd={onAddRecipient} onRemove={onRemoveRecipient} />
              <RecipientRow field="bcc" emails={bcc} onAdd={onAddRecipient} onRemove={onRemoveRecipient} />
            </div>
          ) : (
            <button
              type="button"
              className="lc-email-reply__header"
              onClick={() => setEditingAddresses(true)}
            >
              <span className="lc-email-reply__recipients">
                {to.length > 0 && <span className="lc-email-reply__recipients-list">{to.join(' , ')}</span>}
                {cc.length > 0 && (
                  <span className="lc-email-reply__bcc">
                    <span className="lc-email-reply__bcc-label">CC :</span> {cc.join(', ')}
                  </span>
                )}
              </span>
              <span className="lc-email-reply__header-actions">
                <span
                  className="lc-email-reply__chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingAddresses(true);
                  }}
                >
                  CC
                </span>
                <span
                  className="lc-email-reply__chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingAddresses(true);
                  }}
                >
                  BCC
                </span>
              </span>
            </button>
          )}

          <div className="lc-email-forward__input-row">
            <textarea
              className="lc-email-forward__textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => (!isForward || to.length > 0) && setEditingAddresses(false)}
              placeholder={placeholder}
              rows={6}
            />
          </div>

          {quotedText && (
            <>
              <button
                type="button"
                className="lc-email-message__quoted-toggle"
                onClick={() => setShowQuoted((v) => !v)}
              >
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
              <Button size="sm" onClick={onSend} disabled={sendDisabled}>
                {sendLabel ?? (isForward ? 'Forward' : 'Reply')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );

    if (maximized && typeof document !== 'undefined') {
      return createPortal(
        <div className="lc-email-forward-overlay" onMouseDown={(e) => e.target === e.currentTarget && setMaximized(false)}>
          {composer}
        </div>,
        document.body,
      );
    }

    return composer;
  },
);

export default EmailForwardComposer;
