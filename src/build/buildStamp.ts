export interface BuildStamp {
  /** Short git SHA of the built commit, or `dev` when git is unavailable. */
  sha: string;
  /** ISO date (YYYY-MM-DD, UTC) the build ran. */
  date: string;
}

// Pure so it can be tested; vite.config.ts supplies the real git call and clock.
export function buildStamp(gitShortSha: () => string, now: Date): BuildStamp {
  let sha = '';
  try {
    sha = gitShortSha().trim();
  } catch {
    // No git (or not a repo) — fall through to the dev fallback.
  }
  return { sha: sha || 'dev', date: now.toISOString().slice(0, 10) };
}
