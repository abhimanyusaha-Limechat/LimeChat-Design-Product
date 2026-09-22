/** Demo harness for the reusable components. Not part of the published components. */
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Sidebar } from './components/Sidebar';
import { sidebarPresets, type SidebarProduct } from './components/Sidebar/presets';
import { TopNavBar } from './components/TopNavBar';
import {
  campaignsTopNav,
  helpDeskTopNav,
  automationTopNav,
} from './components/TopNavBar/presets';
import {
  CanvasChrome,
  type CanvasBroadcastAudience,
  type CanvasBroadcastSchedule,
} from './components/CanvasChrome';
import {
  marketingCanvas,
  automationCanvas,
  flowNodePalette,
} from './components/CanvasChrome/presets';
import { PublishFlowModal } from './components/PublishFlowModal';
import { PublishConfirmModal } from './components/PublishConfirmModal';
import { FlowDetailsModal } from './components/FlowDetailsModal';
import { ScheduleBroadcastModal } from './components/ScheduleBroadcastModal';
import { VisualizeFlowModal } from './components/VisualizeFlowModal';
import { SelectUserSegmentModal, type UserSegment } from './components/SelectUserSegmentModal';
import { BroadcastHomePage, type BroadcastRowData, type BroadcastTab } from './components/BroadcastHomePage';
import { FlowsHomePage, type FlowRowData, type FlowTab } from './components/FlowsHomePage';
import {
  SegmentsHomePage,
  type SegmentRowData,
  type SegmentSourceTab,
} from './components/SegmentsHomePage';
import {
  BotFlowsHomePage,
  type BotFlowRowData,
  type BotFlowTab,
} from './components/BotFlowsHomePage';
import {
  TemplatesHomePage,
  type TemplateRowData,
  type TemplateChannel,
} from './components/TemplatesHomePage';
import { SettingsPage, type SettingsTab } from './components/SettingsPage';
import { InboxesTable, type InboxRowData } from './components/InboxesTable';
import { ProfileSettings } from './components/ProfileSettings';
import { AccountSettings } from './components/AccountSettings';
import { HelpDeskAccountSettings, type HelpDeskToggleKey } from './components/HelpDeskAccountSettings';
import { DataSecuritySettings, type PiiTypeKey, type ProfanityWord } from './components/DataSecuritySettings';
import { AttributionSettings, type AttributionWindowKey, type AttributionWindowValue } from './components/AttributionSettings';
import {
  BotCsatSettings,
  type CsatFlowKey,
  type CsatRatingScale,
  type CsatTimeDelay,
} from './components/BotCsatSettings';
import {
  IntegrationsHomePage,
  type IntegrationCategory,
  FreshdeskIcon,
  KaptureIcon,
  ZohoDeskIcon,
  OnedirectIcon,
  ZendeskIcon,
  OdooIcon,
  ShiprocketIcon,
  EzyslipsIcon,
  PickrrIcon,
  EasyEcomIcon,
  UnicommerceIcon,
  ShipDelightIcon,
  BlueDartIcon,
  ClickPostIcon,
  DelhiveryIcon,
  ShopifyIcon,
  WooCommerceIcon,
  MagentoIcon,
  BigCommerceIcon,
  RazorpayIcon,
  StripeIcon,
  PayUIcon,
  CashfreeIcon,
  GoogleSheetsIcon,
  SlackIcon,
  WhatsAppBusinessIcon,
  WebhookIcon,
} from './components/IntegrationsHomePage';
import { TagsInput } from './components/TagsInput';
import { Button } from './components/Button';
import { TicketListItem, type TicketChannel } from './components/TicketListItem';
import { HelpdeskTicketsPage } from './components/HelpdeskTicketsPage';
import { TicketsSection } from './components/TicketsSection';
import { ConversationTopBar } from './components/ConversationTopBar';
import { MessageBubble } from './components/MessageBubble';
import { TicketComposer, type TicketComposerMode } from './components/TicketComposer';
import { EmailMessage, EmailComposerBar, EmailForwardComposer } from './components/EmailMessage';
import { TicketDetailsPanel, type TicketDetailsField, type TicketDetailsSection } from './components/TicketDetailsPanel';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#8c8c8c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
    <path d="M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 -1 0" />
  </svg>
);

const SETTINGS_TABS: SettingsTab[] = [
  { id: 'inboxes', label: 'Inboxes' },
  { id: 'opt-out-users', label: 'Opt out users' },
  { id: 'bot-configurations', label: 'Bot configurations' },
  { id: 'events', label: 'Events' },
  { id: 'attribution', label: 'Attribution' },
  { id: 'integrations', label: 'Integrations' },
];

// HelpDesk's Settings nav is its own set entirely — ticketing/agent
// operations config instead of the generic list above.
const HELPDESK_SETTINGS_TABS: SettingsTab[] = [
  { id: 'inboxes', label: 'Inboxes' },
  { id: 'agents', label: 'Agents' },
  { id: 'teams', label: 'Teams' },
  { id: 'automation-rules', label: 'Automation rules' },
  { id: 'custom-fields', label: 'Custom fields' },
  { id: 'ticket-assignment', label: 'Ticket Assignment' },
  { id: 'sla-rules', label: 'SLA rules' },
  { id: 'canned-responses', label: 'Canned responses' },
  { id: 'tags', label: 'Tags' },
  { id: 'hd-attribution', label: 'Attribution' },
  { id: 'data-security', label: 'Data security' },
  { id: 'hd-integration', label: 'Integration' },
  { id: 'products', label: 'Products' },
  { id: 'bot-csat', label: 'Bot CSAT' },
  { id: 'billing', label: 'Billing' },
];

const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    id: 'crm-partners',
    title: 'CRM Partners',
    partners: [
      { id: 'freshdesk', name: 'Freshdesk', icon: <FreshdeskIcon /> },
      { id: 'kapture', name: 'Kapture', icon: <KaptureIcon /> },
      { id: 'zoho-desk', name: 'Zoho Desk', icon: <ZohoDeskIcon /> },
      { id: 'onedirect', name: 'Onedirect', icon: <OnedirectIcon /> },
      { id: 'zendesk', name: 'Zendesk', icon: <ZendeskIcon /> },
      { id: 'odoo', name: 'Odoo', icon: <OdooIcon /> },
    ],
  },
  {
    id: 'logistics-partners',
    title: 'Logistics Partners',
    partners: [
      { id: 'shiprocket', name: 'Shiprocket', icon: <ShiprocketIcon /> },
      { id: 'ezyslips', name: 'Ezyslips', icon: <EzyslipsIcon /> },
      { id: 'pickrr', name: 'Pickrr', icon: <PickrrIcon /> },
      { id: 'easyecom', name: 'EasyEcom', icon: <EasyEcomIcon /> },
      { id: 'unicommerce', name: 'Unicommerce', icon: <UnicommerceIcon /> },
      { id: 'shipdelight', name: 'ShipDelight', icon: <ShipDelightIcon /> },
      { id: 'bluedart', name: 'Blue Dart', icon: <BlueDartIcon /> },
      { id: 'clickpost', name: 'ClickPost', icon: <ClickPostIcon /> },
      { id: 'delhivery', name: 'Delhivery', icon: <DelhiveryIcon /> },
    ],
  },
  {
    id: 'storefront-partners',
    title: 'Storefront Partners',
    partners: [
      { id: 'shopify', name: 'Shopify', icon: <ShopifyIcon /> },
      { id: 'woocommerce', name: 'WooCommerce', icon: <WooCommerceIcon /> },
      { id: 'magento', name: 'Magento', icon: <MagentoIcon /> },
      { id: 'bigcommerce', name: 'BigCommerce', icon: <BigCommerceIcon /> },
    ],
  },
  {
    id: 'billing-partners',
    title: 'Billing Partners',
    partners: [
      { id: 'razorpay', name: 'Razorpay', icon: <RazorpayIcon /> },
      { id: 'stripe', name: 'Stripe', icon: <StripeIcon /> },
      { id: 'payu', name: 'PayU', icon: <PayUIcon /> },
      { id: 'cashfree', name: 'Cashfree', icon: <CashfreeIcon /> },
    ],
  },
  {
    id: 'others',
    title: 'Others',
    partners: [
      { id: 'google-sheets', name: 'Google Sheets', icon: <GoogleSheetsIcon /> },
      { id: 'slack', name: 'Slack', icon: <SlackIcon /> },
      { id: 'whatsapp-business', name: 'WhatsApp Business', icon: <WhatsAppBusinessIcon /> },
      { id: 'webhook', name: 'Webhook', icon: <WebhookIcon /> },
    ],
  },
];

// Automation's Settings nav is a different set entirely — no opt-out users,
// events, or attribution; bot-specific config instead.
const AUTOMATION_SETTINGS_TABS: SettingsTab[] = [
  { id: 'bot-brain', label: 'Bot brain' },
  { id: 'bot-settings', label: 'Bot settings' },
  { id: 'inboxes', label: 'Inboxes' },
  { id: 'bot-inbox-mapping', label: 'Bot Inbox mapping' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'collaborators', label: 'Collaborators' },
  { id: 'variable', label: 'Variable' },
  { id: 'bot-templates', label: 'Bot templates' },
];

// Reached from the avatar popover ("Account Settings" / "Profile settings")
// instead of the product's own Settings nav — just these two tabs.
const USER_SETTINGS_TABS: SettingsTab[] = [
  { id: 'account', label: 'Account settings' },
  { id: 'profile', label: 'Profile settings' },
];

const USER_SETTINGS_COPY: Record<'account' | 'profile', { title: string; description: string }> = {
  account: {
    title: 'Account settings',
    description: 'Manage account-wide settings, billing, and permissions.',
  },
  profile: {
    title: 'Profile settings',
    description: 'Manage your personal profile details and preferences.',
  },
};

const SETTINGS_COPY: Record<string, { title: string; description: string }> = {
  inboxes: {
    title: 'Inboxes',
    description:
      'Manage your inboxes within the CRM platform to streamline communication, track customer interactions, and organize messages efficiently.',
  },
  'opt-out-users': {
    title: 'Opt out users',
    description: 'View and manage users who have opted out of receiving communications.',
  },
  'bot-configurations': {
    title: 'Bot configurations',
    description: 'Configure how your bots respond and hand off conversations.',
  },
  events: {
    title: 'Events',
    description: 'Track and manage the events triggered across your workspace.',
  },
  attribution: {
    title: 'Attribution',
    description: 'Understand which channels and campaigns drive your conversions.',
  },
  integrations: {
    title: 'Integrations',
    description: 'Connect third-party tools and services to your workspace.',
  },
  'bot-brain': {
    title: 'Bot brain',
    description: "Manage the knowledge your bot draws on when answering questions.",
  },
  'bot-settings': {
    title: 'Bot settings',
    description: 'Configure how your bot behaves across conversations.',
  },
  'bot-inbox-mapping': {
    title: 'Bot Inbox mapping',
    description: 'Map this bot to the inboxes it should respond in.',
  },
  collaborators: {
    title: 'Collaborators',
    description: 'Manage who has access to this bot and what they can do.',
  },
  variable: {
    title: 'Variable',
    description: 'Define reusable variables your bot can reference in flows.',
  },
  'bot-templates': {
    title: 'Bot templates',
    description: 'Manage reusable templates available to this bot.',
  },
  agents: {
    title: 'Agents',
    description: 'Manage the agents who handle tickets on this account.',
  },
  teams: {
    title: 'Teams',
    description: 'Group agents into teams and control how tickets route to them.',
  },
  'automation-rules': {
    title: 'Automation rules',
    description: 'Automatically assign, tag, or update tickets based on conditions you define.',
  },
  'custom-fields': {
    title: 'Custom fields',
    description: 'Add custom fields to capture the ticket details your team needs.',
  },
  'ticket-assignment': {
    title: 'Ticket Assignment',
    description: 'Configure how incoming tickets are distributed across agents and teams.',
  },
  'sla-rules': {
    title: 'SLA rules',
    description: 'Set response and resolution time targets for your tickets.',
  },
  'canned-responses': {
    title: 'Canned responses',
    description: 'Manage reusable replies agents can insert into tickets.',
  },
  tags: {
    title: 'Tags',
    description: 'Manage the tags used to categorize tickets and conversations.',
  },
  'hd-attribution': {
    title: 'Attribution',
    description: 'Understand which channels and sources tickets are coming from.',
  },
  'data-security': {
    title: 'Data security',
    description: 'Manage data retention, masking, and access controls for this account.',
  },
  'hd-integration': {
    title: 'Integration',
    description: 'Connect third-party tools and services to your HelpDesk workspace.',
  },
  products: {
    title: 'Products',
    description: 'Manage the product catalog referenced across tickets and conversations.',
  },
  'bot-csat': {
    title: 'Bot CSAT',
    description: 'Configure the satisfaction survey your bot sends after resolving a ticket.',
  },
  billing: {
    title: 'Billing',
    description: 'Manage your plan, payment method, and billing history.',
  },
};

