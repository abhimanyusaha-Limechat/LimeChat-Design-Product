import { describe, expect, it } from 'vitest';
import { NO_FILTER_RESULTS, NO_SEARCH_RESULTS, WITH_DATA, ZERO_STATE, statesOf } from './screenStates';

describe('statesOf', () => {
  it("lists a Screen's states with the one it opens in first", () => {
    expect(statesOf('automation', 'settings', 'delete-history')).toEqual([
      WITH_DATA,
      ZERO_STATE,
      NO_SEARCH_RESULTS,
      NO_FILTER_RESULTS,
    ]);
  });

  it('is empty for a Screen that lists none', () => {
    expect(statesOf('automation', 'settings', 'bot-settings')).toEqual([]);
    expect(statesOf('helpdesk', 'tickets', '')).toEqual([]);
  });
});
