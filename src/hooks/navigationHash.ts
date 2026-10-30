import { sidebarPresets, type SidebarProduct } from '../components/Sidebar/presets';
import { SETTINGS_TABS_BY_PRODUCT } from '../components/SettingsScreen/settingsTabs';
import { TICKETS } from '../data/ticketsDemo';
import { DEMO_AGENTS, DEMO_CANNED, DEMO_CANNED_LIBRARY, DEMO_INBOXES, DEMO_RULES, DEMO_RULE_LIBRARY, DEMO_SLA, DEMO_SLA_LIBRARY, DEMO_TEAMS, INTEGRATION_FORMS, KB_TABS } from '../data/settingsDemo';
import { FLOW_ROWS } from '../data/flowsDemo';
import type { BroadcastTab } from '../components/BroadcastHomePage';
import type { FlowTab } from '../components/FlowsHomePage';
import type { BotFlowTab } from '../components/BotFlowsHomePage';
import type { SegmentSourceTab } from '../components/SegmentsHomePage';
import type { TemplateChannel } from '../components/TemplatesHomePage';

export type FlowKind = 'broadcast' | 'flows' | 'bot-flows';
export type UserSettingsTab = 'account' | 'profile';

/** Everything the URL hash owns: `#/<product>/<item>?view=…&tab=…&flow=…&industries=1&integration=…&inbox=…&plans=1&ticket=…&user=…`. */
export type Screen = {
  product: SidebarProduct;
  selected: string;
  view: 'list' | 'canvas';
  /** The Settings tab or List tab; '' on items that have neither. */
  tab: string;
  manageIndustries: boolean;
  /** The Integration tab's open partner form, e.g. 'freshdesk'; '' when the tile grid shows. */
  integration: string;
  /** The inbox being edited, by id (from the Inboxes or Widget tab); '' when the list shows. */
  inbox: string;
  /** The agent being edited, by id (from the Agents tab); '' when the list shows. */
  agent: string;
  /** The team being edited, by id (from the Teams tab); '' when the list shows. */
  team: string;
  /** The automation rule or SLA policy being edited, by id (from the Automation rules or SLA rules tab); '' when the list shows. */
  rule: string;
  /** HelpDesk Billing's "Change plan" sub-view. */
  changePlan: boolean;
  /** The open ticket's id. Only Helpdesk Tickets has one; elsewhere it stays at the default. */
  ticket: string;
  /** The Flow editor's flow: a row id, or 'new' for "+ New". '' outside the editor. */
  flow: string;
  userSettings: UserSettingsTab | null;
};

const DEFAULTS = { view: 'list', manageIndustries: false, integration: '', inbox: '', agent: '', team: '', rule: '', changePlan: false, ticket: TICKETS[0].id, userSettings: null } as const;

/** The rows that have an edit page, by Settings tab. */
const RULE_ROWS_BY_TAB: Record<string, { id: string }[]> = {
  'automation-rules': [...DEMO_RULES, ...DEMO_RULE_LIBRARY],
  'sla-rules': [...DEMO_SLA, ...DEMO_SLA_LIBRARY],
  'canned-responses': [...DEMO_CANNED, ...DEMO_CANNED_LIBRARY],
};

const TEMPLATE_CHANNELS = ['whatsapp', 'sms', 'email'] satisfies TemplateChannel[];
/** Each list Screen's List tabs, by `<product>/<item>`; the first is the default. */
const LIST_TABS: Record<string, readonly string[]> = {
  'marketing/broadcast': ['triggered', 'scheduled', 'draft'] satisfies BroadcastTab[],
  'marketing/automation-flows': ['active', 'inactive', 'draft'] satisfies FlowTab[],
  'automation/flows': ['active', 'inactive'] satisfies BotFlowTab[],
  'marketing/segments': ['lc-segments', 'imported'] satisfies SegmentSourceTab[],
  'marketing/templates': TEMPLATE_CHANNELS,
  'helpdesk/templates': TEMPLATE_CHANNELS,
  'automation/knowledge-base': KB_TABS.map((t) => t.id),
};

/**
 * The tabs a rail item offers and the one it opens on. Settings opens on Inboxes, which isn't
 * every Product's first tab, so `#/<product>/settings` keeps meaning what it always has.
 */
/** The flow the editor opens when the URL names none: the List tab's first row. */
const defaultFlow = (kind: FlowKind, tab: string) =>
  (FLOW_ROWS[kind] as Record<string, { id: string }[]>)[tab]?.[0]?.id ?? 'new';

const isFlowOf = (kind: FlowKind, id: unknown) =>
  id === 'new' || Object.values(FLOW_ROWS[kind]).some((rows: { id: string }[]) => rows.some((row) => row.id === id));

function tabsOf(product: SidebarProduct, selected: string): { ids: readonly string[]; fallback: string } {
  if (selected === 'settings') return { ids: SETTINGS_TABS_BY_PRODUCT[product].map((t) => t.id), fallback: 'inboxes' };
  const ids = LIST_TABS[`${product}/${selected}`] ?? [];
  return { ids, fallback: ids[0] ?? '' };
}

const isProduct = (value: string): value is SidebarProduct =>
  Object.prototype.hasOwnProperty.call(sidebarPresets, value);

/** Which flow list/editor a rail item opens, if any. */
export const flowKindOf = (product: SidebarProduct, selected: string): FlowKind | null =>
  product === 'marketing' && selected === 'broadcast'
    ? 'broadcast'
    : product === 'marketing' && selected === 'automation-flows'
      ? 'flows'
      : product === 'automation' && selected === 'flows'
        ? 'bot-flows'
        : null;

