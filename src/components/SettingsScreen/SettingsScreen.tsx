/**
 * SettingsScreen: the Settings Screen of a Product. Owns the state, filtering and
 * per-tab content of every Settings tab; `App` only says which Product and tab are open.
 *
 * State here lives only while the Screen is mounted, so leaving Settings resets it.
 * The search box resets on every tab switch.
 */
import { useState } from 'react';
import type { SidebarProduct } from '../Sidebar/presets';
import { SettingsPage } from '../SettingsPage';
import { InboxesTable } from '../InboxesTable';
import { EventsTable } from '../EventsTable';
import { BotTemplatesTable, type BotTemplateRow } from '../BotTemplatesTable';
import { DataSecuritySettings, type PiiTypeKey, type ProfanityWord } from '../DataSecuritySettings';
import { AttributionSettings, type AttributionWindowKey, type AttributionWindowValue } from '../AttributionSettings';
import {
  BotCsatSettings,
  type CsatFlowKey,
  type CsatRatingScale,
  type CsatTimeDelay,
} from '../BotCsatSettings';
import { IntegrationsHomePage } from '../IntegrationsHomePage';
import { TagsInput } from '../TagsInput';
import { Button } from '../Button';
import { Icon } from '../icons';
import {
  AGENT_INBOXES,
  BOT_TEMPLATE_INDUSTRIES,
  CUSTOM_FIELD_TYPES,
  DEMO_AGENTS,
  DEMO_BOT_TEMPLATES,
  DEMO_CANNED,
  DEMO_CANNED_LIBRARY,
  DEMO_COLLABORATORS,
  DEMO_CONTACT_FIELDS,
  DEMO_CONVERSATION_FIELDS,
  DEMO_EVENTS,
  DEMO_INBOXES,
  DEMO_INDUSTRIES,
  DEMO_RULES,
  DEMO_RULE_LIBRARY,
  DEMO_SLA,
  DEMO_SLA_LIBRARY,
  DEMO_TEAMS,
  DEMO_USE_CASES,
  DEMO_VARIABLES,
  INBOX_NAMES,
  INTEGRATION_CATEGORIES,
  VARIABLE_DATA_TYPES,
  withFieldMeta,
} from '../../data/settingsDemo';
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
  onTabChange: (id: string) => void;
  onManageIndustriesChange: (next: boolean) => void;
}

const WhatsAppIcon = () => <Icon name="whatsapp" stroke="#8C8C8C" />;

const PlusIcon = () => <Icon name="plus" />;

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

export function SettingsScreen({ product, settingsTab, manageIndustries, onTabChange, onManageIndustriesChange }: SettingsScreenProps) {
  // The search box is shared by every tab's table but belongs to one tab: reading it under a
  // different tab gives '' so it resets on any tab change, including back/forward in the URL.
  const [searchState, setSearchState] = useState({ tab: settingsTab, value: '' });
  const search = searchState.tab === settingsTab ? searchState.value : '';
  const setSearch = (value: string) => setSearchState({ tab: settingsTab, value });
  const query = search.trim().toLowerCase();

  const [inboxSyncing, setInboxSyncing] = useState(false);
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

  return (
    <SettingsPage
      tabs={SETTINGS_TABS_BY_PRODUCT[product]}
      activeTab={settingsTab}
      onTabChange={onTabChange}
      title={manageIndustries ? 'Manage industries' : SETTINGS_COPY[settingsTab].title}
      description={manageIndustries ? SETTINGS_COPY.variable.description : SETTINGS_COPY[settingsTab].description}
      contentPadding={settingsTab === 'custom-fields' ? 20 : undefined}
      onWatchVideo={() => alert(`Play tutorial video: ${SETTINGS_COPY[settingsTab].title}`)}
      onViewDocs={() => alert(`Open docs: ${SETTINGS_COPY[settingsTab].title}`)}
      headerActions={
        manageIndustries ? (
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
      ) : settingsTab === 'events' ? (
        <EventsTable events={DEMO_EVENTS} onCustomEvents={() => alert('Manage custom events')} />
      ) : settingsTab === 'inboxes' ? (
        <InboxesTable
          inboxes={visibleInboxes}
          searchValue={search}
          onSearchChange={setSearch}
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
