/** Demo harness for the reusable components. Not part of the published components. */
import { useState } from 'react';
import { useClerk } from '@clerk/react';
import { Sidebar } from './components/Sidebar';
import { sidebarPresets, type SidebarProduct } from './components/Sidebar/presets';
import { isCanvasPage, useAppNavigation } from './hooks/useAppNavigation';
import { TopNavBar } from './components/TopNavBar';
import {
  campaignsTopNav,
  helpDeskTopNav,
  automationTopNav,
} from './components/TopNavBar/presets';
import { Button } from './components/Button';
import { SettingsPage } from './components/SettingsPage';
import { SettingsScreen } from './components/SettingsScreen';
import { ContactsScreen } from './components/ContactsScreen';
import { TicketsScreen } from './components/TicketsScreen';
import { FlowEditorScreen, editorSetup, findFlow } from './components/FlowEditorScreen';
import { AgentsScreen, BroadcastScreen, BotFlowsScreen, FlowsScreen, KnowledgeBaseScreen, SegmentsScreen, TemplatesScreen } from './components/ListScreens';
import { SETTINGS_COPY } from './components/SettingsScreen/settingsTabs';
import { ProfileSettings, TIMEZONE_OPTIONS, type HelpDeskContact } from './components/ProfileSettings';
import { AccountSettings } from './components/AccountSettings';
import {
  HelpDeskAccountSettings,
  HelpDeskToggleSettings,
  type HelpDeskAccountSettingsProps,
  type HelpDeskToggleKey,
} from './components/HelpDeskAccountSettings';

import {
  KB_COPY,
  PUSH_NOTIFICATION_OPTIONS,
  USER_SETTINGS_COPY,
  USER_SETTINGS_TABS,
  DEMO_AGENTS,
  DEMO_TEAMS,
  DEMO_INBOXES,
  findIntegrationPartner,
  type PushNotificationKey,
} from './data/settingsDemo';
import { getPickedAccount } from './components/AccountPicker';
import { TICKETS } from './data/ticketsDemo';

