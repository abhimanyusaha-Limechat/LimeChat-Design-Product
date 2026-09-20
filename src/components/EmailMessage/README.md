# EmailMessage

The Helpdesk email-channel message, from the **LimeChat Design System — V3**
([Figma node `9468:5662`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9468-5662)),
covering `Expanded`, `compressed`, the recipient-details disclosure
(`Variant3`), and the in-thread reply composer (`Variant4`).

Also includes `EmailComposerBar`
([Figma node `9466:6879`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9466-6879),
the `ticket_input` component's `Email zero state`) — the default footer shown
under an email ticket before a reply is started — and `EmailForwardComposer`
([Figma node `9504:20618`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9504-20618),
the `Email Composer` component's `Default` / `Variant4` / `Variant5` / `Large`
states). Clicking Reply or Forward on `EmailComposerBar` both open
`EmailForwardComposer` — `mode="reply"` titles it "Replying to" and hides the
To row (the recipient is already implied by the thread); `mode="forward"`
(the default) titles it "Forwarding to" and shows an editable To row. This
project's `TicketComposer` uses the equivalent "Default"/"Private note"
pattern for non-email channels.

`EmailReplyComposer` (Figma's `Inline` state — a plain bordered card with no
title bar) is still exported for cases that want that lighter-weight look,
but isn't wired up anywhere in this demo app since Reply now uses
`EmailForwardComposer` for a consistent composer chrome across Reply and
Forward.

## Usage

```tsx
import { EmailMessage, EmailForwardComposer } from './components/EmailMessage';

<EmailMessage
  senderName="Caroline Mack"
  senderEmail="caroline@spline.design"
  recipientSummary="to Education, bcc: me"
  date="Mar 3, 2026, 12:59 AM"
  badgeLabel="4 days ago"
  body={<>
    Hi there,<br /><br />
    Thank you for submitting our Spline for Education interest form...
  </>}
  attachments={[{ name: 'student-id.png' }]}
  quotedText="On Mar 2, 2026, Aditi Rao wrote: ..."
  details={{
    from: 'Caroline Mack <caroline@spline.design>',
    to: 'Education <edu@spline.design>',
    bcc: 'abhimanyu.saha1995@gmail.com',
    date: 'Mar 3, 2026, 12:59 AM',
    subject: 'Verification Needed: Spline for Education',
    important: true,
  }}
/>

{/* Starts collapsed — click the header to expand */}
<EmailMessage senderName="Caroline Mack" senderEmail="caroline@spline.design"
  date="Mar 3, 2026, 12:59 AM" badgeLabel="4 days ago" defaultExpanded={false}
  preview="Hi there, Thank you for submitting our Spline for Education interest form..." />

<EmailForwardComposer
  mode="reply"
  to={['contact@randommail.com']}
  cc={['info@mywebsite.com']}
  bcc={['hello@samplemail.com']}
  value={draft}
  onChange={setDraft}
  quotedText="On Mar 2, 2026, Aditi Rao wrote: ..."
  onSend={() => send(draft)}
  onDelete={() => setDraft('')}
/>
```

## `EmailMessage` props

| Prop               | Type                                                        | Default |
| ------------------ | ------------------------------------------------------------| ------- |
| `senderName`       | `string`                                                     | —       |
| `senderEmail`      | `string`                                                     | —       |
| `avatarSrc`        | `string`                                                     | —       |
| `recipientSummary` | `string`, e.g. `"to Education, bcc: me"`                     | —       |
| `date`             | `string`                                                     | —       |
| `badgeLabel`       | `string`, e.g. `"4 days ago"`                                | —       |
| `body`             | `ReactNode` — full message, shown when expanded              | —       |
| `preview`          | `string` — compressed-row snippet; falls back to `body` if it's a string | — |
| `attachments`      | `{ name?, thumbnail? }[]`                                    | —       |
| `quotedText`       | `ReactNode` — content behind "Show quoted text ..."           | —       |
| `details`          | `{ from, to, bcc?, date, subject, important? }` — enables the chevron disclosure | — |
| `defaultExpanded`  | `boolean` — uncontrolled initial compressed/expanded state    | `true`  |
| `onMoreActions`    | `() => void`                                                 | —       |

Clicking the header toggles expanded/compressed. When `details` is passed,
a chevron next to `recipientSummary` toggles the from/to/bcc/date/subject/
important disclosure panel independently of that.

## `EmailReplyComposer` props

| Prop            | Type                     | Default              |
| ---------------- | ------------------------ | -------------------- |
| `cc` / `bcc`     | `string[]`                | —                     |
| `onAddCc` / `onAddBcc` | `() => void`         | —                     |
| `value`          | `string` (controlled)     | —                     |
| `onChange`       | `(value: string) => void` | —                     |
| `placeholder`    | `string`                  | `'Write a reply...'`  |
| `quotedText`     | `ReactNode`               | —                     |
| `onToggleAi`     | `() => void`              | —                     |
| `aiActive`       | `boolean`                 | `false`               |
| `onDelete`       | `() => void`              | —                     |
| `onReply`        | `() => void`              | —                     |
| `replyDisabled`  | `boolean`                 | —                     |

Reuses this design system's own `Button` (`size="sm"`) for the primary
Reply action.

## `EmailComposerBar` props

| Prop            | Type         | Default |
| ---------------- | ------------ | ------- |
| `onMerge`        | `() => void` | —       |
| `mergeDisabled`  | `boolean`    | —       |
| `onNotes`        | `() => void` | —       |
| `onReply`        | `() => void` | —       |
| `onForward`      | `() => void` | —       |

```tsx
<EmailComposerBar
  onMerge={() => mergeTicket()}
  onNotes={() => openPrivateNotes()}
  onReply={() => setComposerOpen(true)}
  onForward={() => setComposerOpen(true)}
/>
```

## `EmailForwardComposer` props

| Prop                | Type                                                | Default            |
| -------------------- | ---------------------------------------------------- | ------------------- |
| `mode`               | `'reply' \| 'forward'`                                | `'forward'`          |
| `to` / `cc` / `bcc`  | `string[]`                                            | `[]`                 |
| `onAddRecipient`     | `(field: 'to' \| 'cc' \| 'bcc', email: string) => void` | —                   |
| `onRemoveRecipient`  | `(field: 'to' \| 'cc' \| 'bcc', email: string) => void` | —                   |
| `value`              | `string` (controlled)                                 | —                    |
| `onChange`           | `(value: string) => void`                             | —                    |
| `placeholder`        | `string`                                              | `'Write a message...'` |
| `quotedText`         | `ReactNode`                                           | —                    |
| `onToggleAi`         | `() => void`                                          | —                    |
| `aiActive`           | `boolean`                                             | `false`              |
| `onDelete`           | `() => void`                                          | —                    |
| `onSend`             | `() => void`                                          | —                    |
| `sendLabel`          | `string`                                              | `'Forward'` / `'Reply'` (from `mode`) |
| `sendDisabled`       | `boolean`                                             | —                    |
| `defaultMaximized`   | `boolean`                                             | `false`              |

```tsx
{/* Forward — editable To row, "Forwarding to" title */}
<EmailForwardComposer
  mode="forward"
  to={['contact@randommail.com']}
  cc={['info@mywebsite.com']}
  bcc={['hello@samplemail.com']}
  onAddRecipient={(field, email) => addRecipient(field, email)}
  onRemoveRecipient={(field, email) => removeRecipient(field, email)}
  value={draft}
  onChange={setDraft}
  quotedText="On Mar 2, 2026, Aditi Rao wrote: ..."
  onSend={() => forward(draft)}
  onDelete={() => setDraft('')}
/>

{/* Reply — recipient implied by the thread, "Replying to" title, no To row */}
<EmailForwardComposer
  mode="reply"
  to={['aditi.rao@example.com']}
  cc={['support@limechat.io']}
  value={draft}
  onChange={setDraft}
  onSend={() => reply(draft)}
  onDelete={() => setDraft('')}
/>
```

For `mode="forward"`, the recipients row starts as an editable To/CC/BCC chip
editor whenever `to` is empty (matching Figma's `Variant4`), and collapses
into the read-only summary row (`Default`/`Variant5`) once there's a `To`
recipient and the message body gets focus. For `mode="reply"` the To row
never renders in the editor (only CC/BCC), and the summary row starts
collapsed. Clicking the summary row (or its CC/BCC pills) reopens the editor.
The maximize icon in the header toggles `Large` sizing.

## Deviation notes

- The rich-text toolbar (bold/italic/highlight/link/redo/repeat/list/
  attach) is rendered as inert icon buttons — wire `onClick` handlers up to
  whatever rich-text editor this gets composed with; this component doesn't
  ship its own editor, just the chrome and a plain `<textarea>`.
- Figma's asset URLs are short-lived (7 days), so avatar fallback and all
  toolbar/status icons are recreated as inline SVGs rather than referencing
  those URLs.
- The "Important" row's star and the attachment swap-placeholder both use
  hand-built icons/placeholders in place of Figma's placeholder assets.
- Figma's `EmailForwardComposer` states show a "Reply" label on the primary
  button even in the `Default`/`Variant4`/`Variant5`/`Large` (forward) states,
  despite the header reading "Forwarding to" (a reused component default).
  `sendLabel` here instead defaults from `mode` (`'Forward'` for forward,
  `'Reply'` for reply), since that's the correct action per composer.
- The maximize icon portals the composer into a full-viewport modal overlay
  (dark scrim, `Escape`/backdrop-click to close), matching Figma's `Large`
  state — sized `max-width: 1248px` with `clamp()` padding rather than the
  literal fixed 96px/72px, so it stays usable on smaller viewports.
