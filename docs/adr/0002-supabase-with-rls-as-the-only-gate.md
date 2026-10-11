# Supabase for Comments, with row-level security as the only gate

The repo and the GitHub Pages site stay public, so every client key ships in the bundle and anyone can call the backend directly. We chose Supabase (Postgres, Google sign-in, row-level security, storage) over Liveblocks because it works from a static site with no auth server, and its row-level security can check the verified company email domain in the sign-in token. Liveblocks' public-key mode would expose rooms to anyone holding the key.

## Consequences

Row-level security is the only thing protecting Comment data. An automated test asserting that an anonymous client reads zero rows is a release blocker. Google's `hd` sign-in hint is a convenience, never a control.

## Amendment: Clerk signs people in, not Supabase

The app adopted Clerk for sign-in before Comments were built, so Supabase's own Google sign-in was never used. Supabase instead trusts Clerk's session token through Third-Party Auth. The token carries `role: authenticated` plus custom `email` and `name` claims, and the policies in `supabase/migrations/0001_comments.sql` read identity only from it: a Comment's author fields must equal the token's, so nobody can post as someone else. Anyone signed in may read and post; there is no domain check, so an open Clerk sign-up is open commenting.

The Designer is the one account whose email `is_designer()` matches. That function is the only copy of the email: the client asks it via RPC to decide whether to show Resolve. A Comment never changes from the client: there are no update or delete grants, and Resolve runs through `resolve_comment()`, which checks `is_designer()` and stamps who resolved it.

Comments are filed under the Screen's normalised hash. A Screen later removed from navigation falls back to another on parse, so its Comments stay in the database but no longer show anywhere.
