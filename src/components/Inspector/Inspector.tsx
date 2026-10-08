/**
 * Inspect mode — a draggable FAB that expands into Type / Color / Padding / Gap tools.
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
import { resetAll } from './edits';
import { InspectorOverlay } from './InspectorOverlay';
import { InspectorToolbar } from './InspectorToolbar';
import { DEFAULT_TOOLS, describePin, type Tool, type ToolSet } from './report';
import { SpecPanel } from './SpecPanel';
import { useDraggable, type Size } from './useDraggable';
import { useInspectTarget } from './useInspectTarget';
import './Inspector.css';

/** Height of the bar, and size of the FAB and the ruler button, px. Shared with the CSS. */
const BAR_SIZE = 44;
const PANEL_WIDTH = 320;
const PANEL_GAP = 8;
const SCREEN_MARGIN = 16;
/** Room a one-line tooltip needs above the bar: 32px bubble + 12px gap and arrow. */
const TOOLTIP_CLEARANCE = 44;

/** Announced on opening and after unpinning: how to pin without a pointer. */
const OPEN_ANNOUNCEMENT = 'Inspect mode on. Press Alt+Enter to pin the focused element.';

/**
 * Bottom-right, left of Agentation's dev toolbar (dev only), and clear of the
 * sidebar's profile button that bottom-left would cover. It expands leftward.
 */
const AGENTATION_CLEARANCE = import.meta.env.DEV ? 72 : 0;
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

/**
 * Below the bar in the top half of the screen, so they don't clip off the top —
 * unless the panel is open there (it would cover them) and there's room above.
 */
function tooltipPlacement(y: number, panelOpen: boolean): 'top' | 'bottom' {
  if (y + BAR_SIZE / 2 >= window.innerHeight / 2) return 'top';
  return panelOpen && y >= TOOLTIP_CLEARANCE ? 'top' : 'bottom';
}

export function Inspector() {
  // `expanded`: the tools are mounted. `motion` picks the CSS animation; `null`
  // (keyboard) switches instantly. While it is 'close' the bar already acts
  // collapsed (`closing`), it just hasn't finished leaving.
  const [expanded, setExpanded] = useState(false);
  const [motion, setMotion] = useState<'open' | 'close' | null>(null);
  const closing = motion === 'close';
  // Decided when the bar opens and kept until it opens again, so closing
  // retraces the same edge and the ruler button never moves.
  const [opensLeft, setOpensLeft] = useState(false);
  // Stays as the reviewer left it for the rest of the session.
  const [tools, setTools] = useState<ToolSet>(DEFAULT_TOOLS);
  // Inspecting doesn't depend on the tools: with all of them off you still
  // hover and pin, and see the element's outline and size.
  const inspecting = expanded && !closing;
  const { hovered, pinned, canSelectParent, pinId, hoveredByFocus, unpin, selectParent, pinFocused, editPinned, resetPinned } =
    useInspectTarget(inspecting);

  const dockRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLButtonElement>(null);
  const { position, dragging, handleProps, onClickCapture } = useDraggable(dockRef, defaultPosition, {
    anchorRight: opensLeft,
    layoutKey: expanded,
  });

  // Before the panel or the tool buttons unmount: if keyboard focus is in
  // them, move it to the always-mounted ruler button instead of <body>.
  const rescueFocus = useCallback(() => {
    if (dockRef.current?.contains(document.activeElement)) mainRef.current?.focus();
  }, []);

  /** Clicks animate; keyboard shortcuts (used far more often) switch instantly. */
  const expand = useCallback(
    (animate: boolean) => {
      // Re-opened mid-close: keep the side it was opening to.
      if (!closing) setOpensLeft(position.x + BAR_SIZE / 2 > window.innerWidth / 2);
      setExpanded(true);
      setMotion(animate ? 'open' : null);
    },
    [closing, position.x],
  );

  const finishClose = useCallback(() => {
    setExpanded(false);
    setMotion(null);
  }, []);

  const collapse = useCallback(
    (animate: boolean) => {
      rescueFocus();
      // Where animations are missing (jsdom) none would end, so close at once.
      if (!animate || typeof document.body.animate !== 'function') return finishClose();
      setMotion('close');
    },
    [rescueFocus, finishClose],
  );

  // The unmount waits for the close animation; its last frame holds until then.
  const onMotionEnd = useCallback(() => {
    if (closing) finishClose();
  }, [closing, finishClose]);

  const unpinKeepingFocus = useCallback(() => {
    rescueFocus();
    return unpin();
  }, [rescueFocus, unpin]);

  // Live-preview edits are undone when Inspect closes.
  useEffect(() => (inspecting ? resetAll : undefined), [inspecting]);

  const toggleTool = useCallback((tool: Tool) => setTools((t) => ({ ...t, [tool]: !t[tool] })), []);
  // Stable, so the memoized toolbar skips the renders that hovering causes.
  const toggleExpanded = useCallback(
    () => (inspecting ? collapse(true) : expand(true)),
    [inspecting, collapse, expand],
  );
  const close = useCallback(() => collapse(true), [collapse]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const noCtrl = !e.ctrlKey && !e.metaKey;
      let handled = false;

      // Ctrl/Cmd+Shift+I opens DevTools — never take it.
      if (e.shiftKey && noCtrl && !e.altKey && e.key.toLowerCase() === 'i' && !isEditable(e.target)) {
        if (inspecting) collapse(false);
        else expand(false);
        handled = true;
      } else if (inspecting && e.key === 'Escape') {
        if (!unpinKeepingFocus()) collapse(false);
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
  }, [inspecting, expand, collapse, unpinKeepingFocus, selectParent, pinFocused]);

  return createPortal(
    <>
      {/* Hidden mid-drag: you're moving the tool, and hover can't update while the
          bar slides under a still pointer, so a stale label would linger. */}
      {inspecting && !dragging && (
        <InspectorOverlay hovered={hovered} pinned={pinned} tools={tools} hoveredByFocus={hoveredByFocus} />
      )}
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
          data-dragging={dragging || undefined}
          onClickCapture={onClickCapture}
          onMouseDown={keepAppFocus}
          {...handleProps}
        >
          <InspectorToolbar
            expanded={expanded}
            closing={closing}
            motion={motion}
            dragging={dragging}
            opensLeft={opensLeft}
            tooltipPosition={tooltipPlacement(position.y, Boolean(inspecting && pinned))}
            tools={tools}
            mainRef={mainRef}
            onToggleExpanded={toggleExpanded}
            onToggleTool={toggleTool}
            onClose={close}
            onMotionEnd={onMotionEnd}
          />
        </div>
        {/* Always mounted, so screen readers are listening before it changes. Keyed
            by the pin, so re-pinning an element that reads the same is announced. */}
        <div className="lc-inspector__announce" role="status">
          <span key={pinId}>{inspecting ? (pinned ? describePin(pinned, tools) : OPEN_ANNOUNCEMENT) : ''}</span>
        </div>
        {inspecting && pinned && (
          <div className="lc-inspector__panel-slot" style={panelPlacement(position.x, position.y)}>
            <SpecPanel
              spec={pinned}
              tools={tools}
              canSelectParent={canSelectParent}
              onSelectParent={selectParent}
              onUnpin={unpinKeepingFocus}
              onEdit={editPinned}
              onResetEdits={resetPinned}
            />
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
