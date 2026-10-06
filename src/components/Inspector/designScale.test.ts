import { describe, expect, it } from 'vitest';
import { isAllowedFontSize, isOnSpacingGrid } from './designScale';

describe('isOnSpacingGrid', () => {
  it.each([0, 4, 8, 12, 64])('accepts %ipx', (px) => {
    expect(isOnSpacingGrid(px)).toBe(true);
  });

  it.each([1, 2, 6, 10, 14, 12.5, 8.01])('flags %spx', (px) => {
    expect(isOnSpacingGrid(px)).toBe(false);
  });
});

describe('isAllowedFontSize', () => {
  it.each([10, 12, 14, 16, 20])('accepts %ipx', (px) => {
    expect(isAllowedFontSize(px)).toBe(true);
  });

  it.each([8, 9, 11, 13, 15, 18, 12.5])('flags %spx', (px) => {
    expect(isAllowedFontSize(px)).toBe(false);
  });
});
