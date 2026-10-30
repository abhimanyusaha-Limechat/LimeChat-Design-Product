/**
 * SettingsScreen: the Settings Screen of a Product. Owns the state, filtering and
 * per-tab content of every Settings tab; `App` only says which Product and tab are open.
 *
 * State here lives only while the Screen is mounted, so leaving Settings resets it.
 * The search box resets on every tab switch.
 */
import { useState } from 'react';
import { useDemoLoading } from '../../hooks/useDemoLoading';
import { canMove, flattenTree, keyboardTarget, moveTag, type DropTarget } from './tagTree';
import type { SidebarProduct } from '../Sidebar/presets';
import { SettingsPage, type DetailPanel } from '../SettingsPage';
import { DetailsAvatar, InboxDetailsIcon, SettingsDetails, rowFields } from './SettingsDetails';
import { AgentDetails, type AgentPatch } from './AgentDetails';
import { AgentEdit } from './AgentEdit';
import { InboxCollaboratorsPanel } from './InboxCollaboratorsPanel';
import { RuleDetails } from './RuleDetails';
import { RuleEdit, isRuleComplete } from './RuleEdit';
import { SlaEdit, isSlaComplete } from './SlaEdit';
import { useSavedEdits } from './useSavedEdits';
import { SlaPolicyDetails } from './SlaPolicyDetails';
import { TeamDetails } from './TeamDetails';
import { TeamEdit } from './TeamEdit';
import { CatalogTable } from '../CatalogTable';
import { InboxChannelIcon, InboxesTable } from '../InboxesTable';
import { WidgetCards, type WidgetKind, type WidgetStatus } from '../WidgetCards';
import { InboxSettings, type InboxAgent, type InboxSettingsValues, type PopupSettings, type WhatsAppWidgetSettings, HeaderSwitch, WidgetEditorActions, WIDGET_EMBED_CODE } from '../InboxSettings';
import { EventsTable } from '../EventsTable';
import { OptOutUsersTable } from '../OptOutUsersTable';
import { WebhooksTable } from '../WebhooksTable';
import { BotTemplatesTable, MediaTypeBadge, type BotTemplateRow } from '../BotTemplatesTable';
import { DataSecuritySettings, type PiiTypeKey, type ProfanityWord } from '../DataSecuritySettings';
import { AttributionSettings, type AttributionWindowKey, type AttributionWindowValue } from '../AttributionSettings';
import { BillingSettings, ChangePlan } from '../BillingSettings';
import {
  BotCsatSettings,
  type CsatFlowKey,
  type CsatRatingScale,
  type CsatTimeDelay,
} from '../BotCsatSettings';
import { TicketAssignmentSettings, type AssignmentStrategy } from '../TicketAssignmentSettings';
import { IntegrationsHomePage } from '../IntegrationsHomePage';
import { IntegrationSettings } from '../IntegrationSettings';
import { DEFAULT_SHOPIFY_PERMISSIONS, ShopifyActionsPermissions, type ShopifyPermissions } from '../ShopifyActionsPermissions';
import { TagsInput } from '../TagsInput';
import { Button } from '../Button';
import { Menu } from '../Menu';
import { CheckboxPill } from '../CheckboxPill';
import { Icon } from '../icons';
import {
  AGENT_INBOXES,
  BOT_TEMPLATE_INDUSTRIES,
  CUSTOM_FIELD_TYPES,
  DEMO_AGENTS,
  CURRENT_PLAN_TIER,
  DEMO_BILLING_PLAN,
  DEMO_BOT_TEMPLATES,
  DEMO_CANNED,
  DEMO_CANNED_LIBRARY,
  DEMO_COLLABORATORS,
  DEMO_CONTACT_FIELDS,
  DEMO_CONTACT_TAGS,
  DEMO_CONVERSATION_FIELDS,
  DEMO_EVENTS,
  DEMO_INBOXES,
  DEMO_INDUSTRIES,
  DEMO_OPT_OUT_USERS,
  DEMO_WEBHOOKS,
  DEMO_RULES,
  DEMO_RULE_LIBRARY,
  DEMO_SLA,
  DEMO_SLA_LIBRARY,
  DEMO_TAGS,
  DEMO_TEAMS,
  DEMO_TEAM_LEVELS,
  DEMO_USE_CASES,
  DEMO_VARIABLES,
  INBOX_NAMES,
  INTEGRATION_CATEGORIES,
  INTEGRATION_FORMS,
  PLAN_FEATURES,
  PLAN_TIERS,
  VARIABLE_DATA_TYPES,
  findIntegrationPartner,
  withFieldMeta,
} from '../../data/settingsDemo';
import { CATALOG_STORE, DEMO_CATALOG } from '../../data/catalogDemo';
import { DEFAULT_MAX_EXECUTIONS, ruleFor, type AutomationRule } from '../../data/ruleDemo';
import { slaPolicyFor, type SlaPolicy } from '../../data/slaPolicyDemo';
import { DEMO_TEMPLATES } from '../../data/templatesDemo';
import {
  HELPDESK_ADD_CTA,
  INDUSTRY_TABS,
  LIST_PAGE_TABS,
  PEOPLE_VARIANT,
  SEARCH_PLACEHOLDER,
  SETTINGS_COPY,
  SETTINGS_TABS_BY_PRODUCT,
  USE_CASE_CATEGORIES,
  VARIABLE_SCOPES,
} from './settingsTabs';

export interface SettingsScreenProps {
  product: SidebarProduct;
  settingsTab: string;
  /** The "Manage industries" sub-view of the Bot templates tab. */
  manageIndustries: boolean;
  /** The Integration tab's open partner form, e.g. 'freshdesk'; '' shows the tile grid. */
  integration: string;
  /** The Inboxes tab's inbox being edited, by id; '' shows the list. */
  inbox: string;
  /** The Agents tab's agent being edited, by id; '' shows the list. */
  agent: string;
  /** The Teams tab's team being edited, by id; '' shows the list. */
  team: string;
  /** The Automation rules or SLA rules tab's row being edited, by id; '' shows the list. */
  rule: string;
  /** HelpDesk Billing's "Change plan" sub-view. */
  changePlan: boolean;
  onTabChange: (id: string) => void;
  onManageIndustriesChange: (next: boolean) => void;
  onIntegrationChange: (partnerId: string) => void;
  onInboxChange: (inboxId: string) => void;
  onAgentChange: (agentId: string) => void;
  onTeamChange: (teamId: string) => void;
  onRuleChange: (ruleId: string) => void;
  onChangePlanChange: (open: boolean) => void;
}

