# Supabase for Comments, with row-level security as the only gate

The repo and the GitHub Pages site stay public, so every client key ships in the bundle and anyone can call the backend directly. We chose Supabase (Postgres, Google sign-in, row-level security, storage) over Liveblocks because it works from a static site with no auth server, and its row-level security can check the verified company email domain in the sign-in token. Liveblocks' public-key mode would expose rooms to anyone holding the key.

## Consequences

Row-level security is the only thing protecting Comment data. An automated test asserting that an anonymous client reads zero rows is a release blocker. Google's `hd` sign-in hint is a convenience, never a control.
