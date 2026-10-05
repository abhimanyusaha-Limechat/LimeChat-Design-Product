/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Short git SHA of the commit this build came from (`dev` without git). */
  readonly BUILD_SHA: string;
  /** ISO date (YYYY-MM-DD) the build ran (UTC). */
  readonly BUILD_DATE: string;
}
