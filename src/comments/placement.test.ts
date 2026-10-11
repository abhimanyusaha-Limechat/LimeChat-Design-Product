import { afterEach, describe, expect, it } from 'vitest';
import { anchorFor, findAnchor, pinPoint, placeAt, type HitTest } from './placement';

const VP = { width: 1000, height: 800 };

/** jsdom has no layout: give one element a box. */
function box(el: Element, left: number, top: number, width: number, height: number) {
  el.getBoundingClientRect = () => DOMRect.fromRect({ x: left, y: top, width, height });
}

function mount(html: string) {
  document.body.innerHTML = html;
  for (const el of document.querySelectorAll('[data-anchor]')) box(el, 100, 200, 400, 100);
}

const hitsEl = (el: Element): HitTest => () => [el];

afterEach(() => {
  document.body.innerHTML = '';
});

describe('placeAt', () => {
  it('stores a point as fractions of the nearest Anchor, with its key', () => {
    mount('<div data-anchor="ticket-row" data-anchor-key="T-1"><span id="t">hi</span></div>');
    const p = placeAt(document.getElementById('t')!, 300, 225, VP);
    expect(p).toEqual({
      anchor: 'ticket-row',
      anchor_key: 'T-1',
      in_overlay: false,
      x: 0.5,
      y: 0.25,
      viewport_w: 1000,
      viewport_h: 800,
    });
  });

  it('stores a null key for an unkeyed Anchor', () => {
    mount('<div data-anchor="ticket-list"><span id="t"></span></div>');
    expect(placeAt(document.getElementById('t')!, 100, 200, VP)).toMatchObject({ anchor: 'ticket-list', anchor_key: null });
  });

  it('climbs past an Anchor name used twice on the page to a unique ancestor', () => {
    mount(`<main data-anchor="page">
      <div data-anchor="conversation"><span id="t"></span></div>
      <div data-anchor="conversation"></div>
    </main>`);
    expect(placeAt(document.getElementById('t')!, 100, 200, VP).anchor).toBe('page');
  });

  it('falls back to a Loose comment when no unique Anchor exists', () => {
    mount('<div data-anchor="dup"><span id="t"></span></div><div data-anchor="dup"></div>');
    expect(placeAt(document.getElementById('t')!, 250, 200, VP)).toMatchObject({ anchor: null, anchor_key: null, x: 0.25, y: 0.25 });
  });

  it('skips a zero-size Anchor', () => {
    mount('<main data-anchor="page"><div data-anchor="hidden"><span id="t"></span></div></main>');
    box(document.querySelector('[data-anchor="hidden"]')!, 0, 0, 0, 0);
    expect(placeAt(document.getElementById('t')!, 100, 200, VP).anchor).toBe('page');
  });

  it('marks a click inside a modal or menu as in an overlay, never anchored', () => {
    mount('<div role="dialog"><div data-anchor="form"><span id="t"></span></div></div>');
    expect(placeAt(document.getElementById('t')!, 500, 400, VP)).toMatchObject({ in_overlay: true, anchor: null });
  });
});

describe('findAnchor', () => {
  it('matches hostile strings literally instead of throwing', () => {
    mount('<div data-anchor="row"></div>');
    expect(() => findAnchor(']"x\\', '"]')).not.toThrow();
    expect(findAnchor(']"x\\', '"]')).toBeNull();
  });

  it('requires an absent key to match an unkeyed element only', () => {
    mount('<div data-anchor="row" data-anchor-key="1"></div>');
    expect(findAnchor('row', null)).toBeNull();
    expect(findAnchor('row', '1')).not.toBeNull();
  });
});

describe('pinPoint', () => {
  it('round-trips a placement back to the same point', () => {
    mount('<div data-anchor="ticket-row" data-anchor-key="T-1"><span id="t"></span></div>');
    const target = document.getElementById('t')!;
    const p = placeAt(target, 300, 225, VP);
    expect(pinPoint(p, hitsEl(target), VP)).toEqual({ left: 300, top: 225 });
  });

  it('is null when the Anchor is not rendered', () => {
    mount('<div data-anchor="other"></div>');
    const comment = { anchor: 'ticket-row', anchor_key: 'T-1', in_overlay: false, x: 0.5, y: 0.5 };
    expect(pinPoint(comment, () => [], VP)).toBeNull();
  });

  it('is null when the Anchor has no size', () => {
    mount('<div data-anchor="row"></div>');
    const el = document.querySelector('[data-anchor]')!;
    box(el, 0, 0, 0, 0);
    expect(pinPoint({ anchor: 'row', anchor_key: null, in_overlay: false, x: 0.5, y: 0.5 }, hitsEl(el), VP)).toBeNull();
  });

  it('is null when something else covers the point (scrolled away or under a modal)', () => {
    mount('<div data-anchor="row"></div><div id="cover"></div>');
    const cover = document.getElementById('cover')!;
    expect(pinPoint({ anchor: 'row', anchor_key: null, in_overlay: false, x: 0.5, y: 0.5 }, hitsEl(cover), VP)).toBeNull();
  });

  it('ignores the Inspector UI when testing what covers the point', () => {
    mount('<div data-anchor="row"><span id="t"></span></div><div data-inspector-ui><b id="pin"></b></div>');
    const hits: HitTest = () => [document.getElementById('pin')!, document.getElementById('t')!];
    expect(pinPoint({ anchor: 'row', anchor_key: null, in_overlay: false, x: 0.5, y: 0.5 }, hits, VP)).toEqual({
      left: 300,
      top: 250,
    });
  });

  it('is null when the point is off-screen', () => {
    mount('<div data-anchor="row"></div>');
    const el = document.querySelector('[data-anchor]')!;
    box(el, 100, 900, 100, 100);
    expect(pinPoint({ anchor: 'row', anchor_key: null, in_overlay: false, x: 0.5, y: 0.5 }, hitsEl(el), VP)).toBeNull();
  });

  it('places a Loose comment by viewport fractions', () => {
    expect(pinPoint({ anchor: null, anchor_key: null, in_overlay: false, x: 0.1, y: 0.5 }, () => [], VP)).toEqual({
      left: 100,
      top: 400,
    });
  });

  it('never pins an overlay comment', () => {
    expect(pinPoint({ anchor: null, anchor_key: null, in_overlay: true, x: 0.1, y: 0.5 }, () => [], VP)).toBeNull();
  });
});

describe('anchorFor', () => {
  it('returns null outside any Anchor', () => {
    mount('<span id="t"></span>');
    expect(anchorFor(document.getElementById('t')!)).toBeNull();
  });
});
