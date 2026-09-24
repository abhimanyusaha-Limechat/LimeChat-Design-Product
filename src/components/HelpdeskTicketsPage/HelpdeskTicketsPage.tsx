/**
 * HelpdeskTicketsPage — LimeChat design system (Figma node 9530:21891,
 * the Tickets section "Content Area" of the Helpdesk product).
 *
 * A layout: a resizable ticket list column and a resizable details column
 * (drag the handle on each one's inner edge, clamped between their
 * `min`/`max` width props), with a flexible conversation column in between
 * (top bar + scrollable message list + composer). Each region is a slot —
 * compose it from this design system's own `TicketsSection` +
 * `TicketListItem`, `ConversationTopBar`, `MessageBubble`, `TicketComposer`,
 * and `TicketDetailsPanel`.
 *
 *   <HelpdeskTicketsPage
 *     ticketsSection={<TicketsSection ...>{tickets.map(...)}</TicketsSection>}
 *     conversationTopBar={<ConversationTopBar name="Ramesh" ... />}
 *     conversation={<>{messages.map((m) => <MessageBubble key={m.id} {...m} />)}</>}
 *     composer={<TicketComposer value={draft} onChange={setDraft} onSend={send} />}
 *     detailsPanel={<TicketDetailsPanel ... />}
 *   />
 */
import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Virtuoso, type ItemProps, type VirtuosoHandle } from 'react-virtuoso';
import './HelpdeskTicketsPage.css';
import '../scrollbar-hidden.css';

export interface ConversationItem {
  id: string;
  node: ReactNode;
}

/**
 * Virtuoso wraps every item in its own plain `<div>`, breaking two things a real message
 * bubble (`MessageBubble`) relies on when it's a direct child of a flex column: its
 * `align-self` (left/right per side) has no effect outside a flex container, and its
 * `margin-top` spacing can collapse through a plain block wrapper. Rendering that wrapper
 * as a flex column itself fixes both, matching the non-virtualized conversation's layout.
 */
function VirtuosoItem({ item: _item, ...rest }: ItemProps<ConversationItem>) {
  return (
    <div {...rest} style={{ ...rest.style, display: 'flex', flexDirection: 'column', padding: '0 12px' }} />
  );
}

/**
 * A column width draggable via a handle on one edge, clamped to [min, max].
 * `direction: 1` grows when dragging right, `-1` grows when dragging left.
 *
 * Uses window-level `mousemove`/`mouseup` listeners (rather than Pointer
 * Capture) so the drag keeps tracking even if the cursor briefly leaves the
 * thin handle mid-drag.
 */
function useResizableWidth(defaultWidth: number, min: number, max: number, direction: 1 | -1) {
  const [width, setWidth] = useState(defaultWidth);
  const [dragging, setDragging] = useState(false);
  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;
      const delta = (e.clientX - drag.startX) * direction;
      setWidth(Math.min(max, Math.max(min, drag.startWidth + delta)));
    };
    const onUp = () => {
      dragStateRef.current = null;
      setDragging(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [dragging, direction, min, max]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      dragStateRef.current = { startX: e.clientX, startWidth: width };
      setDragging(true);
    },
    [width],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 32 : 8;
      const grow = direction === 1 ? 1 : -1;
      if (e.key === 'ArrowLeft') {
        setWidth((w) => Math.min(max, Math.max(min, w - step * grow)));
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        setWidth((w) => Math.min(max, Math.max(min, w + step * grow)));
        e.preventDefault();
      } else if (e.key === 'Home') {
        setWidth(min);
        e.preventDefault();
      } else if (e.key === 'End') {
        setWidth(max);
        e.preventDefault();
      }
    },
    [direction, min, max],
  );

  return { width, dragging, onMouseDown, onKeyDown };
}

export interface HelpdeskTicketsPageProps extends HTMLAttributes<HTMLDivElement> {
  ticketsSection: ReactNode;
  conversationTopBar?: ReactNode;
  conversation?: ReactNode;
  /**
   * Windowed alternative to `conversation` for threads that can grow long (e.g. a live
   * ticket's message history) — pass stable-keyed items instead of raw children and only
   * the visible rows mount, instead of the whole thread at once. Takes priority over
   * `conversation` when both are given. Bottom-anchored like chat: stays pinned to the
   * newest item and jumps there on ticket switch (keyed internally by the item list).
   */
  conversationItems?: ConversationItem[];
  /** Remounts the virtualized list (jumping fresh to the bottom) when it changes — pass the
   * thread's own id (e.g. the ticket id) so switching threads doesn't carry over scroll
   * position from the previous one. Only used with `conversationItems`. */
  conversationKey?: string;
  composer?: ReactNode;
  detailsPanel?: ReactNode;
  /** Initial width of the ticket list column, in px. Default `336`. */
  defaultListWidth?: number;
  /** Minimum width the list column can be dragged to, in px. Default `280`. */
  minListWidth?: number;
  /** Maximum width the list column can be dragged to, in px. Default `520`. */
  maxListWidth?: number;
  /** Initial width of the details column, in px. Default `372`. */
  defaultDetailsWidth?: number;
  /** Minimum width the details column can be dragged to, in px. Default `280`. */
  minDetailsWidth?: number;
  /** Maximum width the details column can be dragged to, in px. Default `520`. */
  maxDetailsWidth?: number;
  /** Vertical alignment of `conversation`'s children — `'end'` (chat, growing upward from
   * the composer) or `'start'` (email threads, read top-down). Default `'end'`. */
  conversationAlign?: 'start' | 'end';
}

