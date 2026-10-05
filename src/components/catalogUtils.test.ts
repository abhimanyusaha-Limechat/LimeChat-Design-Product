import { describe, expect, it } from 'vitest';
import { hashString, thumbPalette } from './catalogUtils';

describe('catalogUtils', () => {
  it('hashString is deterministic and non-negative', () => {
    expect(hashString('SKU-1')).toBe(hashString('SKU-1'));
    expect(hashString('prod_001')).toBeGreaterThanOrEqual(0);
  });

  it('thumbPalette gives the same colours for the same key', () => {
    expect(thumbPalette('prod_001')).toEqual(thumbPalette('prod_001'));
    expect(thumbPalette('prod_001')).toHaveProperty('bg');
    expect(thumbPalette('prod_001')).toHaveProperty('fg');
  });
});