/** Deterministic "looks real" formatter — thousands separators, no locale surprises. */
const fmtNum = (n: number) => Math.round(n).toLocaleString('en-US');

/**
 * Generates a believable-but-varied metrics block for row `i` (scale tunes the
 * overall volume). `deliverySecondary` picks how the delivery sub-line reads:
 * a delivery-rate percentage (Broadcasts) or a hard retry-delivered count (Flows).
 */
function channelMetrics(i: number, scale: number, deliverySecondary: 'percentage' | 'count' = 'percentage') {
  const sent = (15000 + i * 2137 + (i % 4) * 511) * scale;
  const deliveryRate = 0.94 + (i % 7) * 0.006;
  const delivered = sent * deliveryRate;
  const engagementRate = 0.26 + (i % 5) * 0.03;
  const engagement = delivered * engagementRate;
  const dropoff = sent - delivered;
  const revenuePerEngaged = 5.5 + (i % 6) * 1.6;
  const revenue = engagement * revenuePerEngaged;
  const secondaryRevenue = revenue * 0.12;
  const retryDelivered = Math.round(delivered * (0.02 + (i % 4) * 0.01));
  return {
    sent: fmtNum(sent),
    delivery: {
      primary: fmtNum(delivered),
      secondary: deliverySecondary === 'count' ? fmtNum(retryDelivered) : `${(deliveryRate * 100).toFixed(1)}%`,
    },
    engagement: fmtNum(engagement),
    dropoff: fmtNum(dropoff),
    revenue: { primary: `$${fmtNum(revenue)}`, secondary: `$${fmtNum(secondaryRevenue)}` },
  };
}

// Past dates — shared across the "already sent" broadcast/flow tables.
const PAST_DATES = [
  '02 March 2024, 10:00 AM', '17 April 2024, 02:45 PM', '26 September 2024, 08:40 AM',
  '12 October 2024, 09:15 AM', '19 October 2024, 06:30 PM', '13 August 2024, 03:05 PM',
  '02 November 2024, 11:00 AM', '09 October 2024, 01:50 PM', '05 January 2024, 09:30 AM',
  '14 February 2024, 04:15 PM', '21 February 2024, 11:45 AM', '03 April 2024, 07:20 AM',
  '29 April 2024, 02:00 PM', '11 May 2024, 10:10 AM', '30 May 2024, 05:40 PM',
  '18 June 2024, 09:00 AM', '07 July 2024, 12:30 PM', '22 July 2024, 03:50 PM',
  '04 August 2024, 08:15 AM', '27 August 2024, 06:05 PM', '15 September 2024, 10:25 AM',
  '03 November 2024, 01:35 PM', '20 November 2024, 09:50 AM', '08 December 2024, 04:40 PM',
  '22 December 2024, 11:20 AM',
];

const INBOX_NAMES = [
  'Limechat (189)', 'Limechat (189) BB', 'Nonucare Support', 'Aurora Botanicals CS', 'Nimbus Coffee Orders',
  'Peak & Pine Outdoors', 'Saffron House Bookings', 'Bluebird Logistics', 'Harborlight Realty', 'Wildflower Skincare',
  'Cedar & Co. Furniture', 'Tidepool Aquariums', 'Lantern Books', 'Meridian Fitness', 'Copper Kettle Cafe',
  'Northstar Insurance', 'Willowmere Salon', 'Granite Peak Gear', 'Amberglow Candles', 'Foxglove Florist',
  'Rivermill Bakery', 'Summit Cycles', 'Oakhaven Dental', 'Coral Bay Travel', 'Ivy & Oak Interiors',
];

/** Deterministic "looks real" ID: a 5-digit number that varies per row without being sequential. */
const inboxId = (i: number) => String(36000 + i * 421 + (i % 4) * 67);

/** Reformats PAST_DATES' "DD Month YYYY, HH:MM AM/PM" to "HH:MM AM/PM, DD Month YYYY". */
const inboxCreatedOn = (i: number) => {
  const [datePart, timePart] = PAST_DATES[i % PAST_DATES.length].split(', ');
  return `${timePart}, ${datePart}`;
};

// Weighted so WhatsApp (the primary channel) still dominates the list.
const INBOX_TYPES: InboxRowData['type'][] = ['whatsapp', 'whatsapp', 'whatsapp', 'email', 'instagram', 'sms'];

const DEMO_INBOXES: InboxRowData[] = INBOX_NAMES.map((name, i) => ({
  id: inboxId(i),
  name,
  type: INBOX_TYPES[i % INBOX_TYPES.length],
  metaId: 'N/A',
  createdOn: inboxCreatedOn(i),
}));

// Future dates — for anything still "scheduled" (all after today, 15 Sep 2026).
const FUTURE_DATES = [
  '20 September 2026, 09:00 AM', '28 September 2026, 06:00 PM', '05 October 2026, 12:00 PM',
  '13 October 2026, 08:30 AM', '22 October 2026, 03:15 PM', '30 October 2026, 10:00 AM',
  '07 November 2026, 05:45 PM', '15 November 2026, 09:20 AM', '24 November 2026, 01:10 PM',
  '02 December 2026, 11:00 AM', '10 December 2026, 04:30 PM', '19 December 2026, 08:00 AM',
  '27 December 2026, 02:20 PM', '04 January 2027, 06:50 PM', '12 January 2027, 09:40 AM',
  '20 January 2027, 12:15 PM', '28 January 2027, 10:05 AM', '05 February 2027, 03:30 PM',
  '13 February 2027, 07:45 AM', '21 February 2027, 05:00 PM', '01 March 2027, 09:10 AM',
  '09 March 2027, 01:50 PM', '17 March 2027, 06:25 PM', '25 March 2027, 11:35 AM',
  '02 April 2027, 04:05 PM',
];

const BROADCAST_NAMES = [
  'Spring Launch', 'Member Update', 'Feature Release', 'Diwali Mega Sale Blast', 'Weekend Flash Sale',
  'Monthly Roundup', 'New Collection Teaser', 'Customer Stories', 'Loyalty Rewards Update', 'Flash Sale Countdown',
  'Product Restock Alert', 'Holiday Gift Guide', 'App Update Highlights', 'Referral Bonus Reminder', 'VIP Early Access',
  'Cart Abandonment Nudge', 'Anniversary Sale', 'New Arrivals Drop', 'Subscriber Exclusive Offer', 'End of Season Clearance',
  'Birthday Reward Reminder', 'Community Spotlight', 'Sustainability Update', 'Back in Stock Alert', 'Year in Review',
];

const DEMO_BROADCASTS: BroadcastRowData[] = BROADCAST_NAMES.map((name, i) => ({
  id: `b-${i + 1}`,
  displayId: String(40000 + i * 733 + (i % 3) * 97),
  name,
  sentOn: PAST_DATES[i],
  status: i === 0 ? 'sending' : 'completed',
  ...channelMetrics(i, 1, 'count'),
  ...(i % 7 === 5 ? { retry: { attempt: 1, total: 2 } } : {}),
}));

// Scheduled/draft broadcasts haven't sent yet, so there's nothing to report on.
const NO_METRICS = {
  sent: '—',
  delivery: { primary: '—' },
  engagement: '—',
  dropoff: '—',
  revenue: { primary: '—' },
} as const;

const SCHEDULED_BROADCAST_NAMES = [
  'Black Friday Preview', 'Winter Restock Alert', 'Year-End Thank You', 'New Year Kickoff', "Valentine's Day Special",
  'Spring Collection Preview', 'Loyalty Tier Upgrade', 'Referral Program Boost', 'Summer Sale Countdown', 'Founders Day Celebration',
  'App Feature Sneak Peek', 'Customer Appreciation Week', 'Flash Restock Notice', 'Mid-Season Clearance', 'Exclusive Preview Access',
  'Back to School Sale', 'Festive Bundle Offer', 'Anniversary Countdown', 'Product Launch Teaser', 'Subscriber Milestone Reward',
  'Weekend Deal Alert', 'Holiday Shipping Reminder', 'New Store Opening', 'Community Meetup Invite', 'Year-End Survey Request',
];

const DEMO_SCHEDULED_BROADCASTS: BroadcastRowData[] = SCHEDULED_BROADCAST_NAMES.map((name, i) => ({
  id: `s-${i + 1}`,
  name,
  sentOn: FUTURE_DATES[i],
  status: 'scheduled',
  ...NO_METRICS,
}));

const DRAFT_BROADCAST_NAMES = [
  'Spring Preview (untitled)', 'App Update Announcement', 'Referral Program Launch', 'Loyalty Tier Draft', 'Summer Sale Draft',
  'New Feature Teaser', 'Customer Survey Invite', 'Product Bundle Idea', 'Win-Back Draft', 'Flash Sale Concept',
  'Anniversary Message Draft', 'Holiday Campaign Draft', 'Subscriber Welcome Draft', 'Restock Notice Draft', 'VIP Access Draft',
  'Community Update Draft', 'Sustainability Message Draft', 'Feedback Request Draft', 'Milestone Celebration Draft', 'New Arrivals Draft',
  'Clearance Sale Draft', 'Membership Renewal Draft', 'Event Invite Draft', 'Survey Follow-up Draft', 'Year-End Recap Draft',
];

const DEMO_DRAFT_BROADCASTS: BroadcastRowData[] = DRAFT_BROADCAST_NAMES.map((name, i) => ({
  id: `d-${i + 1}`,
  name,
  sentOn: 'Instantly',
  status: 'draft',
  ...NO_METRICS,
}));

const FLOW_ACTIVE_NAMES = [
  'Welcome Series', 'Abandoned Cart Recovery', 'Post-Purchase Follow-up', 'Browse Abandonment Reminder', 'Win-Back Sequence',
  'Loyalty Points Reminder', 'Review Request Flow', 'Replenishment Reminder', 'Upsell After Purchase', 'Order Confirmation Flow',
  'Shipping Update Flow', 'Subscription Renewal Reminder', 'New Customer Onboarding', 'VIP Tier Upgrade Flow', 'Referral Invite Flow',
  'Cross-Sell Recommendation', 'Product Education Series', 'Feedback Collection Flow', 'Re-Engagement Drip', 'Milestone Celebration Flow',
  'Wishlist Reminder', 'Price Drop Alert Flow', 'Back in Stock Flow', 'Support Follow-up Flow', 'Anniversary Reward Flow',
];

const DEMO_FLOWS_ACTIVE: FlowRowData[] = FLOW_ACTIVE_NAMES.map((name, i) => ({
  id: `f-${i + 1}`,
  displayId: String(50000 + i * 677 + (i % 3) * 83),
  name,
  updatedOn: PAST_DATES[i],
  status: 'active',
  ...channelMetrics(i, 1.7, 'count'),
}));

const FLOW_INACTIVE_NAMES = [
  'Win-Back Campaign', 'Birthday Offer', 'Legacy Welcome Flow', 'Old Cart Reminder', 'Seasonal Greeting Flow',
  'Paused Loyalty Flow', 'Retired Onboarding Flow', 'Past Promo Reminder', 'Old Review Request', 'Discontinued Product Flow',
  'Archived Survey Flow', 'Holiday 2023 Flow', 'Legacy Upsell Flow', 'Old Referral Flow', 'Paused Re-Engagement',
  'Retired VIP Flow', 'Old Shipping Update', 'Past Event Reminder', 'Deprecated Onboarding', 'Old Milestone Flow',
  'Paused Wishlist Alert', 'Retired Support Flow', 'Old Anniversary Flow', 'Legacy Cross-Sell', 'Paused Feedback Flow',
];

const DEMO_FLOWS_INACTIVE: FlowRowData[] = FLOW_INACTIVE_NAMES.map((name, i) => ({
  id: `f-${25 + i + 1}`,
  displayId: String(70000 + i * 541 + (i % 4) * 61),
  name,
  updatedOn: PAST_DATES[PAST_DATES.length - 1 - i],
  status: 'inactive',
  ...channelMetrics(i, 0.9, 'count'),
}));

const FLOW_DRAFT_NAMES = [
  'Loyalty Program Intro (untitled)', 'Re-engagement Sequence', 'New Onboarding Draft', 'Cart Reminder Draft', 'Review Flow Draft',
  'Upsell Sequence Draft', 'Referral Flow Draft', 'Milestone Flow Draft', 'Wishlist Alert Draft', 'Support Flow Draft',
  'Anniversary Flow Draft', 'Cross-Sell Draft', 'Shipping Update Draft', 'VIP Flow Draft', 'Price Drop Draft',
  'Back in Stock Draft', 'Subscription Draft', 'Feedback Flow Draft', 'Welcome Series Draft', 'Browse Reminder Draft',
  'Replenishment Draft', 'Order Confirmation Draft', 'Education Series Draft', 'Win-Back Draft Flow', 'Seasonal Greeting Draft',
];

