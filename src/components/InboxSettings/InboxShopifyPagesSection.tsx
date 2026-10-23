/** The WhatsApp Widget tab's list of Shopify page types the widget appears on. */
import { Row, SectionHeading } from './InboxSettingsSections';

export type ShopifyPage = 'home' | 'cart' | 'blog' | 'products' | 'collections' | 'checkout' | 'pages';
export type InboxShopifyPages = Record<ShopifyPage, boolean>;

const PAGES: { page: ShopifyPage; label: string }[] = [
  { page: 'home', label: 'Homepage' },
  { page: 'cart', label: 'Cart' },
  { page: 'blog', label: 'Blog post pages' },
  { page: 'products', label: 'Product pages' },
  { page: 'collections', label: 'Collections' },
  { page: 'checkout', label: 'Checkout' },
  { page: 'pages', label: 'URLs ending with /pages' },
];

export function ShopifyPagesSection({ value, onChange }: { value: InboxShopifyPages; onChange: (next: InboxShopifyPages) => void }) {
  return (
    <section className="lc-inbs__group" aria-label="Shopify pages">
      <SectionHeading
        title="Shopify pages to display WhatsApp widget on"
        description="The widget only shows on the kinds of store pages ticked here."
      />
      <div className="lc-inbs__table">
        <Row label="Show on" description="Untick a page type to hide the widget there.">
          <div className="lc-inbs__checks" role="group" aria-label="Show on">
            {PAGES.map(({ page, label }) => (
              <label key={page} className="lc-inbs__radio">
                <input type="checkbox" checked={value[page]} onChange={(e) => onChange({ ...value, [page]: e.currentTarget.checked })} />
                {label}
              </label>
            ))}
          </div>
        </Row>
      </div>
    </section>
  );
}
