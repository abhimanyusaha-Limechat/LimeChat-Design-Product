import type { SidebarProduct } from '../components/Sidebar/presets';

/**
 * One of the ways a reviewer can ask to see a Screen: with its demo data, in its zero state,
 * loading, and so on. Picked from the state switcher and kept in the Screen's URL (ADR 0001),
 * so a link or a Comment reopens the Screen in the same state.
 */
export interface ScreenState {
  /** Written to the URL as `state=<id>`. */
  id: string;
  /** What the switcher calls it. */
  label: string;
}

export const WITH_DATA: ScreenState = { id: 'data', label: 'With data' };
/** How the Screen looks before there is anything in it. */
export const ZERO_STATE: ScreenState = { id: 'zero', label: 'Zero state' };
/** A search that finds nothing. The Screen opens with the search typed in. */
export const NO_SEARCH_RESULTS: ScreenState = { id: 'no-search-results', label: 'No search results' };
/** Filters that leave nothing to show. The Screen opens with them applied. */
export const NO_FILTER_RESULTS: ScreenState = { id: 'no-filter-results', label: 'No filter results' };
/** Two layouts of one Screen kept side by side to compare; the first is the one it opens in. */
export const VERSION_1: ScreenState = { id: 'v1', label: 'Version 1' };
export const VERSION_2: ScreenState = { id: 'v2', label: 'Version 2' };

/**
 * The states each Screen can be switched between; the first is the one it opens in.
 * Keyed by `<product>/<item>` for a whole rail item, or `<product>/<item>/<tab>` for one of its
 * Settings tabs or List tabs. A Screen that isn't listed has no switcher.
 *
 * To give a Screen states: add its line here, show the switcher on it, and have it render each
 * state. Two or five, the switcher is the same dropdown. A state that a search or filters
 * produce opens with them already applied, so the controls show what led to it.
 */
const SCREEN_STATES: Record<string, readonly ScreenState[]> = {
  'automation/tasks': [WITH_DATA, ZERO_STATE, NO_SEARCH_RESULTS, NO_FILTER_RESULTS],
  // Opens in Version 2, the Helpdesk inbox page's boxed layout; Version 1 follows the Figma frames.
  'automation/settings/bot-settings': [VERSION_2, VERSION_1],
  'automation/settings/delete-history': [WITH_DATA, ZERO_STATE, NO_SEARCH_RESULTS, NO_FILTER_RESULTS],
};

/** The states of a Screen, default first; empty when it has only the one way of showing. */
export function statesOf(product: SidebarProduct, selected: string, tab: string): readonly ScreenState[] {
  return SCREEN_STATES[`${product}/${selected}/${tab}`] ?? SCREEN_STATES[`${product}/${selected}`] ?? [];
}
