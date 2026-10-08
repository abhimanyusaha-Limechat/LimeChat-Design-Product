# The URL hash owns navigation state

Comments need a Screen identity and deep links must restore it, so `useAppNavigation` reads and writes its state from the URL hash instead of keeping it in `useState` and mirroring it out. A mirror can drift and restores Screens step by step through `resetViews()`, which can land half-restored; owning it in the URL gives atomic restore and working back/forward. Hash routing (not React Router, not path routing) because GitHub Pages serves static files with no rewrite rules.

## Consequences

Only state held by `useAppNavigation` is addressable. Modals, menus and popovers stay local to their components in v1; a Comment made on one falls back to its screenshot and a "now closed" banner.
