import { describe, expect, it } from 'vitest';
import {
  COLOR_TOKENS,
  findColorToken,
  isAllowedFontSize,
  isOnSpacingGrid,
  nearestColorToken,
} from './designScale';

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

describe('COLOR_TOKENS', () => {
  it('is read from the arceus palettes', () => {
    expect(COLOR_TOKENS.length).toBeGreaterThan(30);
    expect(COLOR_TOKENS.find((t) => t.name === 'primary-6')).toEqual({
      name: 'primary-6',
      cssVar: '--mantine-color-primary-6',
      hex: '#6bac1b',
    });
  });
});

describe('findColorToken', () => {
  it('returns the first-declared token for a shared hex', () => {
    expect(findColorToken('#E5F7CF')?.name).toBe('primary-1');
  });

  it('returns null for an off-palette or translucent color', () => {
    expect(findColorToken('#818a76')).toBeNull();
    expect(findColorToken('#80897580')).toBeNull();
  });
});

describe('nearestColorToken', () => {
  it('returns the closest token by RGB', () => {
    expect(nearestColorToken('#818a76')?.name).toBe('light');
  });

  it('returns null for colors it cannot read', () => {
    expect(nearestColorToken('color(display-p3 1 0 0)')).toBeNull();
  });
});
