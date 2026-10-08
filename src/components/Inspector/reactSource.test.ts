import { describe, expect, it } from 'vitest';
import { editorHref, formatLoc, sourceOf } from './reactSource';

const loc = (file: string, line: number) => ({ fileName: file, lineNumber: line, columnNumber: 3 });

/** An element carrying a fake fiber, the way React 18 attaches one in dev. */
function elementWithFiber(fiber: object): Element {
  const el = document.createElement('div');
  Object.assign(el, { __reactFiber$abc: fiber });
  return el;
}

describe('sourceOf', () => {
  it('reads where the node is rendered and where its component was used', () => {
    const app = { type: function App() {}, return: null };
    const sidebar = { type: function Sidebar() {}, return: app, _debugSource: loc('D:/x/src/App.tsx', 493) };
    const host = { type: 'aside', return: sidebar, _debugSource: loc('D:/x/src/Sidebar.tsx', 147) };
    expect(sourceOf(elementWithFiber(host))).toEqual({
      component: 'Sidebar',
      renderedAt: { file: 'D:/x/src/Sidebar.tsx', line: 147, column: 3 },
      usedAt: { file: 'D:/x/src/App.tsx', line: 493, column: 3 },
    });
  });

  it('names forwardRef and memo wrappers', () => {
    const wrapper = { type: { render: function Button() {} }, return: null };
    const host = { type: 'button', return: wrapper, _debugSource: loc('D:/x/src/Button.tsx', 1) };
    expect(sourceOf(elementWithFiber(host))?.component).toBe('Button');
  });

  it('is null without a React fiber or without debug info (production, React 19)', () => {
    expect(sourceOf(document.createElement('div'))).toBeNull();
    expect(sourceOf(elementWithFiber({ type: 'div', return: null }))).toBeNull();
  });
});

describe('formatLoc / editorHref', () => {
  const l = { file: 'D:/vibe coding/Canvas UI/src/components/Button/Button.tsx', line: 124, column: 5 };

  it('shortens to src-relative', () => {
    expect(formatLoc(l)).toBe('components/Button/Button.tsx:124');
  });

  it('builds an escaped vscode link', () => {
    expect(editorHref(l)).toBe('vscode://file/D:/vibe%20coding/Canvas%20UI/src/components/Button/Button.tsx:124:5');
  });
});
