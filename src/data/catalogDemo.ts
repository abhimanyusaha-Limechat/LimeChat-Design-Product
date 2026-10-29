/**
 * Demo catalog: what a company's Shopify store would sync into Settings → Products.
 * Built from the ticket panel's MOCK_PRODUCTS, keeping only fields Shopify itself has.
 */
import { MOCK_PRODUCTS } from './mockProducts';

export type CatalogStatus = 'active' | 'draft' | 'archived';

export interface CatalogProduct {
  id: string;
  title: string;
  sku: string;
  vendor: string;
  /** Shopify's "product type". */
  type: string;
  price: number;
  /** The struck-through price, when the product is on sale. */
  compareAtPrice?: number;
  inventory: number;
  status: CatalogStatus;
  imageUrl?: string;
}

// ponytail: demo statuses — one draft, discontinued ones archived; a real sync reads Shopify's own status.
const DEMO_DRAFT_INDEX = 6;

export const DEMO_CATALOG: CatalogProduct[] = MOCK_PRODUCTS.map((p, i) => ({
  id: p.id,
  title: p.name,
  sku: p.sku,
  vendor: p.brand,
  type: p.category,
  price: p.discountedPrice,
  compareAtPrice: p.discountPercentage > 0 ? p.originalPrice : undefined,
  inventory: p.stockCount,
  status: p.availability === 'discontinued' ? 'archived' : i === DEMO_DRAFT_INDEX ? 'draft' : 'active',
  imageUrl: p.imageUrl,
}));

export const CATALOG_STORE = {
  domain: 'limechat-demo.myshopify.com',
  /** When the demo catalog was last synced: two hours before the page loads. */
  lastSyncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};