const DEMO_FLOWS_DRAFT: FlowRowData[] = FLOW_DRAFT_NAMES.map((name, i) => ({
  id: `f-${50 + i + 1}`,
  name,
  updatedOn: 'Instantly',
  status: 'draft',
  ...NO_METRICS,
}));

const SEGMENT_NAMES = [
  'DermaGPT MVP Cohort', 'Discount Buyers', 'Recent Shopper', 'High Value Customers', 'Cart Abandoners',
  'Newsletter Subscribers', 'First-Time Buyers', 'Repeat Purchasers', 'Inactive Users (90 Days)', 'VIP Loyalty Members',
  'Mobile App Users', 'Referral Program Members', 'Wishlist Users', 'Seasonal Shoppers', 'Discount Code Redeemers',
  'High Engagement Users', 'Churn Risk Customers', 'Location: Metro Cities', 'Age 18-24 Shoppers', 'Age 25-34 Shoppers',
  'Product Reviewers', 'Email Opt-In Users', 'WhatsApp Opted-In Users', 'Birthday This Month', 'Support Ticket Raisers',
];

const SEGMENT_DESCRIPTIONS: (string | undefined)[] = [
  undefined,
  'Customers who have made a purchase using a discount within the past year',
  'Customers who have made a purchase within the last month',
  'Customers with lifetime spend above $500',
  'Users who added items to cart but did not complete checkout in the last 30 days',
  'Users who have opted in to receive the weekly newsletter',
  'Customers who completed their first purchase in the last 90 days',
  'Customers who have made 3 or more purchases',
  'Users who have not opened the app or website in the last 90 days',
  'Customers enrolled in the top loyalty tier',
  undefined,
  'Customers who joined through the referral program',
  'Users who have added at least one item to their wishlist',
  'Customers who only purchase during major sale events',
  undefined,
  'Users who opened 5 or more campaigns in the last 60 days',
  'Customers showing declining engagement over the past quarter',
  'Customers located in Tier 1 metro cities',
  'Customers within the 18 to 24 age bracket',
  'Customers within the 25 to 34 age bracket',
  'Customers who have left at least one product review',
  undefined,
  'Customers who have opted in to receive WhatsApp updates',
  'Customers whose birthday falls within the current month',
  'Customers who have raised a support ticket in the last 6 months',
];

const SEGMENT_EDITED = [
  '04:37 PM, 19 April 2025', '12:50 PM, 02 December 2024', '12:44 PM, 02 December 2024', '09:15 AM, 14 January 2025',
  '03:20 PM, 28 February 2025', '11:05 AM, 10 March 2025', '05:45 PM, 22 March 2025', '08:30 AM, 05 April 2025',
  '02:10 PM, 18 April 2025', '10:55 AM, 30 April 2025', '06:40 PM, 12 May 2025', '09:25 AM, 25 May 2025',
  '01:15 PM, 08 June 2025', '04:50 PM, 21 June 2025', '07:35 AM, 03 July 2025', '11:20 AM, 16 July 2025',
  '02:05 PM, 29 July 2025', '05:40 PM, 11 August 2025', '08:55 AM, 24 August 2025', '12:30 PM, 06 September 2025',
  '03:15 PM, 19 September 2025', '06:00 PM, 02 October 2025', '09:45 AM, 15 October 2025', '01:30 PM, 28 October 2025',
  '04:20 PM, 10 November 2025',
];

const DEMO_SEGMENTS: SegmentRowData[] = SEGMENT_NAMES.map((name, i) => ({
  id: `sg-${i + 1}`,
  name,
  lastEditedOn: SEGMENT_EDITED[i],
  description: SEGMENT_DESCRIPTIONS[i],
  size: i === 0 ? 0 : Math.round(5000 + i * 41213 + (i % 4) * 3170),
  sizeUpdatedOn: '03 August 2026',
}));

const BOT_FLOW_ACTIVE_NAMES = [
  'Order Status Bot', 'Refund Assistant', 'FAQ Responder', 'Appointment Booking Bot', 'Live Agent Handoff',
  'Payment Reminder Bot', 'Lead Qualification Bot', 'Return Request Flow', 'Delivery Tracking Bot', 'Product Recommendation Bot',
  'Feedback Collector Bot', 'Cancellation Assistant', 'New User Onboarding Bot', 'Subscription Support Bot', 'Warranty Claim Bot',
];

const BOT_FLOW_INACTIVE_NAMES = [
  'Legacy Support Bot', 'Old Onboarding Flow', 'Retired FAQ Bot', 'Paused Promo Bot', 'Archived Survey Bot',
  'Old Delivery Bot', 'Deprecated Booking Flow', 'Past Campaign Bot', 'Old Refund Flow', 'Retired Lead Bot',
];

const BOT_FLOW_DESCRIPTIONS: (string | undefined)[] = [
  'Answers "where is my order" queries by pulling live shipment status',
  undefined,
  'Handles common help-center questions before routing to an agent',
  'Lets customers pick and confirm an appointment slot',
  'Hands the conversation to a human agent when the bot can\'t resolve it',
  undefined,
  'Scores and routes new leads based on their replies',
  'Walks a customer through initiating a product return',
  undefined,
  'Suggests related products based on the customer\'s last order',
];

const DEMO_BOT_FLOWS_ACTIVE: BotFlowRowData[] = BOT_FLOW_ACTIVE_NAMES.map((name, i) => ({
  id: `bf-${i + 1}`,
  name,
  updatedOn: PAST_DATES[i],
  description: BOT_FLOW_DESCRIPTIONS[i % BOT_FLOW_DESCRIPTIONS.length],
  status: 'active',
  nodeCount: 6 + ((i * 5) % 24),
}));

const DEMO_BOT_FLOWS_INACTIVE: BotFlowRowData[] = BOT_FLOW_INACTIVE_NAMES.map((name, i) => ({
  id: `bf-${20 + i + 1}`,
  name,
  updatedOn: PAST_DATES[PAST_DATES.length - 1 - i],
  description: BOT_FLOW_DESCRIPTIONS[(i + 3) % BOT_FLOW_DESCRIPTIONS.length],
  status: 'inactive',
  nodeCount: 4 + ((i * 3) % 16),
}));

const DEMO_TEMPLATES: TemplateRowData[] = [
  {
    id: 'tpl-1',
    displayId: '9688',
    name: 'tre',
    status: 'in-review',
    language: 'EN US',
    type: 'text',
    preview: 'test',
    category: 'Marketing',
    businessTag: 'Main',
  },
  {
    id: 'tpl-2',
    displayId: '9687',
    name: 'med_shipping2',
    status: 'active',
    language: 'EN',
    type: 'text',
    preview:
      "Dear {} We have successfully shipped your order and we'll deliver it to you by {} Order ID: {} Item(s): {}...",
    category: 'Utility',
    businessTag: 'Clinikally Helpdesk',
  },
  {
    id: 'tpl-3',
    displayId: '9686',
    name: 'spf100',
    status: 'active',
    language: 'EN',
    type: 'image',
    preview:
      "Sunscreen isn't just for sunny days, it's your everyday skin essential 🌞 🎁 ₹100 OFF on ₹1499+ Use ...",
    category: 'Marketing',
    businessTag: 'Clinikally Helpdesk',
  },
  {
    id: 'tpl-4',
    displayId: '9685',
    name: 'med_shipping2',
    status: 'active',
    language: 'EN',
    type: 'text',
    preview:
      "Dear {} We have successfully shipped your order and we'll deliver it to you by {} Order ID: {} Item(s): {}...",
    category: 'Utility',
    businessTag: 'Main',
  },
  {
    id: 'tpl-5',
    displayId: '9684',
    name: 'spf100',
    status: 'active',
    language: 'EN',
    type: 'image',
    preview:
      "Sunscreen isn't just for sunny days, it's your everyday skin essential 🌞 🎁 ₹100 OFF on ₹1499+ Use ...",
    category: 'Marketing',
    businessTag: 'Main',
  },
  {
    id: 'tpl-6',
    displayId: '9682',
    name: 'extra_discount',
    status: 'active',
    language: 'EN US',
    type: 'text',
    preview:
      "We understand your concern. However, at the moment, we're unable to offer any additional discount...",
    category: 'Utility',
    businessTag: 'Main',
  },
  {
    id: 'tpl-7',
    displayId: '9680',
    name: 'order_confirmation',
    status: 'active',
    language: 'EN',
    type: 'text',
    preview: "Thanks for your order! We've received Order ID: {} and it's now being processed...",
    category: 'Utility',
    businessTag: 'Main',
  },
  {
    id: 'tpl-8',
    displayId: '9679',
    name: 'welcome_message',
    status: 'active',
    language: 'EN US',
    type: 'text',
    preview: "Welcome to the family! Here's 10% off your first order with code WELCOME10...",
    category: 'Marketing',
    businessTag: 'Main',
  },
  {
    id: 'tpl-9',
    displayId: '9678',
    name: 'otp_verification',
    status: 'active',
    language: 'EN',
    type: 'text',
    preview: 'Your one-time password is {}. It is valid for 10 minutes. Do not share this code...',
    category: 'Authentication',
    businessTag: 'Main',
  },
  {
    id: 'tpl-10',
    displayId: '9675',
    name: 'seasonal_sale_banner',
    status: 'in-review',
    language: 'EN',
    type: 'image',
    preview: 'End of season sale is here! Up to 50% off on your favourite picks, while stocks last...',
    category: 'Marketing',
    businessTag: 'Clinikally Helpdesk',
  },
  {
    id: 'tpl-11',
    displayId: '9673',
    name: 'abandoned_cart_reminder',
    status: 'rejected',
    language: 'EN',
    type: 'text',
    preview: 'You left something behind! Complete your purchase before your cart expires...',
    category: 'Marketing',
    businessTag: 'Main',
  },
  {
    id: 'tpl-12',
    displayId: '9670',
    name: 'payment_failed_alert',
    status: 'paused',
    language: 'EN US',
    type: 'text',
    preview: "We couldn't process your payment for Order ID: {}. Please update your payment details...",
    category: 'Utility',
    businessTag: 'Main',
    fallbackTemplate: 'payment_failed_alert_v1',
  },
  {
    id: 'tpl-13',
    displayId: '9668',
    name: 'product_review_request',
    status: 'active',
    language: 'EN',
    type: 'text',
    preview: "How was your recent purchase? We'd love to hear your feedback, it only takes a minute...",
    category: 'Marketing',
    businessTag: 'Clinikally Helpdesk',
  },
  {
    id: 'tpl-14',
    displayId: '9665',
    name: 'delivery_delay_notice',
    status: 'active',
    language: 'EN',
    type: 'text',
    preview: "We're sorry, your order is running a little late. Your new estimated delivery date is {}...",
    category: 'Utility',
    businessTag: 'Main',
  },
];

const DEMO_USER_SEGMENTS: UserSegment[] = [
  {
    id: 'seg-1',
    name: 'Weekend Support Escalation',
    recommended: true,
    description: 'Users who raised a ticket during the weekend on-call window.',
    count: 3262,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-2',
    name: 'Sales Inquiry Follow-Up',
    recommended: true,
    description: 'Leads who asked a pricing question but did not convert.',
    count: 274,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-3',
    name: 'VIP Customer Support',
    description: 'Top-tier accounts routed to the priority support queue.',
    count: 154,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-4',
    name: 'Technical Support Escalation',
    description: 'Tickets escalated past first-line technical support.',
    count: 877,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-5',
    name: 'Standard Support Response',
    description: 'General queries handled within the standard SLA.',
    count: 883,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-6',
    name: 'Customer Inquiry Response',
    count: 447,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-7',
    name: 'Abandoned Checkout Reminder',
    description: 'Shoppers who added items to cart but did not check out.',
    count: 1620,
    lastEdited: '9 June 2023',
  },
  {
    id: 'seg-8',
    name: 'Inactive Users — Last 90 Days',
    description: 'Contacts with no session activity in the last quarter.',
    count: 2894,
    lastEdited: '5 June 2023',
  },
  {
    id: 'seg-9',
    name: 'Refund Requested',
    description: 'Users who opened a refund or return request ticket.',
    count: 312,
    lastEdited: '2 June 2023',
  },
  {
    id: 'seg-10',
    name: 'CRM Import — Newsletter Subscribers',
    description: 'Imported from the marketing CRM opt-in list.',
    count: 5210,
    lastEdited: '3 May 2023',
    imported: true,
  },
  {
    id: 'seg-11',
    name: 'CRM Import — Trade Show Leads',
    description: 'Contacts collected at the Q2 trade show booth.',
    count: 964,
    lastEdited: '18 April 2023',
    imported: true,
  },
];

const PRODUCTS: { id: SidebarProduct; label: string }[] = [
  { id: 'helpdesk', label: 'Helpdesk' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'automation', label: 'Automation' },
];

