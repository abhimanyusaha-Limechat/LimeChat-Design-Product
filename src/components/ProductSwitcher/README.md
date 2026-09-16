# ProductSwitcher

Popover of product tiles from the **LimeChat Design System — V3**
([Figma node `9753:518`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9753-518), "Product categories").

A white popover with a top caret, a horizontal row of product tiles (icon +
label) and a "Products by LimeChat" footer. Presentation-only — you position it.

## Usage

```tsx
import { ProductSwitcher } from './components/ProductSwitcher';

<ProductSwitcher
  products={[
    { id: 'helpdesk',   label: 'Helpdesk',   icon: <HelpdeskIcon /> },
    { id: 'marketing',  label: 'Marketing',  icon: <MarketingIcon /> },
    { id: 'automation', label: 'Automation', icon: <AutomationIcon /> },
  ]}
  selectedId={product}
  onSelect={setProduct}
/>
```

It is wired into [`TopNavBar`](../TopNavBar/README.md): pass `products` /
`selectedProductId` / `onProductChange` and the ⋮⋮⋮ apps-menu button toggles this
popover.

## Props

| Prop              | Type                              | Default |
| ----------------- | -------------------------------- | ------- |
| `products`        | `{ id, label, icon? }[]`          | —       |
| `selectedId`      | `string`                         | —       |
| `onSelect`        | `(id) => void`                   | —       |
| `showAttribution` | `boolean` — the LimeChat footer  | `true`  |
| `withArrow`       | `boolean` — the top caret        | `true`  |
| `arrowOffset`     | CSS length — caret x-position    | `50%`   |
| `className` / `style` | —                            | —       |

## Design tokens

| | |
| --- | --- |
| popover | `#fff`, 1px `#d9d9d9`, radius `4px`, padding `4px`, `md` shadow |
| tile | padding `12px`, gap `8px`, radius `4px`, label Lato `10/12.5` `#3c492c` |
| tile selected | bg `#e5f7cf` (`~green/green-1`) |
| tile hover | bg `#e3e5e1` (`~gray/gray-1`) |
| icon slot | 44×44, `#3b90b6 @ 24%` placeholder fill |
| footer | border-top `#d9d9d9`, `10/12.5` text |
