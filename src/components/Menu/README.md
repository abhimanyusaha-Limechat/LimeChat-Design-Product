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
| `selected` | `boolean`    | highlights the active option of a single-select list |
| `trailingIcon` | `ReactNode` | rendered after the label, e.g. a tick on the selected row |
| `checked`  | `boolean \| 'mixed'` | makes the row a checkbox (`menuitemcheckbox`) with a leading tick box; `'mixed'` for a "select all" row |
| `dividerAfter` | `boolean` | draws a rule under the row       |

## `Menu` props

| Prop        | Type                                                | Default |
| ----------- | ---------------------------------------------------- | ------- |
| `items`     | `MenuItemData[]`                                      | —       |
| `trigger`   | `({ ref, onClick, open }) => ReactNode`               | —       |
| `ariaLabel` | `string` — label for the menu popover                 | —       |
| `align`     | `'start' \| 'end'` — which edge aligns to the trigger | `'end'` |
| `width`     | `number` (px)                                         | `190`   |
| `closeOnItemClick` | `boolean`; pass `false` for a multi-select list | `true`  |

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
- Keyboard: opening the menu from the keyboard moves focus into it: to a
  `header` field such as a search box, else the `selected` item, else the
  first item. Arrow keys move through the
  items and wrap, `Home` / `End` jump to the ends, `Enter` or `Space` picks,
  `Escape` closes and returns focus to the trigger, and `Tab` closes and
  carries on from the trigger. Opening it with the mouse leaves focus alone.
- Repositions on scroll/resize while open.
- Icons are supplied by the caller (each page keeps its own icon set) —
  `Menu` has no icon opinions of its own. The one glyph it draws itself is
  the tick in a `checked` row.
