import { useState } from 'react';
import { useAppNavigation } from './useAppNavigation';
import { useDemoLoading } from './useDemoLoading';

/** Whether any field contains `search`, ignoring case. An empty search matches everything. */
export function matchesSearch(search: string, ...fields: (string | undefined)[]): boolean {
  const q = search.trim().toLowerCase();
  return q === '' || fields.some((field) => field?.toLowerCase().includes(q));
}

/**
 * A list Screen's state: its List tab, which lives in the URL, plus the search, filters and
 * page, which start over whenever the List tab changes (a click or Back/Forward alike).
 * Changing a filter goes back to page 1. Tab, filters and page replay the demo fetch;
 * search only narrows what is already loaded, so it doesn't.
 */
export function useListScreen<F extends Record<string, string>>(initialFilters: F) {
  const { tab, setTab } = useAppNavigation();
  const fresh = { tab, search: '', page: 1, filters: initialFilters };
  const [stored, setStored] = useState(fresh);
  const state = stored.tab === tab ? stored : fresh;
  if (state !== stored) setStored(state);
  const { search, page, filters } = state;

  return {
    tab,
    setTab,
    search,
    setSearch: (next: string) => setStored((s) => ({ ...s, search: next })),
    page,
    setPage: (next: number) => setStored((s) => ({ ...s, page: next })),
    filters,
    setFilter: (key: keyof F, value: string) =>
      setStored((s) => ({ ...s, page: 1, filters: { ...s.filters, [key]: value } })),
    loading: useDemoLoading(JSON.stringify([tab, page, filters])),
  };
}
