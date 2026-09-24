/**
 * TicketListItem — LimeChat design system (Figma node 8977:4521 "tickets").
 *
 * A single row in the Helpdesk tickets list: channel icon, contact name,
 * participant avatars, a "new" badge, a relative timestamp (replaced by a
 * "more actions" trigger on hover), a message preview, an assignee mention,
 * and an unread-count badge. Supports bulk-select (checkbox) and a selected
 * (open) state with a left accent bar.
 *
 *   <TicketListItem
 *     channel="whatsapp"
 *     user="John"
 *     avatars={[{ src: '/a.jpg' }, { src: '/b.jpg' }, { src: '/c.jpg' }, { src: '/d.jpg' }]}
 *     isNew
 *     timestamp="4 minutes ago"
 *     message="This is a dummy message for the component"
 *     assignee="Jane"
 *     unreadCount={21}
 *     onMoreActions={() => {}}
 *     onClick={() => openTicket(id)}
 *   />
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { TicketIcon, type TicketIconName } from './icons';
import { ActionMenu } from '../Menu';
import { Avatar, AvatarGroup } from '../Avatar';
import './TicketListItem.css';

export type TicketChannel = 'whatsapp' | 'email' | 'instagram' | 'sms';

const CHANNEL_ICON: Record<TicketChannel, TicketIconName> = {
  whatsapp: 'whatsapp',
  email: 'email',
  instagram: 'instagram',
  sms: 'sms',
};

export interface TicketAvatar {
  src?: string;
  alt?: string;
}

export interface TicketListItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** Selects a built-in channel glyph. Ignored when `channelIcon` is set. */
  channel?: TicketChannel;
  /** Overrides the channel glyph entirely. */
  channelIcon?: ReactNode;
  user: string;
  /** Participant avatars, shown as a small overlapping stack — the rest collapse into a "+N" chip. */
  avatars?: TicketAvatar[];
  isNew?: boolean;
  timestamp: string;
  /** The small glyph before the message preview (default: a "forwarded" icon). Set `false` to hide. */
  messageIcon?: ReactNode | false;
  message: string;
  /** Assignee mention, shown in the secondary/teal accent color. */
  assignee?: string;
  unreadCount?: number;
  /** Highlights the row (open ticket) with a neutral fill, a brand left accent bar and no bottom border. */
  selected?: boolean;
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /**
   * "More actions" popover, shown in place of the timestamp on hover/focus.
   * Provide at least one handler to enable the trigger; omit all to keep the
   * timestamp always visible instead.
   */
  onSelect?: () => void;
  onSelectAll?: () => void;
  onMarkAsStarred?: () => void;
  onClick?: () => void;
}

export function TicketRowCheckbox({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <span
      className="lc-ticket-row__checkbox"
      data-checked={checked}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onChange(!checked);
        }
      }}
    >
      {checked && <TicketIcon name="check" className="lc-ticket-row__checkbox-icon" />}
    </span>
  );
}

export const TicketListItem = forwardRef<HTMLDivElement, TicketListItemProps>(function TicketListItem(
  {
    channel = 'whatsapp',
    channelIcon,
    user,
    avatars,
    isNew = false,
    timestamp,
    messageIcon,
    message,
    assignee,
    unreadCount,
    selected = false,
    showCheckbox = true,
    checked = false,
    onCheckedChange,
    onSelect,
    onSelectAll,
    onMarkAsStarred,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const resolvedMessageIcon =
    messageIcon === false ? null : (messageIcon ?? <TicketIcon name="share" className="lc-ticket-row__message-icon" />);
  const hasMoreActions = onSelect != null || onSelectAll != null || onMarkAsStarred != null;
  const unread = unreadCount != null && unreadCount > 0;

  return (
    <div
      {...rest}
      ref={ref}
      className={`lc-ticket-row${className ? ` ${className}` : ''}`}
      data-selected={selected || undefined}
      data-unread={unread || undefined}
      data-checked={(showCheckbox && checked) || undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {selected && <span className="lc-ticket-row__accent" aria-hidden="true" />}

      {showCheckbox && (
        <TicketRowCheckbox checked={checked} onChange={(next) => onCheckedChange?.(next)} />
      )}

      <div className="lc-ticket-row__body">
        <div className="lc-ticket-row__header">
          <div className="lc-ticket-row__identity">
            <span className="lc-ticket-row__channel-icon">
              {channelIcon ?? <TicketIcon name={CHANNEL_ICON[channel]} />}
            </span>
            <span className="lc-ticket-row__user">{user}</span>
            {avatars && avatars.length > 0 && (
              <AvatarGroup className="lc-ticket-row__avatars" limit={3} size={16} radius="xl">
                {avatars.map((a, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Avatar key={i} src={a.src} alt={a.alt} />
                ))}
              </AvatarGroup>
            )}
          </div>

          <div className="lc-ticket-row__meta">
            <span className="lc-ticket-row__timestamp" data-hidden-on-hover={hasMoreActions || undefined}>
              {timestamp}
            </span>
            {hasMoreActions && (
              <span onClick={(e) => e.stopPropagation()}>
                <ActionMenu
                  ariaLabel="Ticket actions"
                  tooltip="More actions"
                  align="start"
                  width={170}
                  triggerClassName="lc-ticket-row__more"
                  icon={<TicketIcon name="dots-horizontal" />}
                  items={[
                    { key: 'select', label: 'Select', onClick: () => onSelect?.() },
                    { key: 'select-all', label: 'Select all', onClick: () => onSelectAll?.() },
                    { key: 'star', label: 'Mark as starred', onClick: () => onMarkAsStarred?.() },
                  ]}
                />
              </span>
            )}
          </div>
        </div>

        <div className="lc-ticket-row__preview">
          <div className="lc-ticket-row__message">
            {resolvedMessageIcon}
            <span className="lc-ticket-row__message-text">{message}</span>
          </div>
          <div className="lc-ticket-row__mention">
            {assignee && <span className="lc-ticket-row__assignee">{assignee}</span>}
            {unread && (
              <span
                className="lc-ticket-row__badge lc-ticket-row__badge--count"
                aria-label={`${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`}
              >
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TicketListItem;
