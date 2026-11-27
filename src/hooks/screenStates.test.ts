import { describe, expect, it } from 'vitest';
import { NO_FILTER_RESULTS, NO_SEARCH_RESULTS, VERSION_1, VERSION_2, WITH_DATA, ZERO_STATE, statesOf } from './screenStates';

describe('statesOf', () => {
  it("lists a Screen's states with the one it opens in first", () => {
    expect(statesOf('automation', 'settings', 'delete-history')).toEqual([
      WITH_DATA,
      ZERO_STATE,
      NO_SEARCH_RESULTS,
      NO_FILTER_RESULTS,
    ]);
  });

  it('lists the two layouts of Bot settings, opening in Version 2', () => {
    expect(statesOf('automation', 'settings', 'bot-settings')).toEqual([VERSION_2, VERSION_1]);
  });

  it('is empty for a Screen that lists none', () => {
    expect(statesOf('automation', 'settings', 'bot-brain')).toEqual([]);
    expect(statesOf('helpdesk', 'tickets', '')).toEqual([]);
  });
});