const PRODUCTS: { id: SidebarProduct; label: string }[] = [
  { id: 'helpdesk', label: 'Helpdesk' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'automation', label: 'Automation' },
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
  const { signOut } = useClerk();
  const nav = useAppNavigation();
  const { product, selected, page, tab, manageIndustries, integration, inbox, agent, team, changePlan, userSettingsTab, ticketId, flowKind, flowId } = nav;
  const { switchProduct, leaveCanvas, setTab, setManageIndustries, setIntegration, setInbox, setAgent, setTeam, setChangePlan, setUserSettingsTab } = nav;
  const preset = sidebarPresets[product];
  // Account/Profile settings reached from the avatar popover — a dedicated
  // page with just those two tabs, separate from the product's own (much
  // longer) Settings nav.
  const userSettingsOpen = page === 'user-settings';

  const account = { name: 'Nonucare12' };
  const openTicketNumber = TICKETS.find((t) => t.id === ticketId)?.ticketId ?? '';
  const selectedLabel = preset.items.find((i) => i.id === selected)?.label ?? selected;

  const showCanvas = isCanvasPage(page);
  const openFlow = showCanvas && flowKind ? findFlow(flowKind, flowId) : null;

  const [profileName, setProfileName] = useState('LimeChat');
  // Last saved name — "Save changes" stays disabled until the name differs from it.
  const [savedProfileName, setSavedProfileName] = useState(profileName);
  const [hdContact, setHdContact] = useState<HelpDeskContact>({
    displayName: 'Aditi',
    phone: '+91 98765 43210',
    webrtcId: 'aditi.rao@webrtc.limechat.ai',
    timezone: TIMEZONE_OPTIONS[0],
    address: '',
  });
  const [savedHdContact, setSavedHdContact] = useState(hdContact);
  const contactDirty = product === 'helpdesk' && JSON.stringify(hdContact) !== JSON.stringify(savedHdContact);
  const profileDirty = profileName.trim() !== '' && (profileName !== savedProfileName || contactDirty);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [requestingPasswordChange, setRequestingPasswordChange] = useState(false);
  const [apiKeyMasked, setApiKeyMasked] = useState('lcuat.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [actionCableReceipts, setActionCableReceipts] = useState(false);

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
  const [pushNotifications, setPushNotifications] = useState(
    () => Object.fromEntries(PUSH_NOTIFICATION_OPTIONS.map((o) => [o.key, true])) as Record<PushNotificationKey, boolean>,
  );
  const hdAccountProps: HelpDeskAccountSettingsProps = {
    companyName: hdCompanyName,
    onCompanyNameChange: setHdCompanyName,
    websiteUrl: hdWebsiteUrl,
    onWebsiteUrlChange: setHdWebsiteUrl,
    currency: hdCurrency,
    onCurrencyChange: setHdCurrency,
    siteLanguageOptions: ['English (En)', 'Hindi', 'Spanish'],
    siteLanguage: hdSiteLanguage,
    onSiteLanguageChange: setHdSiteLanguage,
    toggles: hdToggles,
    onToggleChange: (key, next) => setHdToggles((prev) => ({ ...prev, [key]: next })),
    selectedFileTypes: hdSelectedFileTypes,
    onFileTypeToggle: (id, next) =>
      setHdSelectedFileTypes((prev) => (next ? [...prev, id] : prev.filter((t) => t !== id))),
  };

  // 'a0' is the header account — no list row matches, so none is pre-highlighted.
  const [pickedAccount] = useState(getPickedAccount);
  const [activeAccount, setActiveAccount] = useState('a0');
  const [accountQuery, setAccountQuery] = useState('');
  const accountMenu = {
    current: { id: 'a0', name: pickedAccount?.name ?? 'Nonucare12', number: pickedAccount?.id ?? '12345561' },
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
              onClick: () => void signOut(),
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
              : showCanvas && openFlow
                ? [
                    { label: editorSetup(openFlow).listLabel, onClick: leaveCanvas },
                    openFlow.displayId ? { label: openFlow.displayId, copyable: true } : { label: openFlow.name },
                  ]
                : page === 'tickets'
                  ? [{ label: 'Tickets' }, { label: openTicketNumber, copyable: true }]
                  : page === 'settings'
                    ? [
                        {
                          label: selectedLabel,
                          onClick: () => setTab('inboxes'),
                        },
                        {
                          label: SETTINGS_COPY[tab].title,
                          onClick: () => setTab(tab),
                        },
                        ...(manageIndustries ? [{ label: 'Manage industries' }] : []),
                        ...(integration ? [{ label: findIntegrationPartner(integration)?.name ?? integration }] : []),
                        ...(inbox ? [{ label: DEMO_INBOXES.find((i) => i.id === inbox)?.name ?? inbox }] : []),
                        ...(agent ? [{ label: DEMO_AGENTS.find((a) => a.id === agent)?.name ?? agent }] : []),
                        ...(team ? [{ label: DEMO_TEAMS.find((t) => t.id === team)?.name ?? team }] : []),
                        ...(changePlan ? [{ label: 'Change plan' }] : []),
                      ]
                    : page === 'knowledge-base'
                      ? [
                          { label: selectedLabel, onClick: () => setTab('upload-files') },
                          { label: KB_COPY[tab].title },
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
          style={{
            flex: 1,
            position: 'relative',
            minWidth: 0,
            minHeight: 0,
            background: showCanvas
              ? 'radial-gradient(circle, #D9D9D9 1px, transparent 1px) 0 0 / 20px 20px, #FAF9F5'
              : '#F5F5F5',
            overflow: 'visible',
          }}
        >
          {userSettingsOpen && (
            <SettingsPage
              tabs={USER_SETTINGS_TABS}
              activeTab={userSettingsTab}
              onTabChange={(id) => setUserSettingsTab(id as 'account' | 'profile')}
              title={USER_SETTINGS_COPY[userSettingsTab].title}
              description={USER_SETTINGS_COPY[userSettingsTab].description}
              headerActions={
                userSettingsTab === 'profile' && (
                  <Button
                    variant="filled"
                    color="primary"
                    size="sm"
                    loading={updatingProfile}
                    disabled={!profileDirty}
                    onClick={() => {
                      setSavedProfileName(profileName);
                      setSavedHdContact(hdContact);
                      setUpdatingProfile(true);
                      window.setTimeout(() => setUpdatingProfile(false), 700);
                    }}
                  >
                    Save changes
                  </Button>
                )
              }
            >
              {userSettingsTab === 'profile' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
                  <ProfileSettings
                    email="team@limechat.ai"
                    name={profileName}
                    onNameChange={setProfileName}
                    contact={product === 'helpdesk' ? hdContact : undefined}
                    onContactChange={setHdContact}
                    accessTokenMasked={product === 'helpdesk' ? `lcat.${'X'.repeat(36)}` : undefined}
                    avatar={
                      product === 'helpdesk'
                        ? {
                            src: avatarUrl,
                            onChange: (file) => {
                              if (avatarUrl) URL.revokeObjectURL(avatarUrl);
                              setAvatarUrl(file ? URL.createObjectURL(file) : undefined);
                            },
                          }
                        : undefined
                    }
                    actionCableReceipts={
                      product === 'helpdesk' ? { checked: actionCableReceipts, onChange: setActionCableReceipts } : undefined
                    }
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
                  {product === 'helpdesk' && (
                    <HelpDeskToggleSettings
                      heading={{
                        title: 'Push notifications',
                        description: 'Choose which events send you a push notification.',
                      }}
                      options={PUSH_NOTIFICATION_OPTIONS}
                      values={pushNotifications}
                      onChange={(key, next) => setPushNotifications((prev) => ({ ...prev, [key]: next }))}
                    />
                  )}
                </div>
              ) : product === 'helpdesk' ? (
                <HelpDeskAccountSettings {...hdAccountProps} />
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
          {showCanvas && <FlowEditorScreen />}

          {page === 'broadcast-list' && <BroadcastScreen />}
          {page === 'flows-list' && <FlowsScreen />}
          {page === 'bot-flows-list' && <BotFlowsScreen />}
          {page === 'agents' && <AgentsScreen />}
          {page === 'segments' && <SegmentsScreen />}
          {page === 'templates' && <TemplatesScreen />}
          {page === 'knowledge-base' && <KnowledgeBaseScreen />}

          {page === 'settings' && (
            <SettingsScreen
              product={product}
              settingsTab={tab}
              manageIndustries={manageIndustries}
              onTabChange={setTab}
              onManageIndustriesChange={setManageIndustries}
              integration={integration}
              onIntegrationChange={setIntegration}
              inbox={inbox}
              onInboxChange={setInbox}
              agent={agent}
              onAgentChange={setAgent}
              team={team}
              onTeamChange={setTeam}
              changePlan={changePlan}
              onChangePlanChange={setChangePlan}
            />
          )}

          {page === 'contacts' && <ContactsScreen />}

          {page === 'tickets' && <TicketsScreen />}

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

    </div>
  );
}
