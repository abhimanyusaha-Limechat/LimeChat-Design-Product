# AccountSwitcher

Account-switching panel from the **LimeChat Design System — V3**
([Figma node `9753:518`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9753-518), "Account switch").

Current-account header · search field · scrollable account list · pagination.
Presentation-only and fully controlled — you own the query, the visible page of
`accounts`, and the pagination state.

## Usage

```tsx
import { AccountSwitcher } from './components/AccountSwitcher';

<AccountSwitcher
  current={{ id: 'a0', name: '30 sundays', number: '12345561', avatarSrc }}
  accounts={pageOfAccounts}
  selectedId={activeId}
  onSelect={switchAccount}
  searchValue={q}
  onSearchChange={setQ}
  pagination={{ page, totalPages, onPageChange: setPage }}
/>
```

## Props

| Prop               | Type                                       | Default                  |
| ------------------ | ------------------------------------------ | ------------------------ |
| `current`          | `{ id, name, number, avatarSrc? }`         | —                        |
| `accounts`         | `SwitcherAccount[]` — current page          | —                        |
| `selectedId`       | `string`                                   | —                        |
| `onSelect`         | `(id) => void`                             | —                        |
| `searchValue` / `onSearchChange` | controlled search              | —                        |
| `searchPlaceholder`| `string`                                   | `"Search by name or id"` |
| `pagination`       | `{ page, totalPages, onPageChange }`        | — (hidden if omitted or ≤1 page) |
| `className` / `style` | —                                       | —                        |

Avatars use the shared [`Avatar`](../Avatar/README.md) — 56px `radius="xs"` in the
header, 36px `radius="xl"` in the rows.

## Design tokens

| | |
| --- | --- |
| panel | `280px`, `#fff`, 1px `#d9d9d9`, radius `4px`, padding `12px`, gap `9px`, `md` shadow |
| header | border-bottom `#d9d9d9`, pb `8px`; name `16/20` bold `#3c492c`; id `12/16` semibold `#808975` |
| search | `32px` tall, 1px `#d9d9d9`, radius `4px`, left search icon; focus ring `#6bac1b` |
| row | gap `12px`, padding `8px`, radius `2px`; name `12/16` bold; id `12/16` semibold `#808975` |
| row hover | bg `#fafafa` (`gray/10`) |
| row selected | bg `#fafdf6` (`~green/green-0`) |
| pager | icon buttons `20px` (1px `#d9d9d9`, radius `4px`); active page `24px` `#6bac1b` / `#fff` |
