# Tooltip

Small dark label shown on hover / focus, from the **LimeChat Design System — V3**
([Figma node `31:59`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=31-59)).

The bubble is portalled to `document.body` and positioned with **fixed**
coordinates, so it is never clipped by a scrolling or `overflow: hidden`
ancestor (e.g. the sidebar rail).

## Usage

```tsx
import { Tooltip } from './components/Tooltip';

<Tooltip label="Tickets" position="right">
  <button aria-label="Tickets">
    <TicketsIcon />
  </button>
</Tooltip>
```

With a link line (Figma "Show link"):

```tsx
<Tooltip
  label="Delivery is delayed"
  link={{ label: 'View order', href: '/orders/42' }}
  position="bottom"
/>
```

## Props

| Prop            | Type                                             | Default    | Notes |
| --------------- | ----------------------------------------------- | ---------- | ----- |
| `label`         | `ReactNode`                                      | —          | Required. Tooltip body. |
| `children`      | `ReactElement`                                   | —          | The single element being described. Gets `aria-describedby` while open. |
| `position`      | `top` \| `bottom` \| `left` \| `right` (+ `-start` / `-end`) | `top` | 12 placements. |
| `arrowPosition` | `'center'` \| `'side'`                           | `center`   | `side` points the arrow at the trigger's centre (useful with `-start` / `-end`). |
| `withArrow`     | `boolean`                                        | `true`     | Figma "Show Polygon". |
| `openDelay`     | `number` (ms)                                    | `0`        | |
| `closeDelay`    | `number` (ms)                                    | `0`        | |
| `offset`        | `number` (px)                                    | `8`        | Gap between trigger and bubble (before the arrow). |
| `multiline`     | `boolean`                                        | `false`    | Allow the label to wrap (`min-width: 160px`). |
| `disabled`      | `boolean`                                        | `false`    | Child still renders; tooltip never shows. |

## Design tokens

Set on `.lc-tooltip__bubble`, overridable via CSS custom properties (see [`Tooltip.css`](./Tooltip.css)):

| Token                  | Value     | Figma variable          |
| ---------------------- | --------- | ---------------------- |
| `--lc-tooltip-bg`      | `#3c492c` | `text/default`         |
| `--lc-tooltip-fg`      | `#ffffff` | `background/default`   |
| `--lc-tooltip-link`    | `#6bac1b` | `text/primary/default` |
| padding                | `8px`     | `padding/xs`           |
| label ↔ link gap       | `4px`     | `padding/2xs`          |
| radius                 | `4px`     | `radius/2xs`           |
| label type             | `12 / 16` | `Text/xs` (Lato 400)   |
| link type              | `10 / 12.5` | `Text/xxs` (Lato 400) |

## Behaviour & accessibility

- Opens on `mouseenter` **and** keyboard `focus` (via `onFocusCapture`); closes on leave / blur / `Escape`.
- `role="tooltip"`; the trigger gets `aria-describedby` pointing at the bubble while open.
- Repositions on `scroll` (capture) and `resize` while open.
- Honours `prefers-reduced-motion` (drops the fade-in).
- No auto-flip on viewport overflow — pick a `position` that fits.

## Deviation notes

- The Figma arrow is a 4px polygon asset; it's redrawn here as a small rotated
  square that inherits `--lc-tooltip-bg`, so it stays crisp and recolours with
  the surface.
