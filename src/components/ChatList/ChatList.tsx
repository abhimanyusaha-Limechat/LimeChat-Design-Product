/**
 * ChatList — the virtualized message list of a conversation (react-virtuoso).
 * Bottom-anchored like chat: pinned to the newest item, jumps there when `listKey` changes.
 */
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Virtuoso, type ItemProps, type VirtuosoHandle } from 'react-virtuoso';
import './ChatList.css';
import '../scrollbar-hidden.css';

export interface ConversationItem {
  id: string;
  node: ReactNode;
}

export interface ChatListProps {
  items: ConversationItem[];
  /** Jumps fresh to the bottom when it changes (e.g. the ticket id) without remounting the list. */
  listKey?: string;
}

/**
 * Virtuoso wraps every item in its own plain `<div>`, breaking two things a real message
 * bubble (`MessageBubble`) relies on when it's a direct child of a flex column: its
 * `align-self` (left/right per side) has no effect outside a flex container, and its
 * `margin-top` spacing can collapse through a plain block wrapper. Rendering that wrapper
 * as a flex column itself fixes both. The 2px vertical gap is padding on this wrapper (not
 * margin) so Virtuoso measures it as part of the item's height.
 */
function ChatListItem({ item: _item, ...rest }: ItemProps<ConversationItem>) {
  return <div {...rest} className="lc-chat-list__item" />;
}

function ChatListFooter() {
  return <div className="lc-chat-list__footer" />;
}

export function ChatList({ items, listKey }: ChatListProps) {
  // Kept mounted across thread switches (no `key` remount, which forced a full re-measure
  // and flashed the list blank) — jump straight to the bottom on `listKey` change instead,
  // and let `followOutput` handle new messages arriving in the same thread.
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  useLayoutEffect(() => {
    virtuosoRef.current?.scrollToIndex({ index: items.length - 1, align: 'end' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey]);

  return (
    <Virtuoso
      ref={virtuosoRef}
      className="lc-hd-tickets__conversation lc-chat-list lc-scrollbar-hidden"
      data={items}
      computeItemKey={(_, item) => item.id}
      itemContent={(_, item) => item.node}
      components={{ Item: ChatListItem, Footer: ChatListFooter }}
      initialTopMostItemIndex={items.length - 1}
      followOutput="smooth"
      alignToBottom
    />
  );
}

export default ChatList;
