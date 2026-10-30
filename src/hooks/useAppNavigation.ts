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
  | 'agents'
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

/** What the main area shows for a Screen. Adding a page means one `Page` member and one branch here. */
export function pageOf({ product, selected, view, userSettings }: Screen): Page {
  const flowKind = flowKindOf(product, selected);
  if (userSettings) return 'user-settings';
  if (flowKind) return FLOW_PAGE[flowKind][view];
  if (product === 'marketing' && selected === 'segments') return 'segments';
  if ((product === 'marketing' || product === 'helpdesk') && selected === 'templates') return 'templates';
  if (selected === 'settings') return 'settings';
  if (product === 'automation' && selected === 'agents') return 'agents';
  if (product === 'automation' && selected === 'knowledge-base') return 'knowledge-base';
  if (product === 'helpdesk' && selected === 'tickets') return 'tickets';
  if (product === 'helpdesk' && selected === 'contacts') return 'contacts';
  return 'home';
}

/**
 * Which Screen is open: product, rail item, flow list/editor view, settings sub-navigation
 * and user settings. `page` is derived from that by `pageOf`.
 *
 * The URL hash is the only copy of this state (ADR 0001). Every change writes a complete hash
 * and pushes a history entry; Back/Forward, manual edits and pasted links arrive as `hashchange`.
 * `pushState` fires no event, so navigating announces its own `hashchange`: every caller of this
 * hook, and anything else following the Screen (Comments), sees the same hash.
 * Navigating writes a hash without sub-views, which is what resets them.
 */
export function useAppNavigation() {
  const [screen, setScreen] = useState(() => parseHash(window.location.hash));
  const { product, selected, tab, manageIndustries, integration, inbox, agent, team, rule, changePlan, ticket, flow, userSettings } = screen;
  const flowKind = flowKindOf(product, selected);
  const page = pageOf(screen);

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
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  /** Changes part of the current Screen. Reads the hash, not render state, so calls in one handler compose. */
  const update = (patch: Partial<Screen>) => navigate(toScreen({ ...parseHash(window.location.hash), ...patch }));

  return {
    product,
    selected,
    page,
    /** The Settings tab or List tab. */
    tab,
    manageIndustries,
    /** The Integration tab's open partner form; '' when the tile grid shows. */
    integration,
    /** The inbox being edited (from the Inboxes or Widget tab); '' when the list shows. */
    inbox,
    /** The agent being edited (from the Agents tab); '' when the list shows. */
    agent,
    /** The team being edited (from the Teams tab); '' when the list shows. */
    team,
    /** The automation rule or SLA policy being edited (from the Automation rules or SLA rules tab); '' when the list shows. */
    rule,
    /** HelpDesk Billing's "Change plan" sub-view is open. */
    changePlan,
    ticketId: ticket,
    /** Which Broadcast, Flow or Bot flow list/editor this item opens, if any. */
    flowKind,
    /** The Flow editor's flow: a row id or 'new'; '' outside the editor. */
    flowId: flow,
    userSettingsTab: userSettings ?? 'account',
    select: (id: string) => navigate(toScreen({ product, selected: id })),
    switchProduct: (next: SidebarProduct) => navigate(toScreen({ product: next, selected: sidebarPresets[next].items[0].id })),
    /** Opens a row, or 'new' for "+ New", in the Flow editor. */
    openFlow: (id: string) => update({ view: 'canvas', flow: id }),
    /** Back from the editor to the list of whichever flow kind is open. */
    leaveCanvas: () => update({ view: 'list' }),
    openUserSettings: (tab: UserSettingsTab) => update({ userSettings: tab }),
    setUserSettingsTab: (tab: UserSettingsTab) => update({ userSettings: tab }),
    /** Picking a tab, even the current one, also closes Manage industries, any partner form, inbox edit and Change plan. */
    setTab: (id: string) => update({ tab: id, manageIndustries: false, integration: '', inbox: '', agent: '', team: '', rule: '', changePlan: false }),
    setManageIndustries: (open: boolean) => update({ manageIndustries: open }),
    /** Opens a partner's form on the Integration tab; '' goes back to the tile grid. */
    setIntegration: (id: string) => update({ integration: id }),
    /** Opens an inbox's edit page from the Inboxes or Widget tab; '' goes back to the list. */
    setInbox: (id: string) => update({ inbox: id }),
    /** Opens an agent's edit page from the Agents tab; '' goes back to the list. */
    setAgent: (id: string) => update({ agent: id }),
    /** Opens a team's edit page from the Teams tab; '' goes back to the list. */
    setTeam: (id: string) => update({ team: id }),
    /** Opens a rule's or SLA policy's edit page; '' goes back to the list. */
    setRule: (id: string) => update({ rule: id }),
    setChangePlan: (open: boolean) => update({ changePlan: open }),
    openTicket: (id: string) => update({ ticket: id }),
  };
}