/** What every edit page lets you type in the header. */
interface Texted {
  name?: string;
  description?: string;
}

/** A team's edits: its name, description and levels, and whether tickets auto-assign to it. */
interface TeamPatch extends Texted {
  levels?: BotTemplateRow[][];
  autoAssign?: boolean;
}

/** A rule's edits: its name and description, and what it checks and does. */
type RulePatch = Partial<AutomationRule> & Texted;
/** An SLA policy's edits: its name and description, and what it matches, allows, reminds and escalates. */
type SlaPatch = Partial<SlaPolicy> & Texted;

const WhatsAppIcon = () => <Icon name="whatsapp" stroke="#8C8C8C" />;

const PlusIcon = () => <Icon name="plus" />;

const widgetDefaults: WhatsAppWidgetSettings = {
  enabled: true,
  type: 'icon',
  position: 'right',
  size: 'medium',
  disappearOnScroll: false,
  marginBottom: 24,
  marginSide: 24,
  icon: { name: 'Static without stroke', kind: 'image' },
};

const popupDefaults: PopupSettings = {
  position: 'side',
  type: 'static',
  appearAfter: 3,
  disappearAfter: 10,
  heading: '',
  body: "Hey, Let's chat!",
  ctaText: '',
  companyImage: null,
  media: null,
};

// Demo: every inbox starts with the same ticket durations.
const inboxDefaults = (name: string): InboxSettingsValues => ({
  name,
  durations: {
    autoClose: { days: 0, hours: 12, minutes: 0 },
    autoResolve: { days: 2, hours: 0, minutes: 0 },
    autoResolveBot: { days: 0, hours: 12, minutes: 0 },
    autoAlert: { days: 0, hours: 12, minutes: 0 },
  },
  internalDurations: {
    autoClose: { days: 0, hours: 12, minutes: 0 },
    autoResolve: { days: 2, hours: 0, minutes: 0 },
    autoAlert: { days: 0, hours: 12, minutes: 0 },
  },
  waitTimeMessage: {
    enabled: true,
    text: 'An agent will join in to assist you...\n\nQueue Position: %{position} (%{time} approx.)',
  },
  conversationTracking: { enabled: true, reminder: { days: 1, hours: 0, minutes: 0 } },
  optInOut: {
    enabled: true,
    optInKeywords: ['START'],
    optOutKeywords: ['UNSUB'],
    optOutMessage: 'You can opt in again by typing %<opt_in_key>s',
    optInMessage: 'You have successfully opted-in.',
  },
  waitingReminders: {
    enabled: true,
    reminders: [
      { delayMinutes: 60, templateId: '' },
      { delayMinutes: 70, templateId: '' },
    ],
  },
  csat: {
    enabled: true,
    format: 'link',
    sendingType: 'automatic',
    ratingScale: '5',
    sendWhenAutoResolved: true,
    sendOutOfOffice: true,
    message: 'Hey, there! 👋 , please take a few moments to share feedback for conversation',
    reminder: { enabled: true, delay: { days: 0, hours: 1, minutes: 0 }, message: '' },
  },
  // Demo: set up by an admin elsewhere, so the tab shows its "contact admin" hint.
  configuration: { callbackUrl: '' },
  whatsappWidget: { mobile: widgetDefaults, desktop: widgetDefaults },
  whatsappPopup: { enabled: true, desktop: popupDefaults, mobile: popupDefaults },
  whatsappPages: { home: true, cart: true, blog: true, products: true, collections: true, checkout: true, pages: true },
  whatsappPrefill: {
    productText: 'Hey! I would like to know about',
    includeVariant: false,
    collectionText: '',
    otherText: "Hey, Let's chat about LimeChat Development V2.",
    utm: true,
  },
  whatsappZIndex: 1000,
  widgetAppearance: { baseColor: '1B83AC', shade: 7, font: 'Lato', icon: null, logo: null },
  widgetHomepage: {
    heading: 'Hello & Welcome',
    tagline: 'Our team is available to assist you round the clock',
    multiChannel: true,
    inboxes: ['Whatsapp_Customer_support', 'Email_Customer_support'],
    customButtons: true,
    buttons: [
      { name: '', subheading: '', link: '', icon: { name: 'videocall.png', kind: 'image' } },
      { name: '', subheading: '', link: '', icon: { name: 'bookcall.png', kind: 'image' } },
    ],
    agentOfflineStatus: true,
  },
  widgetPreChat: { enabled: true, message: '', name: false, email: false, phone: false },
  widgetCards: {
    template: 'compact',
    elements: { description: true, sellingPrice: true, mrp: true, discount: true, rating: true, reviewCount: true, tagPills: true, ribbonBadge: true },
    buttonCount: 2,
    buttonStyle: 'primary-outline',
    buttonLayout: 'stacked',
  },
  widgetGeneral: { botName: 'Bot101', inbox: 'Website widget', filePicker: false, emojiPicker: false, restartButton: false, showUnread: false },
  widgetEcommerce: { imageRatio: '1:1', storeType: 'None', extractTitle: true, messagePrefix: 'Know more about' },
  // Demo: the first 20 agents are on every inbox; the rest show up in the Add menu.
  collaborators: Object.fromEntries(DEMO_COLLABORATORS.slice(0, 20).map((c) => [c.id, { onlyAssignManually: false }])),
  businessHours: {
    enabled: true,
    timezone: 'America/Los_Angeles (GMT-8:00)',
    unavailableMessage: 'We are unavailable at the moment. Leave a message we will respond once we are back.',
    // Sunday first: Monday to Friday, 9 AM for 8 hours.
    days: Array.from({ length: 7 }, (_, i) => ({
      enabled: i >= 1 && i <= 5,
      slots: [{ start: 9 * 60, hours: 8 }],
    })),
  },
});

