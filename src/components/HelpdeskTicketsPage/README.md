# HelpdeskTicketsPage

The three-column layout for the Helpdesk Tickets page's content area, from
the **LimeChat Design System — V3** ([Figma node `9530:21891`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9530-21891)).
A pure layout component — each region is a slot composed from this design
system's own pieces.

## Usage

```tsx
import { HelpdeskTicketsPage } from './components/HelpdeskTicketsPage';
import { TicketsSection } from './components/TicketsSection';
import { TicketListItem } from './components/TicketListItem';
import { ConversationTopBar } from './components/ConversationTopBar';
import { MessageBubble } from './components/MessageBubble';
import { TicketComposer } from './components/TicketComposer';
import { TicketDetailsPanel } from './components/TicketDetailsPanel';

<HelpdeskTicketsPage
  ticketsSection={
    <TicketsSection status="Open" tabs={TABS} activeTab={tab} onTabChange={setTab}>
      {tickets.map((t) => <TicketListItem key={t.id} {...t} />)}
    </TicketsSection>
  }
  conversationTopBar={<ConversationTopBar name="Ramesh" isNew phone="83478 08373" inboxName="Inbox name" />}
  conversation={
    <>
      {messages.map((m) => <MessageBubble key={m.id} {...m} />)}
    </>
  }
  composer={<TicketComposer value={draft} onChange={setDraft} onSend={send} />}
  detailsPanel={<TicketDetailsPanel ticketId="123456" sections={SECTIONS} />}
/>
```

Renders as a 336px list column + a flexible conversation column (top bar,
scrollable message list, composer) + a 372px details column. Drop it
directly into the Helpdesk product's "Tickets" nav item, below the shared
`Sidebar` + `TopNavBar`.
