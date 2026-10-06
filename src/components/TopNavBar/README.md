# TopNavBar

Reusable product top navigation bar from the **LimeChat Design System — V3**
([Figma node `8847:4018`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=8847-4018)).

A 56px white bar: product wordmark + breadcrumb on the left; a product-specific
CTA slot, the product-switcher button, and the account chip on the right.

## Usage

```tsx
import { TopNavBar, helpDeskTopNav } from './components/TopNavBar';

<TopNavBar
  {...helpDeskTopNav({ onVoiceCall, onSelectTicketInbox })}
  breadcrumbs={[
    { label: 'Broadcast', onClick: goBack },
    { label: '10023', copyable: true },   // last = current
  ]}
  products={PRODUCTS}
  selectedProductId="helpdesk"
  onProductChange={switchProduct}
  account={{ name: 'Nonucare12' }}
  accountMenu={accountMenu}
/>
```

## Props

| Prop              | Type                                  | Notes                                                          |
| ----------------- | ------------------------------------- | ------------------------------------------------------------- |
| `logo`            | `ReactNode`                           | String → bold brand-green wordmark; node → rendered as-is.    |
| `breadcrumbs`     | `TopNavCrumb[]`                       | `{ label, onClick?, copyable? }`. The last item is current.   |
| `actions`         | `ReactNode`                           | Right-side CTA slot — `TopNavSelect` / `TopNavButton` / anything. |
| `products`        | `{ id, label, icon? }[]`             | Required. The 9-dot apps button toggles a [`ProductSwitcher`](../ProductSwitcher/README.md) popover. |
| `selectedProductId` / `onProductChange` | —              | Selected product + change handler for that popover.           |
| `account`         | `{ name }`                           | Required. Avatar-only "No name" chip (Figma `9755:6709`) showing the name's first letter; the name surfaces as a tooltip. |
| `accountMenu`     | `AccountSwitcherProps`               | Required. Clicking the account chip toggles an [`AccountSwitcher`](../AccountSwitcher/README.md) popover (closes on select / outside-click / Esc). |

## CTA building blocks

- **`<TopNavSelect icon="whatsapp" label="Whatsapp" onClick={…} />`** — dropdown-styled channel trigger.
- **`<TopNavButton icon="phone" onClick={…}>Voice call</TopNavButton>`** — thin wrapper over the
  design-system [`<Button variant="default" size="sm">`](../Button/README.md) (the component the
  Figma top-nav CTAs are Code-Connected to). Prefer `<Button>` directly in new code.

Icon names: `chevron-down`, `slash`, `edit`, `phone`, `plus`, `grid-dots`, `whatsapp`.

## Presets

`campaignsTopNav(opts?)`, `helpDeskTopNav(opts?)`, `automationTopNav(opts?)` (also
`topNavPresets.campaigns` / `.helpdesk` / `.automation`) return a partial
`TopNavBarProps` with the product wordmark (bundled from Figma) and the right CTA
slot wired. Spread and override the rest.

## Design tokens

Overridable via CSS custom properties on `.lc-topnav` (see [`TopNavBar.css`](./TopNavBar.css)):

| Token                          | Value     | Figma variable                   |
| ------------------------------ | --------- | -------------------------------- |
| `--lc-topnav-height`           | `56px`    | —                              |
| `--lc-topnav-bg`               | `#ffffff` | `background/default`            |
| `--lc-topnav-border`           | `#d9d9d9` | `border/gray/light`            |
| `--lc-topnav-fg`               | `#3c492c` | `text/default`                |
| `--lc-topnav-fg-dimmed`        | `#808975` | `text/dimmed`                 |
| `--lc-topnav-avatar-bg`        | `#cdf0a2` | `~green/green-2`             |
| `--lc-topnav-avatar-fg`        | `#6bac1b` | `~green/green-6-anchor`      |
| `--lc-topnav-font-family`      | `Lato, …` | LimeChat default typeface       |
| `--lc-topnav-logo-width`       | `148px`   | fixed wordmark slot            |
| `--lc-topnav-logo-height`      | `20px`    | wordmark render height         |

The wordmark sits in a **fixed-width slot** (`--lc-topnav-logo-width`) and renders
at a **fixed height** (`--lc-topnav-logo-height`), left-aligned. This keeps the
breadcrumb start position and the logo→breadcrumb gap identical for every product,
regardless of how wide each wordmark asset is.

Load Lato yourself (e.g. Google Fonts `Lato:wght@400;700;900`) — the component
sets the family but does not import the webfont.

## Accessibility

- `<header>` landmark; breadcrumb wrapped in `<nav aria-label="Breadcrumb"><ol>`, current crumb marked `aria-current="page"`.
- Icon-only controls (apps menu, account chip) have `aria-label`; `:focus-visible` rings on every control.
- Honours `prefers-reduced-motion`.

## Deviation notes

- Product wordmarks ship as the exact image assets exported from Figma
  (`assets/campaigns.png`, `assets/helpdesk.svg`, `assets/automation.svg`).
  Override `logo` with your own node to avoid bundling them.
- Figma renders each product wordmark at a slightly different size (HelpDesk
  larger than Campaigns/Automation). They're normalised here to one fixed slot so
  the breadcrumb doesn't shift between products.
- The breadcrumb separator and CTA glyphs are redrawn as inline `currentColor`
  SVGs (Tabler outline style) so they inherit theme colour, rather than the
  fixed-fill SVGs from the Figma payload.
