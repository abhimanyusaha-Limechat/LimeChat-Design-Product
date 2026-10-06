import { describe, expect, it } from 'vitest';
import {
  COLOR_TOKENS,
  findColorToken,
  isAllowedFontSize,
  isOnSpacingGrid,
  nearestColorToken,
  parseColorTokens,
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

describe('parseColorTokens', () => {
  it('reads name, hex and primitive, dropping notes and section comments', () => {
    const css = `
      /* Brand green — primitives */
      --lc-color-green-900: #3C492C; /* color/dark */
      --lc-color-green-75: #e5f7cf; /* green-1 (nearest approved step) */
      --lc-color-plain: #ffffff;
      /* Next section */
      --lc-font: Lato;`;
    expect(parseColorTokens(css)).toEqual([
      { name: 'green-900', hex: '#3c492c', primitive: 'color/dark' },
      { name: 'green-75', hex: '#e5f7cf', primitive: 'green-1' },
      { name: 'plain', hex: '#ffffff', primitive: null },
    ]);
  });

  it('finds every color token in tokens.css', () => {
    expect(COLOR_TOKENS.length).toBeGreaterThan(30);
  });
});

describe('findColorToken', () => {
  it('returns the first-declared token for a shared hex', () => {
    expect(findColorToken('#E5F7CF')?.name).toBe('green-100');
  });

  it('returns null for an off-palette or translucent color', () => {
    expect(findColorToken('#818a76')).toBeNull();
    expect(findColorToken('#80897580')).toBeNull();
  });
});

describe('nearestColorToken', () => {
  it('returns the closest token by RGB', () => {
    expect(nearestColorToken('#818a76')?.name).toBe('sage-500');
  });

  it('returns null for colors it cannot read', () => {
    expect(nearestColorToken('color(display-p3 1 0 0)')).toBeNull();
  });
});
