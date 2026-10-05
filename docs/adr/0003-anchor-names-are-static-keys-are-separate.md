# Anchor names are static literals; instance keys live in a separate attribute

Elements carry `data-anchor="ticket-row"` (always a string literal) and, when repeated, `data-anchor-key={id}`. A build step scans the source for the literals and writes `anchors.json`; a Comment is Detached only when its Anchor name is absent from that manifest. A combined `ticket-row:T-1042` attribute (the spec's original form) can't be listed statically, so "removed in this build" would be indistinguishable from "not rendered right now".

Names describe what an element is (`inbox-sync-button`), not where it sits, so layout moves don't detach Comments — the Screen is stored on the Comment separately. Renaming an anchor detaches every Comment on it; treat names like a public API.
