import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { clampToViewport, readStoredPosition, useDraggable } from './useDraggable';

const KEY = 'lc-inspector:position';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('clampToViewport', () => {
  const size = { width: 40, height: 40 };
  const viewport = { width: 800, height: 600 };

  it.each([
    ['left', { x: -50, y: 100 }, { x: 8, y: 100 }],
    ['top', { x: 100, y: -5 }, { x: 100, y: 8 }],
    ['right', { x: 790, y: 100 }, { x: 752, y: 100 }],
    ['bottom', { x: 100, y: 999 }, { x: 100, y: 552 }],
  ])('keeps it off the %s edge', (_, pos, expected) => {
    expect(clampToViewport(pos, size, viewport)).toEqual(expected);
  });

  it('leaves an in-bounds position alone', () => {
    expect(clampToViewport({ x: 300, y: 200 }, size, viewport)).toEqual({ x: 300, y: 200 });
  });

  it('pins to the margin when the box is wider than the viewport', () => {
    expect(clampToViewport({ x: 50, y: 50 }, { width: 900, height: 40 }, viewport).x).toBe(8);
  });
});

describe('readStoredPosition', () => {
  it('reads a valid saved position', () => {
    localStorage.setItem(KEY, '{"x":10,"y":20}');
    expect(readStoredPosition()).toEqual({ x: 10, y: 20 });
  });

  it.each(['not json', '{"x":"10","y":20}', '{"x":null}', 'null', '[1,2]'])('ignores %s', (raw) => {
    localStorage.setItem(KEY, raw);
    expect(readStoredPosition()).toBeNull();
  });

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readStoredPosition()).toBeNull();
  });
});

function Draggable({
  onClick,
  wide = false,
  anchorRight = false,
}: {
  onClick: () => void;
  wide?: boolean;
  anchorRight?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { position, handleProps, onClickCapture } = useDraggable(ref, () => ({ x: 400, y: 100 }), {
    anchorRight,
    layoutKey: wide,
  });
  return (
    <div ref={ref} data-testid="box" data-wide={wide || undefined} style={{ left: position.x, top: position.y }}>
      <div onClickCapture={onClickCapture} {...handleProps}>
        <button type="button" onClick={onClick}>
          Handle
        </button>
      </div>
    </div>
  );
}

function press(target: Element, from: { x: number; y: number }, to: { x: number; y: number }) {
  fireEvent.pointerDown(target, { button: 0, buttons: 1, pointerId: 1, clientX: from.x, clientY: from.y });
  fireEvent.pointerMove(window, { buttons: 1, pointerId: 1, clientX: to.x, clientY: to.y });
  fireEvent.pointerUp(window, { button: 0, buttons: 0, pointerId: 1, clientX: to.x, clientY: to.y });
  fireEvent.click(target);
}

describe('useDraggable', () => {
  it('treats a movement under the threshold as a tap', () => {
    const onClick = vi.fn();
    render(<Draggable onClick={onClick} />);
    press(screen.getByRole('button'), { x: 10, y: 10 }, { x: 12, y: 12 });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('box')).toHaveStyle({ left: '400px', top: '100px' });
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('moves on a drag, saves the spot, and swallows the click that ends it', () => {
    const onClick = vi.fn();
    render(<Draggable onClick={onClick} />);
    press(screen.getByRole('button'), { x: 10, y: 10 }, { x: 60, y: 30 });
    expect(screen.getByTestId('box')).toHaveStyle({ left: '450px', top: '120px' });
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({ x: 450, y: 120 });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('follows the pointer even after it leaves the handle', () => {
    render(<Draggable onClick={() => {}} />);
    const handle = screen.getByRole('button');
    fireEvent.pointerDown(handle, { button: 0, buttons: 1, pointerId: 1, clientX: 0, clientY: 0 });
    // A fast flick: the first move already lands far outside the handle.
    fireEvent.pointerMove(document.body, { buttons: 1, pointerId: 1, clientX: 200, clientY: 50 });
    expect(screen.getByTestId('box')).toHaveStyle({ left: '600px', top: '150px' });
  });

  describe('when its width changes', () => {
    // jsdom has no layout: 40px wide, or 190px once `data-wide` is set.
    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
        return this.dataset.wide ? 190 : 40;
      });
    });

    it('keeps its left edge by default', () => {
      const { rerender } = render(<Draggable onClick={() => {}} />);
      rerender(<Draggable onClick={() => {}} wide />);
      expect(screen.getByTestId('box')).toHaveStyle({ left: '400px' });
    });

    it('keeps its right edge when anchored right, growing and shrinking', () => {
      const { rerender } = render(<Draggable onClick={() => {}} anchorRight />);
      rerender(<Draggable onClick={() => {}} anchorRight wide />);
      expect(screen.getByTestId('box')).toHaveStyle({ left: '250px' });
      rerender(<Draggable onClick={() => {}} anchorRight />);
      expect(screen.getByTestId('box')).toHaveStyle({ left: '400px' });
    });
  });

  it('starts from the saved position', () => {
    localStorage.setItem(KEY, '{"x":40,"y":60}');
    render(<Draggable onClick={() => {}} />);
    expect(screen.getByTestId('box')).toHaveStyle({ left: '40px', top: '60px' });
  });
});
