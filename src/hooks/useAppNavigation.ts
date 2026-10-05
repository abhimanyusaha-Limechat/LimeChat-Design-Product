import { useEffect, useState } from 'react';
import { sidebarPresets, type SidebarProduct } from '../components/Sidebar/presets';
import { parseHash, toHash, type ScreenLocation } from './navigationHash';

export type FlowKind = 'broadcast' | 'flows' | 'bot-flows';
type View = 'list' | 'canvas';
type UserSettingsTab = 'account' | 'profile';

/** Everything the app shell can show in its main area. Exactly one is current at a time. */
export type Page =
  | 'user-settings'
  | 'tickets'
  | 'broadcast-list'
  | 'broadcast-canvas'
  | 'flows-list'
  | 'flows-canvas'
  | 'bot-flows-list'
  | 'bot-flows-canvas'
  | 'segments'
  | 'templates'
  | 'settings'
  | 'knowledge-base'
  | 'home';

export const isCanvasPage = (page: Page) =>
  page === 'broadcast-canvas' || page === 'flows-canvas' || page === 'bot-flows-canvas';

const FLOW_PAGE: Record<FlowKind, { list: Page; canvas: Page }> = {
  broadcast: { list: 'broadcast-list', canvas: 'broadcast-canvas' },
  flows: { list: 'flows-list', canvas: 'flows-canvas' },
  'bot-flows': { list: 'bot-flows-list', canvas: 'bot-flows-canvas' },
};

/**
 * Which product and rail item is open, which flow list/editor view each flow kind is in,
 * and the settings sub-navigation that resets whenever you navigate. `page` is derived
 * from that state, so adding a page means one `Page` member and one branch here.
 *
 * Product and rail item live in the URL hash (ADR 0001): navigating pushes a history
 * entry, and Back/Forward, manual edits and pasted links arrive as `hashchange`.
 */
export function useAppNavigation() {
  const [{ product, selected }, setLocation] = useState(() => parseHash(window.location.hash));
  const [flowViews, setFlowViews] = useState<Record<FlowKind, View>>({
    broadcast: 'list',
    flows: 'list',
    'bot-flows': 'list',
  });
  const [settingsTab, setSettingsTab] = useState('inboxes');
  const [manageIndustries, setManageIndustries] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [userSettingsTab, setUserSettingsTab] = useState<UserSettingsTab>('account');

  const flowKind: FlowKind | null =
    product === 'marketing' && selected === 'broadcast'
      ? 'broadcast'
      : product === 'marketing' && selected === 'automation-flows'
        ? 'flows'
        : product === 'automation' && selected === 'flows'
          ? 'bot-flows'
          : null;

  let page: Page = 'home';
  if (userSettingsOpen) page = 'user-settings';
  else if (flowKind) page = FLOW_PAGE[flowKind][flowViews[flowKind]];
  else if (product === 'marketing' && selected === 'segments') page = 'segments';
  else if ((product === 'marketing' || product === 'helpdesk') && selected === 'templates') page = 'templates';
  else if (selected === 'settings') page = 'settings';
  else if (product === 'automation' && selected === 'knowledge-base') page = 'knowledge-base';
  else if (product === 'helpdesk' && selected === 'tickets') page = 'tickets';

  /** Every navigation lands on a list view with the settings sub-navigation back at its start. */
  const resetViews = () => {
    setFlowViews({ broadcast: 'list', flows: 'list', 'bot-flows': 'list' });
    setSettingsTab('inboxes');
    setManageIndustries(false);
    setUserSettingsOpen(false);
  };

  /** Shows whatever the hash says, rewriting it in place (no history entry) if its path was broken. */
  const followHash = () => {
    const next = parseHash(window.location.hash);
    if (toHash(next) !== window.location.hash.split('?')[0])
      window.history.replaceState(window.history.state, '', toHash(next));
    setLocation(next);
    resetViews();
  };

  useEffect(() => {
    followHash();
    window.addEventListener('hashchange', followHash);
    return () => window.removeEventListener('hashchange', followHash);
  }, []); // followHash only calls stable state setters.

  const navigate = (to: ScreenLocation) => {
    window.history.pushState(null, '', toHash(to));
    followHash();
  };

  const select = (id: string) => navigate({ product, selected: id });

  const switchProduct = (next: SidebarProduct) => navigate({ product: next, selected: sidebarPresets[next].items[0].id });

  const setFlowView = (kind: FlowKind, view: View) => setFlowViews((v) => ({ ...v, [kind]: view }));

  return {
    product,
    selected,
    page,
    settingsTab,
    manageIndustries,
    userSettingsTab,
    select,
    switchProduct,
    openCanvas: (kind: FlowKind) => setFlowView(kind, 'canvas'),
    /** Back from the editor to the list of whichever flow kind is open. */
    leaveCanvas: () => flowKind && setFlowView(flowKind, 'list'),
    openUserSettings: (tab: UserSettingsTab) => {
      setUserSettingsTab(tab);
      setUserSettingsOpen(true);
    },
    setUserSettingsTab,
    setSettingsTab,
    setManageIndustries,
  };
}
