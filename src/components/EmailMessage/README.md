# EmailMessage

The Helpdesk email-channel message, from the **LimeChat Design System — V3**
([Figma node `9468:5662`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9468-5662)),
covering `Expanded`, `compressed`, the recipient-details disclosure
(`Variant3`), and the in-thread reply composer (`Variant4`).

## Usage

```tsx
import { EmailMessage, EmailReplyComposer } from './components/EmailMessage';

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

<EmailReplyComposer
  cc={['contact@randommail.com', 'info@mywebsite.com']}
  bcc={['hello@samplemail.com']}
  value={draft}
  onChange={setDraft}
  quotedText="On Mar 2, 2026, Aditi Rao wrote: ..."
  onReply={() => send(draft)}
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
