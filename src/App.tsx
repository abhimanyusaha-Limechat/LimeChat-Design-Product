/** Demo harness for the reusable components. Not part of the published components. */
import { Fragment, memo, useCallback, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { sidebarPresets, type SidebarProduct } from './components/Sidebar/presets';
import { isCanvasPage, useAppNavigation } from './hooks/useAppNavigation';
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
import { SelectUserSegmentModal } from './components/SelectUserSegmentModal';
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
import { SettingsPage } from './components/SettingsPage';
import { InboxesTable } from './components/InboxesTable';
import { BotTemplatesTable, type BotTemplateRow } from './components/BotTemplatesTable';
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
} from './components/IntegrationsHomePage';
import { TagsInput } from './components/TagsInput';
import { Button } from './components/Button';
import { TicketListItem } from './components/TicketListItem';
import { HelpdeskTicketsPage } from './components/HelpdeskTicketsPage';
import { TicketsSection } from './components/TicketsSection';
import { TicketsBulkModifyModal } from './components/TicketsBulkModifyModal';
import { ConversationTopBar } from './components/ConversationTopBar';
import { MessageBubble, MessageDateDivider, type ReactionData } from './components/MessageBubble';
import { type MenuItemData } from './components/Menu';
import { TicketComposer, type TicketComposerMode } from './components/TicketComposer';
import { EmailMessage, EmailComposerBar, EmailForwardComposer } from './components/EmailMessage';
import { TicketDetailsPanel } from './components/TicketDetailsPanel';

import { AGENT_INBOXES, BOT_TEMPLATE_INDUSTRIES, CUSTOM_FIELD_TYPES, DEMO_AGENTS, DEMO_BOT_TEMPLATES, DEMO_CANNED, DEMO_CANNED_LIBRARY, DEMO_COLLABORATORS, DEMO_CONTACT_FIELDS, DEMO_CONVERSATION_FIELDS, DEMO_INBOXES, DEMO_INDUSTRIES, DEMO_KB_FILES, DEMO_RULES, DEMO_RULE_LIBRARY, DEMO_SLA, DEMO_SLA_LIBRARY, DEMO_TEAMS, DEMO_USE_CASES, DEMO_VARIABLES, HELPDESK_ADD_CTA, INBOX_NAMES, INDUSTRY_TABS, INTEGRATION_CATEGORIES, KB_COPY, KB_SOURCE_TABS, KB_TABS, LIST_PAGE_TABS, PEOPLE_VARIANT, SEARCH_PLACEHOLDER, SETTINGS_COPY, SETTINGS_TABS_BY_PRODUCT, USER_SETTINGS_COPY, USER_SETTINGS_TABS, USE_CASE_CATEGORIES, VARIABLE_DATA_TYPES, VARIABLE_SCOPES, withFieldMeta } from './data/settingsDemo';
import { DEMO_BROADCASTS, DEMO_DRAFT_BROADCASTS, DEMO_SCHEDULED_BROADCASTS } from './data/broadcastDemo';
import { DEMO_BOT_FLOWS_ACTIVE, DEMO_BOT_FLOWS_INACTIVE, DEMO_FLOWS_ACTIVE, DEMO_FLOWS_DRAFT, DEMO_FLOWS_INACTIVE } from './data/flowsDemo';
import { DEMO_SEGMENTS, DEMO_USER_SEGMENTS } from './data/segmentsDemo';
import { DEMO_TEMPLATES } from './data/templatesDemo';
import { CONVERSATIONS, ConversationEntry, EMAIL_THREADS, SHOWCASE_MESSAGES, TICKETS, TICKET_DETAIL_SECTIONS } from './data/ticketsDemo';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
    <path d="M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 -1 0" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const PRODUCTS: { id: SidebarProduct; label: string }[] = [
  { id: 'helpdesk', label: 'Helpdesk' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'automation', label: 'Automation' },
];

