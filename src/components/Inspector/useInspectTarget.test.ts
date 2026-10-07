import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, renderHook, waitFor } from '@testing-library/react';
import { useInspectTarget } from './useInspectTarget';

const nextFrame = () => act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

// jsdom has no layout: give every element a box so targets don't resolve up to <body>.
beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 10,
    y: 10,
    left: 10,
    top: 10,
    width: 100,
    height: 20,
    right: 110,
    bottom: 30,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('useInspectTarget', () => {
  it("doesn't re-render for frames that measure nothing new", async () => {
    const el = document.body.appendChild(document.createElement('div'));
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useInspectTarget(true);
    });

    fireEvent.pointerMove(el);
    await waitFor(() => expect(result.current.hovered).not.toBeNull());
    const hovered = result.current.hovered;
    const rendersAfterHover = renders;

    // The pointer keeps moving within the same, unchanged element.
    for (let i = 0; i < 10; i += 1) {
      fireEvent.pointerMove(el);
      await nextFrame();
    }

    // React may render once more before it bails out of an unchanged state;
    // without the bail-out this would be one render per frame.
    expect(renders).toBeLessThanOrEqual(rendersAfterHover + 1);
    expect(result.current.hovered).toBe(hovered);
  });

  it('re-renders when the hovered element changes', async () => {
    const a = document.body.appendChild(document.createElement('div'));
    const b = document.body.appendChild(document.createElement('span'));
    const { result } = renderHook(() => useInspectTarget(true));

    fireEvent.pointerMove(a);
    await waitFor(() => expect(result.current.hovered?.name).toBe('div'));
    fireEvent.pointerMove(b);
    await waitFor(() => expect(result.current.hovered?.name).toBe('span'));
  });
});
