/**
 * Where a Comment sits, and where its Pin goes now. Pure DOM reads, no state.
 * Anchors are matched by comparing attributes, never by building a selector,
 * so a hostile anchor string from the database can't throw or match the wrong thing.
 */
import { isIgnoredUi } from '../components/Inspector/useInspectTarget';
import type { Comment } from './api';

export interface Placement {
  anchor: string | null;
  anchor_key: string | null;
  in_overlay: boolean;
  x: number;
  y: number;
  viewport_w: number;
  viewport_h: number;
}

export interface Point {
  left: number;
  top: number;
}

export type HitTest = (x: number, y: number) => Element[];

/** Content the URL can't restore (ADR 0001): a Comment made here is listed, never pinned. */
const OVERLAY = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [aria-modal="true"]';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const hasBox = (r: DOMRect) => r.width > 0 && r.height > 0;
const viewport = () => ({ width: window.innerWidth, height: window.innerHeight });

/** The one rendered element with this Anchor name and key; null when none, or when it's ambiguous. */
export function findAnchor(name: string, key: string | null, root: ParentNode = document): Element | null {
  let found: Element | null = null;
  for (const el of root.querySelectorAll('[data-anchor]')) {
    if (el.getAttribute('data-anchor') !== name || el.getAttribute('data-anchor-key') !== key) continue;
    if (found) return null; // names aren't enforced unique within a Screen
    found = el;
  }
  return found;
}

/** The nearest Anchor around `target` that can be found again: unique on the page, with a box. */
export function anchorFor(target: Element): Element | null {
  for (let el = target.closest('[data-anchor]'); el; el = el.parentElement?.closest('[data-anchor]') ?? null) {
    const name = el.getAttribute('data-anchor') ?? '';
    if (findAnchor(name, el.getAttribute('data-anchor-key')) === el && hasBox(el.getBoundingClientRect())) return el;
  }
  return null;
}

/** Where a click at (clientX, clientY) on `target` should store its Comment. */
export function placeAt(target: Element, clientX: number, clientY: number, vp = viewport()): Placement {
  const in_overlay = target.closest(OVERLAY) !== null;
  const anchor = in_overlay ? null : anchorFor(target);
  const base = { in_overlay, viewport_w: Math.round(vp.width), viewport_h: Math.round(vp.height) };
  if (!anchor) {
    // ponytail: Loose comments drift when the window size changes; anchor more elements where they pile up.
    return { ...base, anchor: null, anchor_key: null, x: clamp01(clientX / vp.width), y: clamp01(clientY / vp.height) };
  }
  const r = anchor.getBoundingClientRect();
  return {
    ...base,
    anchor: anchor.getAttribute('data-anchor'),
    anchor_key: anchor.getAttribute('data-anchor-key'),
    x: clamp01((clientX - r.left) / r.width),
    y: clamp01((clientY - r.top) / r.height),
  };
}

const defaultHitTest: HitTest = (x, y) => document.elementsFromPoint(x, y);

/**
 * Where the Pin goes right now, or null when it shouldn't be drawn: made in an
 * overlay, Anchor not rendered (or ambiguous), zero-size, off-screen, or covered
 * (scrolled out of an inner scroll area, or under a modal).
 */
export function pinPoint(
  comment: Pick<Comment, 'anchor' | 'anchor_key' | 'in_overlay' | 'x' | 'y'>,
  hitTest: HitTest = defaultHitTest,
  vp = viewport(),
): Point | null {
  if (comment.in_overlay) return null;
  if (!comment.anchor) return { left: comment.x * vp.width, top: comment.y * vp.height };
  const el = findAnchor(comment.anchor, comment.anchor_key);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!hasBox(r)) return null;
  const left = r.left + comment.x * r.width;
  const top = r.top + comment.y * r.height;
  if (left < 0 || top < 0 || left > vp.width || top > vp.height) return null;
  const hit = hitTest(left, top).find((e) => !isIgnoredUi(e));
  return hit && el.contains(hit) ? { left, top } : null;
}
