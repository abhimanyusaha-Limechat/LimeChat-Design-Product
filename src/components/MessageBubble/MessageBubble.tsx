/**
 * MessageBubble — LimeChat design system (Figma node 9235:2872 "message_bubble").
 *
 * The chat bubble used across Helpdesk conversations: agent/customer sides,
 * tails, avatars, timestamps + read ticks, forwarded/notice banners,
 * reactions, and content variants (text, quote/reply, media, link,
 * attachment, location, private note, deleted/opened/view-once system
 * states).
 *
 *   <MessageBubble side="agent" time="12:00" status="read">
 *     Hey, how can I help?
 *   </MessageBubble>
 *
 *   <MessageBubble side="customer" senderName="Aditi Rao" avatar quote={{ name: 'Aditi Rao', text: 'Is my order shipped?' }}>
 *     Yes, it left the warehouse today.
 *   </MessageBubble>
 *
 *   <MessageBubble side="agent" variant="media" media={[{ src: '/photo.jpg' }]} time="12:00" />
 *   <MessageBubble side="agent" variant="deleted" time="12:00" />
 */
import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { type MenuTriggerRenderProps } from '../Menu';
import { usePopoverPosition } from '../../hooks/usePopoverPosition';
import './MessageBubble.css';
import { iconProps } from '../iconProps';

const DEFAULT_REACTION_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export type MessageBubbleSide = 'agent' | 'customer';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageBubbleVariant =
  | 'text'
  | 'quote'
  | 'media'
  | 'link'
  | 'attachment'
  | 'location'
  | 'note'
  | 'blocked'
  | 'deleted'
  | 'opened'
  | 'viewOnce';

export interface ReactionData {
  emoji: string;
  count?: number;
}

export interface QuoteData {
  name: string;
  text: string;
  /** Accent used for the name + left bar. Defaults to `accentColor`. */
  color?: string;
}

export interface MediaItem {
  src?: string;
  alt?: string;
}

export interface LinkData {
  title: string;
  description?: string;
  domain?: string;
  thumbnail?: string;
}

export interface AttachmentData {
  title: string;
  meta?: string;
  fileType?: string;
  thumbnail?: string;
}

export interface LocationData {
  thumbnail?: string;
}

export interface NoteData {
  ticketId?: string;
  onViewTicket?: () => void;
}

/* --- Icons (Tabler-style outline, matches Avatar's PersonIcon) --------- */

