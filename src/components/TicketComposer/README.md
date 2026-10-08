# TicketComposer

The reply box beneath an open ticket's conversation, from the
**LimeChat Design System — V3** ([Figma node `8985:37228`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9530-21891)).

## Usage

```tsx
import { TicketComposer } from './components/TicketComposer';

const [mode, setMode] = useState<'reply' | 'note'>('reply');
const [draft, setDraft] = useState('');

<TicketComposer
  mode={mode} onModeChange={setMode}
  value={draft} onChange={setDraft}
  maxLength={1000}
  onSend={() => send(draft)}
  onMic={recordVoiceNote}
  onEmoji={openEmojiPicker}
/>
```

Tabs switch between `Reply` and `Private note` modes; the mode sets the
placeholder, the send button (`Reply` / `Save`) and hides the counter + mic
for notes. Attached files are held inside the composer (image tiles open a
preview) and cleared on send. The textarea grows with its content up to six
lines via CSS `field-sizing`. Reuses this design system's own `Button` for
the send action.