export const HelpdeskTicketsPage = forwardRef<HTMLDivElement, HelpdeskTicketsPageProps>(function HelpdeskTicketsPage(
  {
    ticketsSection,
    conversationTopBar,
    conversation,
    conversationItems,
    conversationKey,
    composer,
    detailsPanel,
    defaultListWidth = 336,
    minListWidth = 280,
    maxListWidth = 520,
    defaultDetailsWidth = 372,
    minDetailsWidth = 280,
    maxDetailsWidth = 520,
    conversationAlign = 'end',
    className,
    ...rest
  },
  ref,
) {
  const list = useResizableWidth(defaultListWidth, minListWidth, maxListWidth, 1);
  const details = useResizableWidth(defaultDetailsWidth, minDetailsWidth, maxDetailsWidth, -1);

  const conversationRef = useRef<HTMLDivElement>(null);
  const messageCount = Children.count(conversation);
  useEffect(() => {
    if (conversationItems) return; // the virtualized list below handles its own scroll position
    const el = conversationRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    // Re-run when the message count changes (new message) or conversationKey changes
    // (ticket switch, even to a ticket with the same message count) — not on every
    // parent re-render (e.g. composer keystrokes), which would yank the scroll
    // position away from an agent reading earlier history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageCount, conversationKey]);

  // Kept mounted across thread switches (no `key` remount, which forced a full re-measure
  // and flashed the list blank) — jump straight to the bottom on `conversationKey` change
  // instead, and let `followOutput` below handle new messages arriving in the same thread.
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  useLayoutEffect(() => {
    if (!conversationItems) return;
    virtuosoRef.current?.scrollToIndex({ index: conversationItems.length - 1, align: 'end' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationKey]);

  return (
    <div {...rest} ref={ref} className={`lc-hd-tickets${className ? ` ${className}` : ''}`}>
      <div className="lc-hd-tickets__list" style={{ width: list.width }}>
        {ticketsSection}
      </div>

      <div
        className="lc-hd-tickets__resize-handle"
        data-dragging={list.dragging || undefined}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize ticket list"
        aria-valuenow={list.width}
        aria-valuemin={minListWidth}
        aria-valuemax={maxListWidth}
        tabIndex={0}
        onMouseDown={list.onMouseDown}
        onKeyDown={list.onKeyDown}
      />

      <div className="lc-hd-tickets__main">
        {conversationTopBar && <div className="lc-hd-tickets__topbar">{conversationTopBar}</div>}
        {conversationItems ? (
          <Virtuoso
            ref={virtuosoRef}
            className="lc-hd-tickets__conversation lc-hd-tickets__conversation--virtual lc-scrollbar-hidden"
            style={{ paddingTop: 8, paddingBottom: 8 }}
            data={conversationItems}
            computeItemKey={(_, item) => item.id}
            itemContent={(_, item) => item.node}
            components={{ Item: VirtuosoItem }}
            initialTopMostItemIndex={conversationItems.length - 1}
            followOutput="smooth"
            alignToBottom
          />
        ) : (
          <div
            className="lc-hd-tickets__conversation lc-scrollbar-hidden"
            data-align={conversationAlign}
            ref={conversationRef}
          >
            <div className="lc-hd-tickets__conversation-inner">{conversation}</div>
          </div>
        )}
        {composer && <div className="lc-hd-tickets__composer">{composer}</div>}
      </div>

      {detailsPanel && (
        <>
          <div
            className="lc-hd-tickets__resize-handle"
            data-dragging={details.dragging || undefined}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize details panel"
            aria-valuenow={details.width}
            aria-valuemin={minDetailsWidth}
            aria-valuemax={maxDetailsWidth}
            tabIndex={0}
            onMouseDown={details.onMouseDown}
            onKeyDown={details.onKeyDown}
          />
          <div className="lc-hd-tickets__details" style={{ width: details.width }}>
            {detailsPanel}
          </div>
        </>
      )}
    </div>
  );
});

export default HelpdeskTicketsPage;
