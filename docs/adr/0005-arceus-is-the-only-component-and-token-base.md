# arceus is the only component and token base, vendored as source

LimeChat's design system, `arceus` (a Mantine v8 wrapper), is the single source of components and tokens for this prototype. It is a private workspace package that can't be installed from npm, so its source is copied into `arceus/` and imported as `from 'arceus'` through a Vite/TS alias (`arceus/aliases.ts`) instead of being built as a library. Local re-implementations of arceus components (Button, Tooltip, Avatar, Select, Modal, TagsInput, CheckboxPill) were deleted, and the old `--lc-color-*` / `--lc-input-*` tokens and `fonts.css` were replaced by arceus's Mantine CSS variables (`--mantine-color-primary-6`, `--mantine-color-gray-3`, …) and Lato.

Screens that need a data-driven API keep thin adapters over arceus parts (e.g. `Menu` / `ActionMenu` over arceus `Menu`); they hold no behaviour arceus already has.

## Consequences

- Updating means re-copying the upstream arceus `src` (minus stories, tests and `figma/`) over `arceus/src`, then reapplying the four app-level edits, each marked in its file: global `--input-height-*` vars in `theme/resolver.ts`, an `env` prop on `ThemeProvider` (tests turn off transitions), the `Close` label on the Modal close button, and unused `React` imports removed.
- arceus sizes in rem on a 10px root, so `src/base.css` sets `html { font-size: 10px }`. No app CSS may use `rem`.
- Look-and-feel now follows arceus: labels are no longer auto-capitalised, Lato SemiBold (600) renders as Bold, and `stone-25` (#faf9f5) became `gray-0`.
- Controlled arceus `Popover` does not toggle on Target click (Mantine only wires that when uncontrolled), so triggers toggle `opened` themselves; Mantine also names a popover dialog from its trigger, not its own `aria-label`.
- Still hand-built (bespoke sliding-indicator tab strips in `TicketComposer` and `TicketDetailsPanel`, checkbox/radio/date/file inputs, the Inspector and Comments chrome); DataTable stays a compound shell whose sort header, skeleton and pagination are arceus parts.
- jsdom can't lay out floating elements, so tests assert tooltip/menu behaviour, not placement; the Inspector's placement rule is tested as a pure function.
