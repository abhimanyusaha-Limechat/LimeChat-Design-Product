/**
 * EmailMessage — LimeChat design system (Figma node 9468:5662 "email-message").
 *
 * A single email in a Helpdesk email-channel thread: a compressed preview
 * row that expands into the full message, an optional "to/bcc" detail
 * disclosure (from/to/bcc/date/subject/important), attachments, and a
 * "Show quoted text" toggle for the trailing thread history.
 *
 *   <EmailMessage
 *     senderName="Caroline Mack" senderEmail="caroline@spline.design"
 *     recipientSummary="to Education, bcc: me" date="Mar 3, 2026, 12:59 AM"
 *     badgeLabel="4 days ago"
 *     details={{ from: 'Caroline Mack <caroline@spline.design>', to: 'Education <edu@spline.design>', bcc: 'me@example.com', date: 'Mar 3, 2026, 12:59 AM', subject: 'Verification Needed', important: true }}
 *     body={<>Hi there,<br />...</>}
 *     attachments={[{ name: 'id-card.png' }]}
 *     quotedText="On Mar 2, 2026, Aditi Rao wrote: ..."
 *   />
 */
import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
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

const ChevronDownIcon = () => (
  <svg {...iconProps()}>
    <path d="M6 9l6 6l6 -6" />
  </svg>
);
const DotsVerticalIcon = () => (
  <svg {...iconProps()}>
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    <circle cx="12" cy="19" r="0.5" fill="currentColor" />
    <circle cx="12" cy="5" r="0.5" fill="currentColor" />
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" fill="currentColor" />
    <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" fill="currentColor" />
    <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" fill="currentColor" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.9 6.26L22 9.27l-5 4.87l1.18 6.88L12 17.77l-6.18 3.25L7 14.14L2 9.27l7.1-1.01L12 2z" />
  </svg>
);

export interface EmailAttachment {
  name?: string;
  thumbnail?: string;
}

export interface EmailDetails {
  from: string;
  to: string;
  bcc?: string;
  date: string;
  subject: string;
  important?: boolean;
}

export interface EmailMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  senderName: string;
  senderEmail: string;
  avatarSrc?: string;
  /** e.g. "to Education, bcc: me" — shown next to the disclosure chevron. */
  recipientSummary?: string;
  date: string;
  /** e.g. "4 days ago" */
  badgeLabel?: string;
  /** Full message body, shown when expanded. */
  body?: ReactNode;
  /** Short plain-text preview, shown in the compressed row. Falls back to `body` if it's a string. */
  preview?: string;
  attachments?: EmailAttachment[];
  /** Content revealed by "Show quoted text ...". Omit to hide the toggle. */
  quotedText?: ReactNode;
  /** Recipient detail fields — presence enables the chevron disclosure. */
  details?: EmailDetails;
  /** Uncontrolled initial state for the compressed/expanded row. Default `true`. */
  defaultExpanded?: boolean;
  onMoreActions?: () => void;
}

function AttachmentThumb({ thumbnail, name }: EmailAttachment) {
  if (thumbnail) {
    return <img className="lc-email-message__attachment" src={thumbnail} alt={name ?? ''} />;
  }
  return (
    <div className="lc-email-message__attachment lc-email-message__attachment--placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 15l4 -4a3 5 0 0 1 3 0l5 5" />
        <path d="M14 14l1 -1a3 5 0 0 1 3 0l3 3" />
        <circle cx="8" cy="8.5" r="1.5" />
      </svg>
    </div>
  );
}

function DetailRow({ label, value, emphasize }: { label: ReactNode; value: ReactNode; emphasize?: boolean }) {
  return (
    <div className="lc-email-message__detail-row">
      <span className="lc-email-message__detail-label">{label}</span>
      <span className={`lc-email-message__detail-value${emphasize ? ' lc-email-message__detail-value--strong' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export const EmailMessage = forwardRef<HTMLDivElement, EmailMessageProps>(function EmailMessage(
  {
    senderName,
    senderEmail,
    avatarSrc,
    recipientSummary,
    date,
    badgeLabel,
    body,
    preview,
    attachments,
    quotedText,
    details,
    defaultExpanded = true,
    onMoreActions,
    className,
    ...rest
  },
  ref,
) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuoted, setShowQuoted] = useState(false);

  const previewText = preview ?? (typeof body === 'string' ? body : undefined);

  return (
    <div {...rest} ref={ref} className={`lc-email-message${className ? ` ${className}` : ''}`} data-expanded={expanded}>
      <button
        type="button"
        className="lc-email-message__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="lc-email-message__avatar">
          {avatarSrc ? <img src={avatarSrc} alt="" /> : <span>{senderName.charAt(0).toUpperCase()}</span>}
        </div>

        <div className="lc-email-message__sender-stack">
          <div className="lc-email-message__name-row">
            <span className="lc-email-message__name">{senderName}</span>
            <span className="lc-email-message__email">&lt;{senderEmail}&gt;</span>
          </div>

          {expanded ? (
            recipientSummary && (
              <div className="lc-email-message__recipient-row">
                <span>{recipientSummary}</span>
                {details && (
                  <span
                    className="lc-email-message__chevron"
                    data-open={showDetails}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails((v) => !v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        setShowDetails((v) => !v);
                      }
                    }}
                    aria-label="Toggle message details"
                  >
                    <ChevronDownIcon />
                  </span>
                )}
              </div>
            )
          ) : (
            previewText && <p className="lc-email-message__preview">{previewText}</p>
          )}
        </div>

        <div className="lc-email-message__meta">
          <span className="lc-email-message__date">{date}</span>
          {badgeLabel && <span className="lc-email-message__badge">{badgeLabel}</span>}
          <span
            className="lc-email-message__more"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onMoreActions?.();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onMoreActions?.();
              }
            }}
            aria-label="More actions"
          >
            <DotsVerticalIcon />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="lc-email-message__body-wrap">
          {showDetails && details && (
            <div className="lc-email-message__details">
              <DetailRow label="from" value={details.from} />
              <DetailRow label="to" value={details.to} />
              {details.bcc && <DetailRow label="bcc" value={details.bcc} />}
              <DetailRow label="date" value={details.date} />
              <DetailRow label="subject" value={details.subject} emphasize />
              {details.important && (
                <DetailRow
                  label={
                    <span className="lc-email-message__star">
                      <StarIcon />
                    </span>
                  }
                  value="Important"
                />
              )}
            </div>
          )}

          {body && <div className="lc-email-message__body">{body}</div>}

          {(attachments?.length || quotedText) && <div className="lc-email-message__divider" />}

          {attachments && attachments.length > 0 && (
            <div className="lc-email-message__attachments">
              <p className="lc-email-message__attachments-title">Attachments</p>
              <div className="lc-email-message__attachments-row">
                {attachments.map((a, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <AttachmentThumb key={i} {...a} />
                ))}
              </div>
            </div>
          )}

          {quotedText && (
            <>
              <button type="button" className="lc-email-message__quoted-toggle" onClick={() => setShowQuoted((v) => !v)}>
                {showQuoted ? 'Hide quoted text' : 'Show quoted text ...'}
              </button>
              {showQuoted && <div className="lc-email-message__quoted-text">{quotedText}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default EmailMessage;
