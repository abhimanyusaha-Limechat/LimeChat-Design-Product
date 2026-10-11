import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Comments stay off in tests even when a local env file has Supabase keys:
// the Comment tool needs Clerk, which component tests don't provide. Tests that
// want it on mock `src/comments/api` instead.
vi.stubEnv('VITE_SUPABASE_URL', '');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');

afterEach(() => {
  cleanup();
  // The URL hash owns navigation (ADR 0001); jsdom keeps it between tests.
  history.replaceState(null, '', '/');
});