interface TicketRowData {
  id: string;
  ticketId: string;
  channel: TicketChannel;
  user: string;
  phone?: string;
  avatarCount?: number;
  isNew?: boolean;
  timestamp: string;
  message: string;
  assignee?: string;
  unreadCount?: number;
}

interface ConversationEntry {
  id: string;
  side: 'agent' | 'customer';
  quote?: { name: string; text: string };
  text: string;
  time: string;
}

/** Per-ticket conversation threads, keyed by ticket id — lets the two linked tickets in each
 * channel demonstrate the same thread from an incoming (customer-first) vs. outgoing
 * (agent-first) angle. */
const CONVERSATIONS: Record<string, ConversationEntry[]> = {
  't-1': [
    { id: 'm-1', side: 'customer', text: 'Hey, is my order still on its way? It has been 3 days already.', time: '10:02' },
    { id: 'm-2', side: 'agent', text: 'Hi John! Let me check that for you right away.', time: '10:03' },
    { id: 'm-3', side: 'customer', text: 'Sure, thanks. Order number is #48213.', time: '10:04' },
    { id: 'm-4', side: 'agent', text: 'Your order left the warehouse yesterday and is out for delivery today.', time: '10:06' },
  ],
  't-2': [
    { id: 'm-1', side: 'agent', text: 'Hi John, just a heads up — your order #48213 is out for delivery today.', time: '10:06' },
    {
      id: 'm-2',
      side: 'customer',
      quote: { name: 'John', text: 'Hey, is my order still on its way? It has been 3 days already.' },
      text: 'Oh perfect, thank you for the update!',
      time: '10:08',
    },
    { id: 'm-3', side: 'agent', text: 'Anytime! Let us know if it does not arrive today.', time: '10:09' },
  ],
};

interface EmailThreadEntry {
  id: string;
  senderName: string;
  senderEmail: string;
  date: string;
  badgeLabel?: string;
  preview: string;
  body: ReactNode;
  defaultExpanded?: boolean;
}

/** Per-ticket email threads, keyed by ticket id — same incoming/outgoing pairing as
 * `CONVERSATIONS`, rendered as a stack of `EmailMessage` rows instead of chat bubbles. */
const EMAIL_THREADS: Record<string, EmailThreadEntry[]> = {
  't-3': [
    {
      id: 'e-1',
      senderName: 'Aditi Rao',
      senderEmail: 'aditi.rao@example.com',
      date: 'Sep 10, 2026, 9:14 AM',
      badgeLabel: '5 days ago',
      preview: 'Following up on the refund request I submitted last week.',
      body: (
        <>
          Hi team,
          <br />
          <br />
          Following up on the refund request I submitted last week — I haven&apos;t heard back yet. Could you let me know the status?
          <br />
          <br />
          Thanks,
          <br />
          Aditi
        </>
      ),
      defaultExpanded: false,
    },
    {
      id: 'e-2',
      senderName: 'Marcus Lee',
      senderEmail: 'marcus@limechat.io',
      date: 'Sep 15, 2026, 9:31 AM',
      badgeLabel: 'Today',
      preview: 'I can confirm your refund of ₹1,200 has been processed today.',
      body: (
        <>
          Hi Aditi,
          <br />
          <br />
          Apologies for the delay — I can confirm your refund of ₹1,200 has been processed today. It should reflect in your account within 3-5 business days.
          <br />
          <br />
          Best,
          <br />
          Marcus
        </>
      ),
      defaultExpanded: true,
    },
  ],
  't-4': [
    {
      id: 'e-1',
      senderName: 'Marcus Lee',
      senderEmail: 'marcus@limechat.io',
      date: 'Sep 15, 2026, 9:31 AM',
      badgeLabel: '9 minutes ago',
      preview: 'Good news — your refund of ₹1,200 has been processed.',
      body: (
        <>
          Hi Aditi,
          <br />
          <br />
          Good news — your refund of ₹1,200 has been processed. It should reflect in your account within 3-5 business days.
          <br />
          <br />
          Best,
          <br />
          Marcus
        </>
      ),
      defaultExpanded: false,
    },
    {
      id: 'e-2',
      senderName: 'Aditi Rao',
      senderEmail: 'aditi.rao@example.com',
      date: 'Sep 15, 2026, 9:35 AM',
      badgeLabel: 'Today',
      preview: 'Great, thank you so much for the quick turnaround!',
      body: (
        <>
          Great, thank you so much for the quick turnaround!
          <br />
          <br />
          Aditi
        </>
      ),
      defaultExpanded: true,
    },
  ],
};

/** Every `MessageBubble` variant/flag, one after another, for design review — see
 * ticket `t-showcase` ("Design QA · All message states"). */
const SHOWCASE_MESSAGES: Array<{ id: string } & ComponentProps<typeof MessageBubble>> = [
  { id: 's-1', side: 'customer', variant: 'text', time: '09:00', children: 'Hey, can you help me with a few things?' },
  { id: 's-2', side: 'agent', variant: 'text', time: '09:00', children: "Of course! Here's every message state, one by one." },
  {
    id: 's-3',
    side: 'customer',
    variant: 'quote',
    time: '09:01',
    quote: { name: 'Design QA', text: 'Here\'s every message state, one by one.' },
    children: 'Perfect, starting with quote/reply.',
  },
  {
    id: 's-4',
    side: 'agent',
    variant: 'media',
    time: '09:01',
    media: [{}, {}],
  },
  {
    id: 's-5',
    side: 'customer',
    variant: 'link',
    time: '09:02',
    link: { title: 'LimeChat Design System', description: 'Figma file with all components', domain: 'figma.com' },
  },
  {
    id: 's-6',
    side: 'agent',
    variant: 'attachment',
    time: '09:02',
    attachment: { title: 'design-states.pdf', meta: '2 pages · 66 kB', fileType: 'pdf' },
  },
  { id: 's-7', side: 'customer', variant: 'location', time: '09:03', location: {} },
  {
    id: 's-8',
    side: 'agent',
    variant: 'note',
    time: '09:03',
    onlyVisibleToMe: true,
    note: { ticketId: '123456' },
    children: 'Internal note — only the team can see this.',
  },
  { id: 's-11', side: 'customer', variant: 'opened', time: '09:05' },
  { id: 's-12', side: 'agent', variant: 'viewOnce', time: '09:05', children: 'Photo' },
  {
    id: 's-13',
    side: 'agent',
    variant: 'text',
    time: '09:06',
    forwarded: true,
    children: 'And this one was forwarded from another chat.',
  },
  {
    id: 's-14',
    side: 'customer',
    variant: 'text',
    time: '09:06',
    children: "That's the whole set — thanks!",
  },
];

