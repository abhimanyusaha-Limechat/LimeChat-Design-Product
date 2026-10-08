# TicketDetailsPanel

The right-hand contact/ticket panel beside an open conversation, from the
**LimeChat Design System — V3** ([Figma node `9530:21902`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9530-21891)).

## Usage

```tsx
import { TicketDetailsPanel } from './components/TicketDetailsPanel';

<TicketDetailsPanel
  tabs={['Overview', 'Orders', 'Products']}
  activeTab={tab} onTabChange={setTab}
  ticketId="123456" onCopyTicketId={() => {}}
  customisationNps="123456" onOpenNps={() => {}}
  agent={{ value: 'John Adams', options: ['John Adams', 'Jane Doe'], onChange: setAgent }}
  team={{ value: 'Marketing', options: ['Marketing', 'Support'], onChange: setTeam }}
  sections={[
    {
      id: 'previous-tickets', label: 'Previous tickets', count: 21, defaultOpen: true,
      items: [{ title: 'Email_Sales', timestamp: '6 months ago', preview: 'Hi, looks like you are away from our...' }],
    },
    { id: 'sub-tickets', label: 'Sub tickets', count: 0, emptyText: 'There are no sub tickets for this customer' },
    { id: 'voice-logs', label: 'Voice logs', count: 0, emptyText: 'There are no voice logs for this customer' },
  ]}
/>
```

## `TicketDetailsSection`

| Field         | Type                          |
| ------------- | ------------------------------|
| `id`          | `string`                       |
| `label`       | `string`                       |
| `group`       | `'tickets' \| 'tags' \| 'fields'` — overview category heading (defaults to `tickets`) |
| `count`       | `number` — badge next to label |
| `items`       | `{ icon?, title, timestamp?, preview? }[]` |
| `emptyText`   | `string` — shown when `items` is empty/omitted |
| `defaultOpen` | `boolean`                      |
| `onAdd`       | `() => void` — the `+` button  |

Reuses this design system's own `NativeSelect` for Assign Agent/Team.
