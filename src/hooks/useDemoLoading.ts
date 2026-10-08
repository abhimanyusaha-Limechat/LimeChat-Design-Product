import { useEffect, useState } from 'react';

/** How long the demo pretends a table's data takes to arrive. */
const DEMO_LOAD_MS = 600;

/**
 * Demo only — there is no backend, so this fakes a short fetch whenever `key` changes
 * (e.g. "broadcast:triggered:2" for a tab + page) and returns true until it "arrives".
 * Lets every table show its loading state. Off under tests so they see data immediately.
 *
 * ponytail: replace with the real request's pending state once tables load from an API.
 */
export function useDemoLoading(key: string): boolean {
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoadedKey(key), DEMO_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [key]);
  return import.meta.env.MODE !== 'test' && loadedKey !== key;
}
