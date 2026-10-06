import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { useBarMotion } from './useBarMotion';

/** A controllable stand-in for a WAAPI Animation. */
function fakeAnimation(keyframes: Keyframe[]) {
  let resolve!: () => void;
  let reject!: (e: Error) => void;
  const finished = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  finished.catch(() => {});
  return {
    keyframes,
    finished,
    finish: () => resolve(),
    cancel: vi.fn(() => reject(new Error('AbortError'))),
  };
}

let animations: ReturnType<typeof fakeAnimation>[] = [];

function setup() {
  animations = [];
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: (keyframes: Keyframe[]) => {
      const a = fakeAnimation(keyframes);
      animations.push(a);
      return a;
    },
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(193);

  let motion!: ReturnType<typeof useBarMotion>;
  function Bar() {
    const ref = useRef<HTMLDivElement>(null);
    motion = useBarMotion(ref, 40);
    return (
      <div ref={ref}>
        <div data-inspector-extras="" />
      </div>
    );
  }
  render(<Bar />);
  return () => motion;
}

const clipOf = (a: ReturnType<typeof fakeAnimation>) => a.keyframes.map((k) => k.clipPath);

afterEach(() => {
  delete (HTMLElement.prototype as { animate?: unknown }).animate;
  delete (window as { matchMedia?: unknown }).matchMedia;
  vi.restoreAllMocks();
});

describe('useBarMotion', () => {
  it('reveals the bar from the ruler side outward', () => {
    const motion = setup();
    act(() => motion().play('open', false));
    const clip = animations.find((a) => a.keyframes[0].clipPath)!;
    expect(clipOf(clip)).toEqual(['inset(0 153px 0 0 round 20px)', 'inset(0 0 0 0 round 20px)']);

    act(() => motion().play('open', true));
    const clips = animations.filter((a) => a.keyframes[0].clipPath);
    const left = clips[clips.length - 1];
    expect(left.keyframes[0].clipPath).toBe('inset(0 0 0 153px round 20px)');
  });

  it('slides the tools out of the ruler and fades them in', () => {
    const motion = setup();
    act(() => motion().play('open', false));
    const tools = animations.find((a) => a.keyframes[0].opacity !== undefined)!;
    expect(tools.keyframes).toEqual([
      { opacity: '0', transform: 'translateX(-8px)' },
      { opacity: '1', transform: 'none' },
    ]);
  });

  it('calls onDone once the close finishes', async () => {
    const motion = setup();
    const onDone = vi.fn();
    act(() => motion().play('close', false, onDone));
    expect(onDone).not.toHaveBeenCalled();
    await act(async () => animations.forEach((a) => a.finish()));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('never finishes an interrupted close: the newer play wins', async () => {
    const motion = setup();
    const onDone = vi.fn();
    act(() => motion().play('close', false, onDone));
    const closing = [...animations];
    act(() => motion().play('open', false));
    for (const a of closing) expect(a.cancel).toHaveBeenCalled();
    await act(async () => {});
    expect(onDone).not.toHaveBeenCalled();
  });

  it('keeps the fade but drops the movement under reduced motion', () => {
    // jsdom has no matchMedia.
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: true }),
    });
    const motion = setup();
    act(() => motion().play('open', false));
    expect(animations).toHaveLength(1);
    expect(animations[0].keyframes).toEqual([
      { opacity: '0', transform: 'none' },
      { opacity: '1', transform: 'none' },
    ]);
  });
});
