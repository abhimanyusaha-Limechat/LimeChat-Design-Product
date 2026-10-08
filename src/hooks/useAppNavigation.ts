import { useEffect, useState } from 'react';
import { sidebarPresets, type SidebarProduct } from '../components/Sidebar/presets';
import { flowKindOf, parseHash, toHash, toScreen, withoutUnknownParams, type FlowKind, type Screen, type UserSettingsTab } from './navigationHash';

export type { FlowKind };

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
  | 'contacts'
  | 'home';

export const isCanvasPage = (page: Page) =>
  page === 'broadcast-canvas' || page === 'flows-canvas' || page === 'bot-flows-canvas';

const FLOW_PAGE: Record<FlowKind, { list: Page; canvas: Page }> = {
  broadcast: { list: 'broadcast-list', canvas: 'broadcast-canvas' },
  flows: { list: 'flows-list', canvas: 'flows-canvas' },
  'bot-flows': { list: 'bot-flows-list', canvas: 'bot-flows-canvas' },
};

/**
 * Which Screen is open: product, rail item, flow list/editor view, settings sub-navigation
 * and user settings. `page` is derived from that, so adding a page means one `Page` member
 * and one branch here.
 *
 * The URL hash is the only copy of this state (ADR 0001). Every change writes a complete hash
 * and pushes a history entry; Back/Forward, manual edits and pasted links arrive as `hashchange`.
 * Navigating writes a hash without sub-views, which is what resets them.
 */
export function useAppNavigation() {
  const [screen, setScreen] = useState(() => parseHash(window.location.hash));
  const { product, selected, view, settingsTab, manageIndustries, userSettings } = screen;
  const flowKind = flowKindOf(product, selected);

  let page: Page = 'home';
  if (userSettings) page = 'user-settings';
  else if (flowKind) page = FLOW_PAGE[flowKind][view];
  else if (product === 'marketing' && selected === 'segments') page = 'segments';
  else if ((product === 'marketing' || product === 'helpdesk') && selected === 'templates') page = 'templates';
  else if (selected === 'settings') page = 'settings';
  else if (product === 'automation' && selected === 'knowledge-base') page = 'knowledge-base';
  else if (product === 'helpdesk' && selected === 'tickets') page = 'tickets';
  else if (product === 'helpdesk' && selected === 'contacts') page = 'contacts';

  /** Shows whatever the hash says, rewriting it in place (no history entry) if any of it was broken. */
  const followHash = () => {
    const next = parseHash(window.location.hash);
    if (toHash(next) !== withoutUnknownParams(window.location.hash))
      window.history.replaceState(window.history.state, '', toHash(next));
    setScreen(next);
  };

  useEffect(() => {
    followHash();
    window.addEventListener('hashchange', followHash);
    return () => window.removeEventListener('hashchange', followHash);
  }, []); // followHash only calls a stable state setter.

  const navigate = (to: Screen) => {
    if (toHash(to) === window.location.hash) return;
    window.history.pushState(null, '', toHash(to));
    followHash();
  };

  /** Changes part of the current Screen. Reads the hash, not render state, so calls in one handler compose. */
  const update = (patch: Partial<Screen>) => navigate(toScreen({ ...parseHash(window.location.hash), ...patch }));

  return {
    product,
    selected,
    page,
    settingsTab,
    manageIndustries,
    userSettingsTab: userSettings ?? 'account',
    select: (id: string) => navigate(toScreen({ product, selected: id })),
    switchProduct: (next: SidebarProduct) => navigate(toScreen({ product: next, selected: sidebarPresets[next].items[0].id })),
    openCanvas: (_kind: FlowKind) => update({ view: 'canvas' }),
    /** Back from the editor to the list of whichever flow kind is open. */
    leaveCanvas: () => update({ view: 'list' }),
    openUserSettings: (tab: UserSettingsTab) => update({ userSettings: tab }),
    setUserSettingsTab: (tab: UserSettingsTab) => update({ userSettings: tab }),
    /** Picking a tab, even the current one, also closes Manage industries. */
    setSettingsTab: (id: string) => update({ settingsTab: id, manageIndustries: false }),
    setManageIndustries: (open: boolean) => update({ manageIndustries: open }),
  };
}
