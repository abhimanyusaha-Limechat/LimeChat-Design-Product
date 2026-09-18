# MessageBubble

The Helpdesk conversation bubble, from the **LimeChat Design System — V3**
([Figma node `9235:2872`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9235-2872)),
covering both `Agent side` / `Customer side` property sets.

## Usage

```tsx
import { MessageBubble, PiMask, ProfaneWord } from './components/MessageBubble';

<MessageBubble side="agent" time="12:00" status="read">
  Hey, how can I help?
</MessageBubble>

<MessageBubble side="customer" senderName="Aditi Rao" avatar time="11:58"
  quote={{ name: 'Aditi Rao', text: 'Is my order shipped?' }}>
  Yes, it left the warehouse today.
</MessageBubble>

<MessageBubble side="agent" variant="media" time="12:01"
  media={[{ src: '/photo.jpg' }]} />

<MessageBubble side="agent" variant="link" time="12:01" link={{
  title: 'Order #4821', description: 'Track your shipment', domain: 'limechat.ai',
}} />

<MessageBubble side="agent" variant="attachment" time="12:01" attachment={{
  title: 'Invoice.pdf', meta: '2 pages • 66 kB', fileType: 'pdf',
}} />

<MessageBubble side="agent" variant="location" time="12:01" location={{ thumbnail: '/map.png' }} />

<MessageBubble side="agent" variant="deleted" time="12:02" />
<MessageBubble side="agent" variant="opened" time="12:02" />
<MessageBubble side="agent" variant="viewOnce" time="12:02">Photo</MessageBubble>

<MessageBubble side="agent" variant="note" time="12:03"
  note={{ ticketId: '123456', onViewTicket: () => {} }}>
  Some internal message
</MessageBubble>

{/* Inline PII masking */}
<MessageBubble side="customer" senderName="Aditi Rao" time="12:04">
  This is my aadhar number <PiMask value="1234 5678 8901" /> help me with my account
</MessageBubble>

{/* Profanity blocking */}
<MessageBubble side="customer" senderName="Aditi Rao" variant="blocked" time="12:05"
  warningLabel="This message was blocked for inappropriate language.">
  You need to help me with this you <ProfaneWord>stupid</ProfaneWord> person
</MessageBubble>

<MessageBubble side="agent" time="12:00" reaction={{ emoji: '❤️', count: 2 }}>
  Glad that helped!
</MessageBubble>
```

## Props

| Prop              | Type                                                                                              | Default   |
| ----------------- | --------------------------------------------------------------------------------------------------| --------- |
| `side`            | `agent` \| `customer`                                                                              | `agent`   |
| `variant`         | `text` \| `quote` \| `media` \| `link` \| `attachment` \| `location` \| `note` \| `blocked` \| `deleted` \| `opened` \| `viewOnce` | `text` |
| `children`        | message text, or mixed inline content (`PiMask`, `ProfaneWord`, strings)                          | —         |
| `time`            | `string`                                                                                           | —         |
| `status`          | `sent` \| `delivered` \| `read` — controls the read-tick                                          | `read`    |
| `avatar`          | `true` (default initial avatar) \| a node \| `false`                                              | —         |
| `avatarInitial`   | `string`, used when `avatar` is `true`                                                             | `'B'`     |
| `senderName`      | `string`, shown above content on the customer side                                                | —         |
| `accentColor`     | `string`, colour for `senderName` / quote name+bar                                                | `#c13584` |
| `forwarded`       | `boolean`                                                                                           | `false`   |
| `forwardedLabel`  | `string`                                                                                            | `'Forwarded'` |
| `notice`          | `string` — banner for e.g. "Encrypted message detected"                                           | —         |
| `warningLabel`    | `string` — banner used by `variant="blocked"`                                                     | —         |
| `onlyVisibleToMe` | `boolean`                                                                                           | `false`   |
| `reaction`        | `{ emoji, count? }`                                                                                | —         |
| `tail`            | `boolean`                                                                                           | `true`    |
| `quote`           | `{ name, text, color? }` — for `variant="quote"`                                                  | —         |
| `media`           | `{ src?, alt? }[]` (1–4) — for `variant="media"`                                                   | —         |
| `link`            | `{ title, description?, domain?, thumbnail? }` — for `variant="link"`                             | —         |
| `attachment`      | `{ title, meta?, fileType?, thumbnail? }` — for `variant="attachment"`                            | —         |
| `location`        | `{ thumbnail? }` — for `variant="location"`                                                        | —         |
| `note`            | `{ ticketId?, onViewTicket? }` — for `variant="note"`                                              | —         |

Also accepts native `<div>` attributes and forwards `ref`.

**`PiMask`** — `value: string`. Renders a masked pill; click reveals `value` inline.
**`ProfaneWord`** — highlights a blocked word inline (used inside `children`).

## Colour tokens

| variant / part          | background | notes |
| ------------------------| ---------- | ----- |
| bubble, agent side       | `#e5f7cf` (green-1) | tail on the right |
| bubble, customer side    | `#ffffff`            | tail on the left, shows `senderName` |
| nested card, agent side  | `#cdf0a2` (green-2)  | quote / link / attachment fill |
| nested card, customer side | `#f3fafd` (blue-0) | quote / link / attachment fill |
| `note`                   | `#faefdb` (yellow-warning-1) | |
| `blocked`                | `#fcf3f3` (red-error-0), chip `#f5c7c8` | text `#a1171c` |
| text                     | `#3c492c` (text/title) | |
| dimmed (forwarded, time, system) | `#808975` (text/dimmed) | |

## Deviation notes

- The Figma frame defines ~25 named variants (`Property 1`) across both sides.
  This component covers the common set used in Helpdesk conversations: text,
  quote/reply, media, link, attachment, location, private note, deleted,
  opened, view-once, PII masking, and profanity blocking. `Carousel`,
  `Template large/small image`, and `Vocal`/`Incoming voice call` aren't
  wired up yet — extend `MessageBubbleVariant` and the render switch in
  `MessageBubble.tsx` following the same pattern.
- Figma's asset URLs are short-lived (7 days), so all icons (tick, forwarded,
  lock, trash, eye, etc.) and the bubble tail are recreated as inline SVGs /
  CSS `clip-path` rather than referencing those URLs.
- Reuses this design system's own `Avatar` (`size="xs" radius="xs"`) and
  `Button` (`size="xs" variant="default"`) components rather than duplicating
  them.
- `status="read"` tints the tick blue as a reasonable default; Figma's source
  only ships a single "Read" tick asset with no colour variants documented.
