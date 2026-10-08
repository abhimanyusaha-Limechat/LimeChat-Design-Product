/**
 * ConversationTopBar — LimeChat design system (Figma node 8984:34679
 * "conversation_top_bar"), the contact header above an open ticket's
 * conversation.
 *
 *   <ConversationTopBar
 *     name="Ramesh" isNew
 *     phone="83478 08373" inboxName="Inbox name"
 *     avatarSrc="/ramesh.jpg"
 *     callAvailable
 *     onCall={() => {}}
 *     onResolve={() => {}}
 *     onMoreActions={() => {}}
 *   />
 */
import { forwardRef, type HTMLAttributes } from 'react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { ActionMenu, Menu } from '../Menu';
import { TicketIcon, type TicketChannel } from '../TicketListItem';
import './ConversationTopBar.css';
import { iconProps } from '../iconProps';
import { Icon, ChevronDownIcon } from '../icons';

const WhatsAppIcon = () => <Icon name="whatsapp" />;
const DotsVerticalIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0" />
    <path d="M12 19m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0" />
    <path d="M12 5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0" />
  </svg>
);
const StarIcon = () => <Icon name="star" />;
const BellOffIcon = () => (
  <svg {...iconProps()}>
    <path d="M17 17h-13a1 1 0 0 1 -0.74 -1.673c0.789 -0.86 1.74 -2.339 1.74 -4.327v-1a6.97 6.97 0 0 1 1.279 -4.007m2.083 -1.767a6.97 6.97 0 0 1 3.638 -1.226v0a1 1 0 0 1 3 0v0c0 0.35 0.006 0.698 0.017 1.043" />
    <path d="M9 17v1a3 3 0 0 0 5.667 1.343m1.219 -3.343a7 7 0 0 0 1.114 -4v-1c0 -1.35 0.55 -2.55 1.44 -3.44" />
    <path d="M3 3l18 18" />
  </svg>
);

const PanelRightIcon = () => (
  <svg {...iconProps()}>
    <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
    <path d="M15 4v16" />
  </svg>
);

const RESOLVE_STATUSES = ['Open', 'Resolve', 'Follow Up', 'Waiting'] as const;

export interface ConversationTopBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onResize'> {
  name: string;
  avatarSrc?: string;
  /** Shows the channel icon (WhatsApp/email/Instagram/SMS) in place of the avatar. */
  channel?: TicketChannel;
  isNew?: boolean;
  phone?: string;
  inboxName?: string;
  /** Shows the "AVAILABLE" pill above the call button. */
  callAvailable?: boolean;
  onCall?: () => void;
  onResolve?: () => void;
  /** Called when a status is picked from the "More resolve options" popover. */
  onResolveStatusChange?: (status: (typeof RESOLVE_STATUSES)[number]) => void;
  resolveLabel?: string;
  /** "More actions" popover — star/mute this ticket. */
  onStarTicket?: () => void;
  onMuteTicket?: () => void;
  /** Shows a button that hides/opens the overview (right) panel. Omit to hide the button. */
  onToggleDetails?: () => void;
  /** Whether the overview panel is currently open (drives `aria-pressed`). Default `true`. */
  detailsOpen?: boolean;
}

export const ConversationTopBar = forwardRef<HTMLDivElement, ConversationTopBarProps>(function ConversationTopBar(
  {
    name,
    avatarSrc,
    channel,
    isNew = false,
    phone,
    inboxName,
    callAvailable = false,
    onCall,
    onResolve,
    onResolveStatusChange,
    resolveLabel = 'Resolve',
    onStarTicket,
    onMuteTicket,
    onToggleDetails,
    detailsOpen = true,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={`lc-conv-top${className ? ` ${className}` : ''}`}>
      <div className="lc-conv-top__identity">
        {channel ? (
          <span className="lc-conv-top__channel-icon">
            <TicketIcon name={channel} />
          </span>
        ) : (
          <Avatar src={avatarSrc} alt={name} size={36} radius="xs">
            {avatarSrc ? undefined : name.charAt(0)}
          </Avatar>
        )}
        <div className="lc-conv-top__text">
          <div className="lc-conv-top__name-row">
            <span className="lc-conv-top__name">{name}</span>
            {isNew && <span className="lc-conv-top__badge">new</span>}
          </div>
          {(phone || inboxName) && (
            <div className="lc-conv-top__meta">
              {phone && <span>{phone}</span>}
              {phone && inboxName && <span className="lc-conv-top__meta-divider">|</span>}
              {inboxName && <span>{inboxName}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="lc-conv-top__actions">
        <div className="lc-conv-top__call-wrap">
          {callAvailable && <span className="lc-conv-top__available">available</span>}
          {/* Neutral, so the filled Resolve stays the header's single brand-coloured action. */}
          <Button size="sm" variant="default" leftSection={<WhatsAppIcon />} onClick={onCall}>
            Voice call
          </Button>
        </div>

        <div className="lc-conv-top__split">
          <Button size="sm" variant="filled" color="primary" onClick={onResolve}>
            {resolveLabel}
          </Button>
          <Menu
            ariaLabel="Resolve status"
            width={160}
            // "Resolve" is already the primary button; the menu only offers the other statuses,
            // applied immediately, so the primary never changes meaning under the agent's cursor.
            items={RESOLVE_STATUSES.filter((status) => status !== 'Resolve').map((status) => ({
              label: `Mark as ${status.toLowerCase()}`,
              onClick: () => onResolveStatusChange?.(status),
            }))}
            trigger={({ ref, onClick }) => (
              <button
                ref={ref}
                type="button"
                className="lc-conv-top__icon-btn"
                aria-label="More resolve options"
                onClick={onClick}
              >
                <ChevronDownIcon />
              </button>
            )}
          />
        </div>

        <ActionMenu
          ariaLabel="Ticket actions"
          icon={<DotsVerticalIcon />}
          triggerClassName="lc-conv-top__icon-btn"
          items={[
            { label: 'Star mark ticket', icon: <StarIcon />, onClick: onStarTicket },
            { label: 'Mute ticket notifications', icon: <BellOffIcon />, onClick: onMuteTicket },
          ]}
        />

        {onToggleDetails && (
          <button
            type="button"
            className="lc-conv-top__icon-btn"
            data-active={detailsOpen || undefined}
            aria-label={detailsOpen ? 'Hide overview panel' : 'Show overview panel'}
            aria-pressed={detailsOpen}
            onClick={onToggleDetails}
          >
            <PanelRightIcon />
          </button>
        )}
      </div>
    </div>
  );
});

export default ConversationTopBar;
