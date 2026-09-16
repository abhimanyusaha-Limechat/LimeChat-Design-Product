# Sidebar

Reusable rail navigation from the **LimeChat Design System — V3** ([Figma node `8773:1123`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=8773-1123)).

A 72px vertical rail: brand mark on top, a scrollable icon-only nav stack in the
middle, and a pinned footer (quick actions + user avatar) at the bottom.

## Usage

```tsx
import { Sidebar, helpdeskSidebar } from './components/Sidebar';

function Shell() {
  const [selected, setSelected] = useState('tickets');

  return (
    <Sidebar
      {...helpdeskSidebar}                 // items + footerItems preset
      selectedId={selected}
      onSelect={setSelected}
      profile={{ name: 'Aditi Rao', avatarUrl: '/me.jpg' }}
      logo={{ href: '/' }}
    />
  );
}
```

Fully data-driven — you can skip the presets and pass your own `items`:

```tsx
<Sidebar
  items={[
    { id: 'inbox', label: 'Inbox', icon: 'message-circle', href: '/inbox' },
    { id: 'reports', label: 'Reports', icon: 'chart-bar', href: '/reports' },
    { id: 'custom', label: 'Custom', icon: <MyOwnSvg /> },
  ]}
  selectedId="inbox"
/>
```

## Props

| Prop          | Type                                             | Notes                                                        |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| `items`       | `SidebarItem[]`                                  | Required. Middle nav stack.                                  |
| `selectedId`  | `string`                                         | id of the active item.                                      |
| `onSelect`    | `(id: string) => void`                           | Fired on item activation.                                    |
| `footerItems` | `SidebarItem[]`                                  | Actions pinned above the avatar (e.g. WhatsApp, bell).       |
| `profile`     | `{ name; avatarUrl?; onClick? }`                 | Avatar; renders initials when `avatarUrl` is omitted.        |
| `logo`        | `{ href?; onClick?; label? }`                    | `href` → anchor, `onClick` → button, neither → static.       |
| `ariaLabel`   | `string`                                         | Accessible name for the `<nav>`. Default `"Primary"`.        |
| `showTooltips`| `boolean`                                        | Show a label [`Tooltip`](../Tooltip/README.md) to the right of each item on hover / focus (2000 ms open, 50 ms close). Default `true`. |
| `className` / `style` | —                                        | Forwarded to the root element.                               |

`SidebarItem`: `{ id, label, icon, href?, onClick? }` where `icon` is a
[built-in name](./icons.tsx) (`SidebarIconName`) or any React node.

## Presets

`helpdeskSidebar`, `marketingSidebar`, `automationSidebar` (also
`sidebarPresets.helpdesk` / `.marketing` / `.automation`) mirror the three
product rails in the design file. Each is `{ items, footerItems }`.

## Design tokens

Overridable via CSS custom properties on `.lc-sidebar` (see [`Sidebar.css`](./Sidebar.css)):

| Token                              | Value     | Figma variable                       |
| ---------------------------------- | --------- | ------------------------------------ |
| `--lc-sidebar-width`               | `72px`    | —                                   |
| `--lc-sidebar-bg`                  | `#508014` | `background/primary/filled-hover`   |
| `--lc-sidebar-item-selected-bg`    | `#34540d` | `~green/green-8`                    |
| `--lc-sidebar-fg`                  | `#fafdf6` | `~green/green-0`                    |
| `--lc-sidebar-avatar-bg`           | `#808975` | `text/dimmed`                      |
| `--lc-sidebar-radius`              | `4px`     | `radius/2xs`                       |
| `--lc-sidebar-pad-y`               | `20px`    | `padding/lg`                      |
| `--lc-sidebar-pad-x`               | `8px`     | `padding/xs`                      |
| `--lc-sidebar-icon-idle`           | `#cdf0a2` | `~green/green-2` — unselected icon stroke |
| `--lc-sidebar-font-family`         | `Lato, …` | LimeChat default typeface         |

Selected (and hovered) icons use `--lc-sidebar-fg` (`~green/green-0`); idle icons
use `--lc-sidebar-icon-idle` (`~green/green-2`).

Load Lato yourself (e.g. Google Fonts `Lato:wght@400;700;900`) — the component
sets the family but does not import the webfont.

## Accessibility

- Nav items are real `<button>` / `<a>` elements with `aria-label` and
  `aria-current="page"` / `aria-pressed` on the active item. With `showTooltips`
  on, the label surfaces via the `Tooltip` component (`aria-describedby`); with it
  off, the native `title` attribute is used instead.
- `<nav aria-label>` landmark; `:focus-visible` ring on every control.
- Honours `prefers-reduced-motion`.
