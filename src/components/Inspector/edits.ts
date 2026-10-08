/**
 * Live style tweaks made from the Inspect panel. They are inline styles on the
 * element, remembered so they can be undone: nothing is saved anywhere, and
 * closing Inspect mode (or reloading) puts the page back exactly as it was.
 */

export type Styled = HTMLElement | SVGElement;

/** One changed property: its computed value before the first edit, and what it is set to now. */
export interface Edit {
  prop: string;
  from: string;
  to: string;
}

interface Original {
  /** Computed value before the first edit, for the change list. */
  computed: string;
  /** The element's own inline value, restored on reset (`''` = none). */
  inline: string;
}

/** Every edited element and what it had before; cleared by `resetAll` when Inspect closes. */
const originals = new Map<Element, Map<string, Original>>();

export const isStyled = (el: Element | null): el is Styled => el instanceof HTMLElement || el instanceof SVGElement;

export function setStyle(el: Styled, prop: string, value: string): void {
  let props = originals.get(el);
  if (!props) originals.set(el, (props = new Map()));
  if (!props.has(prop)) {
    props.set(prop, { computed: getComputedStyle(el).getPropertyValue(prop), inline: el.style.getPropertyValue(prop) });
  }
  el.style.setProperty(prop, value);
}

export function editsOf(el: Element): Edit[] {
  const props = originals.get(el);
  if (!props || !isStyled(el)) return [];
  return [...props].map(([prop, { computed }]) => ({ prop, from: computed, to: el.style.getPropertyValue(prop) }));
}

export function resetElement(el: Styled): void {
  for (const [prop, { inline }] of originals.get(el) ?? []) {
    if (inline) el.style.setProperty(prop, inline);
    else el.style.removeProperty(prop);
  }
  originals.delete(el);
}

export function resetAll(): void {
  for (const el of [...originals.keys()]) if (isStyled(el)) resetElement(el);
}
