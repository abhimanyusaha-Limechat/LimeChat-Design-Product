# TicketComposer

The reply box beneath an open ticket's conversation, from the
**LimeChat Design System — V3** ([Figma node `8985:37228`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9530-21891)).

## Usage

```tsx
import { TicketComposer } from './components/TicketComposer';

const [mode, setMode] = useState<'reply' | 'note' | 'template'>('reply');
const [draft, setDraft] = useState('');

<TicketComposer
  mode={mode} onModeChange={setMode}
  value={draft} onChange={setDraft}
  maxLength={1000}
  sendLabel={mode === 'note' ? 'Add note' : 'Reply'}
  onSend={() => send(draft)}
  onSendMenu={() => {}}
/>
```

Tabs switch between `Reply`, `Private note`, and `Template` modes — wire
`mode` to change placeholder/validation/send behavior in the parent.
Reuses this design system's own `Button` for the send action.
