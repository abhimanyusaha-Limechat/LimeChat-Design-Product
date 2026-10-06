/**
 * Inspect mode — a draggable FAB that expands into Type / Padding / Gap tools.
 * Hover an element to see its spacing and type, click to pin it and read the
 * values; anything off the design scale is flagged. Read-only: it never
 * changes the page, and while inspecting the app receives no presses.
 *
 * Shortcuts: Shift+I toggles · Esc unpins, then closes · Alt+↑ selects the
 * pinned element's parent · Alt+Enter pins the focused element.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { InspectorOverlay } from './InspectorOverlay';
import { InspectorToolbar } from './InspectorToolbar';
import type { Tool, ToolSet } from './report';
import { SpecPanel } from './SpecPanel';
import { useDraggable, type Size } from './useDraggable';
import { useInspectTarget } from './useInspectTarget';
import './Inspector.css';

/** Height of the bar and size of the collapsed FAB, px. Shared with the CSS. */
const BAR_SIZE = 40;
const PANEL_WIDTH = 320;
const PANEL_GAP = 8;
const SCREEN_MARGIN = 16;

const ALL_TOOLS: ToolSet = { type: true, padding: true, gap: true };

/**
 * Bottom-right, left of Agentation's dev toolbar, and clear of the sidebar's
 * profile button that bottom-left would cover. It expands leftward from there.
 */
const AGENTATION_CLEARANCE = 72;
const defaultPosition = (viewport: Size) => ({
  x: viewport.width - BAR_SIZE - SCREEN_MARGIN - AGENTATION_CLEARANCE,
  y: viewport.height - BAR_SIZE - SCREEN_MARGIN,
});

/**
 * Presses on the inspector's own UI must not reach the app's "outside click"
 * listeners (Menu, useDismiss…), or opening Inspect mode would close the very
 * popover you wanted to inspect. The portal sits under <body>, so stopping
 * here keeps the event from `document`, where those listeners live.
 */
const keepFromApp = (e: SyntheticEvent) => e.stopPropagation();

/** Pressing the bar keeps focus where it was, so focus-driven popovers stay open. */
const keepAppFocus = (e: ReactMouseEvent) => e.preventDefault();

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches('input, textarea, select'))
  );
}

/** Keeps the panel on screen: above or below the bar, shifted sideways if needed. */
function panelPlacement(x: number, y: number): CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(PANEL_WIDTH, vw - SCREEN_MARGIN * 2);
  const left = Math.max(SCREEN_MARGIN - x, Math.min(0, vw - SCREEN_MARGIN - width - x));
  const spaceBelow = vh - (y + BAR_SIZE) - PANEL_GAP - SCREEN_MARGIN;
  const spaceAbove = y - PANEL_GAP - SCREEN_MARGIN;
  return spaceBelow >= spaceAbove
    ? { left, width, top: BAR_SIZE + PANEL_GAP, maxHeight: spaceBelow }
    : { left, width, bottom: BAR_SIZE + PANEL_GAP, maxHeight: spaceAbove };
}

export function Inspector() {
  const [expanded, setExpanded] = useState(false);
  // Stays as the reviewer left it for the rest of the session.
  const [tools, setTools] = useState<ToolSet>(ALL_TOOLS);
  const inspecting = expanded && (tools.type || tools.padding || tools.gap);
  const { hovered, pinned, canSelectParent, unpin, selectParent, pinFocused } = useInspectTarget(inspecting);

  const dockRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLButtonElement>(null);
  const { position, handleProps, onClickCapture } = useDraggable(dockRef, defaultPosition);

  // Before the panel or the tool buttons unmount: if keyboard focus is in
  // them, move it to the always-mounted ruler button instead of <body>.
  const rescueFocus = useCallback(() => {
    if (dockRef.current?.contains(document.activeElement)) mainRef.current?.focus();
  }, []);

  const collapse = useCallback(() => {
    rescueFocus();
    setExpanded(false);
  }, [rescueFocus]);

  const unpinKeepingFocus = useCallback(() => {
    rescueFocus();
    return unpin();
  }, [rescueFocus, unpin]);

  const toggleExpanded = useCallback(() => {
    if (expanded) collapse();
    else setExpanded(true);
  }, [expanded, collapse]);

  const toggleTool = useCallback((tool: Tool) => setTools((t) => ({ ...t, [tool]: !t[tool] })), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const noCtrl = !e.ctrlKey && !e.metaKey;
      let handled = false;

      // Ctrl/Cmd+Shift+I opens DevTools — never take it.
      if (e.shiftKey && noCtrl && !e.altKey && e.key.toLowerCase() === 'i' && !isEditable(e.target)) {
        toggleExpanded();
        handled = true;
      } else if (expanded && e.key === 'Escape') {
        if (!unpinKeepingFocus()) collapse();
        handled = true;
      } else if (inspecting && e.altKey && noCtrl && e.key === 'ArrowUp') {
        handled = selectParent();
      } else if (inspecting && e.altKey && noCtrl && e.key === 'Enter') {
        handled = pinFocused();
      }

      // Only when Inspect mode acted, so e.g. Esc doesn't also close an open Modal.
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [expanded, inspecting, toggleExpanded, collapse, unpinKeepingFocus, selectParent, pinFocused]);

  return createPortal(
    <>
      {inspecting && <InspectorOverlay hovered={hovered} pinned={pinned} tools={tools} />}
      <div
        ref={dockRef}
        className="lc-inspector"
        data-inspector-ui=""
        style={{ left: position.x, top: position.y, '--lc-inspector-bar': `${BAR_SIZE}px` } as CSSProperties}
        onPointerDown={keepFromApp}
        onMouseDown={keepFromApp}
        onClick={keepFromApp}
      >
        {/* Only the bar drags, so values in the panel stay selectable. */}
        <div
          className="lc-inspector__handle"
          onClickCapture={onClickCapture}
          onMouseDown={keepAppFocus}
          {...handleProps}
        >
          <InspectorToolbar
            expanded={expanded}
            tools={tools}
            mainRef={mainRef}
            onToggleExpanded={toggleExpanded}
            onToggleTool={toggleTool}
            onClose={collapse}
          />
        </div>
        {inspecting && pinned && (
          <div className="lc-inspector__panel-slot" style={panelPlacement(position.x, position.y)}>
            <SpecPanel
              spec={pinned}
              tools={tools}
              canSelectParent={canSelectParent}
              onSelectParent={selectParent}
              onUnpin={unpinKeepingFocus}
            />
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
