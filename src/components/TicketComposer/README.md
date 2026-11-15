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

Layout, top to bottom: editor, attachments, a quiet tools strip (emoji, Aa,
AI, attach, `/`) with the counter on the right, then a footer with the mode
tabs on the left and Send on the right (the only filled element).

- **Tabs**: `Reply`, `Template`, `Private note`. Template shows only when the
  channel has templates and the contact opted in. Send reads `Reply` /
  `Send` / `Create`; the mic replaces it on voice channels while the box is empty.
- **Template tab**: the box becomes a search field over `templates`; picking one
  shows its `params` as fields, and Send stays disabled until all are filled.
- **Locked**: a closed reply window (WhatsApp 24h, Facebook / Instagram 7d),
  `lockReason="billing"` or `"voicebot"` hides Reply and Template, forces
  Private note and shows a banner.
- **Channels**: limits, formatting, voice and emoji per channel live in
  `channelConfig.ts`. Private notes always allow 10000 characters. The counter
  appears at 80% of the limit.
- **Keys**: Enter sends, Shift+Enter adds a line, an open canned / template list
  takes Enter, Esc closes pickers and the Aa strip.
- **Narrow** (container under 420px): tabs become icons, emoji / Aa / `/` fold
  into a `+` menu.
- Files: at most 5, 16 MB each.
