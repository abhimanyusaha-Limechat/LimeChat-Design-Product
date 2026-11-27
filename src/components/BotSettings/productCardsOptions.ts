/**
 * The option lists of the Product cards tab, shared by its Version 1 (two-column) and
 * Version 2 (inbox-style) layouts.
 */
import type { ButtonLayout, ButtonStyle, ProductCardElements } from './ProductCardPreview';

export type ElementKey = keyof ProductCardElements | 'title' | 'price';

export const CARD_ELEMENT_ROWS: { key: ElementKey; label: string; description: string; required?: boolean }[] = [
  { key: 'title', label: 'Product title', description: 'Name of the product, up to 2 lines', required: true },
  { key: 'description', label: 'Description', description: 'Short product summary, up to 2 lines' },
  { key: 'price', label: 'Selling price', description: 'Number with currency symbol, e.g. ₹399', required: true },
  {
    key: 'mrp',
    label: 'MRP / original price',
    description: 'Struck through next to the selling price. Hidden automatically when it matches the selling price.',
  },
  { key: 'discount', label: 'Discount value', description: 'Percentage off, worked out from the MRP' },
  { key: 'rating', label: 'Rating', description: 'Average star rating out of 5' },
  { key: 'reviewCount', label: 'Review count', description: 'Number of reviews, shown next to the rating' },
  { key: 'tags', label: 'Tag pills', description: 'Up to three product attributes, then a +N pill' },
  { key: 'ribbon', label: 'Ribbon badge', description: 'Bestseller, New or Editor’s pick over the image' },
];

export const CURRENCIES = [
  { value: '₹', label: '₹  Indian Rupee (INR)' },
  { value: '$', label: '$  US Dollar (USD)' },
  { value: '€', label: '€  Euro (EUR)' },
  { value: '£', label: '£  Pound Sterling (GBP)' },
  { value: 'AED ', label: 'AED  UAE Dirham (AED)' },
];

export const BUTTON_STYLES: { id: ButtonStyle; label: string; description: string }[] = [
  { id: 'primary-outline', label: 'Primary + outline', description: 'First button filled, others outlined' },
  { id: 'all-filled', label: 'All filled', description: 'Every button filled in brand green' },
];

export const BUTTON_LAYOUTS: { id: ButtonLayout; label: string }[] = [
  { id: 'stacked', label: 'Stacked' },
  { id: 'side-by-side', label: 'Side by side' },
];

export const LABEL_LIMIT = 25;

