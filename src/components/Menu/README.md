# Menu

The shared popover-menu shell used across LimeChat home pages — a
trigger-anchored, portal-positioned dropdown with a consistent shadow,
radius, and open/close animation. Extracted after `TemplatesHomePage`,
`BotFlowsHomePage`, and `SegmentsHomePage` each hand-rolled the same
row-actions menu independently.

## Usage

```tsx
import { ActionMenu, Menu } from './components/Menu';

{/* The common case: a ⋮ trigger with a "More actions" tooltip. */}
<ActionMenu
  ariaLabel="Template actions"
  icon={<DotsVerticalIcon />}
  items={[
    { label: 'Edit template', icon: <EditIcon />, onClick: () => editTemplate(row) },
    { label: 'Clone', icon: <CopyIcon />, onClick: () => cloneTemplate(row) },
    { label: 'Delete', icon: <TrashIcon />, danger: true, onClick: () => deleteTemplate(row) },
  ]}
/>

{/* Custom trigger (e.g. a labeled button instead of a ⋮ icon). */}
<Menu
  ariaLabel="Report options"
  items={[{ label: 'Download CSV', onClick: downloadCsv }]}
  trigger={({ ref, onClick }) => (
    <Button ref={ref} onClick={onClick} rightSection={<ChevronDownIcon />}>Report</Button>
  )}
/>
```

## `MenuItemData`

| Field      | Type         | Notes                          |
| ---------- | ------------ | ------------------------------- |
| `label`    | `ReactNode`  | —                                |
| `icon`     | `ReactNode`  | optional, rendered before label |
| `onClick`  | `() => void` | menu closes first               |
| `danger`   | `boolean`    | red text + hover (destructive)  |
| `disabled` | `boolean`    | —                                |

## `Menu` props

| Prop        | Type                                                | Default |
| ----------- | ---------------------------------------------------- | ------- |
| `items`     | `MenuItemData[]`                                      | —       |
| `trigger`   | `({ ref, onClick, open }) => ReactNode`               | —       |
| `ariaLabel` | `string` — label for the menu popover                 | —       |
| `align`     | `'start' \| 'end'` — which edge aligns to the trigger | `'end'` |
| `width`     | `number` (px)                                         | `190`   |

## `ActionMenu` props

Same as `Menu`, minus `trigger`, plus:

| Prop              | Type        | Default          |
| ----------------- | ----------- | ---------------- |
| `icon`            | `ReactNode` | —                 |
| `tooltip`         | `string`    | `'More actions'`  |
| `triggerClassName`| `string`    | —                 |

## Behavior

- Portals to `document.body` and positions with `fixed` coordinates, so it
  never clips against a scrolling or `overflow: hidden` row/card ancestor.
- Closes on outside pointerdown, `Escape`, or when an item is clicked.
- Repositions on scroll/resize while open.
- Icons are supplied by the caller (each page keeps its own icon set) —
  `Menu` has no icon opinions of its own.
