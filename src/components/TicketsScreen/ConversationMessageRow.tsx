import { Fragment, memo, useMemo } from 'react';
import { MessageBubble, MessageDateDivider, type ReactionData } from '../MessageBubble';
import { type MenuItemData } from '../Menu';
import { type ConversationEntry } from '../../data/ticketsDemo';

export type MessageMenuAction = 'reply' | 'forward' | 'copy' | 'delete';

const DATE_CHIP_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
/** e.g. '2026-09-20' -> 'September 20, 2026'. */
const formatDateChip = (isoDate: string) => DATE_CHIP_FORMATTER.format(new Date(`${isoDate}T00:00:00`));

/**
 * One conversation row (date divider + bubble), memoized so reacting to one message
 * doesn't re-render every other message in the thread — `onReact` takes the reaction key
 * so the callback identity stays stable across renders instead of being re-created per row.
 */
export const ConversationMessageRow = memo(function ConversationMessageRow({
  entry,
  isFirst,
  showDateDivider,
  groupedWithPrevious,
  avatarInitial,
  reactionKey,
  reaction,
  onReact,
  onMenuAction,
}: {
  entry: ConversationEntry;
  isFirst: boolean;
  showDateDivider: boolean;
  /** Same side as the previous message, with no date divider between them — sits closer to
   * it than a sender change would. Computed here rather than left to `MessageBubble`'s own
   * CSS (which keys off DOM adjacency) because Virtuoso renders each row in its own wrapper,
   * so consecutive bubbles are no longer literal DOM siblings. */
  groupedWithPrevious: boolean;
  avatarInitial: string;
  reactionKey: string;
  reaction?: ReactionData;
  onReact: (reactionKey: string, emoji: string) => void;
  onMenuAction: (action: MessageMenuAction, entry: ConversationEntry) => void;
}) {
  const marginTop = isFirst || showDateDivider ? 0 : groupedWithPrevious ? 3 : 14;
  // Built here (not passed down as a prop) so its array identity only changes when `entry`
  // or `onMenuAction` actually change — keeping it a parent-supplied prop would hand this
  // memoized row a fresh array on every render, defeating the memoization.
  const menuItems: MenuItemData[] = useMemo(
    () => [
      { key: 'reply', label: 'Reply', onClick: () => onMenuAction('reply', entry) },
      { key: 'forward', label: 'Forward', onClick: () => onMenuAction('forward', entry) },
      { key: 'copy', label: 'Copy text', onClick: () => onMenuAction('copy', entry) },
      { key: 'delete', label: 'Delete', danger: true, onClick: () => onMenuAction('delete', entry) },
    ],
    [entry, onMenuAction],
  );
  return (
    <Fragment>
      {showDateDivider && (
        // The divider is always the *first* DOM child of its own Virtuoso item wrapper (even
        // when it isn't the first divider in the conversation), so `.lc-message-bubble__date-
        // divider:first-child`'s zero margin-top fires unconditionally — override it explicitly
        // for every divider after the very first message.
        <MessageDateDivider label={formatDateChip(entry.date)} style={{ marginTop: isFirst ? 0 : 18 }} />
      )}
      <MessageBubble
        side={entry.side}
        time={entry.time}
        status="read"
        variant={entry.quote ? 'quote' : 'text'}
        quote={entry.quote}
        avatar={entry.side === 'agent'}
        avatarInitial={avatarInitial}
        reaction={reaction}
        onReact={(emoji) => onReact(reactionKey, emoji)}
        menuItems={menuItems}
        style={{ marginTop }}
      >
        {entry.text}
      </MessageBubble>
    </Fragment>
  );
});