const ForwardIcon = () => (
  <svg {...iconProps()}>
    <path d="M15 8l4 4l-4 4" />
    <path d="M4 12h14.5" />
    <path d="M6 6c0 4 -1 6 -3 8" opacity={0} />
  </svg>
);
const LockIcon = () => (
  <svg {...iconProps()}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
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
const EyeIcon = () => (
  <svg {...iconProps()}>
    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
  </svg>
);
const ViewOnceIcon = () => (
  <svg {...iconProps()}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l3 2" />
  </svg>
);
const PrivateIcon = () => (
  <svg {...iconProps()}>
    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
  </svg>
);
const TicketIcon = () => (
  <svg {...iconProps()}>
    <path d="M15 5l6 6l-1.5 1.5a2.121 2.121 0 0 0 -3 3l-6.5 6.5l-6 -6l6.5 -6.5a2.121 2.121 0 0 0 3 -3z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg {...iconProps()}>
    <path d="M5 12h14" />
    <path d="M13 18l6 -6" />
    <path d="M13 6l6 6" />
  </svg>
);
const ReactIcon = () => (
  <svg {...iconProps()}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 10l.01 0" />
    <path d="M15 10l.01 0" />
    <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
  </svg>
);
const RemoveReactionIcon = () => (
  <svg {...iconProps()}>
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </svg>
);
const DocIcon = ({ label = 'file' }: { label?: string }) => (
  <div className="lc-message-bubble__doc-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    </svg>
    <span>{label}</span>
  </div>
);

/** Single check for `sent`; double (overlapping) check for `delivered`/`read` — the second turns blue via CSS when `read`. */
function Tick({ status }: { status: MessageStatus }) {
  return (
    <span className="lc-message-bubble__tick" data-status={status} aria-hidden="true">
      <svg viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 5.5L4.5 9L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {status !== 'sent' && (
          <path d="M5.5 5.5L9 9L15.5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </span>
  );
}

/* --- Media / link / attachment thumbnails ------------------------------- */

function Thumbnail({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  if (src) {
    return <img className={className} src={src} alt={alt ?? ''} />;
  }
  return (
    <div className={`${className ?? ''} lc-message-bubble__thumb-placeholder`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 15l4 -4a3 5 0 0 1 3 0l5 5" />
        <path d="M14 14l1 -1a3 5 0 0 1 3 0l3 3" />
        <circle cx="8" cy="8.5" r="1.5" />
      </svg>
    </div>
  );
}

/* --- Root component ------------------------------------------------------ */

export interface MessageBubbleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  side?: MessageBubbleSide;
  variant?: MessageBubbleVariant;
  /** Message text / mixed inline content. */
  children?: ReactNode;
  time?: string;
  status?: MessageStatus;
  /** `true` renders a default initial avatar; pass a node to customize; omit/`false` to hide. */
  avatar?: ReactNode | boolean;
  avatarInitial?: string;
  /** Shown above the content on the customer side. */
  senderName?: string;
  /** Accent used for `senderName` and the quote bar/name. */
  accentColor?: string;
  forwarded?: boolean;
  forwardedLabel?: string;
  /** Notice banner (e.g. "Encrypted message detected") — same slot as `forwarded`. */
  notice?: string;
  /** Warning banner used by the `blocked` variant. */
  warningLabel?: string;
  onlyVisibleToMe?: boolean;
  reaction?: ReactionData;
  /** Quick-reaction emoji set for the picker. Defaults to a WhatsApp-style set. */
  reactionOptions?: string[];
  /**
   * Called with the picked emoji when the agent reacts (or re-picks the current one, to
   * remove it). Presence enables a hover-reveal reaction trigger on the bubble and makes
   * an existing `reaction` chip clickable to change or remove it.
   */
  onReact?: (emoji: string) => void;
  tail?: boolean;
  quote?: QuoteData;
  media?: MediaItem[];
  link?: LinkData;
  attachment?: AttachmentData;
  location?: LocationData;
  note?: NoteData;
}

function Banner({ icon, text, tone = 'dimmed' }: { icon: ReactNode; text: string; tone?: 'dimmed' | 'error' }) {
  return (
    <div className="lc-message-bubble__banner" data-tone={tone}>
      <span className="lc-message-bubble__banner-icon">{icon}</span>
      <p>{text}</p>
    </div>
  );
}

/**
 * Horizontal emoji-strip popover for picking a reaction. Near-duplicates
 * `Menu`'s trigger/portal/outside-click/Escape mechanics (and shares its
 * `usePopoverPosition` hook) rather than reusing `Menu` itself — `Menu`'s
 * `items` render as a vertical icon+label list, which doesn't fit a compact
 * row of plain emoji buttons (same reasoning as `ProductsPanel`'s
 * `FilterPopover`).
 */
function ReactionPicker({
  options,
  active,
  onPick,
  trigger,
  align = 'start',
}: {
  options: string[];
  active?: string;
  onPick: (emoji: string) => void;
  trigger: (props: MenuTriggerRenderProps) => ReactNode;
  align?: 'start' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const width = options.length * 32 + 16 + (active ? 32 : 0);
  const coords = usePopoverPosition(open, triggerRef, popoverRef, width, align);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !popoverRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Portalling to `document.body` moves the popover out of the trigger's place in the
  // DOM, so Tab order wouldn't naturally reach it — move focus in on open (to the
  // active/first option) and back to the trigger on close, rather than relying on it.
  useEffect(() => {
    if (!open) return;
    const activeButton = popoverRef.current?.querySelector<HTMLButtonElement>('[data-active]');
    const firstButton = popoverRef.current?.querySelector<HTMLButtonElement>('button');
    (activeButton ?? firstButton)?.focus();
    return () => triggerRef.current?.focus();
  }, [open]);

  return (
    <>
      {trigger({ ref: triggerRef, onClick: () => setOpen((o) => !o), open })}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            className="lc-message-bubble__reaction-picker"
            role="group"
            aria-label="Pick a reaction"
            style={{ width, ...(coords ? { top: coords.top, left: coords.left } : { visibility: 'hidden' as const }) }}
          >
            {options.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="lc-message-bubble__reaction-option"
                data-active={emoji === active || undefined}
                onClick={() => {
                  setOpen(false);
                  onPick(emoji);
                }}
              >
                {emoji}
              </button>
            ))}
            {active && (
              <button
                type="button"
                className="lc-message-bubble__reaction-option lc-message-bubble__reaction-option--remove"
                aria-label="Remove reaction"
                onClick={() => {
                  setOpen(false);
                  onPick(active);
                }}
              >
                <RemoveReactionIcon />
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(function MessageBubble(
  {
    side = 'agent',
    variant = 'text',
    children,
    time,
    status = 'read',
    avatar,
    avatarInitial = 'B',
    senderName,
    accentColor = '#c13584',
    forwarded = false,
    forwardedLabel = 'Forwarded',
    notice,
    warningLabel,
    onlyVisibleToMe = false,
    reaction,
    reactionOptions = DEFAULT_REACTION_OPTIONS,
    onReact,
    tail = true,
    quote,
    media,
    link,
    attachment,
    location,
    note,
    className,
    style,
    ...rest
  },
  ref,
) {
  const resolvedAvatar =
    avatar === true ? (
      <Avatar variant="filled" size="xs" radius="xs">
        {avatarInitial}
      </Avatar>
    ) : avatar || null;

  const showText = children != null && variant !== 'deleted' && variant !== 'opened' && variant !== 'viewOnce';

  const reactionChipContent = reaction && (
    <>
      <span className="lc-message-bubble__reaction-emoji">{reaction.emoji}</span>
      {reaction.count != null && <span className="lc-message-bubble__reaction-count">{reaction.count}</span>}
    </>
  );

  return (
    <div
      {...rest}
      ref={ref}
      className={`lc-message-bubble${className ? ` ${className}` : ''}`}
      data-side={side}
      data-variant={variant}
      style={style}
    >
      <div className="lc-message-bubble__row">
        {side === 'customer' && resolvedAvatar && (
          <div className="lc-message-bubble__avatar">{resolvedAvatar}</div>
        )}

        <div className="lc-message-bubble__bubble">
          {senderName && side === 'customer' && (
            <p className="lc-message-bubble__sender" style={{ color: accentColor }}>
              {senderName}
            </p>
          )}

          {forwarded && <Banner icon={<ForwardIcon />} text={forwardedLabel} />}
          {notice && <Banner icon={<LockIcon />} text={notice} />}
          {warningLabel && variant === 'blocked' && <Banner icon={null} text={warningLabel} tone="error" />}

          {variant === 'quote' && quote && (
            <div className="lc-message-bubble__quote">
              <span className="lc-message-bubble__quote-bar" style={{ background: quote.color ?? accentColor }} />
              <div className="lc-message-bubble__quote-body">
                <p className="lc-message-bubble__quote-name" style={{ color: quote.color ?? accentColor }}>
                  {quote.name}
                </p>
                <p className="lc-message-bubble__quote-text">{quote.text}</p>
              </div>
            </div>
          )}

          {variant === 'media' && media && media.length > 0 && (
            <div className="lc-message-bubble__media" data-count={Math.min(media.length, 4)}>
              {media.slice(0, 4).map((item, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Thumbnail key={i} src={item.src} alt={item.alt} className="lc-message-bubble__media-item" />
              ))}
            </div>
          )}

          {variant === 'link' && link && (
            <div className="lc-message-bubble__card lc-message-bubble__card--link">
              <Thumbnail src={link.thumbnail} className="lc-message-bubble__card-thumb" />
              <div className="lc-message-bubble__card-body">
                <p className="lc-message-bubble__card-title">{link.title}</p>
                {link.description && <p className="lc-message-bubble__card-desc">{link.description}</p>}
                {link.domain && <p className="lc-message-bubble__card-desc">{link.domain}</p>}
              </div>
            </div>
          )}

          {variant === 'attachment' && attachment && (
            <div className="lc-message-bubble__card lc-message-bubble__card--attachment">
              <Thumbnail src={attachment.thumbnail} className="lc-message-bubble__card-thumb" />
              <div className="lc-message-bubble__card-file">
                <DocIcon label={attachment.fileType ?? 'file'} />
                <div className="lc-message-bubble__card-body">
                  <p className="lc-message-bubble__card-title">{attachment.title}</p>
                  {attachment.meta && <p className="lc-message-bubble__card-meta">{attachment.meta}</p>}
                </div>
              </div>
            </div>
          )}

          {variant === 'location' && (
            <Thumbnail src={location?.thumbnail} className="lc-message-bubble__location" />
          )}

          {variant === 'deleted' && (
            <div className="lc-message-bubble__system">
              <TrashIcon />
              <p>You deleted this message</p>
            </div>
          )}
          {variant === 'opened' && (
            <div className="lc-message-bubble__system">
              <EyeIcon />
              <p>Opened</p>
            </div>
          )}
          {variant === 'viewOnce' && (
            <div className="lc-message-bubble__system lc-message-bubble__system--title">
              <ViewOnceIcon />
              <p>{children ?? 'Photo'}</p>
            </div>
          )}

          {variant === 'note' && (
            <>
              <div className="lc-message-bubble__note-header">
                <ForwardIcon />
                <span>Private note</span>
                {note?.ticketId && (
                  <>
                    <span className="lc-message-bubble__note-divider" />
                    <TicketIcon />
                    <span>Id : {note.ticketId}</span>
                  </>
                )}
              </div>
              {children && <p className="lc-message-bubble__note-text">{children}</p>}
              <Button size="xs" variant="default" rightSection={<ArrowRightIcon />} onClick={note?.onViewTicket}>
                View ticket
              </Button>
            </>
          )}

          {showText && (variant === 'text' || variant === 'quote' || variant === 'blocked') && (
            <p className="lc-message-bubble__text">
              {children}
              {/* Reserves just enough trailing inline space for the time/tick footer — wraps to
                  a new line only when the last line would otherwise run under it, instead of
                  reserving that space on every line. */}
              <span className="lc-message-bubble__text-spacer" aria-hidden="true" />
            </p>
          )}
          {showText && (variant === 'media' || variant === 'link' || variant === 'attachment') && (
            <p className="lc-message-bubble__text">{children}</p>
          )}

          <div className="lc-message-bubble__footer">
            {time && <span className="lc-message-bubble__time">{time}</span>}
            {side === 'agent' && <Tick status={status} />}
          </div>

          {onReact && !reaction && (
            <ReactionPicker
              options={reactionOptions}
              onPick={onReact}
              // The trigger sits just outside the bubble's outer edge (right for customer,
              // left for agent — see `.lc-message-bubble__react-trigger` CSS), so the
              // popover must extend back *toward* the bubble, not off the panel edge:
              // 'end' anchors its right edge to the trigger (extends left) for customer,
              // 'start' anchors its left edge (extends right) for agent.
              align={side === 'customer' ? 'end' : 'start'}
              trigger={({ ref: triggerRef, onClick }) => (
                <button
                  ref={triggerRef}
                  type="button"
                  className="lc-message-bubble__react-trigger"
                  aria-label="React to message"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  <ReactIcon />
                </button>
              )}
            />
          )}

          {onlyVisibleToMe && (
            <div className="lc-message-bubble__private">
              <PrivateIcon />
              <span>Only visible to you</span>
            </div>
          )}

          {tail && <span className="lc-message-bubble__tail" aria-hidden="true" />}
        </div>

        {side === 'agent' && resolvedAvatar && (
          <div className="lc-message-bubble__avatar">{resolvedAvatar}</div>
        )}
      </div>

      {reaction && (
        <div className="lc-message-bubble__reaction-row">
          {onReact ? (
            <ReactionPicker
              options={reactionOptions}
              active={reaction.emoji}
              onPick={onReact}
              // The chip sits near the *inner* edge of the row (left, under the
              // customer-side padding; right otherwise — see `.lc-message-bubble__reaction-row`
              // CSS) — the opposite edge from the corner trigger above — so the align
              // direction is mirrored from it: 'start' for customer, 'end' for agent.
              align={side === 'customer' ? 'start' : 'end'}
              trigger={({ ref: triggerRef, onClick }) => (
                <button
                  ref={triggerRef}
                  type="button"
                  className="lc-message-bubble__reaction"
                  aria-label="Change reaction"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  {reactionChipContent}
                </button>
              )}
            />
          ) : (
            <span className="lc-message-bubble__reaction">{reactionChipContent}</span>
          )}
        </div>
      )}
    </div>
  );
});

/** Centered pill separating a day's messages from the next — e.g. "September 20, 2026". */
export function MessageDateDivider({ label }: { label: string }) {
  return (
    <div className="lc-message-bubble__date-divider">
      <span>{label}</span>
    </div>
  );
}

export default MessageBubble;