const DATE_CHIP_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
/** e.g. '2026-09-20' -> 'September 20, 2026'. */
const formatDateChip = (isoDate: string) => DATE_CHIP_FORMATTER.format(new Date(`${isoDate}T00:00:00`));

/**
 * One conversation row (date divider + bubble), memoized so reacting to one message
 * doesn't re-render every other message in the thread — `onReact` takes the reaction key
 * so the callback identity stays stable across renders instead of being re-created per row.
 */
const ConversationMessageRow = memo(function ConversationMessageRow({
  entry,
  isFirst,
  showDateDivider,
  groupedWithPrevious,
  avatarInitial,
  reactionKey,
  reaction,
  onReact,
  onMenuAction,
}: {
  entry: ConversationEntry;
  isFirst: boolean;
  showDateDivider: boolean;
  /** Same side as the previous message, with no date divider between them — sits closer to
   * it than a sender change would. Computed here rather than left to `MessageBubble`'s own
   * CSS (which keys off DOM adjacency) because Virtuoso renders each row in its own wrapper,
   * so consecutive bubbles are no longer literal DOM siblings. */
  groupedWithPrevious: boolean;
  avatarInitial: string;
  reactionKey: string;
  reaction?: ReactionData;
  onReact: (reactionKey: string, emoji: string) => void;
  onMenuAction: (action: 'reply' | 'forward' | 'copy' | 'delete', entry: ConversationEntry) => void;
}) {
  const marginTop = isFirst || showDateDivider ? 0 : groupedWithPrevious ? 3 : 14;
  // Built here (not passed down as a prop) so its array identity only changes when `entry`
  // or `onMenuAction` actually change — keeping it a parent-supplied prop would hand this
  // memoized row a fresh array on every render, defeating the memoization.
  const menuItems: MenuItemData[] = useMemo(
    () => [
      { key: 'reply', label: 'Reply', onClick: () => onMenuAction('reply', entry) },
      { key: 'forward', label: 'Forward', onClick: () => onMenuAction('forward', entry) },
      { key: 'copy', label: 'Copy text', onClick: () => onMenuAction('copy', entry) },
      { key: 'delete', label: 'Delete', danger: true, onClick: () => onMenuAction('delete', entry) },
    ],
    [entry, onMenuAction],
  );
  return (
    <Fragment>
      {showDateDivider && (
        // The divider is always the *first* DOM child of its own Virtuoso item wrapper (even
        // when it isn't the first divider in the conversation), so `.lc-message-bubble__date-
        // divider:first-child`'s zero margin-top fires unconditionally — override it explicitly
        // for every divider after the very first message.
        <MessageDateDivider label={formatDateChip(entry.date)} style={{ marginTop: isFirst ? 0 : 18 }} />
      )}
      <MessageBubble
        side={entry.side}
        time={entry.time}
        status="read"
        variant={entry.quote ? 'quote' : 'text'}
        quote={entry.quote}
        avatar={entry.side === 'agent'}
        avatarInitial={avatarInitial}
        reaction={reaction}
        onReact={(emoji) => onReact(reactionKey, emoji)}
        menuItems={menuItems}
        style={{ marginTop }}
      >
        {entry.text}
      </MessageBubble>
    </Fragment>
  );
});

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
  const nav = useAppNavigation();
  const { product, selected, page, settingsTab, manageIndustries, userSettingsTab } = nav;
  const { switchProduct, leaveCanvas, openCanvas, setSettingsTab, setManageIndustries, setUserSettingsTab } = nav;
  const preset = sidebarPresets[product];
  // Account/Profile settings reached from the avatar popover — a dedicated
  // page with just those two tabs, separate from the product's own (much
  // longer) Settings nav.
  const userSettingsOpen = page === 'user-settings';

  const account = { name: 'Nonucare12', compact: true };
  const selectedLabel = preset.items.find((i) => i.id === selected)?.label ?? selected;

  const [kbTab, setKbTab] = useState('upload-files');
  const [kbSource, setKbSource] = useState('doc');
  const showCanvas = isCanvasPage(page);

  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxSyncing, setInboxSyncing] = useState(false);
  const visibleInboxes = DEMO_INBOXES.filter(
    (row) =>
      row.id.includes(inboxSearch.trim()) ||
      row.name.toLowerCase().includes(inboxSearch.trim().toLowerCase()),
  );

  const [variableScope, setVariableScope] = useState('system');
  // Sub-page of Bot templates; mirrors the Variable page until it gets its own content.
  const [industryTab, setIndustryTab] = useState('industries');
  const [useCaseCategory, setUseCaseCategory] = useState('all');
  const [variableDataType, setVariableDataType] = useState('all');
  const [botTemplateSearch, setBotTemplateSearch] = useState('');
  const [botTemplateType, setBotTemplateType] = useState('all');
  const [botTemplateIndustry, setBotTemplateIndustry] = useState('all');
  // Collaborators, Agents, Teams, Automation rules and Canned responses share one table; PEOPLE_VARIANT maps each tab to its variant.
  const peopleVariant = PEOPLE_VARIANT[settingsTab];
  const isPeopleTab = peopleVariant !== undefined;
  // Active segmented tab per list page.
  const [listTabs, setListTabs] = useState<Record<string, string>>({});
  const pageTabs = LIST_PAGE_TABS[settingsTab];
  const listTab = listTabs[settingsTab] ?? pageTabs?.[0].id;
  const [switchOn, setSwitchOn] = useState<Record<string, boolean>>({});
  const [agentRole, setAgentRole] = useState('all');
  // The Inbox dropdown is shared by Agents and Custom fields.
  const [agentInbox, setAgentInbox] = useState('all');
  const [fieldType, setFieldType] = useState('all');
  const withSwitches = (rows: BotTemplateRow[]) => rows.map((r) => ({ ...r, enabled: switchOn[r.id] ?? r.enabled }));
  const peopleRows: Record<string, BotTemplateRow[]> = {
    collaborators: DEMO_COLLABORATORS,
    agents: DEMO_AGENTS,
    teams: DEMO_TEAMS,
    'automation-rules': withSwitches(listTab === 'library' ? DEMO_RULE_LIBRARY : DEMO_RULES),
    'canned-responses': listTab === 'library' ? DEMO_CANNED_LIBRARY : DEMO_CANNED,
    'sla-rules': withSwitches(listTab === 'library' ? DEMO_SLA_LIBRARY : DEMO_SLA),
    'custom-fields': withFieldMeta(withSwitches(listTab === 'contact' ? DEMO_CONTACT_FIELDS : DEMO_CONVERSATION_FIELDS)),
  };
  const visibleCollaborators = (peopleRows[settingsTab] ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(botTemplateSearch.trim().toLowerCase()) &&
      (settingsTab !== 'agents' || agentRole === 'all' || c.role === agentRole) &&
      (settingsTab !== 'custom-fields' || fieldType === 'all' || c.kind === fieldType) &&
      ((settingsTab !== 'agents' && settingsTab !== 'custom-fields') ||
        agentInbox === 'all' ||
        c.inboxes?.some((i) => i.name === agentInbox)),
  );
  const visibleKbFiles = (DEMO_KB_FILES[kbSource] ?? [])
    .filter((r) => r.name.toLowerCase().includes(botTemplateSearch.trim().toLowerCase()))
    .map((r) => ({
      ...r,
      format:
        kbSource === 'url' || kbSource === 'domain'
          ? new URL(r.name).hostname.replace(/^www\./, '')
          : r.name.includes('.')
            ? r.name.split('.').pop()?.toUpperCase()
            : undefined,
    }));
  const visibleVariables = DEMO_VARIABLES.filter(
    (v) =>
      (variableDataType === 'all' || v.dataType === variableDataType) &&
      v.name.toLowerCase().includes(botTemplateSearch.trim().toLowerCase()),
  );
  const visibleBotTemplates = DEMO_BOT_TEMPLATES.filter(
    (t) =>
      (botTemplateType === 'all' || t.type === botTemplateType) &&
      (botTemplateIndustry === 'all' || t.industries.includes(botTemplateIndustry)) &&
      t.name.toLowerCase().includes(botTemplateSearch.trim().toLowerCase()),
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
  const [ticketReactions, setTicketReactions] = useState<Record<string, ReactionData>>({});
  const handleTicketReact = useCallback((reactionKey: string, emoji: string) => {
    setTicketReactions((prev) => {
      const next = { ...prev };
      if (prev[reactionKey]?.emoji === emoji) delete next[reactionKey];
      else next[reactionKey] = { emoji };
      return next;
    });
  }, []);
  const handleMessageMenuAction = useCallback((action: 'reply' | 'forward' | 'copy' | 'delete', entry: ConversationEntry) => {
    if (action === 'copy') {
      navigator.clipboard?.writeText(entry.text);
      return;
    }
    alert(`${action[0].toUpperCase()}${action.slice(1)} message: "${entry.text}"`);
  }, []);
  const [ticketsTab, setTicketsTab] = useState('queued');
  const [ticketsSearch, setTicketsSearch] = useState('');
  const [ticketsSort, setTicketsSort] = useState('Newly created');
  const [ticketsStatus, setTicketsStatus] = useState('Open');
  const [ticketsSelectedInboxes, setTicketsSelectedInboxes] = useState<string[]>([]);
  const [ticketsSelectMode, setTicketsSelectMode] = useState(false);
  const [checkedTicketIds, setCheckedTicketIds] = useState<Set<string>>(new Set());
  const setCheckedTicketIdsAndExit = (next: Set<string>) => {
    setCheckedTicketIds(next);
    if (next.size === 0) setTicketsSelectMode(false);
  };
  const [ticketsBulkModifyOpen, setTicketsBulkModifyOpen] = useState(false);
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
  const broadcastTriggered =
    selected === 'broadcast' && (broadcastStatus === 'sending' || broadcastStatus === 'completed');
  const [flowStatus, setFlowStatus] = useState<FlowRowData['status']>('active');
  const flowIsCampaign = selected === 'automation-flows' && flowStatus !== 'draft';
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
    openCanvas('broadcast');
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
    openCanvas('flows');
  };

  // Opens a bot-flow row in the flow-builder canvas, carrying its name/status
  // over so the editor reflects that row.
  const openBotFlowInEditor = (row: BotFlowRowData) => {
    setFlows((f) => ({
      ...f,
      automation: { ...f.automation, name: row.name, active: row.status === 'active' },
    }));
    setBotFlowStatus(row.status);
    openCanvas('bot-flows');
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
        onSelect={nav.select}
        profile={{
          name: 'Aditi Rao',
          menuItems: [
            {
              id: 'profile-settings',
              label: 'Profile settings',
              icon: 'user',
              onClick: () => {
                nav.openUserSettings('profile');
              },
            },
            {
              id: 'account-settings',
              label: 'Account Settings',
              icon: 'settings',
              onClick: () => {
                nav.openUserSettings('account');
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
                    { label: selected === 'broadcast' ? 'Broadcast' : 'Flows', onClick: leaveCanvas },
                    { label: curFlow.id, copyable: true },
                  ]
                : page === 'tickets'
                  ? [{ label: 'Tickets' }, { label: selectedTicket?.ticketId ?? '', copyable: true }]
                  : page === 'settings'
                    ? [
                        {
                          label: selectedLabel,
                          onClick: () => setSettingsTab('inboxes'),
                        },
                        {
                          label: SETTINGS_COPY[settingsTab].title,
                          onClick: () => setManageIndustries(false),
                        },
                        ...(manageIndustries ? [{ label: 'Manage industries' }] : []),
                      ]
                    : page === 'knowledge-base'
                      ? [
                          { label: selectedLabel, onClick: () => setKbTab('upload-files') },
                          { label: KB_COPY[kbTab].title },
                        ]
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
              ? 'radial-gradient(circle, #D9D9D9 1px, transparent 1px) 0 0 / 20px 20px, #FAF9F5'
              : '#F5F5F5',
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
                  simpleReport: broadcastTriggered || flowIsCampaign,
                  dateRange: flowIsCampaign ? 'January 14, 2023 - January 14, 2023' : undefined,
                  saveLabel: flowIsCampaign ? 'Draft' : undefined,
                  omitActions:
                    selected === 'broadcast'
                      ? broadcastTriggered
                        ? ['save', 'publish']
                        : ['reports', 'save']
                      : selected === 'automation-flows' && flowStatus === 'draft'
                        ? ['reports']
                        : undefined,
                  onTest:
                    selected === 'broadcast' && !broadcastTriggered
                      ? () => setVisualizeOpen(true)
                      : undefined,
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
                  onBack: leaveCanvas,
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
                showHistory={selected !== 'automation-flows' && selected !== 'broadcast'}
                onUndo={() => console.log('undo')}
                onRedo={() => console.log('redo')}
              />
            )}

            {showCanvas && product === 'automation' && (
              <CanvasChrome
                {...automationCanvas({
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
                  onBack: leaveCanvas,
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

          {page === 'broadcast-list' && (
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
              onNewBroadcast={() => openCanvas('broadcast')}
              onRowClick={openBroadcastInEditor}
              onRowDownload={(row) => alert(`Download report: ${row.name}`)}
              onRowCopy={(row) => alert(`Copy broadcast: ${row.name}`)}
              page={broadcastPage}
              totalPages={broadcastTab === 'triggered' ? 10 : 1}
              onPageChange={setBroadcastPage}
            />
          )}

          {page === 'flows-list' && (
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
              onNewFlow={() => openCanvas('flows')}
              onRowClick={openFlowInEditor}
              onRowDownload={(row) => alert(`Download report: ${row.name}`)}
              onRowCopy={(row) => alert(`Copy flow: ${row.name}`)}
              page={flowPage}
              totalPages={flowTab === 'active' ? 10 : 1}
              onPageChange={setFlowPage}
            />
          )}

          {page === 'bot-flows-list' && (
            <BotFlowsHomePage
              flows={BOT_FLOWS_BY_TAB[botFlowTab]}
              activeTab={botFlowTab}
              onTabChange={(tab) => {
                setBotFlowTab(tab);
                setBotFlowPage(1);
              }}
              searchValue={botFlowSearch}
              onSearchChange={setBotFlowSearch}
              onNewFlow={() => openCanvas('bot-flows')}
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

          {page === 'segments' && (
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

          {page === 'templates' && (
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

          {page === 'knowledge-base' && (
            <SettingsPage
              tabs={KB_TABS}
              activeTab={kbTab}
              onTabChange={setKbTab}
              title={KB_COPY[kbTab].title}
              description={KB_COPY[kbTab].description}
              onWatchVideo={() => alert(`Play tutorial video: ${KB_COPY[kbTab].title}`)}
              onViewDocs={() => alert(`Open docs: ${KB_COPY[kbTab].title}`)}
            >
              {kbTab === 'manage' && (
                <BotTemplatesTable
                  variant="files"
                  webSource={kbSource === 'url' || kbSource === 'domain' ? kbSource : undefined}
                  tabs={KB_SOURCE_TABS}
                  activeTab={kbSource}
                  onTabChange={setKbSource}
                  templates={visibleKbFiles}
                  searchValue={botTemplateSearch}
                  onSearchChange={setBotTemplateSearch}
                  searchPlaceholder={`Search for ${KB_SOURCE_TABS.find((t) => t.id === kbSource)?.label ?? ''}`}
                  hideFilters
                  onViewDetails={(row) => alert(`View details: ${row.name}`)}
                  onRowEdit={(row) => alert(`Edit template: ${row.name}`)}
                  onRowClone={(row) => alert(`Clone template: ${row.name}`)}
                  onRowDelete={(row) => alert(`Delete template: ${row.name}`)}
                />
              )}
            </SettingsPage>
          )}

          {page === 'settings' && (
            <SettingsPage
              tabs={SETTINGS_TABS_BY_PRODUCT[product]}
              activeTab={settingsTab}
              onTabChange={setSettingsTab}
              title={manageIndustries ? 'Manage industries' : SETTINGS_COPY[settingsTab].title}
              description={manageIndustries ? SETTINGS_COPY.variable.description : SETTINGS_COPY[settingsTab].description}
              contentPadding={settingsTab === 'custom-fields' ? 20 : undefined}
              onWatchVideo={() => alert(`Play tutorial video: ${SETTINGS_COPY[settingsTab].title}`)}
              onViewDocs={() => alert(`Open docs: ${SETTINGS_COPY[settingsTab].title}`)}
              headerActions={
                manageIndustries ? (
                  <>
                    <Button variant="default" size="sm" onClick={() => setManageIndustries(false)}>
                      Back to Bot templates
                    </Button>
                    <Button
                      variant="filled"
                      color="primary"
                      size="sm"
                      leftSection={<PlusIcon />}
                      onClick={() => alert(industryTab === 'use-cases' ? 'New use case' : 'New industry')}
                    >
                      {industryTab === 'use-cases' ? 'Use cases' : 'Industries'}
                    </Button>
                  </>
                ) : settingsTab === 'bot-templates' ? (
                  <>
                    <Button variant="default" size="sm" onClick={() => setManageIndustries(true)}>
                      Manage industries
                    </Button>
                    <Button
                      variant="filled"
                      color="primary"
                      size="sm"
                      leftSection={<PlusIcon />}
                      onClick={() => alert('New template')}
                    >
                      Template
                    </Button>
                  </>
                ) : product === 'helpdesk' && HELPDESK_ADD_CTA[settingsTab] ? (
                  <Button
                    variant="filled"
                    color="primary"
                    size="sm"
                    leftSection={<PlusIcon />}
                    onClick={() => alert(`New ${HELPDESK_ADD_CTA[settingsTab].toLowerCase()}`)}
                  >
                    {HELPDESK_ADD_CTA[settingsTab]}
                  </Button>
                ) : settingsTab === 'variable' ? (
                  <Button
                    variant="filled"
                    color="primary"
                    size="sm"
                    leftSection={<PlusIcon />}
                    onClick={() => alert('New variable')}
                  >
                    Variables
                  </Button>
                ) : settingsTab === 'bot-inbox-mapping' ? (
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
                  onRowEdit={(row) => alert(`Edit inbox: ${row.name}`)}
                  onRowDelete={(row) => alert(`Delete inbox: ${row.name}`)}
                  onSync={
                    product === 'helpdesk'
                      ? undefined
                      : () => {
                          setInboxSyncing(true);
                          window.setTimeout(() => setInboxSyncing(false), 900);
                        }
                  }
                />
              ) : settingsTab === 'bot-templates' || settingsTab === 'variable' || isPeopleTab ? (
                <BotTemplatesTable
                  variant={manageIndustries ? 'industries' : settingsTab === 'variable' ? 'variables' : (peopleVariant ?? 'templates')}
                  searchPlaceholder={SEARCH_PLACEHOLDER[manageIndustries ? 'variable' : settingsTab]}
                  hideFilters={isPeopleTab || manageIndustries}
                  hideSearch={manageIndustries}
                  iconActions={manageIndustries}
                  showUseCases={industryTab === 'industries'}
                  chipFilter={
                    manageIndustries && industryTab === 'use-cases'
                      ? { options: USE_CASE_CATEGORIES, value: useCaseCategory, onChange: setUseCaseCategory }
                      : undefined
                  }
                  onToggleRow={(row) => setSwitchOn((prev) => ({ ...prev, [row.id]: !row.enabled }))}
                  onInvite={settingsTab === 'collaborators' ? () => alert('Invite collaborator') : undefined}
                  selects={
                    settingsTab === 'agents' || settingsTab === 'custom-fields'
                      ? [
                          settingsTab === 'agents'
                            ? {
                                ariaLabel: 'Filter by role',
                                options: [{ value: 'all', label: 'Role' }, ...['Admin', 'Editor', 'Viewer'].map((r) => ({ value: r, label: r }))],
                                value: agentRole,
                                onChange: setAgentRole,
                              }
                            : {
                                ariaLabel: 'Filter by type',
                                options: [{ value: 'all', label: 'Type' }, ...CUSTOM_FIELD_TYPES.map((t) => ({ value: t, label: t }))],
                                value: fieldType,
                                onChange: setFieldType,
                              },
                          {
                            ariaLabel: 'Filter by inbox',
                            options: [{ value: 'all', label: 'Inbox' }, ...AGENT_INBOXES.map((i) => ({ value: i.name, label: i.name }))],
                            value: agentInbox,
                            onChange: setAgentInbox,
                          },
                        ]
                      : undefined
                  }
                  {...(pageTabs
                    ? { tabs: pageTabs, activeTab: listTab, onTabChange: (id: string) => setListTabs((prev) => ({ ...prev, [settingsTab]: id })) }
                    : (settingsTab === 'variable' || manageIndustries) && {
                        tabs: manageIndustries ? INDUSTRY_TABS : VARIABLE_SCOPES,
                        activeTab: manageIndustries ? industryTab : variableScope,
                        onTabChange: manageIndustries ? setIndustryTab : setVariableScope,
                      })}
                  templates={manageIndustries
                    ? industryTab === 'use-cases'
                      ? DEMO_USE_CASES.filter((u) => useCaseCategory === 'all' || u.industries.includes(useCaseCategory))
                      : DEMO_INDUSTRIES
                    : settingsTab === 'variable'
                      ? visibleVariables
                      : isPeopleTab
                        ? visibleCollaborators
                        : visibleBotTemplates}
                  searchValue={botTemplateSearch}
                  onSearchChange={setBotTemplateSearch}
                  typeFilter={botTemplateType}
                  onTypeFilterChange={setBotTemplateType}
                  industryFilter={botTemplateIndustry}
                  onIndustryFilterChange={setBotTemplateIndustry}
                  industries={BOT_TEMPLATE_INDUSTRIES}
                  dataTypes={VARIABLE_DATA_TYPES}
                  dataTypeFilter={variableDataType}
                  onDataTypeFilterChange={setVariableDataType}
                  onAccountFilterClick={() => alert('Filter by account')}
                  onRowEdit={(row) => alert(`Edit template: ${row.name}`)}
                  onRowClone={(row) => alert(`Clone template: ${row.name}`)}
                  onRowDelete={(row) => alert(`Delete template: ${row.name}`)}
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
                        borderTop: i === 0 ? 'none' : '1px solid #F0F0F0',
                        borderBottom: i === BOT_NAMES.length - 1 ? '1px solid #F0F0F0' : 'none',
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

          {page === 'tickets' && (
            <HelpdeskTicketsPage
              conversationAlign={selectedTicket?.channel === 'email' ? 'start' : 'end'}
              ticketsSection={
                <TicketsSection
                  status={ticketsStatus}
                  onStatusChange={setTicketsStatus}
                  searchValue={ticketsSearch}
                  onSearchChange={setTicketsSearch}
                  onFilterClick={() => alert('Filter tickets')}
                  onTagsClick={() => alert('Filter by tags')}
                  dateRangeLabel="Last 7 days"
                  onDateRangeClick={() => alert('Change date range')}
                  inboxLabel={
                    ticketsSelectedInboxes.length === 0
                      ? 'All inboxes'
                      : ticketsSelectedInboxes.length === 1
                        ? ticketsSelectedInboxes[0]
                        : `${ticketsSelectedInboxes.length} inboxes`
                  }
                  inboxOptions={INBOX_NAMES}
                  selectedInboxes={ticketsSelectedInboxes}
                  onSelectedInboxesChange={setTicketsSelectedInboxes}
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
                  selectedCount={ticketsSelectMode ? checkedTicketIds.size : undefined}
                  allSelected={checkedTicketIds.size === TICKETS.length}
                  onSelectAllChange={(checked) =>
                    setCheckedTicketIdsAndExit(checked ? new Set(TICKETS.map((t) => t.id)) : new Set())
                  }
                  onModify={() => setTicketsBulkModifyOpen(true)}
                >
                  {TICKETS.map((ticket) => (
                    <TicketListItem
                      key={ticket.id}
                      data-anchor="ticket-row"
                      data-anchor-key={ticket.id}
                      channel={ticket.channel}
                      user={ticket.user}
                      avatars={ticket.avatarCount ? Array.from({ length: ticket.avatarCount }, () => ({})) : undefined}
                      isNew={ticket.isNew}
                      timestamp={ticket.timestamp}
                      message={ticket.message}
                      assignee={ticketsTab === 'mine' ? undefined : ticket.assignee}
                      unreadCount={ticket.unreadCount}
                      selected={selectedTicketId === ticket.id}
                      showCheckbox={ticketsSelectMode}
                      checked={checkedTicketIds.has(ticket.id)}
                      onCheckedChange={(next) => {
                        const nextIds = new Set(checkedTicketIds);
                        if (next) nextIds.add(ticket.id);
                        else nextIds.delete(ticket.id);
                        setCheckedTicketIdsAndExit(nextIds);
                      }}
                      onSelect={() => setTicketsSelectMode(true)}
                      onSelectAll={() => {
                        setTicketsSelectMode(true);
                        setCheckedTicketIds(new Set(TICKETS.map((t) => t.id)));
                      }}
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
                      onReply={() => alert(`Reply to: ${email.senderName}`)}
                      onReplyToAll={() => alert(`Reply to all: ${email.senderName}`)}
                      onForward={() => alert(`Forward: ${email.senderName}`)}
                    />
                  ))
                ) : undefined
              }
              // Ticket message threads can grow long, so this branch alone renders through
              // `conversationItems` (windowed/virtualized) instead of `conversation` — the
              // showcase and email branches above stay small and fixed, so they don't need it.
              conversationItems={
                selectedTicketId !== 't-showcase' && selectedTicket?.channel !== 'email'
                  ? (CONVERSATIONS[selectedTicketId] ?? []).map((entry, i, entries) => {
                      const reactionKey = `${selectedTicketId}:${entry.id}`;
                      const showDateDivider = entry.date !== entries[i - 1]?.date;
                      return {
                        id: entry.id,
                        node: (
                          <ConversationMessageRow
                            entry={entry}
                            isFirst={i === 0}
                            showDateDivider={showDateDivider}
                            groupedWithPrevious={!showDateDivider && entry.side === entries[i - 1]?.side}
                            avatarInitial={selectedTicket?.assignee?.charAt(0) ?? 'A'}
                            reactionKey={reactionKey}
                            reaction={ticketReactions[reactionKey]}
                            onReact={handleTicketReact}
                            onMenuAction={handleMessageMenuAction}
                          />
                        ),
                      };
                    })
                  : undefined
              }
              conversationKey={selectedTicketId}
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
                    onSend={() => setComposerDraft('')}
                    onMic={() => alert('Record voice note')}
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

          <TicketsBulkModifyModal
            open={ticketsBulkModifyOpen}
            onClose={() => setTicketsBulkModifyOpen(false)}
            selectedCount={checkedTicketIds.size}
            onApply={(values) => {
              alert(`Applied changes to ${checkedTicketIds.size} ticket(s): ${JSON.stringify(values)}`);
              setTicketsBulkModifyOpen(false);
              setCheckedTicketIdsAndExit(new Set());
            }}
          />

          {page === 'home' && (
            <div style={{ padding: 24 }} data-anchor="home-intro">
                <h1 style={{ marginTop: 0 }}>LimeChat App Shell</h1>
                <p>Reusable rail navigation + top bar from the LimeChat Design System V3.</p>
                <p style={{ color: '#595959' }}>
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