/**
 * Turns any mix of fields into a Screen that can actually be shown: an unknown product opens
 * Helpdesk's first item, an unknown item the product's first item, and sub-views that don't
 * apply to the item (an editor on a non-flow item, a tab another product doesn't have,
 * industries outside Bot templates) fall back to their defaults.
 */
export function toScreen(fields: { product: string; selected: string } & Partial<Record<keyof Screen, unknown>>): Screen {
  const product = isProduct(fields.product) ? fields.product : 'helpdesk';
  const { items, footerItems } = sidebarPresets[product];
  const selected =
    product === fields.product && [...items, ...footerItems].some((item) => item.id === fields.selected)
      ? fields.selected
      : items[0].id;
  const onSettings = selected === 'settings';
  const tabs = tabsOf(product, selected);
  const tab = tabs.ids.some((id) => id === fields.tab) ? String(fields.tab) : tabs.fallback;
  const kind = flowKindOf(product, selected);
  const view = fields.view === 'canvas' && kind ? 'canvas' : 'list';
  return {
    product,
    selected,
    view,
    tab,
    flow: kind && view === 'canvas' ? (isFlowOf(kind, fields.flow) ? String(fields.flow) : defaultFlow(kind, tab)) : '',
    manageIndustries: onSettings && tab === 'bot-templates' && fields.manageIndustries === true,
    integration:
      onSettings &&
      (tab === 'hd-integration' || tab === 'integrations') &&
      typeof fields.integration === 'string' &&
      Object.prototype.hasOwnProperty.call(INTEGRATION_FORMS, fields.integration)
        ? fields.integration
        : DEFAULTS.integration,
    inbox: onSettings && (tab === 'inboxes' || tab === 'widget') && DEMO_INBOXES.some((i) => i.id === fields.inbox) ? String(fields.inbox) : DEFAULTS.inbox,
    agent:
      onSettings && product === 'helpdesk' && tab === 'agents' && DEMO_AGENTS.some((a) => a.id === fields.agent)
        ? String(fields.agent)
        : DEFAULTS.agent,
    team:
      onSettings && product === 'helpdesk' && tab === 'teams' && DEMO_TEAMS.some((t) => t.id === fields.team)
        ? String(fields.team)
        : DEFAULTS.team,
    rule:
      onSettings && product === 'helpdesk' && (RULE_ROWS_BY_TAB[tab] ?? []).some((r) => r.id === fields.rule)
        ? String(fields.rule)
        : DEFAULTS.rule,
    changePlan: onSettings && product === 'helpdesk' && tab === 'billing' && fields.changePlan === true,
    ticket:
      product === 'helpdesk' && selected === 'tickets' && TICKETS.some((t) => t.id === fields.ticket)
        ? String(fields.ticket)
        : DEFAULTS.ticket,
    userSettings: fields.userSettings === 'account' || fields.userSettings === 'profile' ? fields.userSettings : null,
  };
}

/** Reads a hash; unknown query parameters are ignored. */
export function parseHash(hash: string): Screen {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const [product = '', selected = ''] = path.split('/');
  const params = new URLSearchParams(query);
  return toScreen({
    product,
    selected,
    view: params.get('view'),
    tab: params.get('tab'),
    manageIndustries: params.get('industries') === '1',
    integration: params.get('integration'),
    inbox: params.get('inbox'),
    agent: params.get('agent'),
    team: params.get('team'),
    rule: params.get('rule'),
    changePlan: params.get('plans') === '1',
    ticket: params.get('ticket'),
    flow: params.get('flow'),
    userSettings: params.get('user'),
  });
}

/** Writes a Screen as a hash, with only the sub-views that differ from their defaults. */
export function toHash(screen: Screen) {
  const params = new URLSearchParams();
  if (screen.view !== DEFAULTS.view) params.set('view', screen.view);
  if (screen.tab !== tabsOf(screen.product, screen.selected).fallback) params.set('tab', screen.tab);
  if (screen.manageIndustries) params.set('industries', '1');
  if (screen.integration) params.set('integration', screen.integration);
  if (screen.inbox) params.set('inbox', screen.inbox);
  if (screen.agent) params.set('agent', screen.agent);
  if (screen.team) params.set('team', screen.team);
  if (screen.rule) params.set('rule', screen.rule);
  if (screen.changePlan) params.set('plans', '1');
  if (screen.ticket !== DEFAULTS.ticket) params.set('ticket', screen.ticket);
  const kind = flowKindOf(screen.product, screen.selected);
  if (kind && screen.view === 'canvas' && screen.flow !== defaultFlow(kind, screen.tab)) params.set('flow', screen.flow);
  if (screen.userSettings) params.set('user', screen.userSettings);
  const query = params.toString();
  return `#/${screen.product}/${screen.selected}${query ? `?${query}` : ''}`;
}

const KNOWN_PARAMS = ['view', 'tab', 'flow', 'industries', 'integration', 'inbox', 'agent', 'team', 'rule', 'plans', 'ticket', 'user'];

/** The hash with unknown query parameters removed, to compare against `toHash`. */
export function withoutUnknownParams(hash: string) {
  const [path, query = ''] = hash.split('?');
  const params = new URLSearchParams(query);
  for (const key of [...params.keys()]) if (!KNOWN_PARAMS.includes(key)) params.delete(key);
  const known = params.toString();
  return known ? `${path}?${known}` : path;
}
