# TicketsSection

The left-hand ticket list column of the Helpdesk Tickets page, from the
**LimeChat Design System — V3** ([Figma node `9530:21891`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9530-21891)):
title + status dropdown, search + filters, date-range/inbox filters,
Mine/Queued/All tabs, a sort row, and a scrollable list.

## Usage

```tsx
import { TicketsSection } from './components/TicketsSection';
import { TicketListItem } from './components/TicketListItem';

<TicketsSection
  status="Open" onStatusClick={() => {}}
  searchValue={q} onSearchChange={setQ}
  onFilterClick={() => {}} onTagsClick={() => {}}
  dateRangeLabel="Last 7 days" onDateRangeClick={() => {}}
  inboxLabel="All inboxes" onInboxClick={() => {}}
  tabs={[{ id: 'mine', label: 'Mine' }, { id: 'queued', label: 'Queued' }, { id: 'all', label: 'All' }]}
  activeTab={tab} onTabChange={setTab}
  sortLabel="Newly created" onSortClick={() => {}}
>
  {tickets.map((t) => (
    <TicketListItem key={t.id} {...t} selected={t.id === selectedId} onClick={() => select(t.id)} />
  ))}
</TicketsSection>
```

Renders its `children` (typically a list of `TicketListItem`) in a
scrollable region below the filters/tabs — it owns layout only, not the
row data model.
