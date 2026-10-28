/**
 * The widget editor's Ecommerce tab: how product cards look in the widget, which store it
 * reads carts from, and the chat input text it prefills on a product page.
 */
import { NativeSelect } from '../Select';
import { Row, SectionHeading, SwitchRow, TextRow } from './InboxSettingsSections';

export type ProductImageRatio = '1:1' | '9:16' | '16:9';

export interface InboxWidgetEcommerce {
  imageRatio: ProductImageRatio;
  storeType: string;
  /** Prefill the chat input with the product name taken from the page URL on a product page. */
  extractTitle: boolean;
  /** Text put before the product title in the chat input. */
  messagePrefix: string;
}

const RATIOS: ProductImageRatio[] = ['1:1', '9:16', '16:9'];

const STORE_TYPES = ['None', 'Shopify', 'WooCommerce', 'BigCommerce'];

export function WidgetEcommerceSection({
  value,
  onChange,
}: {
  value: InboxWidgetEcommerce;
  onChange: (next: InboxWidgetEcommerce) => void;
}) {
  const set = (patch: Partial<InboxWidgetEcommerce>) => onChange({ ...value, ...patch });
  return (
    <section className="lc-inbs__group" aria-label="Ecommerce">
      <SectionHeading title="Ecommerce" description="Configure cart management and product title prefill for your widget." />
      <div className="lc-inbs__table">
        <Row label="Product card image ratio" description="The shape of the product images in the widget's product cards.">
          <div className="lc-inbs__ratios" role="radiogroup" aria-label="Product card image ratio">
            {RATIOS.map((ratio) => (
              <button
                key={ratio}
                type="button"
                role="radio"
                aria-checked={value.imageRatio === ratio}
                className="lc-inbs__ratio"
                data-ratio={ratio}
                onClick={() => set({ imageRatio: ratio })}
              >
                <span className="lc-inbs__ratio-box">{ratio}</span>
              </button>
            ))}
          </div>
        </Row>
        <Row label="Ecommerce Store Type" description="The store the widget reads carts and products from.">
          <NativeSelect
            size="sm"
            fullWidth
            aria-label="Ecommerce Store Type"
            data={STORE_TYPES}
            value={value.storeType}
            onChange={(e) => set({ storeType: e.currentTarget.value })}
          />
        </Row>
        <SwitchRow
          label="Extract product title from URL"
          description="Automatically prefills the chat input with the product name extracted from the page URL slug when a customer visits a PDP page."
          checked={value.extractTitle}
          onChange={(extractTitle) => set({ extractTitle })}
        />
        <TextRow
          label="Message prefix"
          description="This text will be prepended to the product title in the chat input."
          placeholder="Know more about"
          value={value.messagePrefix}
          onChange={(messagePrefix) => set({ messagePrefix })}
        />
      </div>
    </section>
  );
}