// Demo: the account's collaborators, as agents an inbox can add. Two are flagged to show the warning.
const INBOX_AGENTS: InboxAgent[] = DEMO_COLLABORATORS.map((c) => ({
  id: c.id,
  name: c.name,
  email: c.description,
  role: c.role === 'Admin' ? 'Administrator' : 'Agent',
  incompleteProfile: c.id === 'c3' || c.id === 'c9',
}));

const REMINDER_TEMPLATES = DEMO_TEMPLATES.map((t) => ({ value: t.id, label: t.name }));

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

export function SettingsScreen({
  product,
  settingsTab,
  manageIndustries,
  integration: integrationId,
  inbox: inboxId,
  agent: agentId,
  team: teamId,
  rule: ruleId,
  changePlan,
  onTabChange,
  onManageIndustriesChange,
  onIntegrationChange,
  onInboxChange,
  onAgentChange,
  onTeamChange,
  onRuleChange,
  onChangePlanChange,
}: SettingsScreenProps) {
  const copy = SETTINGS_COPY[settingsTab];
  // The search box is shared by every tab's table but belongs to one tab: reading it under a
  // different tab gives '' so it resets on any tab change, including back/forward in the URL.
  const [searchState, setSearchState] = useState({ tab: settingsTab, value: '' });
  const search = searchState.tab === settingsTab ? searchState.value : '';
  const setSearch = (value: string) => setSearchState({ tab: settingsTab, value });
  const query = search.trim().toLowerCase();

  // Helpdesk details panel: the selected row, remembered with its tab so switching tabs closes it.
  const [selection, setSelection] = useState<{ tab: string; id: string } | null>(null);
  const selectedId = selection?.tab === settingsTab ? selection.id : undefined;
  const selectRowId = (id: string) => setSelection({ tab: settingsTab, id });

  // Integration: the URL says which partner's form is open; edits to its fields live here.
  // Saving a partner's details makes them the saved values and marks it connected (no real API yet).
  const [integrationEdits, setIntegrationEdits] = useState<Record<string, Record<string, string>>>({});
  const [integrationSaves, setIntegrationSaves] = useState<Record<string, Record<string, string>>>({});
  // Logistics partners can be switched on/off once connected (on by default once connected); the rest are on whenever connected.
  const [integrationActive, setIntegrationActive] = useState<Record<string, boolean>>({});
  const integrationPartner = integrationId ? findIntegrationPartner(integrationId) : undefined;
  const integrationForm = integrationPartner && INTEGRATION_FORMS[integrationPartner.id];
  const integrationSaved = integrationId ? integrationSaves[integrationId] : undefined;
  const integrationSavedValues = integrationSaved ?? integrationForm?.values ?? {};
  const integration =
    integrationPartner && integrationForm
      ? {
          partner: integrationPartner,
          form: integrationForm,
          status: integrationSaved ? ('connected' as const) : integrationForm.status,
          savedValues: integrationSavedValues,
          values: { ...integrationSavedValues, ...integrationEdits[integrationPartner.id] },
        }
      : undefined;
  // Shopify's page is a set of agent permissions, not credentials; prepaid orders need Razorpay connected.
  const isShopifyPage = integration?.partner.id === 'shopify';
  // Webhook's page is its list of endpoints, not a credential form.
  const isWebhookPage = integration?.partner.id === 'webhook';
  const [shopifySaved, setShopifySaved] = useState<ShopifyPermissions>(DEFAULT_SHOPIFY_PERMISSIONS);
  const [shopifyPermissions, setShopifyPermissions] = useState(shopifySaved);
  const shopifyChanged = JSON.stringify(shopifyPermissions) !== JSON.stringify(shopifySaved);
  const razorpayConnected = !!integrationSaves.razorpay || INTEGRATION_FORMS.razorpay.status === 'connected';
  const shopifyConnected = !!integrationSaves.shopify || INTEGRATION_FORMS.shopify.status === 'connected';
  // Products: the catalog "syncs" from the store on request; `catalogSyncedAt` is when that last finished.
  const [catalogSyncing, setCatalogSyncing] = useState(false);
  const [catalogSyncedAt, setCatalogSyncedAt] = useState(CATALOG_STORE.lastSyncedAt);
  // ponytail: stands in for the real fetch — a server-side call to Shopify's Admin API (no token can live in this bundle).
  const syncCatalog = () => {
    setCatalogSyncing(true);
    window.setTimeout(() => {
      setCatalogSyncedAt(new Date().toISOString());
      setCatalogSyncing(false);
    }, 1500);
  };
  // Stands in for checking the details with the partner.
  const fakeVerify = () => {
    setSavingHelpdeskSettings(true);
    window.setTimeout(() => setSavingHelpdeskSettings(false), 700);
  };

  const [inboxSyncing, setInboxSyncing] = useState(false);
  // Inbox edit: the URL says which inbox is open; edits to it live here (no real API yet).
  // Agents created from an inbox's Collaborators tab; they join the account's roster.
  const [createdAgents, setCreatedAgents] = useState<InboxAgent[]>([]);
  const [inboxEdits, setInboxEdits] = useState<Record<string, InboxSettingsValues>>({});
  const editedInbox = inboxId ? DEMO_INBOXES.find((row) => row.id === inboxId) : undefined;
  const inboxValuesOf = (row: { id: string; name: string }) => inboxEdits[row.id] ?? inboxDefaults(row.name);
  const editedInboxValues = editedInbox && inboxValuesOf(editedInbox);
  const visibleInboxes = DEMO_INBOXES.filter(
    (row) => row.id.includes(search.trim()) || row.name.toLowerCase().includes(query),
  );

  const [variableScope, setVariableScope] = useState('system');
  // Sub-page of Bot templates; mirrors the Variable page until it gets its own content.
  const [industryTab, setIndustryTab] = useState('industries');
  const [useCaseCategory, setUseCaseCategory] = useState('all');
  const [variableDataType, setVariableDataType] = useState('all');
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
  // Agents: edits made in the details panel, applied over the demo rows.
  const [agentEdits, setAgentEdits] = useState<Record<string, AgentPatch>>({});
  // The edit page's unsaved changes; they reach the list, header and panel only when Update is clicked.
  const [agentDraft, setAgentDraft] = useState<{ id: string; patch: AgentPatch } | null>(null);
  // Teams, automation rules and SLA policies: edits saved by Update, over the demo rows; and the edit page's unsaved edits.
  const teamEdits = useSavedEdits<TeamPatch>();
  const ruleEdits = useSavedEdits<RulePatch>();
  const slaEdits = useSavedEdits<SlaPatch>();
  const ruleOf = (id: string) => ({ ...ruleFor(id), ...ruleEdits.saves[id] });
  const slaOf = (id: string) => ({ ...slaPolicyFor(id), ...slaEdits.saves[id] });
  /** The rows with their saved names and descriptions. */
  const withSavedText = (rows: BotTemplateRow[], saves: Record<string, Texted>) =>
    rows.map((r) => ({ ...r, name: saves[r.id]?.name ?? r.name, description: saves[r.id]?.description ?? r.description }));
  const teamLevelsOf = (id: string) => teamEdits.saves[id]?.levels ?? DEMO_TEAM_LEVELS[id] ?? [];
  // The Inbox dropdown is shared by Agents and Custom fields.
  const [agentInbox, setAgentInbox] = useState('all');
  const [fieldType, setFieldType] = useState('all');
  // SLA rules apply top to bottom, so their order is editable. `slaDraft` is the order being edited (null when not reordering).
  const [slaOrder, setSlaOrder] = useState(DEMO_SLA);
  const [slaDraft, setSlaDraft] = useState<BotTemplateRow[] | null>(null);
  const [savingSlaOrder, setSavingSlaOrder] = useState(false);
  const reorderingSla = settingsTab === 'sla-rules' && slaDraft !== null;
  const slaOrderChanged = slaDraft?.some((row, i) => row.id !== slaOrder[i].id) ?? false;
  const moveSlaRule = (from: number, to: number) =>
    setSlaDraft((draft) => {
      if (!draft) return draft;
      const next = [...draft];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });
  const saveSlaOrder = () => {
    const draft = slaDraft;
    if (!draft) return;
    setSavingSlaOrder(true);
    window.setTimeout(() => {
      setSlaOrder(draft);
      setSlaDraft(null);
      setSavingSlaOrder(false);
    }, 700);
  };
  // Demo: a table's data "loads" again when the tab, list tab or sub-page changes.
  const tableLoading = useDemoLoading(
    [settingsTab, listTab, manageIndustries, industryTab, variableScope, integrationId].join(':'),
  );
  const [tagsInInternalTickets, setTagsInInternalTickets] = useState(false);
  // Tags: one tree per tab (Customer / Contact). Moves apply immediately.
  const [tagTrees, setTagTrees] = useState({ customer: DEMO_TAGS, contact: DEMO_CONTACT_TAGS });
  const tagTab = listTab === 'contact' ? 'contact' : 'customer';
  const tagRows = flattenTree(tagTrees[tagTab], query);
  const moveTagTo = (id: string, target: DropTarget) =>
    setTagTrees((prev) => ({ ...prev, [tagTab]: moveTag(prev[tagTab], id, target) }));
  const withSwitches = (rows: BotTemplateRow[]) => rows.map((r) => ({ ...r, enabled: switchOn[r.id] ?? r.enabled }));
  const peopleRows: Record<string, BotTemplateRow[]> = {
    collaborators: DEMO_COLLABORATORS,
    agents: DEMO_AGENTS.map((a) => ({ ...a, ...agentEdits[a.id] })),
    teams: DEMO_TEAMS.map((t) => ({ ...t, name: teamEdits.saves[t.id]?.name ?? t.name, description: teamEdits.saves[t.id]?.description ?? t.description })),
    'automation-rules': withSavedText(withSwitches(listTab === 'library' ? DEMO_RULE_LIBRARY : DEMO_RULES), ruleEdits.saves),
    'canned-responses': listTab === 'library' ? DEMO_CANNED_LIBRARY : DEMO_CANNED,
    'sla-rules': withSavedText(withSwitches(listTab === 'library' ? DEMO_SLA_LIBRARY : (slaDraft ?? slaOrder)), slaEdits.saves),
    'custom-fields': withFieldMeta(withSwitches(listTab === 'contact' ? DEMO_CONTACT_FIELDS : DEMO_CONVERSATION_FIELDS)),
  };
  const visibleCollaborators = (peopleRows[settingsTab] ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(query) &&
      (settingsTab !== 'agents' || agentRole === 'all' || c.role === agentRole) &&
      (settingsTab !== 'custom-fields' || fieldType === 'all' || c.kind === fieldType) &&
      ((settingsTab !== 'agents' && settingsTab !== 'custom-fields') ||
        agentInbox === 'all' ||
        c.inboxes?.some((i) => i.name === agentInbox)),
  );
  const visibleVariables = DEMO_VARIABLES.filter(
    (v) => (variableDataType === 'all' || v.dataType === variableDataType) && v.name.toLowerCase().includes(query),
  );
  const visibleBotTemplates = DEMO_BOT_TEMPLATES.filter(
    (t) =>
      (botTemplateType === 'all' || t.type === botTemplateType) &&
      (botTemplateIndustry === 'all' || t.industries.includes(botTemplateIndustry)) &&
      t.name.toLowerCase().includes(query),
  );

  const [botInboxMap, setBotInboxMap] = useState<Record<string, string[]>>({
    'Sales Bot': ['Limechat (189)'],
  });
  const [savingBotInboxMap, setSavingBotInboxMap] = useState(false);
  const [savingHelpdeskSettings, setSavingHelpdeskSettings] = useState(false);

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

  const [assignStrategy, setAssignStrategy] = useState<AssignmentStrategy>('round-robin');
  // A handful of inboxes start on manual assignment so both panels have content.
  const [assignManualIds, setAssignManualIds] = useState(() => DEMO_INBOXES.slice(0, 6).map((i) => i.id));
  const [assignOfflineEnabled, setAssignOfflineEnabled] = useState(true);
  const [assignOfflineIds, setAssignOfflineIds] = useState<string[]>([]);

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

  const whatsappWidgets = visibleInboxes.filter((row) => row.type === 'whatsapp');
  // ponytail: demo statuses until widgets have a real one — shows each card state.
  // ponytail: demo kinds too — the second card shows a web widget.
  const widgetKindById: Record<string, WidgetKind> = whatsappWidgets[1] ? { [whatsappWidgets[1].id]: 'web' } : {};
  const demoWidgetStatusById: Record<string, WidgetStatus> = Object.fromEntries(
    whatsappWidgets.flatMap((row, i): [string, WidgetStatus][] => (i === 2 ? [[row.id, 'inactive']] : i === 3 ? [[row.id, 'disabled']] : i === 4 ? [[row.id, 'error']] : [])),
  );
  // Active / Inactive switched in the widget editor; disabled and errored widgets keep their status.
  const [widgetActiveById, setWidgetActiveById] = useState<Record<string, boolean>>({});
  const widgetStatusById: Record<string, WidgetStatus> = { ...demoWidgetStatusById };
  for (const [id, active] of Object.entries(widgetActiveById)) {
    const status = demoWidgetStatusById[id];
    if (status !== 'disabled' && status !== 'error') widgetStatusById[id] = active ? 'active' : 'inactive';
  }

  const editedAgent = agentId ? peopleRows.agents.find((a) => a.id === agentId) : undefined;
  const agentDraftPatch = editedAgent && agentDraft?.id === editedAgent.id ? agentDraft.patch : undefined;
  const editedTeam = teamId ? peopleRows.teams.find((t) => t.id === teamId) : undefined;
  const teamDraftPatch = editedTeam && teamEdits.draftFor(editedTeam.id);
  // What the edit page shows: the saved team with the unsaved edits on top.
  const draftedTeam = editedTeam && {
    ...editedTeam,
    levels: teamLevelsOf(editedTeam.id),
    autoAssign: false,
    ...teamEdits.saves[editedTeam.id],
    ...teamDraftPatch,
  };
  const patchTeam = (patch: TeamPatch) => editedTeam && teamEdits.patch(editedTeam.id, patch);
  // The row open on an edit page: from this tab's list, else (the other List tab, a pasted link) the demo rows.
  const editedRow = (tab: string, rows: BotTemplateRow[]) =>
    settingsTab === tab && ruleId ? [...peopleRows[tab], ...rows].find((r) => r.id === ruleId) : undefined;
  const editedRule = editedRow('automation-rules', [...DEMO_RULES, ...DEMO_RULE_LIBRARY]);
  const editedSla = editedRow('sla-rules', [...DEMO_SLA, ...DEMO_SLA_LIBRARY]);
  const ruleDraftPatch = editedRule && ruleEdits.draftFor(editedRule.id);
  const slaDraftPatch = editedSla && slaEdits.draftFor(editedSla.id);
  // What the edit pages show: the saved row with the unsaved edits on top. A rule's limit is always set, so clearing the box is a draft state.
  const draftedRule = editedRule && {
    maxExecutions: DEFAULT_MAX_EXECUTIONS,
    name: editedRule.name,
    description: editedRule.description,
    ...ruleOf(editedRule.id),
    ...ruleDraftPatch,
  };
  const draftedSla = editedSla && {
    name: editedSla.name,
    description: editedSla.description,
    ...slaOf(editedSla.id),
    ...slaDraftPatch,
  };
  const patchRule = (patch: RulePatch) => editedRule && ruleEdits.patch(editedRule.id, patch);
  const patchSla = (patch: SlaPatch) => editedSla && slaEdits.patch(editedSla.id, patch);
  // The page title and description are typed in place on the pages that have a draft.
  const titled = draftedTeam ?? draftedRule ?? draftedSla;
  const patchTitled = draftedTeam ? patchTeam : draftedRule ? patchRule : draftedSla ? patchSla : undefined;
  const editedPolicy = editedRule ?? editedSla;
  const selectedInbox = selectedId ? visibleInboxes.find((r) => r.id === selectedId) : undefined;
  const selectedRow = selectedId ? visibleCollaborators.find((r) => r.id === selectedId) : undefined;
  const selectedAgent = settingsTab === 'agents' ? selectedRow : undefined;
  const closePanel = () => setSelection(null);
  const patchAgent = (id: string, patch: AgentPatch) =>
    setAgentEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  // Opening or leaving the edit page starts from the saved agent, dropping unsaved changes.
  const openAgent = (id: string) => {
    setAgentDraft(null);
    onAgentChange(id);
  };
  const openTeam = (id: string) => {
    teamEdits.discard();
    onTeamChange(id);
  };
  const openRule = (id: string) => {
    ruleEdits.discard();
    slaEdits.discard();
    onRuleChange(id);
  };
  // Rows without an edit page yet keep the demo alert.
  const editRow = (row: BotTemplateRow) =>
    settingsTab === 'agents'
      ? openAgent(row.id)
      : settingsTab === 'teams'
        ? openTeam(row.id)
        : settingsTab === 'automation-rules' || settingsTab === 'sla-rules'
          ? openRule(row.id)
          : alert(`Edit template: ${row.name}`);
  const cloneRow = (row: BotTemplateRow) => alert(`Clone template: ${row.name}`);
  const updateAgent = () => {
    if (!editedAgent || !agentDraftPatch) return;
    patchAgent(editedAgent.id, agentDraftPatch);
    setAgentDraft(null);
    fakeVerify();
  };
  const updateTeam = () => {
    if (!editedTeam || !teamDraftPatch) return;
    teamEdits.save(editedTeam.id);
    fakeVerify();
  };
  const updatePolicy = () => {
    if (!editedPolicy) return;
    (editedRule ? ruleEdits : slaEdits).save(editedPolicy.id);
    fakeVerify();
  };
  const detailPanel: DetailPanel | undefined =
    product !== 'helpdesk' || reorderingSla || editedInbox || editedAgent || editedTeam || editedPolicy
      ? undefined
      : selectedInbox
        ? {
            title: selectedInbox.name,
            subtitle: selectedInbox.detail,
            icon: <InboxChannelIcon type={selectedInbox.type} />,
            actions: [{ icon: 'pencil', label: 'Edit', onClick: () => onInboxChange(selectedInbox.id) }],
            onClose: closePanel,
            children: (
              <InboxCollaboratorsPanel
                key={selectedInbox.id}
                agents={[...INBOX_AGENTS, ...createdAgents]}
                value={inboxValuesOf(selectedInbox).collaborators}
                onChange={(collaborators) =>
                  setInboxEdits((prev) => ({ ...prev, [selectedInbox.id]: { ...inboxValuesOf(selectedInbox), collaborators } }))
                }
              />
            ),
          }
        : selectedAgent
          ? {
              title: selectedAgent.name,
              subtitle: 'Agent',
              icon: <DetailsAvatar name={selectedAgent.name} src={selectedAgent.avatar} />,
              actions: [{ icon: 'pencil', label: 'Edit', onClick: () => openAgent(selectedAgent.id) }],
              onClose: closePanel,
              children: (
                <AgentDetails
                  key={selectedAgent.id}
                  agent={selectedAgent}
                  onChange={(patch) => patchAgent(selectedAgent.id, patch)}
                />
              ),
            }
          : selectedRow
            ? {
                title: selectedRow.name,
                subtitle: settingsTab === 'sla-rules' ? 'SLA policy' : settingsTab === 'automation-rules' ? 'Automation rule' : undefined,
                icon: selectedRow.mediaType && <MediaTypeBadge mediaType={selectedRow.mediaType} />,
                actions: [
                  { icon: 'pencil', label: 'Edit', onClick: () => editRow(selectedRow) },
                  ...(settingsTab === 'automation-rules'
                    ? [{ icon: 'copy' as const, label: 'Clone', onClick: () => cloneRow(selectedRow) }]
                    : []),
                ],
                onClose: closePanel,
                children:
                  settingsTab === 'teams' ? (
                    <TeamDetails description={selectedRow.description} levels={teamLevelsOf(selectedRow.id)} />
                  ) : settingsTab === 'sla-rules' ? (
                    <SlaPolicyDetails policy={slaOf(selectedRow.id)} />
                  ) : settingsTab === 'automation-rules' ? (
                    <RuleDetails rule={ruleOf(selectedRow.id)} />
                  ) : (
                    <SettingsDetails fields={rowFields(settingsTab, selectedRow)} />
                  ),
              }
            : undefined;
  const rowSelectable = product === 'helpdesk' && !reorderingSla;

  return (
    <SettingsPage
      tabs={SETTINGS_TABS_BY_PRODUCT[product]}
      activeTab={settingsTab}
      onTabChange={onTabChange}
      title={
        manageIndustries
          ? 'Manage industries'
          : integration
            ? (integration.form.title ?? integration.partner.name)
            : editedInbox
              ? editedInbox.name
              : editedAgent
                ? editedAgent.name
                : titled
                  ? titled.name
                  : changePlan
              ? 'Change plan'
              : copy.title
      }
      titleIcon={
        integration ? (
          <span className="lc-is-title-icon">{integration.partner.icon}</span>
        ) : (
          editedInbox ? <InboxDetailsIcon type={editedInbox.type} /> : editedAgent && <DetailsAvatar name={editedAgent.name} src={editedAgent.avatar} />
        )
      }
      onBack={
        integration
          ? () => onIntegrationChange('')
          : editedInbox
            ? () => onInboxChange('')
            : editedAgent
              ? () => openAgent('')
              : editedTeam
                ? () => openTeam('')
                : editedPolicy
                  ? () => openRule('')
                  : changePlan
              ? () => onChangePlanChange(false)
              : undefined
      }
      description={
        manageIndustries
          ? SETTINGS_COPY.variable.description
          : integration
            ? integration.form.description
            : titled
              ? titled.description
              : editedInbox || editedAgent
              ? undefined
              : changePlan
              ? `You are on ${CURRENT_PLAN_TIER.name} at $${CURRENT_PLAN_TIER.pricePerMonth}/month. Prices are in USD. Recurring and usage-based charges bill every 30 days.`
              : copy.description
      }
      contentPadding={changePlan ? '48px 72px 72px' : settingsTab === 'custom-fields' ? 20 : undefined}
      detailPanel={detailPanel}
      // The inbox edit page has no tutorial or docs page of its own.
      onTitleChange={patchTitled && ((name) => patchTitled({ name }))}
      onDescriptionChange={patchTitled && ((description) => patchTitled({ description }))}
      onWatchVideo={editedInbox || editedAgent || editedTeam || editedPolicy ? undefined : () => alert(`Play tutorial video: ${copy.title}`)}
      onViewDocs={editedInbox || editedAgent || editedTeam || editedPolicy ? undefined : () => alert(`Open docs: ${copy.title}`)}
      headerActions={
        editedInbox || editedAgent || editedTeam || editedPolicy ? (
          <>
            {editedInbox && settingsTab === 'widget' && (
              <WidgetEditorActions
                active={(widgetStatusById[editedInbox.id] ?? 'active') === 'active'}
                canToggle={!['disabled', 'error'].includes(widgetStatusById[editedInbox.id] ?? 'active')}
                code={WIDGET_EMBED_CODE}
                onActiveChange={(active) => setWidgetActiveById((prev) => ({ ...prev, [editedInbox.id]: active }))}
              />
            )}
            {draftedTeam && (
              <HeaderSwitch label="Auto-assign" checked={draftedTeam.autoAssign} onChange={(autoAssign) => patchTeam({ autoAssign })} />
            )}
            <Button
              variant="filled"
              color="primary"
              size="sm"
              style={{ width: 100 }}
              loading={savingHelpdeskSettings}
              disabled={
                (!!editedAgent && !agentDraftPatch) ||
                (!!draftedTeam && (!teamDraftPatch || !draftedTeam.name.trim())) ||
                (!!draftedRule && (!ruleDraftPatch || !draftedRule.name.trim() || !isRuleComplete(draftedRule))) ||
                (!!draftedSla && (!slaDraftPatch || !draftedSla.name.trim() || !isSlaComplete(draftedSla)))
              }
              onClick={editedAgent ? updateAgent : editedTeam ? updateTeam : editedPolicy ? updatePolicy : fakeVerify}
            >
              Update
            </Button>
          </>
        ) : manageIndustries ? (
          <>
            <Button variant="default" size="sm" onClick={() => onManageIndustriesChange(false)}>
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
            <Button variant="default" size="sm" onClick={() => onManageIndustriesChange(true)}>
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
        ) : reorderingSla ? (
          <>
            <Button variant="default" size="sm" disabled={savingSlaOrder} onClick={() => setSlaDraft(null)}>
              Cancel
            </Button>
            <Button
              variant="filled"
              color="primary"
              size="sm"
              loading={savingSlaOrder}
              disabled={!slaOrderChanged}
              onClick={saveSlaOrder}
            >
              Save order
            </Button>
          </>
        ) : settingsTab === 'sla-rules' && listTab !== 'library' ? (
          <>
            <Button
              variant="default"
              size="sm"
              leftSection={<Icon name="arrows-sort" />}
              onClick={() => {
                setSearch(''); // reorder the whole list, never a filtered slice of it
                setSlaDraft(slaOrder);
              }}
            >
              Reorder
            </Button>
            <Button
              variant="filled"
              color="primary"
              size="sm"
              leftSection={<PlusIcon />}
              onClick={() => alert(`New ${HELPDESK_ADD_CTA[settingsTab].toLowerCase()}`)}
            >
              {HELPDESK_ADD_CTA[settingsTab]}
            </Button>
          </>
        ) : settingsTab === 'tags' ? (
          <>
            <CheckboxPill checked={tagsInInternalTickets} onChange={setTagsInInternalTickets} label="Use in Internal tickets" />
            <Button
              variant="filled"
              color="primary"
              size="sm"
              leftSection={<PlusIcon />}
              onClick={() => alert('New tag')}
            >
              {HELPDESK_ADD_CTA.tags}
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
        ) : settingsTab === 'opt-out-users' ? (
          <Menu
            ariaLabel="Add opt out numbers"
            items={[
              { label: 'Single number', icon: <Icon name="phone" />, onClick: () => alert('Add a single number') },
              { label: 'Bulk upload CSV', icon: <Icon name="paperclip" />, onClick: () => alert('Upload a CSV of numbers') },
            ]}
            trigger={({ ref, onClick }) => (
              <Button ref={ref} variant="filled" color="primary" size="sm" leftSection={<PlusIcon />} onClick={onClick}>
                Number
              </Button>
            )}
          />
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
      {isWebhookPage ? (
        <WebhooksTable
          loading={tableLoading}
          webhooks={DEMO_WEBHOOKS}
          onEdit={(row) => alert(`Edit webhook: ${row.url}`)}
          onDelete={(row) => alert(`Delete webhook: ${row.url}`)}
          iconActions={product === 'helpdesk'}
        />
      ) : integration ? (
        <IntegrationSettings
          partnerName={integration.partner.name}
          status={integration.status}
          submitting={savingHelpdeskSettings}
          changed={isShopifyPage && shopifyChanged}
          active={integrationActive[integration.partner.id] ?? integration.status === 'connected'}
          onActiveChange={
            INTEGRATION_CATEGORIES.find((c) => c.id === 'logistics-partners')?.partners.some((p) => p.id === integration.partner.id)
              ? (on) => setIntegrationActive((prev) => ({ ...prev, [integration.partner.id]: on }))
              : undefined
          }
          onSubmit={() => {
            if (isShopifyPage) setShopifySaved(shopifyPermissions);
            setIntegrationSaves((prev) => ({ ...prev, [integration.partner.id]: integration.values }));
            setIntegrationEdits((prev) => ({ ...prev, [integration.partner.id]: {} }));
            fakeVerify();
          }}
          fields={integration.form.fields}
          values={integration.values}
          savedValues={integration.savedValues}
          onChange={(fieldId, value) =>
            setIntegrationEdits((prev) => ({
              ...prev,
              [integration.partner.id]: { ...prev[integration.partner.id], [fieldId]: value },
            }))
          }
          onHelpClick={(fieldId) =>
            alert(
              `Where to find the ${integration.partner.name} ${integration.form.fields.find((f) => f.id === fieldId)?.label}`,
            )
          }
        >
          {isShopifyPage && (
            <ShopifyActionsPermissions
              values={shopifyPermissions}
              onChange={setShopifyPermissions}
              prepaidAvailable={razorpayConnected}
            />
          )}
        </IntegrationSettings>
      ) : editedAgent ? (
        <AgentEdit
          key={editedAgent.id}
          agent={{ ...editedAgent, ...agentDraftPatch }}
          onChange={(patch) => setAgentDraft({ id: editedAgent.id, patch: { ...agentDraftPatch, ...patch } })}
        />
      ) : draftedRule ? (
        <RuleEdit key={ruleId} rule={draftedRule} onChange={patchRule} />
      ) : draftedSla ? (
        <SlaEdit key={ruleId} policy={draftedSla} onChange={patchSla} />
      ) : draftedTeam ? (
        <TeamEdit
          key={draftedTeam.id}
          levels={draftedTeam.levels}
          onChange={(levels) => patchTeam({ levels })}
        />
      ) : editedInbox && editedInboxValues ? (
        <InboxSettings
          key={editedInbox.id}
          variant={settingsTab === 'widget' ? 'widget' : 'inbox'}
          type={editedInbox.type}
          detail={editedInbox.detail}
          templates={REMINDER_TEMPLATES}
          agents={[...INBOX_AGENTS, ...createdAgents]}
          onCreateAgent={(agent) => {
            const id = `new-${createdAgents.length + 1}`;
            setCreatedAgents((prev) => [...prev, { ...agent, id }]);
            return id;
          }}
          values={editedInboxValues}
          onChange={(patch) =>
            setInboxEdits((prev) => ({ ...prev, [editedInbox.id]: { ...editedInboxValues, ...patch } }))
          }
        />
      ) : settingsTab === 'hd-integration' || settingsTab === 'integrations' ? (
        <IntegrationsHomePage
          categories={INTEGRATION_CATEGORIES}
          onPartnerClick={onIntegrationChange}
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
      ) : settingsTab === 'ticket-assignment' ? (
        <TicketAssignmentSettings
          inboxes={DEMO_INBOXES}
          strategy={assignStrategy}
          onStrategyChange={setAssignStrategy}
          manualIds={assignManualIds}
          onManualChange={(id, manual) =>
            setAssignManualIds((prev) => (manual ? [...prev, id] : prev.filter((x) => x !== id)))
          }
          offlineEnabled={assignOfflineEnabled}
          onOfflineEnabledChange={setAssignOfflineEnabled}
          offlineInboxIds={assignOfflineIds}
          onOfflineInboxToggle={(id) =>
            setAssignOfflineIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
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
      ) : changePlan ? (
        <ChangePlan
          tiers={PLAN_TIERS}
          features={PLAN_FEATURES}
          currentId={CURRENT_PLAN_TIER.id}
          onSwitch={(tier) => alert(`Switch to ${tier.name}`)}
        />
      ) : settingsTab === 'billing' ? (
        <BillingSettings plan={DEMO_BILLING_PLAN} onUpgrade={() => onChangePlanChange(true)} />
      ) : settingsTab === 'products' ? (
        <CatalogTable
          products={DEMO_CATALOG}
          store={CATALOG_STORE.domain}
          lastSyncedAt={catalogSyncedAt}
          connected={shopifyConnected}
          loading={tableLoading}
          syncing={catalogSyncing}
          onSync={syncCatalog}
          onConnect={() => {
            onTabChange('hd-integration');
            onIntegrationChange('shopify');
          }}
        />
      ) : settingsTab === 'events' ? (
        <EventsTable loading={tableLoading} events={DEMO_EVENTS} onCustomEvents={() => alert('Manage custom events')} />
      ) : settingsTab === 'opt-out-users' ? (
        <OptOutUsersTable loading={tableLoading} users={DEMO_OPT_OUT_USERS} />
      ) : settingsTab === 'widget' ? (
        <WidgetCards
          loading={tableLoading}
          widgets={whatsappWidgets}
          statusById={widgetStatusById}
          kindById={widgetKindById}
          selectedId={selectedId}
          onSelect={rowSelectable ? (row) => selectRowId(row.id) : undefined}
          onEdit={(row) => onInboxChange(row.id)}
          onDelete={(row) => alert(`Delete widget: ${row.name}`)}
          onCreate={() => alert('Create a widget')}
        />
      ) : settingsTab === 'inboxes' ? (
        <InboxesTable
          loading={tableLoading}
          inboxes={visibleInboxes}
          searchValue={search}
          onSearchChange={setSearch}
          syncing={inboxSyncing}
          onRowEdit={(row) => onInboxChange(row.id)}
          onRowDelete={(row) => alert(`Delete inbox: ${row.name}`)}
          iconActions={product === 'helpdesk'}
          onRowSelect={rowSelectable ? (row) => selectRowId(row.id) : undefined}
          selectedId={selectedId}
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
          // Remount on entering/leaving reorder mode so a column sort never hides the manual order.
          key={reorderingSla ? 'reorder' : 'view'}
          loading={tableLoading}
          tree={
            settingsTab === 'tags'
              ? {
                  levels: new Map(tagRows.map((r) => [r.tag.id, { depth: r.depth, hasChildren: r.hasChildren }])),
                  canDrop: (id, target) => canMove(tagTrees[tagTab], id, target),
                  onDrop: moveTagTo,
                  onKeyMove: (id, key) => {
                    const target = keyboardTarget(tagTrees[tagTab], id, key);
                    if (target) moveTagTo(id, target);
                  },
                  dragDisabled: query !== '',
                  onAddChild: (parentId) =>
                    setTagTrees((prev) => ({
                      ...prev,
                      [tagTab]: [
                        ...prev[tagTab],
                        {
                          id: crypto.randomUUID(),
                          name: 'New tag',
                          description: '',
                          type: 'task',
                          usecases: [],
                          industries: [],
                          scope: 'account',
                          enabled: true,
                          parentId,
                        },
                      ],
                    })),
                }
              : undefined
          }
          reorder={
            reorderingSla
              ? {
                  onMove: moveSlaRule,
                  hint: 'Drag rules to set their priority. Each ticket gets the first matching rule, from top to bottom.',
                }
              : undefined
          }
          variant={manageIndustries ? 'industries' : settingsTab === 'variable' ? 'variables' : (peopleVariant ?? 'templates')}
          searchPlaceholder={SEARCH_PLACEHOLDER[manageIndustries ? 'variable' : settingsTab]}
          hideFilters={isPeopleTab || manageIndustries}
          hideSearch={manageIndustries}
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
              : settingsTab === 'tags'
                ? withSwitches(tagRows.map((r) => r.tag))
                : isPeopleTab
                ? visibleCollaborators
                : visibleBotTemplates}
          searchValue={search}
          onSearchChange={setSearch}
          typeFilter={botTemplateType}
          onTypeFilterChange={setBotTemplateType}
          industryFilter={botTemplateIndustry}
          onIndustryFilterChange={setBotTemplateIndustry}
          industries={BOT_TEMPLATE_INDUSTRIES}
          dataTypes={VARIABLE_DATA_TYPES}
          dataTypeFilter={variableDataType}
          onDataTypeFilterChange={setVariableDataType}
          onAccountFilterClick={() => alert('Filter by account')}
          onRowEdit={editRow}
          onRowClone={cloneRow}
          onRowDelete={(row) => alert(`Delete template: ${row.name}`)}
          iconActions={product === 'helpdesk'}
          overflowActions={settingsTab === 'sla-rules'}
          onRowSelect={rowSelectable && isPeopleTab && settingsTab !== 'collaborators' ? (row) => selectRowId(row.id) : undefined}
          selectedId={selectedId}
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
  );
}
