/**
 * CTA building blocks + product presets for the LimeChat top navigation bar.
 *
 * The presets mirror the three product variants in the design system
 * (Figma node 8847:4018). Each returns a partial `TopNavBarProps` — spread it
 * and override what you need:
 *
 *   <TopNavBar
 *     {...campaignsTopNav({ onChannelChange: openChannelMenu })}
 *     breadcrumbs={crumbs}
 *     account={{ name: 'Nonucare12' }}
 *   />
 */
import { forwardRef, type ReactNode } from 'react';
import type { TopNavBarProps } from './TopNavBar';
import { TopNavIcon, type TopNavIconName } from './icons';
import { CreateTicketMenu, type TicketInboxOption } from './CreateTicketMenu';
import { Button } from '../Button';
import campaignsWordmark from './assets/campaigns.png';
import helpDeskWordmark from './assets/helpdesk.svg';
import automationWordmark from './assets/automation.svg';

/* -------------------------------------------------------------------------- */
/* CTA building blocks                                                         */
/* -------------------------------------------------------------------------- */

export interface TopNavButtonProps {
  children: ReactNode;
  onClick?: () => void;
  /** Named icon rendered before the label. */
  icon?: TopNavIconName;
  type?: 'button' | 'submit';
  'aria-label'?: string;
}

/**
 * White-outline top-bar CTA (e.g. "Voice call", "Ticket").
 *
 * Thin wrapper over the design-system `<Button variant="default" size="sm">` —
 * the same component the Figma top-nav CTAs are Code-Connected to. Prefer using
 * `<Button>` directly; this is kept for the preset API.
 */
export const TopNavButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, TopNavButtonProps>(
  function TopNavButton({ children, onClick, icon, type = 'button', ...rest }, ref) {
    return (
      <Button
        ref={ref}
        variant="default"
        size="sm"
        type={type}
        textTransform="none"
        onClick={onClick}
        leftSection={icon ? <TopNavIcon name={icon} /> : undefined}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

export interface TopNavSelectProps {
  label: ReactNode;
  onClick?: () => void;
  /** Named icon rendered before the label (e.g. `whatsapp`). */
  icon?: TopNavIconName;
  'aria-label'?: string;
}

/** Dropdown-styled trigger used for the channel picker (e.g. "Whatsapp ▾"). */
export function TopNavSelect({ label, onClick, icon, ...rest }: TopNavSelectProps) {
  return (
    <button
      type="button"
      className="lc-topnav__button lc-topnav__button--select"
      onClick={onClick}
      {...rest}
    >
      {icon && <TopNavIcon name={icon} />}
      {label}
      <TopNavIcon name="chevron-down" className="lc-topnav__icon lc-topnav__button-caret" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Product presets                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Each product wordmark asset has its own aspect ratio and internal whitespace,
 * so the per-product modifier class carries a tuned render height that makes the
 * visible letterforms read at a consistent cap height across products.
 */
const wordmark = (src: string, alt: string, product: TopNavProduct): ReactNode => (
  <img className={`lc-topnav__wordmark lc-topnav__wordmark--${product}`} src={src} alt={alt} />
);

export interface CampaignsTopNavOptions {
  channelLabel?: string;
  onChannelChange?: () => void;
  onAppsMenuClick?: () => void;
}

export function campaignsTopNav(options: CampaignsTopNavOptions = {}): Partial<TopNavBarProps> {
  const { channelLabel = 'Whatsapp', onChannelChange, onAppsMenuClick } = options;
  return {
    logo: wordmark(campaignsWordmark, 'Campaigns', 'campaigns'),
    actions: <TopNavSelect icon="whatsapp" label={channelLabel} onClick={onChannelChange} />,
    showAppsMenu: true,
    onAppsMenuClick,
  };
}

const DEFAULT_TICKET_INBOXES: TicketInboxOption[] = [
  { id: 'whatsapp-support', name: 'Whatsapp Support', type: 'whatsapp' },
  { id: 'whatsapp-sales', name: 'Whatsapp Sales', type: 'whatsapp' },
  { id: 'email-support', name: 'Support Email', type: 'email' },
  { id: 'email-billing', name: 'Billing Email', type: 'email' },
];

export interface HelpDeskTopNavOptions {
  onVoiceCall?: () => void;
  /** @deprecated Pass `onSelectTicketInbox` instead — "+ Ticket" now opens an inbox picker. */
  onCreateTicket?: () => void;
  /** Inboxes listed in the "+ Ticket" popover. Defaults to a sample Whatsapp/Email set. */
  ticketInboxes?: TicketInboxOption[];
  onSelectTicketInbox?: (inbox: TicketInboxOption) => void;
  onAppsMenuClick?: () => void;
  /** Show the "Voice call" / "Ticket" CTAs — only relevant on the Tickets section. Default `true`. */
  showActions?: boolean;
}

export function helpDeskTopNav(options: HelpDeskTopNavOptions = {}): Partial<TopNavBarProps> {
  const {
    onVoiceCall,
    ticketInboxes = DEFAULT_TICKET_INBOXES,
    onSelectTicketInbox,
    onAppsMenuClick,
    showActions = true,
  } = options;
  return {
    logo: wordmark(helpDeskWordmark, 'HelpDesk', 'helpdesk'),
    actions: showActions && (
      <>
        <TopNavButton icon="phone" onClick={onVoiceCall}>
          Voice call
        </TopNavButton>
        <CreateTicketMenu inboxes={ticketInboxes} onSelectInbox={(inbox) => onSelectTicketInbox?.(inbox)} />
      </>
    ),
    showAppsMenu: true,
    onAppsMenuClick,
  };
}

export interface AutomationTopNavOptions {
  channelLabel?: string;
  onChannelChange?: () => void;
  onAppsMenuClick?: () => void;
}

export function automationTopNav(options: AutomationTopNavOptions = {}): Partial<TopNavBarProps> {
  const { channelLabel = 'Whatsapp', onChannelChange, onAppsMenuClick } = options;
  return {
    logo: wordmark(automationWordmark, 'Automation', 'automation'),
    actions: <TopNavSelect icon="whatsapp" label={channelLabel} onClick={onChannelChange} />,
    showAppsMenu: true,
    onAppsMenuClick,
  };
}

export const topNavPresets = {
  campaigns: campaignsTopNav,
  helpdesk: helpDeskTopNav,
  automation: automationTopNav,
} as const;

export type TopNavProduct = keyof typeof topNavPresets;
