/**
 * The WhatsApp Widget tab's pre-filled message: the text the widget types into the
 * visitor's WhatsApp, per kind of page. A page type that's unticked under Shopify pages
 * never shows the widget, so its message is disabled.
 */
import type { InboxShopifyPages } from './InboxShopifyPagesSection';
import { SectionHeading, SwitchRow, TextRow } from './InboxSettingsSections';

export interface InboxPrefilledMessage {
  productText: string;
  /** Add the selected variant (size, colour…) to the product message. */
  includeVariant: boolean;
  /** `{collection_name}` is filled in. */
  collectionText: string;
  otherText: string;
  /** Append the page URL the visitor was on. */
  utm: boolean;
}

export function PrefilledMessageSection({
  value,
  pages,
  onChange,
}: {
  value: InboxPrefilledMessage;
  pages: InboxShopifyPages;
  onChange: (next: InboxPrefilledMessage) => void;
}) {
  const set = (patch: Partial<InboxPrefilledMessage>) => onChange({ ...value, ...patch });
  return (
    <section className="lc-inbs__group" aria-label="Pre-filled text message">
      <SectionHeading
        title="Pre-filled text message"
        description="Loaded into the visitor's WhatsApp by the widget, so messaging your company takes one tap."
      />
      <div className="lc-inbs__table">
        <TextRow
          label="Product pages"
          description="The product's name is added at the end."
          placeholder="Hey! I would like to know about"
          value={value.productText}
          off={!pages.products}
          onChange={(productText) => set({ productText })}
        />
        <SwitchRow
          label="Include variant information"
          description="Also add the variant the visitor picked, like size or colour."
          checked={value.includeVariant}
          off={!pages.products}
          onChange={(includeVariant) => set({ includeVariant })}
        />
        <TextRow
          label="Collections pages"
          description="Use {collection_name} for the collection's name."
          placeholder="Hey! I would like to know more about {collection_name}"
          value={value.collectionText}
          off={!pages.collections}
          onChange={(collectionText) => set({ collectionText })}
        />
        <TextRow
          label="Non-product pages"
          description="Every other page the widget shows on."
          placeholder="Hey, Let's chat!"
          value={value.otherText}
          onChange={(otherText) => set({ otherText })}
        />
        <SwitchRow
          label="Enable UTM for widget"
          description="Append the active page URL to the message."
          checked={value.utm}
          onChange={(utm) => set({ utm })}
        />
      </div>
    </section>
  );
}
