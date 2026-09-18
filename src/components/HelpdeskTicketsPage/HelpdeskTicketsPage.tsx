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
import { forwardRef, useCallback, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import './HelpdeskTicketsPage.css';

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

  return { width, dragging, onMouseDown };
}

export interface HelpdeskTicketsPageProps extends HTMLAttributes<HTMLDivElement> {
  ticketsSection: ReactNode;
  conversationTopBar?: ReactNode;
  conversation?: ReactNode;
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
        onMouseDown={list.onMouseDown}
      />

      <div className="lc-hd-tickets__main">
        {conversationTopBar && <div className="lc-hd-tickets__topbar">{conversationTopBar}</div>}
        <div className="lc-hd-tickets__conversation" data-align={conversationAlign}>
          {conversation}
        </div>
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
            onMouseDown={details.onMouseDown}
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
