import { sidebarPresets, type SidebarProduct } from '../components/Sidebar/presets';

/** The part of a Screen the URL hash owns: `#/<product>/<item>`. */
export type ScreenLocation = { product: SidebarProduct; selected: string };

const isProduct = (value: string): value is SidebarProduct =>
  Object.prototype.hasOwnProperty.call(sidebarPresets, value);

const firstItem = (product: SidebarProduct): ScreenLocation => ({
  product,
  selected: sidebarPresets[product].items[0].id,
});

/**
 * Reads a hash like `#/marketing/segments?x=1`. Query parameters are ignored; an unknown
 * product opens Helpdesk Tickets and an unknown item opens the product's first item.
 */
export function parseHash(hash: string): ScreenLocation {
  const [product = '', selected = ''] = hash.replace(/^#\/?/, '').split('?')[0].split('/');
  if (!isProduct(product)) return firstItem('helpdesk');
  const { items, footerItems } = sidebarPresets[product];
  return [...items, ...footerItems].some((item) => item.id === selected) ? { product, selected } : firstItem(product);
}

export const toHash = ({ product, selected }: ScreenLocation) => `#/${product}/${selected}`;
