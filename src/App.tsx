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
import { type BroadcastRowData } from './components/BroadcastHomePage';
import { type FlowRowData } from './components/FlowsHomePage';
import { type BotFlowRowData } from './components/BotFlowsHomePage';
import { SettingsPage } from './components/SettingsPage';
import { SettingsScreen } from './components/SettingsScreen';
import { ContactsScreen } from './components/ContactsScreen';
import { TicketsScreen } from './components/TicketsScreen';
import { BroadcastScreen, BotFlowsScreen, FlowsScreen, KnowledgeBaseScreen, SegmentsScreen, TemplatesScreen } from './components/ListScreens';
import { SETTINGS_COPY } from './components/SettingsScreen/settingsTabs';
import { ProfileSettings } from './components/ProfileSettings';
import { AccountSettings } from './components/AccountSettings';
import { HelpDeskAccountSettings, type HelpDeskToggleKey } from './components/HelpDeskAccountSettings';

import { KB_COPY, USER_SETTINGS_COPY, USER_SETTINGS_TABS } from './data/settingsDemo';
import { DEMO_USER_SEGMENTS } from './data/segmentsDemo';
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
  const { product, selected, page, tab, manageIndustries, userSettingsTab, ticketId } = nav;
  const { switchProduct, leaveCanvas, openCanvas, setTab, setManageIndustries, setUserSettingsTab } = nav;
  const preset = sidebarPresets[product];
  // Account/Profile settings reached from the avatar popover — a dedicated
  // page with just those two tabs, separate from the product's own (much
  // longer) Settings nav.
  const userSettingsOpen = page === 'user-settings';

  const account = { name: 'Nonucare12' };
  const openTicketNumber = TICKETS.find((t) => t.id === ticketId)?.ticketId ?? '';
  const selectedLabel = preset.items.find((i) => i.id === selected)?.label ?? selected;

  const showCanvas = isCanvasPage(page);

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
              : showCanvas
                ? [
                    { label: selected === 'broadcast' ? 'Broadcast' : 'Flows', onClick: leaveCanvas },
                    { label: curFlow.id, copyable: true },
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
            <BroadcastScreen onRowClick={openBroadcastInEditor} onNewBroadcast={() => openCanvas('broadcast')} />
          )}
          {page === 'flows-list' && <FlowsScreen onRowClick={openFlowInEditor} onNewFlow={() => openCanvas('flows')} />}
          {page === 'bot-flows-list' && (
            <BotFlowsScreen onRowClick={openBotFlowInEditor} onNewFlow={() => openCanvas('bot-flows')} />
          )}
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
