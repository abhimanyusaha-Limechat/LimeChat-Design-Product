import '@testing-library/jest-dom/vitest';
import 'vitest-canvas-mock';
import { afterEach, vi } from 'vitest';
import { cleanup, type RenderOptions } from '@testing-library/react';
import { createElement, type ReactElement, type ReactNode } from 'react';
import { ThemeProvider } from 'arceus';

// arceus components (Mantine) need a theme provider and a few browser APIs jsdom lacks.
if (typeof window !== 'undefined') {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView ??= () => undefined;
}

// Every test render is wrapped in the arceus ThemeProvider, as the real app is.
vi.mock('@testing-library/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@testing-library/react')>();
  const Providers = ({ children }: { children: ReactNode }) => createElement(ThemeProvider, { env: 'test', children });
  const render = ((ui: ReactElement, options?: RenderOptions) =>
    actual.render(ui, { wrapper: Providers, ...options })) as typeof actual.render;
  return { ...actual, render };
});

// Comments stay off in tests even when a local env file has Supabase keys:
// the Comment tool needs Clerk, which component tests don't provide. Tests that
// want it on mock `src/comments/api` instead.
vi.stubEnv('VITE_SUPABASE_URL', '');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');

afterEach(() => {
  cleanup();
  // The URL hash owns navigation (ADR 0001); jsdom keeps it between tests.
  // Absent in the few files that run in plain Node (`@vitest-environment node`).
  if (typeof history !== 'undefined') history.replaceState(null, '', '/');
});
