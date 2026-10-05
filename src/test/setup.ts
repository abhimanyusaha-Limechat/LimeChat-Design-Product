import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  // The URL hash owns navigation (ADR 0001); jsdom keeps it between tests.
  history.replaceState(null, '', '/');
});
