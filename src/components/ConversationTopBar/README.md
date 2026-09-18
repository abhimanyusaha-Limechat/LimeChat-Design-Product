# ConversationTopBar

The contact header above an open ticket's conversation, from the
**LimeChat Design System — V3** ([Figma node `8984:34679`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9530-21891)).

## Usage

```tsx
import { ConversationTopBar } from './components/ConversationTopBar';

<ConversationTopBar
  name="Ramesh"
  isNew
  phone="83478 08373"
  inboxName="Inbox name"
  callAvailable
  onCall={() => {}}
  onResolve={() => resolveTicket()}
  onResolveMenu={() => {}}
  onMoreActions={() => {}}
/>
```

Reuses this design system's own `Avatar` and `Button`.
