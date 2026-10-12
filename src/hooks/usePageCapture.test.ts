import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, renderHook } from '@testing-library/react';
import { usePageCapture } from './usePageCapture';

function setup(active = true) {
  const page = document.body.appendChild(document.createElement('button'));
  const toolUi = document.body.appendChild(document.createElement('div'));
  toolUi.setAttribute('data-inspector-ui', '');
  const toolButton = toolUi.appendChild(document.createElement('button'));
  const appClick = vi.fn();
  page.addEventListener('click', appClick);
  const toolClick = vi.fn();
  toolButton.addEventListener('click', toolClick);
  const onPress = vi.fn();
  const onHover = vi.fn();
  const hook = renderHook(({ on }) => usePageCapture(on, { onPress, onHover }), { initialProps: { on: active } });
  return { page, toolButton, appClick, toolClick, onPress, onHover, hook };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('usePageCapture', () => {
  it('swallows presses on the page and reports primary-button ones with their point', () => {
    const { page, appClick, onPress } = setup();
    fireEvent.pointerDown(page, { button: 0, clientX: 10, clientY: 20 });
    fireEvent.click(page);
    expect(appClick).not.toHaveBeenCalled();
    expect(onPress).toHaveBeenCalledOnce();
    expect(onPress).toHaveBeenCalledWith(page, 10, 20);

    fireEvent.pointerDown(page, { button: 2 });
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("lets the tools' own UI work and reports no hover over it", () => {
    const { page, toolButton, toolClick, onPress, onHover } = setup();
    fireEvent.pointerDown(toolButton, { button: 0 });
    fireEvent.click(toolButton);
    expect(toolClick).toHaveBeenCalledOnce();
    expect(onPress).not.toHaveBeenCalled();

    fireEvent.pointerMove(page);
    expect(onHover).toHaveBeenLastCalledWith(page);
    fireEvent.pointerMove(toolButton);
    expect(onHover).toHaveBeenLastCalledWith(null);
  });

  it('gives the page back when it turns off', () => {
    const { page, appClick, onPress, hook } = setup();
    hook.rerender({ on: false });
    fireEvent.pointerDown(page, { button: 0 });
    fireEvent.click(page);
    expect(appClick).toHaveBeenCalledOnce();
    expect(onPress).not.toHaveBeenCalled();
  });
});
