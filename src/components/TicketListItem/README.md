# TicketListItem

A row in the Helpdesk tickets list, from the **LimeChat Design System — V3**
([Figma node `8977:4521`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=8977-4521)),
covering the `Default` / `Hover` / `Selected` property states.

## Usage

```tsx
import { TicketListItem } from './components/TicketListItem';

<TicketListItem
  channel="whatsapp"
  user="John"
  avatars={[{ src: '/a.jpg' }, { src: '/b.jpg' }, { src: '/c.jpg' }]}
  avatarOverflow={3}
  isNew
  timestamp="4 minutes ago"
  message="This is a dummy message for the component"
  assignee="Jane"
  unreadCount={21}
  selected={activeId === ticket.id}
  checked={selectedIds.has(ticket.id)}
  onCheckedChange={(next) => toggleSelected(ticket.id, next)}
  onMoreActions={() => openRowMenu(ticket.id)}
  onClick={() => openTicket(ticket.id)}
/>
```

Render a list of these inside a scrollable container — each row owns its own
border/background/selected state, so no extra list wrapper styling is needed.

## Props

| Prop              | Type                                            | Default     |
| ----------------- | ------------------------------------------------| ----------- |
| `channel`         | `whatsapp` \| `email` \| `instagram` \| `sms`   | `whatsapp`  |
| `channelIcon`     | `ReactNode` — overrides the built-in glyph       | —           |
| `user`            | `string`                                         | —           |
| `avatars`         | `{ src?, alt? }[]` — stack, max 3 rendered       | —           |
| `avatarOverflow`  | `number` — shown as `+N` after the stack         | —           |
| `isNew`           | `boolean` — shows the "NEW" badge                | `false`     |
| `timestamp`       | `string`                                         | —           |
| `messageIcon`     | `ReactNode \| false` — before the preview text   | share icon  |
| `message`         | `string` — preview text                          | —           |
| `assignee`        | `string` — teal mention after the message        | —           |
| `unreadCount`     | `number` — green count badge                     | —           |
| `selected`        | `boolean` — green left accent bar, no bottom border | `false`  |
| `showCheckbox`    | `boolean`                                        | `true`      |
| `checked`         | `boolean`                                        | `false`     |
| `onCheckedChange` | `(checked: boolean) => void`                     | —           |
| `onMoreActions`   | `() => void` — enables the hover-revealed `⋮` trigger that replaces the timestamp | — |
| `onClick`         | `() => void` — makes the row a `role="button"`   | —           |

Also accepts native `<div>` attributes and forwards `ref`.

## Behavior

- **Default**: white background, light bottom border.
- **Hover**: light green background; if `onMoreActions` is set, the timestamp
  fades out and a `⋮` trigger fades in over the same spot (matches Figma's
  masking approach rather than shifting layout).
- **Selected**: light green background, no bottom border, 4px primary-green
  left accent bar.
- The checkbox and `⋮` trigger stop click propagation, so they don't also
  fire `onClick`.

## Deviation notes

- Figma names the channel glyph slot "Mail Icon" but its default screenshot
  renders the WhatsApp brand mark — the prop is generic (`channel` /
  `channelIcon`) and defaults to `whatsapp` to match that default.
- The checkbox is a small inline control built for this row, not a shared
  design-system `Checkbox` (none exists yet in this codebase).
- Figma's asset URLs are short-lived (7 days); channel/share/dots-vertical
  icons are recreated as inline SVGs (reusing the same paths as
  `InboxesTable`'s channel icon set for whatsapp/email/instagram/sms).