const TICKET_CUSTOM_FIELDS: TicketDetailsField[] = [
  { id: 'order-ref', label: 'Order reference', type: 'text', defaultValue: 'ORD-10241' },
  { id: 'follow-up', label: 'Follow-up date', type: 'date', defaultValue: '2026-09-25' },
  {
    id: 'priority',
    label: 'Priority',
    type: 'select',
    defaultValue: 'medium',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
  {
    id: 'issue-category',
    label: 'Issue category',
    type: 'cascading',
    options: [
      {
        value: 'product',
        label: 'Product',
        children: [
          {
            value: 'sizing',
            label: 'Sizing',
            children: [
              { value: 'too-small', label: 'Too small' },
              { value: 'too-large', label: 'Too large' },
              { value: 'wrong-size', label: 'Wrong size shipped' },
            ],
          },
          {
            value: 'quality',
            label: 'Quality',
            children: [
              { value: 'defective', label: 'Defective item' },
              { value: 'damaged', label: 'Damaged in transit' },
            ],
          },
          {
            value: 'availability',
            label: 'Availability',
            children: [
              { value: 'out-of-stock', label: 'Out of stock' },
              { value: 'restock-eta', label: 'Restock ETA' },
            ],
          },
        ],
      },
      {
        value: 'order',
        label: 'Order',
        children: [
          {
            value: 'shipping',
            label: 'Shipping',
            children: [
              { value: 'delayed', label: 'Delayed delivery' },
              { value: 'lost', label: 'Lost in transit' },
            ],
          },
          {
            value: 'payment',
            label: 'Payment',
            children: [
              { value: 'failed', label: 'Payment failed' },
              { value: 'refund', label: 'Refund status' },
            ],
          },
        ],
      },
      {
        value: 'account',
        label: 'Account',
        children: [
          {
            value: 'login',
            label: 'Login issue',
            children: [
              { value: 'password-reset', label: 'Password reset' },
              { value: 'otp', label: 'OTP not received' },
            ],
          },
        ],
      },
    ],
  },
];

const TICKET_DETAIL_SECTIONS: TicketDetailsSection[] = [
  {
    id: 'previous-tickets',
    label: 'Previous tickets',
    hideAdd: true,
    items: [
      { title: 'Email_Sales', timestamp: '6 months ago', preview: 'Hi, Looks like you are away from our...' },
      { title: 'WhatsApp_Support', timestamp: '4 months ago', preview: 'My order hasn\'t arrived yet, can you...' },
      { title: 'Email_Billing', timestamp: '2 months ago', preview: 'I was charged twice for my last order...' },
      { title: 'WhatsApp_Support', timestamp: '3 weeks ago', preview: 'Thanks for the quick resolution earlier!' },
    ],
  },
  {
    id: 'sub-tickets',
    label: 'Sub tickets',
    emptyText: 'There are no sub tickets for this customer',
    items: [
      { title: 'Refund_Request', timestamp: '5 days ago', preview: 'Splitting this off to track the refund separately...' },
      { title: 'Replacement_Item', timestamp: '2 days ago', preview: 'Logging the replacement request for the damaged item.' },
    ],
  },
  {
    id: 'voice-logs',
    label: 'Voice logs',
    emptyText: 'There are no voice logs for this customer',
    hideAdd: true,
    items: [
      { title: 'Ananya Rao', timestamp: '5th Aug | 10:00 am', duration: '5 minutes 10 seconds' },
      { title: 'Ananya Rao', timestamp: '2nd Aug | 3:45 pm', duration: '2 minutes 45 seconds' },
    ],
  },
  {
    id: 'conversation-fields',
    label: 'Conversation fields',
    emptyText: 'There are no fields for this customer',
    hideAdd: true,
    fields: TICKET_CUSTOM_FIELDS,
  },
  {
    id: 'contact-fields',
    label: 'Contact fields',
    emptyText: 'There are no fields for this customer',
    hideAdd: true,
    fields: TICKET_CUSTOM_FIELDS,
  },
  {
    id: 'conversation-tags',
    label: 'Conversation tags',
    emptyText: 'There are no tags for this customer',
    tags: ['Order delay', 'Delivery issue', 'Follow-up needed'],
  },
  {
    id: 'contact-tags',
    label: 'Contact tags',
    emptyText: 'There are no tags for this customer',
    tags: ['Returning customer', 'VIP'],
  },
  {
    id: 'shopify-tags',
    label: 'Shopify tags',
    emptyText: 'There are no tags for this customer',
    tags: ['Shopify Plus', 'High LTV'],
  },
  {
    id: 'crm-tickets',
    label: 'CRM tickets',
    emptyText: 'There are no CRM tickets for this customer',
    items: [
      { title: 'Salesforce_Case_00931', timestamp: '3 months ago', preview: 'Escalated to account manager for loyalty credit...' },
      { title: 'HubSpot_Ticket_4021', timestamp: '1 month ago', preview: 'Customer requested invoice copy for reimbursement...' },
    ],
  },
];

/** Demo tickets — t-1..t-4 are 2 linked pairs (WhatsApp incoming/outgoing, Email
 * incoming/outgoing) that exercise both message directions; t-5..t-14 pad out the
 * list with a variety of channels, assignees, and unread states. */
const TICKETS: TicketRowData[] = [
  { id: 't-1', ticketId: '100230', channel: 'whatsapp', user: 'John', phone: '98765 43210', avatarCount: 2, isNew: true, timestamp: '4 minutes ago', message: 'Hey, is my order still on its way? It has been 3 days already.', assignee: 'Jane', unreadCount: 2 },
  { id: 't-2', ticketId: '100231', channel: 'whatsapp', user: 'John', phone: '98765 43210', avatarCount: 2, timestamp: '2 minutes ago', message: 'Anytime! Let us know if it does not arrive today.', assignee: 'Jane' },
  { id: 't-3', ticketId: '100232', channel: 'email', user: 'Aditi Rao', timestamp: '12 minutes ago', message: 'Following up on the refund request I submitted last week.', assignee: 'Marcus', unreadCount: 1 },
  { id: 't-4', ticketId: '100233', channel: 'email', user: 'Aditi Rao', timestamp: '9 minutes ago', message: "You're welcome! Let us know if there's anything else.", assignee: 'Marcus' },
  { id: 't-5', ticketId: '100234', channel: 'instagram', user: 'the.skincare.edit', isNew: true, timestamp: '20 minutes ago', message: 'Do you restock the lavender candle? Sold out everywhere.', unreadCount: 3 },
  { id: 't-6', ticketId: '100235', channel: 'sms', user: 'Rahul Verma', timestamp: '35 minutes ago', message: 'OTP did not arrive, can you resend it please?', assignee: 'Jane' },
  { id: 't-7', ticketId: '100236', channel: 'whatsapp', user: 'Priya Nair', avatarCount: 2, timestamp: '1 hour ago', message: 'Thanks for the quick help earlier, resolved now!', assignee: 'Marcus' },
  { id: 't-8', ticketId: '100237', channel: 'email', user: 'Support Team', timestamp: '2 hours ago', message: 'Escalation: customer requesting a callback about billing.', assignee: 'Marcus', unreadCount: 5 },
  { id: 't-9', ticketId: '100238', channel: 'instagram', user: 'urban.threads.co', timestamp: '3 hours ago', message: 'Is the summer collection back in stock yet?', assignee: 'Jane' },
  { id: 't-10', ticketId: '100239', channel: 'sms', user: 'Karan Mehta', isNew: true, timestamp: '4 hours ago', message: 'Package shows delivered but I never received it.', unreadCount: 1 },
  { id: 't-11', ticketId: '100240', channel: 'whatsapp', user: 'Sneha Iyer', avatarCount: 1, timestamp: '5 hours ago', message: 'Can I exchange this for a different size?', assignee: 'Marcus' },
  { id: 't-12', ticketId: '100241', channel: 'email', user: 'Vikram Singh', timestamp: '6 hours ago', message: 'Invoice copy needed for reimbursement, please advise.', assignee: 'Jane' },
  { id: 't-13', ticketId: '100242', channel: 'instagram', user: 'thefitnessjourney', timestamp: '8 hours ago', message: 'Do you ship internationally to Singapore?', unreadCount: 2 },
  { id: 't-14', ticketId: '100243', channel: 'sms', user: 'Neha Kapoor', timestamp: '1 day ago', message: 'Thanks, the replacement arrived today!', assignee: 'Marcus' },
  {
    id: 't-showcase',
    ticketId: '100244',
    channel: 'whatsapp',
    user: 'Design QA',
    timestamp: 'Just now',
    message: 'All message states — for design review',
    assignee: 'You',
  },
];

const TOP_NAV_BY_PRODUCT = {
  helpdesk: (selected: string) =>
    helpDeskTopNav({
      onVoiceCall: () => alert('Voice call'),
      onSelectTicketInbox: (inbox) => alert(`New ticket in: ${inbox.name}`),
      showActions: selected === 'tickets',
    }),
  marketing: () => campaignsTopNav({ onChannelChange: () => alert('Pick channel') }),
  automation: () => automationTopNav({ onChannelChange: () => alert('Pick channel') }),
} as const;


export function App() {
  const [product, setProduct] = useState<SidebarProduct>('helpdesk');
  const preset = sidebarPresets[product];
  const [selected, setSelected] = useState(preset.items[0].id);

  const switchProduct = (next: SidebarProduct) => {
    setProduct(next);
    setSelected(sidebarPresets[next].items[0].id);
    setUserSettingsOpen(false);
  };

  // Account/Profile settings reached from the avatar popover — a dedicated
  // page with just those two tabs, separate from the product's own (much
  // longer) Settings nav.
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [userSettingsTab, setUserSettingsTab] = useState<'account' | 'profile'>('account');

  const account = { name: 'Nonucare12', compact: true };
  const selectedLabel = preset.items.find((i) => i.id === selected)?.label ?? selected;

  // Rail items that show the flow-builder canvas chrome. Marketing's "Broadcast"
  // reuses the same (Campaigns flows) canvas.
  const CANVAS_ITEMS: Partial<Record<SidebarProduct, string[]>> = {
    marketing: ['automation-flows', 'broadcast'],
    automation: ['flows'],
  };
  // Broadcast, Automation flows, and Bot flows all have a list/home view in
  // front of the flow-builder canvas.
  const [broadcastView, setBroadcastView] = useState<'list' | 'canvas'>('list');
  const [flowsView, setFlowsView] = useState<'list' | 'canvas'>('list');
  const [botFlowsView, setBotFlowsView] = useState<'list' | 'canvas'>('list');
  const showBroadcastHome = product === 'marketing' && selected === 'broadcast' && broadcastView === 'list';
  const showFlowsHome =
    product === 'marketing' && selected === 'automation-flows' && flowsView === 'list';
  const showBotFlowsHome =
    product === 'automation' && selected === 'flows' && botFlowsView === 'list';
  const showSegmentsHome = product === 'marketing' && selected === 'segments';
  const showTemplatesHome =
    (product === 'marketing' || product === 'helpdesk') && selected === 'templates';
  const showSettingsHome = selected === 'settings';
  const showTicketsHome = product === 'helpdesk' && selected === 'tickets';
  const showCanvas =
    (CANVAS_ITEMS[product] ?? []).includes(selected) &&
    !showBroadcastHome &&
    !showFlowsHome &&
    !showBotFlowsHome;

  const [settingsTab, setSettingsTab] = useState('inboxes');
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxSyncing, setInboxSyncing] = useState(false);
  const visibleInboxes = DEMO_INBOXES.filter(
    (row) =>
      row.id.includes(inboxSearch.trim()) ||
      row.name.toLowerCase().includes(inboxSearch.trim().toLowerCase()),
  );

  const BOT_NAMES = [
    'Sales Bot',
    'FAQ',
    'Order Tracking Assistant',
    'Billing Helper',
    'Onboarding Concierge',
    'VIP Support',
    'Lead Qualifier',
    'Appointment Scheduler',
    'Feedback Bot',
    'Returns & Refunds Assistant',
    'Multilingual Support Bot',
  ];
  const [botInboxMap, setBotInboxMap] = useState<Record<string, string[]>>({
    'Sales Bot': ['Limechat (189)'],
  });
  const [savingBotInboxMap, setSavingBotInboxMap] = useState(false);
  const [savingHelpdeskSettings, setSavingHelpdeskSettings] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(TICKETS[0].id);
  const selectedTicket = TICKETS.find((ticket) => ticket.id === selectedTicketId);
  const [ticketsTab, setTicketsTab] = useState('queued');
  const [ticketsSearch, setTicketsSearch] = useState('');
  const [ticketsSort, setTicketsSort] = useState('Newly created');
  const [composerMode, setComposerMode] = useState<TicketComposerMode>('reply');
  const [resolveStatus, setResolveStatus] = useState('Resolve');
  const [composerDraft, setComposerDraft] = useState('');
  const [emailComposerAction, setEmailComposerAction] = useState<'reply' | 'forward' | null>(null);
  const [forwardTo, setForwardTo] = useState<string[]>([]);
  const [forwardCc, setForwardCc] = useState<string[]>(['info@mywebsite.com']);
  const [forwardBcc, setForwardBcc] = useState<string[]>(['hello@samplemail.com']);
  const [replyCc, setReplyCc] = useState<string[]>(['support@limechat.io']);
  const [replyBcc, setReplyBcc] = useState<string[]>([]);
  const [detailsTab, setDetailsTab] = useState('Overview');
  const [ticketAgent, setTicketAgent] = useState('John Adams');
  const [ticketTeam, setTicketTeam] = useState('Marketing');

  const [profileName, setProfileName] = useState('LimeChat');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [requestingPasswordChange, setRequestingPasswordChange] = useState(false);
  const [apiKeyMasked, setApiKeyMasked] = useState('lcuat.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  const [generatingKey, setGeneratingKey] = useState(false);

  const [uiModePreference, setUiModePreference] = useState('Whatsapp');
  const [dndStartTime, setDndStartTime] = useState('23:01');
  const [dndEndTime, setDndEndTime] = useState('08:00');
  const [savingDnd, setSavingDnd] = useState(false);

  const [hdCompanyName, setHdCompanyName] = useState('LimeChat Development V2');
  const [hdWebsiteUrl, setHdWebsiteUrl] = useState('');
  const [hdCurrency, setHdCurrency] = useState('INR');
  const [hdSiteLanguage, setHdSiteLanguage] = useState('English (En)');
  const [hdToggles, setHdToggles] = useState<Record<HelpDeskToggleKey, boolean>>({
    hideAllTicketsAgents: true,
    hideQueuedTicketsAgents: true,
    hideAllTicketsSupervisors: true,
    hideQueuedTicketsSupervisors: true,
    hideBotTicketsAgents: true,
    enforceTagging: false,
    hideOutOfStockShopify: false,
    applyPiiMasking: false,
    enableActionCableMonitoring: false,
  });
  const [hdSelectedFileTypes, setHdSelectedFileTypes] = useState<string[]>(['pdfDocuments']);

  const [dsMaskMessagePii, setDsMaskMessagePii] = useState(true);
  const [dsPiiTypes, setDsPiiTypes] = useState<Record<PiiTypeKey, boolean>>({
    aadhaarNumber: true,
    panNumber: true,
    cardNumber: true,
    ifscCode: true,
    bankAccountNumber: true,
    internationalPhoneNumber: false,
    emailAddress: false,
    upiId: false,
    drivingLicenceNumber: false,
    voterId: false,
    passportNumber: false,
    otp: false,
    dateOfBirth: false,
  });
  const [dsBlockProfanity, setDsBlockProfanity] = useState(false);
  const [dsProfanityWords, setDsProfanityWords] = useState<ProfanityWord[]>([]);

  const [attrEnabled, setAttrEnabled] = useState<Record<AttributionWindowKey, boolean>>({
    linkClick: true,
    linkSent: true,
    botIntent: true,
  });
  const [attrWindows, setAttrWindows] = useState<Record<AttributionWindowKey, AttributionWindowValue>>({
    linkClick: { days: 2, hours: 0 },
    linkSent: { days: 2, hours: 0 },
    botIntent: { days: 2, hours: 0 },
  });

  const [csatEnabled, setCsatEnabled] = useState(true);
  const [csatFlows, setCsatFlows] = useState<Record<CsatFlowKey, boolean>>({
    showProducts: false,
    faq: true,
    gptProductSearch: true,
    myCaptain: false,
    voucher: true,
    cancelOrder: true,
    trackOrder: true,
    gptQna: true,
    returnOrder: false,
    addressChange: false,
    returnRefund: true,
    checkout: true,
    gptAgenticQna: false,
    exchangeOrder: false,
  });
  const [csatRatingScale, setCsatRatingScale] = useState<CsatRatingScale>('5');
  const [csatDelay, setCsatDelay] = useState<CsatTimeDelay>({ hours: 0, minutes: 0, seconds: 15 });
  const [csatReminderDelay, setCsatReminderDelay] = useState<CsatTimeDelay>({ hours: 0, minutes: 0, seconds: 20 });

  const [broadcastTab, setBroadcastTab] = useState<BroadcastTab>('triggered');
  const [broadcastSearch, setBroadcastSearch] = useState('');
  const [broadcastPage, setBroadcastPage] = useState(1);
  const BROADCASTS_BY_TAB: Record<BroadcastTab, BroadcastRowData[]> = {
    triggered: DEMO_BROADCASTS,
    scheduled: DEMO_SCHEDULED_BROADCASTS,
    draft: DEMO_DRAFT_BROADCASTS,
  };

  const [flowTab, setFlowTab] = useState<FlowTab>('active');
  const [flowSearch, setFlowSearch] = useState('');
  const [flowPage, setFlowPage] = useState(1);
  const FLOWS_BY_TAB: Record<FlowTab, FlowRowData[]> = {
    active: DEMO_FLOWS_ACTIVE,
    inactive: DEMO_FLOWS_INACTIVE,
    draft: DEMO_FLOWS_DRAFT,
  };

  const [botFlowTab, setBotFlowTab] = useState<BotFlowTab>('active');
  const [botFlowSearch, setBotFlowSearch] = useState('');
  const [botFlowPage, setBotFlowPage] = useState(1);
  const BOT_FLOWS_BY_TAB: Record<BotFlowTab, BotFlowRowData[]> = {
    active: DEMO_BOT_FLOWS_ACTIVE,
    inactive: DEMO_BOT_FLOWS_INACTIVE,
  };

  const [segmentTab, setSegmentTab] = useState<SegmentSourceTab>('lc-segments');
  const [segmentSearch, setSegmentSearch] = useState('');
  const [segmentPage, setSegmentPage] = useState(1);
  const SEGMENTS_BY_TAB: Record<SegmentSourceTab, SegmentRowData[]> = {
    'lc-segments': DEMO_SEGMENTS,
    imported: [],
  };

  const [templateChannel, setTemplateChannel] = useState<TemplateChannel>('whatsapp');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateInboxFilter, setTemplateInboxFilter] = useState('all');
  const [templateTypeFilter, setTemplateTypeFilter] = useState('all');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');
  const [templatePage, setTemplatePage] = useState(1);
  const TEMPLATES_BY_CHANNEL: Record<TemplateChannel, TemplateRowData[]> = {
    whatsapp: DEMO_TEMPLATES,
    sms: DEMO_TEMPLATES,
    email: DEMO_TEMPLATES,
  };

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [visualizeOpen, setVisualizeOpen] = useState(false);
  const [segmentModalOpen, setSegmentModalOpen] = useState(false);

  // Broadcast audience + schedule — shown in the canvas meta bar and reused as
  // the review summary in the pre-publish confirmation modal.
  const broadcastAudience: CanvasBroadcastAudience = {
    count: 370131,
    description: '3 included 1 excluded',
    onRefresh: () => alert('Refresh audience'),
    onEdit: () => setSegmentModalOpen(true),
    includedSegments: [
      { name: 'Engaged App Users Who Opened The App In Last 30 Days', count: 182391 },
      { name: 'Recent Purchasers Who Bought Something Last Week', count: 123208 },
      { name: 'Cart Abandoners Who Left Items Unpurchased Twice', count: 98745 },
    ],
    excludedSegments: [
      { name: 'Visited Pricing Page And Compared Premium Plans Closely', count: 34213 },
    ],
    totalUsers: 370131,
    optOutNotice: 'Phone numbers which are in Opt Out list will not be included in the broadcast.',
  };
  const broadcastSchedule: CanvasBroadcastSchedule = {
    label: 'Sep 14 · 10:30 AM',
    description: 'Retry after 1 day 8 hours',
    onEdit: () => setScheduleOpen(true),
    details: [
      { label: 'Timezone', value: 'Asia/Kolkata (GMT+5:30)' },
      { label: 'Retry policy', value: 'Retry after 1 day 8 hours' },
      { label: 'Max retries', value: '2' },
    ],
  };
  const [zoom, setZoom] = useState(100);
  const setZoomClamped = (z: number) => setZoom(Math.min(400, Math.max(25, Math.round(z))));
  const [activeTool, setActiveTool] = useState('select');
  const [grabbing, setGrabbing] = useState(false);
  const canvasCursor =
    showCanvas && activeTool === 'pan' ? (grabbing ? 'grabbing' : 'grab') : undefined;

  // Per-canvas flow meta, editable from the Flow details modal.
  type FlowKey = 'marketing' | 'automation' | 'broadcast';
  const [flows, setFlows] = useState<Record<FlowKey, { name: string; id: string; active: boolean }>>({
    marketing: { name: 'Welcome series', id: '1024839', active: true },
    automation: { name: 'Bot flows', id: '5820147', active: true },
    broadcast: { name: 'Diwali Mega Sale Blast', id: '4471063', active: true },
  });
  const flowKey: FlowKey =
    product === 'automation' ? 'automation' : selected === 'broadcast' ? 'broadcast' : 'marketing';
  const curFlow = flows[flowKey];

  // Which section (tab) the currently-open broadcast/flow was opened from —
  // drives the editor's status badge so it matches where the row actually lives.
  const [broadcastStatus, setBroadcastStatus] = useState<BroadcastRowData['status']>('completed');
  const [flowStatus, setFlowStatus] = useState<FlowRowData['status']>('active');
  const [botFlowStatus, setBotFlowStatus] = useState<BotFlowRowData['status']>('active');

  const BROADCAST_BADGE: Record<BroadcastRowData['status'], { label: string; tone?: 'accent' | 'warning' }> = {
    sending: { label: 'Sending' },
    completed: { label: 'Completed' },
    scheduled: { label: 'Scheduled', tone: 'warning' },
    draft: { label: 'Draft' },
  };
  const FLOW_BADGE: Record<FlowRowData['status'], { label: string; tone?: 'accent' | 'warning' }> = {
    active: { label: 'Active' },
    inactive: { label: 'Inactive' },
    draft: { label: 'Draft' },
  };
  const BOT_FLOW_BADGE: Record<BotFlowRowData['status'], { label: string; tone?: 'accent' | 'warning' }> = {
    active: { label: 'Active' },
    inactive: { label: 'Inactive' },
  };

  // Opens a broadcast row in the flow-builder canvas, carrying its name/ID/status
  // over so the editor (breadcrumb, flow header, status badge) reflects that row.
  const openBroadcastInEditor = (row: BroadcastRowData) => {
    setFlows((f) => ({
      ...f,
      broadcast: {
        ...f.broadcast,
        name: row.name,
        id: row.displayId ?? f.broadcast.id,
        active: row.status !== 'draft',
      },
    }));
    setBroadcastStatus(row.status);
    setBroadcastView('canvas');
  };

  // Opens an automation-flow row in the flow-builder canvas, carrying its
  // name/ID/status over so the editor reflects that row.
  const openFlowInEditor = (row: FlowRowData) => {
    setFlows((f) => ({
      ...f,
      marketing: {
        ...f.marketing,
        name: row.name,
        id: row.displayId ?? f.marketing.id,
        active: row.status === 'active',
      },
    }));
    setFlowStatus(row.status);
    setFlowsView('canvas');
  };

  // Opens a bot-flow row in the flow-builder canvas, carrying its name/status
  // over so the editor reflects that row.
  const openBotFlowInEditor = (row: BotFlowRowData) => {
    setFlows((f) => ({
      ...f,
      automation: { ...f.automation, name: row.name, active: row.status === 'active' },
    }));
    setBotFlowStatus(row.status);
    setBotFlowsView('canvas');
  };

  // 'a0' is the header account — no list row matches, so none is pre-highlighted.
  const [activeAccount, setActiveAccount] = useState('a0');
  const [accountQuery, setAccountQuery] = useState('');
  const accountMenu = {
    current: {
      id: 'a0',
      name: 'Nonucare12',
      number: '12345561',
      avatarSrc: 'https://i.pravatar.cc/96?img=32',
    },
    accounts: [
      { id: 'c1', name: 'Aurora Botanicals', number: 'ACC-104829', avatarSrc: 'https://i.pravatar.cc/64?img=12' },
      { id: 'c2', name: 'Nimbus Coffee Roasters', number: 'ACC-238104', avatarSrc: 'https://i.pravatar.cc/64?img=32' },
      { id: 'c3', name: 'Peak & Pine Outfitters', number: 'ACC-593017', avatarSrc: 'https://i.pravatar.cc/64?img=15' },
      { id: 'c4', name: 'Saffron House Kitchens', number: 'ACC-671142', avatarSrc: 'https://i.pravatar.cc/64?img=45' },
      { id: 'c5', name: 'Tidewater Surf Co.', number: 'ACC-820556', avatarSrc: 'https://i.pravatar.cc/64?img=8' },
      { id: 'c6', name: 'Copperleaf Interiors', number: 'ACC-947330', avatarSrc: 'https://i.pravatar.cc/64?img=25' },
    ].filter(
      (a) =>
        a.name.toLowerCase().includes(accountQuery.toLowerCase()) ||
        a.number.includes(accountQuery),
    ),
    selectedId: activeAccount,
    onSelect: setActiveAccount,
    searchValue: accountQuery,
    onSearchChange: setAccountQuery,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        {...preset}
        selectedId={userSettingsOpen ? undefined : selected}
        onSelect={(id) => {
          setSelected(id);
          setBroadcastView('list');
          setFlowsView('list');
          setSettingsTab('inboxes');
          setUserSettingsOpen(false);
        }}
        profile={{
          name: 'Aditi Rao',
          menuItems: [
            {
              id: 'profile-settings',
              label: 'Profile settings',
              icon: 'user',
              onClick: () => {
                setUserSettingsTab('profile');
                setUserSettingsOpen(true);
              },
            },
            {
              id: 'account-settings',
              label: 'Account Settings',
              icon: 'settings',
              onClick: () => {
                setUserSettingsTab('account');
                setUserSettingsOpen(true);
              },
            },
            {
              id: 'logout',
              label: 'Logout',
              icon: 'logout',
              danger: true,
              onClick: () => alert('Logout'),
            },
          ],
        }}
        logo={{ onClick: () => switchProduct('helpdesk') }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
        <TopNavBar
          {...(product === 'helpdesk' ? TOP_NAV_BY_PRODUCT.helpdesk(selected) : TOP_NAV_BY_PRODUCT[product]())}
          breadcrumbs={
            userSettingsOpen
              ? [{ label: USER_SETTINGS_COPY[userSettingsTab].title }]
              : showCanvas
                ? [
                    { label: selected === 'broadcast' ? 'Broadcast' : 'Flows' },
                    { label: curFlow.id, copyable: true },
                  ]
                : showTicketsHome
                  ? [{ label: 'Tickets' }, { label: selectedTicket?.ticketId ?? '', copyable: true }]
                  : showSettingsHome
                    ? [{ label: selectedLabel }, { label: SETTINGS_COPY[settingsTab].title }]
                    : [{ label: selectedLabel }]
          }
          account={account}
          accountMenu={accountMenu}
          products={PRODUCTS}
          selectedProductId={product}
          onProductChange={(id) => switchProduct(id as SidebarProduct)}
        />

        <main
          onPointerDown={() => canvasCursor && setGrabbing(true)}
          onPointerUp={() => setGrabbing(false)}
          onPointerLeave={() => setGrabbing(false)}
          style={{
            flex: 1,
            position: 'relative',
            minWidth: 0,
            minHeight: 0,
            background: showCanvas
              ? 'radial-gradient(circle, #dcdcd6 1px, transparent 1px) 0 0 / 20px 20px, #faf9f5'
              : '#f5f5f4',
            overflow: 'visible',
            cursor: canvasCursor,
          }}
        >
          {userSettingsOpen && (
            <SettingsPage
              tabs={USER_SETTINGS_TABS}
              activeTab={userSettingsTab}
              onTabChange={(id) => setUserSettingsTab(id as 'account' | 'profile')}
              title={USER_SETTINGS_COPY[userSettingsTab].title}
              description={USER_SETTINGS_COPY[userSettingsTab].description}
            >
              {userSettingsTab === 'profile' ? (
                <ProfileSettings
                  email="team@limechat.ai"
                  name={profileName}
                  onNameChange={setProfileName}
                  updatingProfile={updatingProfile}
                  onUpdateProfile={() => {
                    setUpdatingProfile(true);
                    window.setTimeout(() => setUpdatingProfile(false), 700);
                  }}
                  requestingPasswordChange={requestingPasswordChange}
                  onRequestPasswordChange={() => {
                    setRequestingPasswordChange(true);
                    window.setTimeout(() => setRequestingPasswordChange(false), 700);
                  }}
                  apiKeyMasked={apiKeyMasked}
                  apiKeyExpiry="Never"
                  generatingKey={generatingKey}
                  onGenerateKey={() => {
                    setGeneratingKey(true);
                    window.setTimeout(() => {
                      setApiKeyMasked(`lcuat.${'X'.repeat(38)}`);
                      setGeneratingKey(false);
                    }, 700);
                  }}
                />
              ) : product === 'helpdesk' ? (
                <HelpDeskAccountSettings
                  companyName={hdCompanyName}
                  onCompanyNameChange={setHdCompanyName}
                  websiteUrl={hdWebsiteUrl}
                  onWebsiteUrlChange={setHdWebsiteUrl}
                  currency={hdCurrency}
                  onCurrencyChange={setHdCurrency}
                  siteLanguageOptions={['English (En)', 'Hindi', 'Spanish']}
                  siteLanguage={hdSiteLanguage}
                  onSiteLanguageChange={setHdSiteLanguage}
                  toggles={hdToggles}
                  onToggleChange={(key, next) =>
                    setHdToggles((prev) => ({ ...prev, [key]: next }))
                  }
                  selectedFileTypes={hdSelectedFileTypes}
                  onFileTypeToggle={(id, next) =>
                    setHdSelectedFileTypes((prev) =>
                      next ? [...prev, id] : prev.filter((t) => t !== id),
                    )
                  }
                />
              ) : (
                <AccountSettings
                  id="1"
                  crmAccountId="189"
                  company="Limechat Development"
                  brandSubdomain="http://links.limechat.in"
                  uiModeOptions={['Whatsapp', 'Instagram', 'Email', 'SMS']}
                  uiModePreference={uiModePreference}
                  onUiModePreferenceChange={setUiModePreference}
                  dndStartTime={dndStartTime}
                  dndEndTime={dndEndTime}
                  onDndStartTimeChange={setDndStartTime}
                  onDndEndTimeChange={setDndEndTime}
                  savingDnd={savingDnd}
                  onSaveDnd={() => {
                    setSavingDnd(true);
                    window.setTimeout(() => setSavingDnd(false), 700);
                  }}
                />
              )}
            </SettingsPage>
          )}

          {!userSettingsOpen && (
          <>
          {/* 12px inset so the canvas chrome doesn't sit flush against the shell.
              pointerEvents stays off unless the canvas is showing — otherwise this
              full-bleed absolutely-positioned div sits over later siblings (e.g. the
              broadcast home page) and swallows their scroll/click events. */}
          <div style={{ position: 'absolute', inset: 12, pointerEvents: showCanvas ? undefined : 'none' }}>
          {showCanvas && product === 'marketing' && (
              <CanvasChrome
                {...marketingCanvas({
                  omitTools:
                    selected === 'broadcast' ? ['preview', 'experiment', 'settings'] : undefined,
                  omitActions: selected === 'broadcast' ? ['reports', 'save'] : undefined,
                  onTest: selected === 'broadcast' ? () => setVisualizeOpen(true) : undefined,
                  broadcastMeta:
                    selected === 'broadcast'
                      ? {
                          audience: broadcastAudience,
                          schedule: broadcastSchedule,
                          readOnly: broadcastStatus === 'sending' || broadcastStatus === 'completed',
                        }
                      : undefined,
                  onDownloadReports: () => alert('Download reports'),
                  onSaveDraft: () => alert('Saved'),
                  onPublish: () =>
                    selected === 'broadcast' ? setPublishConfirmOpen(true) : setPublishOpen(true),
                  onCloneFlow: () => alert('Clone flow'),
                  onDeleteFlow: () => alert('Delete flow'),
                  onExportFlow: () => alert('Export flow'),
                  onPublishHistory: () => alert('Publish history'),
                })}
                flow={{
                  title: curFlow.name,
                  subtitle: curFlow.id,
                  active: curFlow.active,
                  badge:
                    selected === 'broadcast'
                      ? BROADCAST_BADGE[broadcastStatus].label
                      : selected === 'automation-flows'
                        ? FLOW_BADGE[flowStatus].label
                        : undefined,
                  badgeTone:
                    selected === 'broadcast'
                      ? BROADCAST_BADGE[broadcastStatus].tone
                      : selected === 'automation-flows'
                        ? FLOW_BADGE[flowStatus].tone
                        : undefined,
                  onBack: () =>
                    selected === 'broadcast'
                      ? setBroadcastView('list')
                      : selected === 'automation-flows'
                        ? setFlowsView('list')
                        : setSelected('home'),
                  onEdit: () => setDetailsOpen(true),
                }}
                nodePalette={flowNodePalette}
                onAddNode={(id) => alert(`Add node: ${id}`)}
                onCanvasSearch={(q) => console.log('search', q)}
                onCanvasSearchOptions={() => alert('Search options')}
                activeToolId={activeTool}
                onToolSelect={setActiveTool}
                zoom={zoom}
                onZoomChange={setZoomClamped}
                onUndo={() => console.log('undo')}
                onRedo={() => console.log('redo')}
              />
            )}

            {showCanvas && product === 'automation' && (
              <CanvasChrome
                {...automationCanvas({
                  onRevert: () => alert('Reverted to original'),
                  onPublish: () => alert('Published'),
                  onCollaborators: () => alert('Collaborators'),
                  onCloneFlow: () => alert('Clone flow'),
                  onDeleteFlow: () => alert('Delete flow'),
                  onExportFlow: () => alert('Export flow'),
                  onPublishHistory: () => alert('Publish history'),
                  lastEditedBy: {
                    name: 'Rajeev Sanyal',
                    at: '3:00 PM, Nov 24, 2025',
                    avatarSrc: 'https://i.pravatar.cc/64?img=13',
                  },
                })}
                flow={{
                  title: curFlow.name,
                  subtitle: curFlow.id,
                  active: curFlow.active,
                  badge: BOT_FLOW_BADGE[botFlowStatus].label,
                  badgeTone: BOT_FLOW_BADGE[botFlowStatus].tone,
                  onBack: () => setBotFlowsView('list'),
                  onEdit: () => setDetailsOpen(true),
                }}
                nodePalette={flowNodePalette}
                onAddNode={(id) => alert(`Add node: ${id}`)}
                onCanvasSearch={(q) => console.log('search', q)}
                onCanvasSearchOptions={() => alert('Search options')}
                activeToolId={activeTool}
                onToolSelect={setActiveTool}
                zoom={zoom}
                onZoomChange={setZoomClamped}
              />
            )}
          </div>

          {showBroadcastHome && (
            <BroadcastHomePage
              broadcasts={BROADCASTS_BY_TAB[broadcastTab]}
              activeTab={broadcastTab}
              onTabChange={(tab) => {
                setBroadcastTab(tab);
                setBroadcastPage(1);
              }}
              searchValue={broadcastSearch}
              onSearchChange={setBroadcastSearch}
              onReport={() => alert('Download broadcast report')}
              onNewBroadcast={() => setBroadcastView('canvas')}
              onRowClick={openBroadcastInEditor}
              onRowDownload={(row) => alert(`Download report: ${row.name}`)}
              onRowCopy={(row) => alert(`Copy broadcast: ${row.name}`)}
              page={broadcastPage}
              totalPages={broadcastTab === 'triggered' ? 10 : 1}
              onPageChange={setBroadcastPage}
            />
          )}

          {showFlowsHome && (
            <FlowsHomePage
              flows={FLOWS_BY_TAB[flowTab]}
              activeTab={flowTab}
              onTabChange={(tab) => {
                setFlowTab(tab);
                setFlowPage(1);
              }}
              searchValue={flowSearch}
              onSearchChange={setFlowSearch}
              onReport={(type) =>
                alert(type === 'flow-report' ? 'Download flow report' : 'Download error log')
              }
              onNewFlow={() => setFlowsView('canvas')}
              onRowClick={openFlowInEditor}
              onRowDownload={(row) => alert(`Download report: ${row.name}`)}
              onRowCopy={(row) => alert(`Copy flow: ${row.name}`)}
              page={flowPage}
              totalPages={flowTab === 'active' ? 10 : 1}
              onPageChange={setFlowPage}
            />
          )}

          {showBotFlowsHome && (
            <BotFlowsHomePage
              flows={BOT_FLOWS_BY_TAB[botFlowTab]}
              activeTab={botFlowTab}
              onTabChange={(tab) => {
                setBotFlowTab(tab);
                setBotFlowPage(1);
              }}
              searchValue={botFlowSearch}
              onSearchChange={setBotFlowSearch}
              onNewFlow={() => setBotFlowsView('canvas')}
              onRowToggleActive={(row) =>
                alert(`${row.status === 'active' ? 'Deactivate' : 'Activate'} flow: ${row.name}`)
              }
              onRowClick={openBotFlowInEditor}
              onRowClone={(row) => alert(`Clone flow: ${row.name}`)}
              onRowDownload={(row) => alert(`Download flow: ${row.name}`)}
              onRowDelete={(row) => alert(`Delete flow: ${row.name}`)}
              page={botFlowPage}
              totalPages={botFlowTab === 'active' ? 10 : 1}
              onPageChange={setBotFlowPage}
            />
          )}

          {showSegmentsHome && (
            <SegmentsHomePage
              segments={SEGMENTS_BY_TAB[segmentTab]}
              activeTab={segmentTab}
              onTabChange={(tab) => {
                setSegmentTab(tab);
                setSegmentPage(1);
              }}
              searchValue={segmentSearch}
              onSearchChange={setSegmentSearch}
              onCreateSegment={() => alert('Create segment')}
              onRowEdit={(row) => alert(`Edit segment: ${row.name}`)}
              onRowClone={(row) => alert(`Clone segment: ${row.name}`)}
              onRowDownload={(row) => alert(`Download segment: ${row.name}`)}
              onRowDelete={(row) => alert(`Delete segment: ${row.name}`)}
              onRowRefresh={(row) => alert(`Refresh size: ${row.name}`)}
              page={segmentPage}
              totalPages={1}
              onPageChange={setSegmentPage}
            />
          )}

          {showTemplatesHome && (
            <TemplatesHomePage
              templates={TEMPLATES_BY_CHANNEL[templateChannel]}
              activeChannel={templateChannel}
              onChannelChange={(channel) => {
                setTemplateChannel(channel);
                setTemplatePage(1);
              }}
              searchValue={templateSearch}
              onSearchChange={setTemplateSearch}
              inboxFilter={templateInboxFilter}
              onInboxFilterChange={(v) => {
                setTemplateInboxFilter(v);
                setTemplatePage(1);
              }}
              typeFilter={templateTypeFilter}
              onTypeFilterChange={(v) => {
                setTemplateTypeFilter(v);
                setTemplatePage(1);
              }}
              categoryFilter={templateCategoryFilter}
              onCategoryFilterChange={(v) => {
                setTemplateCategoryFilter(v);
                setTemplatePage(1);
              }}
              onRefresh={() => alert('Refresh templates')}
              onDownloadReport={() => alert('Download template report')}
              onCreateTemplate={() => alert('Create template')}
              onRowEdit={(row) => alert(`Edit template: ${row.name}`)}
              onRowClone={(row) => alert(`Clone template: ${row.name}`)}
              onRowDelete={(row) => alert(`Delete template: ${row.name}`)}
              page={templatePage}
              totalPages={262}
              onPageChange={setTemplatePage}
            />
          )}

          {showSettingsHome && (
            <SettingsPage
              tabs={
                product === 'automation'
                  ? AUTOMATION_SETTINGS_TABS
                  : product === 'helpdesk'
                    ? HELPDESK_SETTINGS_TABS
                    : SETTINGS_TABS
              }
              activeTab={settingsTab}
              onTabChange={setSettingsTab}
              title={SETTINGS_COPY[settingsTab].title}
              description={SETTINGS_COPY[settingsTab].description}
              onWatchVideo={() => alert(`Play tutorial video: ${SETTINGS_COPY[settingsTab].title}`)}
              onViewDocs={() => alert(`Open docs: ${SETTINGS_COPY[settingsTab].title}`)}
              headerActions={
                settingsTab === 'bot-inbox-mapping' ? (
                  <Button
                    variant="filled"
                    color="primary"
                    size="sm"
                    style={{ width: 100 }}
                    loading={savingBotInboxMap}
                    onClick={() => {
                      setSavingBotInboxMap(true);
                      window.setTimeout(() => setSavingBotInboxMap(false), 700);
                    }}
                  >
                    Save
                  </Button>
                ) : settingsTab === 'bot-csat' ||
                    settingsTab === 'data-security' ||
                    settingsTab === 'hd-attribution' ||
                    settingsTab === 'ticket-assignment' ? (
                  <Button
                    variant="filled"
                    color="primary"
                    size="sm"
                    style={{ width: 100 }}
                    loading={savingHelpdeskSettings}
                    onClick={() => {
                      setSavingHelpdeskSettings(true);
                      window.setTimeout(() => setSavingHelpdeskSettings(false), 700);
                    }}
                  >
                    Save
                  </Button>
                ) : undefined
              }
            >
              {settingsTab === 'hd-integration' || settingsTab === 'integrations' ? (
                <IntegrationsHomePage
                  categories={INTEGRATION_CATEGORIES}
                  onPartnerClick={(id) => alert(`Connect ${id}`)}
                />
              ) : settingsTab === 'data-security' ? (
                <DataSecuritySettings
                  maskMessagePii={dsMaskMessagePii}
                  onMaskMessagePiiChange={setDsMaskMessagePii}
                  piiTypes={dsPiiTypes}
                  onPiiTypeChange={(key, next) =>
                    setDsPiiTypes((prev) => ({ ...prev, [key]: next }))
                  }
                  blockProfanity={dsBlockProfanity}
                  onBlockProfanityChange={setDsBlockProfanity}
                  profanityWords={dsProfanityWords}
                  onAddProfanityWord={(text) =>
                    setDsProfanityWords((prev) => [
                      ...prev,
                      { id: crypto.randomUUID(), text, matchType: 'whole' },
                    ])
                  }
                  onRemoveProfanityWord={(id) =>
                    setDsProfanityWords((prev) => prev.filter((w) => w.id !== id))
                  }
                  onProfanityMatchTypeChange={(id, matchType) =>
                    setDsProfanityWords((prev) =>
                      prev.map((w) => (w.id === id ? { ...w, matchType } : w)),
                    )
                  }
                />
              ) : settingsTab === 'hd-attribution' ? (
                <AttributionSettings
                  enabled={attrEnabled}
                  onEnabledChange={(key, next) =>
                    setAttrEnabled((prev) => ({ ...prev, [key]: next }))
                  }
                  windows={attrWindows}
                  onWindowChange={(key, field, value) =>
                    setAttrWindows((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], [field]: value },
                    }))
                  }
                />
              ) : settingsTab === 'bot-csat' ? (
                <BotCsatSettings
                  enabled={csatEnabled}
                  onEnabledChange={setCsatEnabled}
                  flows={csatFlows}
                  onFlowChange={(key, next) => setCsatFlows((prev) => ({ ...prev, [key]: next }))}
                  ratingScale={csatRatingScale}
                  onRatingScaleChange={setCsatRatingScale}
                  csatDelay={csatDelay}
                  onCsatDelayChange={(field, value) =>
                    setCsatDelay((prev) => ({ ...prev, [field]: value }))
                  }
                  reminderDelay={csatReminderDelay}
                  onReminderDelayChange={(field, value) =>
                    setCsatReminderDelay((prev) => ({ ...prev, [field]: value }))
                  }
                />
              ) : settingsTab === 'inboxes' ? (
                <InboxesTable
                  inboxes={visibleInboxes}
                  searchValue={inboxSearch}
                  onSearchChange={setInboxSearch}
                  syncing={inboxSyncing}
                  onSync={() => {
                    setInboxSyncing(true);
                    window.setTimeout(() => setInboxSyncing(false), 900);
                  }}
                />
              ) : settingsTab === 'bot-inbox-mapping' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                  {BOT_NAMES.map((bot, i) => (
                    <div
                      key={bot}
                      style={{
                        width: '100%',
                        maxWidth: 640,
                        padding: i === 0 ? '0 0 16px' : '16px 0',
                        borderTop: i === 0 ? 'none' : '1px solid #ececea',
                        borderBottom: i === BOT_NAMES.length - 1 ? '1px solid #ececea' : 'none',
                      }}
                    >
                      <TagsInput
                        label={bot}
                        labelIcon={<WhatsAppIcon />}
                        layout="horizontal"
                        placeholder="Enter inboxes"
                        searchPlaceholder="Search inboxes"
                        data={INBOX_NAMES}
                        value={botInboxMap[bot] ?? []}
                        onChange={(next) =>
                          setBotInboxMap((prev) => ({ ...prev, [bot]: next }))
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : undefined}
            </SettingsPage>
          )}

          {showTicketsHome && (
            <HelpdeskTicketsPage
              conversationAlign={selectedTicket?.channel === 'email' ? 'start' : 'end'}
              ticketsSection={
                <TicketsSection
                  status="Open"
                  onStatusClick={() => alert('Change ticket status filter')}
                  searchValue={ticketsSearch}
                  onSearchChange={setTicketsSearch}
                  onFilterClick={() => alert('Filter tickets')}
                  onTagsClick={() => alert('Filter by tags')}
                  dateRangeLabel="Last 7 days"
                  onDateRangeClick={() => alert('Change date range')}
                  inboxLabel="All inboxes"
                  onInboxClick={() => alert('Change inbox filter')}
                  tabs={[
                    { id: 'mine', label: 'Mine' },
                    { id: 'queued', label: 'Queued' },
                    { id: 'all', label: 'All' },
                  ]}
                  activeTab={ticketsTab}
                  onTabChange={setTicketsTab}
                  sortLabel={ticketsSort}
                  onSortChange={setTicketsSort}
                  onLoadMore={() => alert('Load more tickets')}
                >
                  {TICKETS.map((ticket) => (
                    <TicketListItem
                      key={ticket.id}
                      channel={ticket.channel}
                      user={ticket.user}
                      avatars={
                        ticket.avatarCount
                          ? Array.from({ length: Math.min(ticket.avatarCount, 3) }, () => ({}))
                          : undefined
                      }
                      avatarOverflow={ticket.avatarCount && ticket.avatarCount > 3 ? ticket.avatarCount - 3 : undefined}
                      isNew={ticket.isNew}
                      timestamp={ticket.timestamp}
                      message={ticket.message}
                      assignee={ticketsTab === 'mine' ? undefined : ticket.assignee}
                      unreadCount={ticket.unreadCount}
                      selected={selectedTicketId === ticket.id}
                      showCheckbox={false}
                      onSelect={() => alert(`Select ticket: ${ticket.user}`)}
                      onSelectAll={() => alert('Select all tickets')}
                      onMarkAsStarred={() => alert(`Mark as starred: ${ticket.user}`)}
                      onClick={() => setSelectedTicketId(ticket.id)}
                    />
                  ))}
                </TicketsSection>
              }
              conversationTopBar={
                <ConversationTopBar
                  name={selectedTicket?.user ?? ''}
                  channel={selectedTicket?.channel}
                  isNew={selectedTicket?.isNew}
                  phone={selectedTicket?.phone}
                  inboxName="Inbox name"
                  callAvailable={selectedTicket?.channel === 'whatsapp'}
                  onCall={() => alert('Start voice call')}
                  onResolve={() => alert('Resolve ticket')}
                  resolveLabel={resolveStatus}
                  onResolveStatusChange={setResolveStatus}
                  onStarTicket={() => alert('Star mark ticket')}
                  onMuteTicket={() => alert('Mute ticket notifications')}
                />
              }
              conversation={
                selectedTicketId === 't-showcase' ? (
                  SHOWCASE_MESSAGES.map(({ id, ...msg }) => <MessageBubble key={id} {...msg} />)
                ) : selectedTicket?.channel === 'email' ? (
                  (EMAIL_THREADS[selectedTicketId] ?? []).map((email) => (
                    <EmailMessage
                      key={email.id}
                      senderName={email.senderName}
                      senderEmail={email.senderEmail}
                      date={email.date}
                      badgeLabel={email.badgeLabel}
                      preview={email.preview}
                      body={email.body}
                      defaultExpanded={email.defaultExpanded}
                      onMoreActions={() => alert(`More actions: ${email.senderName}`)}
                    />
                  ))
                ) : (
                  (CONVERSATIONS[selectedTicketId] ?? []).map((entry) => (
                    <MessageBubble
                      key={entry.id}
                      side={entry.side}
                      time={entry.time}
                      status="read"
                      variant={entry.quote ? 'quote' : 'text'}
                      quote={entry.quote}
                      avatar={entry.side === 'agent'}
                      avatarInitial={selectedTicket?.assignee?.charAt(0) ?? 'A'}
                    >
                      {entry.text}
                    </MessageBubble>
                  ))
                )
              }
              composer={
                selectedTicket?.channel === 'email' ? (
                  emailComposerAction === 'reply' ? (
                    <EmailForwardComposer
                      mode="reply"
                      to={[selectedTicket.user.toLowerCase().replace(' ', '.') + '@example.com']}
                      cc={replyCc}
                      bcc={replyBcc}
                      onAddRecipient={(field, email) => {
                        if (field === 'cc') setReplyCc((v) => [...v, email]);
                        if (field === 'bcc') setReplyBcc((v) => [...v, email]);
                      }}
                      onRemoveRecipient={(field, email) => {
                        if (field === 'cc') setReplyCc((v) => v.filter((e) => e !== email));
                        if (field === 'bcc') setReplyBcc((v) => v.filter((e) => e !== email));
                      }}
                      value={composerDraft}
                      onChange={setComposerDraft}
                      onToggleAi={() => alert('Toggle AI assist')}
                      onDelete={() => {
                        setComposerDraft('');
                        setEmailComposerAction(null);
                      }}
                      onSend={() => {
                        setComposerDraft('');
                        setEmailComposerAction(null);
                      }}
                    />
                  ) : emailComposerAction === 'forward' ? (
                    <EmailForwardComposer
                      mode="forward"
                      to={forwardTo}
                      cc={forwardCc}
                      bcc={forwardBcc}
                      onAddRecipient={(field, email) => {
                        if (field === 'to') setForwardTo((v) => [...v, email]);
                        if (field === 'cc') setForwardCc((v) => [...v, email]);
                        if (field === 'bcc') setForwardBcc((v) => [...v, email]);
                      }}
                      onRemoveRecipient={(field, email) => {
                        if (field === 'to') setForwardTo((v) => v.filter((e) => e !== email));
                        if (field === 'cc') setForwardCc((v) => v.filter((e) => e !== email));
                        if (field === 'bcc') setForwardBcc((v) => v.filter((e) => e !== email));
                      }}
                      value={composerDraft}
                      onChange={setComposerDraft}
                      onToggleAi={() => alert('Toggle AI assist')}
                      onDelete={() => {
                        setComposerDraft('');
                        setEmailComposerAction(null);
                      }}
                      onSend={() => {
                        setComposerDraft('');
                        setEmailComposerAction(null);
                      }}
                    />
                  ) : (
                    <EmailComposerBar
                      onMerge={() => alert('Merge ticket')}
                      onNotes={() => alert('Open private notes')}
                      onReply={() => setEmailComposerAction('reply')}
                      onForward={() => setEmailComposerAction('forward')}
                    />
                  )
                ) : (
                  <TicketComposer
                    mode={composerMode}
                    onModeChange={setComposerMode}
                    value={composerDraft}
                    onChange={setComposerDraft}
                    sendLabel={composerMode === 'template' ? 'Send' : undefined}
                    onSend={() => setComposerDraft('')}
                    onMic={() => alert('Record voice note')}
                    onAttach={() => alert('Attach file')}
                    onEmoji={() => alert('Insert emoji')}
                  />
                )
              }
              detailsPanel={
                <TicketDetailsPanel
                  tabs={['Overview', 'Orders', 'Products', 'Cart']}
                  activeTab={detailsTab}
                  onTabChange={setDetailsTab}
                  ticketId={selectedTicket?.ticketId ?? ''}
                  agent={{ value: ticketAgent, options: ['John Adams', 'Jane Doe', 'Marcus Lee'], onChange: setTicketAgent }}
                  team={{ value: ticketTeam, options: ['Marketing', 'Support', 'Sales'], onChange: setTicketTeam }}
                  sections={TICKET_DETAIL_SECTIONS}
                />
              }
            />
          )}

          {!showCanvas && !showBroadcastHome && !showFlowsHome && !showBotFlowsHome && !showSegmentsHome && !showTemplatesHome && !showSettingsHome && !showTicketsHome && (
            <div style={{ padding: 24 }}>
                <h1 style={{ marginTop: 0 }}>LimeChat App Shell</h1>
                <p>Reusable rail navigation + top bar from the LimeChat Design System V3.</p>
                <p style={{ color: '#57534e' }}>
                  Product: <strong>{product}</strong> · nav item: <strong>{selected}</strong> —
                  open <strong>Flows</strong> in Marketing or Automation from the rail to see the
                  flow-builder canvas chrome.
                </p>
            </div>
          )}
          </>
          )}
        </main>
      </div>

      <PublishFlowModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title={selected === 'broadcast' ? 'Publish broadcast' : undefined}
        description={
          selected === 'broadcast'
            ? 'Verify all details of the flow before publishing this broadcast'
            : undefined
        }
        submitLabel={selected === 'broadcast' ? 'Publish Broadcast' : undefined}
        retryOptions={['Immediately', 'After 30 minutes', 'After 1 hour', 'After 3 hours']}
        onPublish={(v) => {
          console.log('publish', v);
          setPublishOpen(false);
        }}
      />

      <PublishConfirmModal
        open={publishConfirmOpen}
        onClose={() => setPublishConfirmOpen(false)}
        audience={broadcastAudience}
        schedule={broadcastSchedule}
        onEditAudience={() => {
          setPublishConfirmOpen(false);
          setSegmentModalOpen(true);
        }}
        onEditSchedule={() => {
          setPublishConfirmOpen(false);
          setScheduleOpen(true);
        }}
        onConfirm={() => {
          console.log('publish broadcast', curFlow);
          setPublishConfirmOpen(false);
          alert('Broadcast published');
        }}
      />

      <FlowDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={flowKey === 'broadcast' ? 'Broadcast details' : 'Flow details'}
        defaults={{ name: curFlow.name, flowId: curFlow.id, active: curFlow.active }}
        onCopyFlowId={(id) => navigator.clipboard?.writeText(id)}
        onActiveChange={(active) =>
          setFlows((f) => ({ ...f, [flowKey]: { ...f[flowKey], active } }))
        }
        onSave={(v) => {
          setFlows((f) => ({
            ...f,
            [flowKey]: { ...f[flowKey], name: v.name, active: v.active },
          }));
          setDetailsOpen(false);
        }}
      />

      <ScheduleBroadcastModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        defaults={{ mode: 'later', date: '2026-09-14', time: '10:30' }}
        onEditQuietHours={() => alert('Edit quiet hours')}
        onSetSchedule={(v) => {
          console.log('schedule broadcast', v);
          setScheduleOpen(false);
        }}
      />

      <VisualizeFlowModal
        open={visualizeOpen}
        onClose={() => setVisualizeOpen(false)}
        onSend={(v) => {
          console.log('visualize flow send', v);
          setVisualizeOpen(false);
        }}
      />

      <SelectUserSegmentModal
        open={segmentModalOpen}
        onClose={() => setSegmentModalOpen(false)}
        segments={DEMO_USER_SEGMENTS}
        onSave={(selections) => {
          console.log('segment selections', selections);
          setSegmentModalOpen(false);
        }}
      />
    </div>
  );
}
