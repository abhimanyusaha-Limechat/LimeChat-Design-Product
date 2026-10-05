import { sidebarPresets, type SidebarProduct } from '../components/Sidebar/presets';
import { SETTINGS_TABS_BY_PRODUCT } from '../components/SettingsScreen/settingsTabs';

export type FlowKind = 'broadcast' | 'flows' | 'bot-flows';
export type UserSettingsTab = 'account' | 'profile';

/** Everything the URL hash owns: `#/<product>/<item>?view=…&tab=…&industries=1&user=…`. */
export type Screen = {
  product: SidebarProduct;
  selected: string;
  view: 'list' | 'canvas';
  settingsTab: string;
  manageIndustries: boolean;
  userSettings: UserSettingsTab | null;
};

const DEFAULTS = { view: 'list', settingsTab: 'inboxes', manageIndustries: false, userSettings: null } as const;

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
  const settingsTab =
    onSettings && SETTINGS_TABS_BY_PRODUCT[product].some((tab) => tab.id === fields.settingsTab)
      ? String(fields.settingsTab)
      : DEFAULTS.settingsTab;
  return {
    product,
    selected,
    view: fields.view === 'canvas' && flowKindOf(product, selected) ? 'canvas' : 'list',
    settingsTab,
    manageIndustries: onSettings && settingsTab === 'bot-templates' && fields.manageIndustries === true,
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
    settingsTab: params.get('tab'),
    manageIndustries: params.get('industries') === '1',
    userSettings: params.get('user'),
  });
}

/** Writes a Screen as a hash, with only the sub-views that differ from their defaults. */
export function toHash(screen: Screen) {
  const params = new URLSearchParams();
  if (screen.view !== DEFAULTS.view) params.set('view', screen.view);
  if (screen.settingsTab !== DEFAULTS.settingsTab) params.set('tab', screen.settingsTab);
  if (screen.manageIndustries) params.set('industries', '1');
  if (screen.userSettings) params.set('user', screen.userSettings);
  const query = params.toString();
  return `#/${screen.product}/${screen.selected}${query ? `?${query}` : ''}`;
}

const KNOWN_PARAMS = ['view', 'tab', 'industries', 'user'];

/** The hash with unknown query parameters removed, to compare against `toHash`. */
export function withoutUnknownParams(hash: string) {
  const [path, query = ''] = hash.split('?');
  const params = new URLSearchParams(query);
  for (const key of [...params.keys()]) if (!KNOWN_PARAMS.includes(key)) params.delete(key);
  const known = params.toString();
  return known ? `${path}?${known}` : path;
}
