# TicketComposer

The reply box beneath an open ticket's conversation, from the
**LimeChat Design System — V3** ([Figma node `8985:37228`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9530-21891)).

## Usage

```tsx
import { TicketComposer } from './components/TicketComposer';

const [mode, setMode] = useState<'reply' | 'template' | 'note'>('reply');
const [draft, setDraft] = useState('');

<TicketComposer
  channel="whatsapp"
  mode={mode} onModeChange={setMode}
  value={draft} onChange={setDraft}
  windowOpen={ticket.windowOpen} contactOptedIn={ticket.contactOptedIn} lockReason={ticket.lockReason}
  cannedResponses={canned} templates={templates}
  onSend={(sentFrom) => send(sentFrom, draft)}
/>
```

Layout, top to bottom: editor, attachments, then one bottom bar: mode tabs, a
divider, the tools (emoji, Aa, AI, attach, `/`), the counter and Send on the
right (the only filled element). The Template tab shows no tools.

- **Tabs**: `Reply`, `Private note`, `Template`. Template shows only when the
  channel has templates and the contact opted in. Send reads `Reply` /
  `Send` / `Create`; the mic replaces it on voice channels while the box is empty.
- **Template tab**: the box becomes a search field over `templates`; picking one
  shows its `params` as fields, and Send stays disabled until all are filled.
- **Locked**: a closed reply window (WhatsApp 24h, Facebook / Instagram 7d),
  `lockReason="billing"` or `"voicebot"` hides Reply and Template, forces
  Private note and shows a banner; the tabs become a static `Private note` label.
- **Channels**: limits, formatting, voice and emoji per channel live in
  `channelConfig.ts`. Private notes always allow 10000 characters. The counter
  appears at 80% of the limit.
- **Keys**: Enter sends, Shift+Enter adds a line, an open canned / template list
  takes Enter, Esc closes pickers and the Aa strip.
- **Narrow** (container under 640px): emoji / Aa / `/` fold into a `+` menu.
  Under 420px the tabs also become icons. Under 560px the open Aa strip hides the tabs.
- **Email** (`EmailMessage/EmailForwardComposer`): no Aa toggle. The formatting row
  (bold, italic, highlight, link, list, redo, repeat) is always open above the bar,
  also in a private note. It wraps on narrow widths. Attach and AI stay in the bar.
- Files: at most 5, 16 MB each.
