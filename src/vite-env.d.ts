/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Short git SHA of the commit this build came from (`dev` without git). */
  readonly BUILD_SHA: string;
  /** ISO date (YYYY-MM-DD) the build ran (UTC). */
  readonly BUILD_DATE: string;
  /** Supabase project URL for Comments; unset hides the Comment tool. */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase publishable (anon) key. Public by design: row-level security is the gate. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}
