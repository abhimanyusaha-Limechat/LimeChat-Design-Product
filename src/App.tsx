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
import { SettingsPage } from './components/SettingsPage';
import { SettingsScreen } from './components/SettingsScreen';
import { ContactsScreen } from './components/ContactsScreen';
import { TicketsScreen } from './components/TicketsScreen';
import { FlowEditorScreen, editorSetup, findFlow } from './components/FlowEditorScreen';
import { BroadcastScreen, BotFlowsScreen, FlowsScreen, KnowledgeBaseScreen, SegmentsScreen, TemplatesScreen } from './components/ListScreens';
import { SETTINGS_COPY } from './components/SettingsScreen/settingsTabs';
import { ProfileSettings } from './components/ProfileSettings';
import { AccountSettings } from './components/AccountSettings';
import { HelpDeskAccountSettings, type HelpDeskToggleKey } from './components/HelpDeskAccountSettings';

import { KB_COPY, USER_SETTINGS_COPY, USER_SETTINGS_TABS } from './data/settingsDemo';
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
  const { product, selected, page, tab, manageIndustries, userSettingsTab, ticketId, flowKind, flowId } = nav;
  const { switchProduct, leaveCanvas, setTab, setManageIndustries, setUserSettingsTab } = nav;
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
                          onClick: () => setManageIndustries(false),
                        },
                        ...(manageIndustries ? [{ label: 'Manage industries' }] : []),
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
          {showCanvas && <FlowEditorScreen />}

          {page === 'broadcast-list' && <BroadcastScreen />}
          {page === 'flows-list' && <FlowsScreen />}
          {page === 'bot-flows-list' && <BotFlowsScreen />}
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
