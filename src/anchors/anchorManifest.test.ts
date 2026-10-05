import { describe, expect, it } from 'vitest';
import { anchorManifest } from './anchorManifest';

const file = (path: string, source: string) => ({ path, source });

describe('anchorManifest', () => {
  it('collects names in double and single quotes', () => {
    expect(
      anchorManifest([file('a.tsx', `<div data-anchor="sidebar" /><nav data-anchor='top-nav-bar' />`)]),
    ).toEqual(['sidebar', 'top-nav-bar']);
  });

  it('rejects the expression form, naming the file and line', () => {
    const source = `<div>\n  <span data-anchor={name} />\n</div>`;
    expect(() => anchorManifest([file('src/Row.tsx', source)])).toThrow('src/Row.tsx:2');
  });

  it('rejects names that are not lowercase kebab-case', () => {
    expect(() => anchorManifest([file('a.tsx', `<div data-anchor="ticketRow" />`)])).toThrow(
      /a\.tsx:1.*ticketRow/,
    );
    expect(() => anchorManifest([file('a.tsx', `<div data-anchor="ticket_row" />`)])).toThrow();
    expect(() => anchorManifest([file('a.tsx', `<div data-anchor="" />`)])).toThrow();
  });

  it('ignores data-anchor-key', () => {
    expect(
      anchorManifest([file('a.tsx', `<li data-anchor="ticket-row" data-anchor-key={ticket.id} />`)]),
    ).toEqual(['ticket-row']);
  });

  it('ignores attributes that merely end in data-anchor', () => {
    expect(anchorManifest([file('a.tsx', `<div foo-data-anchor={x} />`)])).toEqual([]);
  });

  it('de-duplicates across files and sorts the output', () => {
    expect(
      anchorManifest([
        file('a.tsx', `<b data-anchor="zeta" /><b data-anchor="alpha" />`),
        file('b.tsx', `<b data-anchor="alpha" /><b data-anchor="mid-2" />`),
      ]),
    ).toEqual(['alpha', 'mid-2', 'zeta']);
  });
});
