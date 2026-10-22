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
import { DetailsAvatar, InboxDetailsIcon, SettingsDetails, inboxFields, rowFields } from './SettingsDetails';
import { AgentDetails, type AgentPatch } from './AgentDetails';
import { InboxesTable } from '../InboxesTable';
import { InboxSettings, type InboxSettingsValues } from '../InboxSettings';
import { EventsTable } from '../EventsTable';
import { OptOutUsersTable } from '../OptOutUsersTable';
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
import { IntegrationsHomePage } from '../IntegrationsHomePage';
import { IntegrationSettings } from '../IntegrationSettings';
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
  DEMO_RULES,
  DEMO_RULE_LIBRARY,
  DEMO_SLA,
  DEMO_SLA_LIBRARY,
  DEMO_TAGS,
  DEMO_TEAMS,
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
  /** HelpDesk Billing's "Change plan" sub-view. */
  changePlan: boolean;
  onTabChange: (id: string) => void;
  onManageIndustriesChange: (next: boolean) => void;
  onIntegrationChange: (partnerId: string) => void;
  onInboxChange: (inboxId: string) => void;
  onChangePlanChange: (open: boolean) => void;
}

const WhatsAppIcon = () => <Icon name="whatsapp" stroke="#8C8C8C" />;

const PlusIcon = () => <Icon name="plus" />;

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
});

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
  changePlan,
  onTabChange,
  onManageIndustriesChange,
  onIntegrationChange,
  onInboxChange,
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
  // Stands in for checking the details with the partner.
  const fakeVerify = () => {
    setSavingHelpdeskSettings(true);
    window.setTimeout(() => setSavingHelpdeskSettings(false), 700);
  };

  const [inboxSyncing, setInboxSyncing] = useState(false);
  // Inbox edit: the URL says which inbox is open; edits to it live here (no real API yet).
  const [inboxEdits, setInboxEdits] = useState<Record<string, InboxSettingsValues>>({});
  const editedInbox = inboxId ? DEMO_INBOXES.find((row) => row.id === inboxId) : undefined;
  const editedInboxValues = editedInbox && (inboxEdits[editedInbox.id] ?? inboxDefaults(editedInbox.name));
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
    [settingsTab, listTab, manageIndustries, industryTab, variableScope].join(':'),
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
    teams: DEMO_TEAMS,
    'automation-rules': withSwitches(listTab === 'library' ? DEMO_RULE_LIBRARY : DEMO_RULES),
    'canned-responses': listTab === 'library' ? DEMO_CANNED_LIBRARY : DEMO_CANNED,
    'sla-rules': withSwitches(listTab === 'library' ? DEMO_SLA_LIBRARY : (slaDraft ?? slaOrder)),
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

  const selectedInbox = selectedId ? visibleInboxes.find((r) => r.id === selectedId) : undefined;
  const selectedRow = selectedId ? visibleCollaborators.find((r) => r.id === selectedId) : undefined;
  const selectedAgent = settingsTab === 'agents' ? selectedRow : undefined;
  const closePanel = () => setSelection(null);
  const detailPanel: DetailPanel | undefined =
    product !== 'helpdesk' || reorderingSla || editedInbox
      ? undefined
      : selectedInbox
        ? {
            title: selectedInbox.name,
            icon: <InboxDetailsIcon type={selectedInbox.type} />,
            onClose: closePanel,
            children: <SettingsDetails fields={inboxFields(selectedInbox)} />,
          }
        : selectedAgent
          ? {
              title: selectedAgent.name,
              subtitle: 'Agent',
              icon: <DetailsAvatar name={selectedAgent.name} />,
              // ponytail: design placeholder — no edit behaviour yet; add onClick when one is decided.
              actions: [{ icon: 'pencil', label: 'Edit' }],
              onClose: closePanel,
              children: (
                <AgentDetails
                  key={selectedAgent.id}
                  agent={selectedAgent}
                  onChange={(patch) =>
                    setAgentEdits((prev) => ({ ...prev, [selectedAgent.id]: { ...prev[selectedAgent.id], ...patch } }))
                  }
                />
              ),
            }
          : selectedRow
            ? {
                title: selectedRow.name,
                icon: selectedRow.mediaType && <MediaTypeBadge mediaType={selectedRow.mediaType} />,
                onClose: closePanel,
                children: <SettingsDetails fields={rowFields(settingsTab, selectedRow)} />,
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
            ? integration.partner.name
            : editedInbox
              ? editedInbox.name
              : changePlan
              ? 'Change plan'
              : copy.title
      }
      titleIcon={
        integration ? (
          <span className="lc-is-title-icon">{integration.partner.icon}</span>
        ) : (
          editedInbox && <InboxDetailsIcon type={editedInbox.type} />
        )
      }
      onBack={
        integration
          ? () => onIntegrationChange('')
          : editedInbox
            ? () => onInboxChange('')
            : changePlan
              ? () => onChangePlanChange(false)
              : undefined
      }
      description={
        manageIndustries
          ? SETTINGS_COPY.variable.description
          : integration
            ? integration.form.description
            : editedInbox
              ? undefined
              : changePlan
              ? `You are on ${CURRENT_PLAN_TIER.name} at $${CURRENT_PLAN_TIER.pricePerMonth}/month. Prices are in USD. Recurring and usage-based charges bill every 30 days.`
              : copy.description
      }
      contentPadding={changePlan ? '48px 72px 72px' : settingsTab === 'custom-fields' ? 20 : undefined}
      detailPanel={detailPanel}
      onWatchVideo={() => alert(`Play tutorial video: ${copy.title}`)}
      onViewDocs={() => alert(`Open docs: ${copy.title}`)}
      headerActions={
        editedInbox ? (
          <Button
            variant="filled"
            color="primary"
            size="sm"
            style={{ width: 100 }}
            loading={savingHelpdeskSettings}
            onClick={fakeVerify}
          >
            Update
          </Button>
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
      {integration ? (
        <IntegrationSettings
          partnerName={integration.partner.name}
          status={integration.status}
          submitting={savingHelpdeskSettings}
          onSubmit={() => {
            setIntegrationSaves((prev) => ({ ...prev, [integration.partner.id]: integration.values }));
            setIntegrationEdits((prev) => ({ ...prev, [integration.partner.id]: {} }));
            fakeVerify();
          }}
          onRefresh={fakeVerify}
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
        />
      ) : editedInbox && editedInboxValues ? (
        <InboxSettings
          key={editedInbox.id}
          type={editedInbox.type}
          detail={editedInbox.detail}
          templates={REMINDER_TEMPLATES}
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
      ) : settingsTab === 'events' ? (
        <EventsTable loading={tableLoading} events={DEMO_EVENTS} onCustomEvents={() => alert('Manage custom events')} />
      ) : settingsTab === 'opt-out-users' ? (
        <OptOutUsersTable loading={tableLoading} users={DEMO_OPT_OUT_USERS} />
      ) : settingsTab === 'inboxes' ? (
        <InboxesTable
          loading={tableLoading}
          inboxes={visibleInboxes}
          searchValue={search}
          onSearchChange={setSearch}
          syncing={inboxSyncing}
          onRowEdit={(row) => onInboxChange(row.id)}
          onRowDelete={(row) => alert(`Delete inbox: ${row.name}`)}
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
          onRowEdit={(row) => alert(`Edit template: ${row.name}`)}
          onRowClone={(row) => alert(`Clone template: ${row.name}`)}
          onRowDelete={(row) => alert(`Delete template: ${row.name}`)}
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
