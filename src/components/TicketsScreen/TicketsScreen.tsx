/**
 * TicketsScreen — Helpdesk → Tickets: the ticket list, the open ticket's conversation and
 * composer, and its details panel. Which ticket is open lives in the URL (`?ticket=`); what an
 * agent does on it is the Ticket session (see GLOSSARY.md), which starts fresh when the ticket
 * changes. The details panel tab is the agent's, not the ticket's, so it survives the switch.
 */
import { useCallback, useState } from 'react';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { HelpdeskTicketsPage } from '../HelpdeskTicketsPage';
import { TicketsSection } from '../TicketsSection';
import { TicketListItem } from '../TicketListItem';
import { TicketsBulkModifyModal } from '../TicketsBulkModifyModal';
import { ConversationTopBar } from '../ConversationTopBar';
import { MessageBubble, type ReactionData } from '../MessageBubble';
import { TicketComposer, type TicketComposerMode } from '../TicketComposer';
import { EmailMessage, EmailComposerBar, EmailForwardComposer, type EmailRecipientField } from '../EmailMessage';
import { TicketDetailsPanel } from '../TicketDetailsPanel';
import { ConversationMessageRow, type MessageMenuAction } from './ConversationMessageRow';
import { INBOX_NAMES } from '../../data/settingsDemo';
import {
  CONVERSATIONS,
  EMAIL_THREADS,
  SHOWCASE_MESSAGES,
  TICKETS,
  TICKET_DETAIL_SECTIONS,
  type ConversationEntry,
  type TicketRowData,
} from '../../data/ticketsDemo';

/** Whether `ticket` matches `search` by customer name, message or ticket number. An empty search matches all. */
export function ticketMatches(ticket: TicketRowData, search: string): boolean {
  const q = search.trim().toLowerCase();
  return q === '' || [ticket.user, ticket.message, ticket.ticketId].some((field) => field.toLowerCase().includes(q));
}

const LIST_TABS = [
  { id: 'mine', label: 'Mine' },
  { id: 'queued', label: 'Queued' },
  { id: 'all', label: 'All' },
];
const DETAILS_TABS = ['Overview', 'Orders', 'Products', 'Cart'];
/** The same names the list rows show, so the row and the details panel agree. */
const AGENT_OPTIONS = ['Unassigned', ...new Set(TICKETS.flatMap((t) => t.assignee ?? []))];
const TEAM_OPTIONS = ['Marketing', 'Support', 'Sales'];

type EmailAction = 'reply' | 'forward';
type Recipients = Record<EmailRecipientField, string[]>;

interface TicketSession {
  ticketId: string;
  composerMode: TicketComposerMode;
  draft: string;
  emailAction: EmailAction | null;
  recipients: Record<EmailAction, Recipients>;
  resolveStatus: string;
  agent: string;
  team: string;
  /** Keyed by message id. */
  reactions: Record<string, ReactionData>;
}

/** The Commerce session is the rest of the Ticket session; TicketDetailsPanel keys it by ticket. */
const freshSession = (ticket: TicketRowData): TicketSession => ({
  ticketId: ticket.id,
  composerMode: 'reply',
  draft: '',
  emailAction: null,
  recipients: {
    reply: { to: [`${ticket.user.toLowerCase().replace(' ', '.')}@example.com`], cc: ['support@limechat.io'], bcc: [] },
    forward: { to: [], cc: ['info@mywebsite.com'], bcc: ['hello@samplemail.com'] },
  },
  resolveStatus: 'Resolve',
  agent: ticket.assignee ?? 'Unassigned',
  team: 'Marketing',
  reactions: {},
});

const onMessageMenuAction = (action: MessageMenuAction, entry: ConversationEntry) => {
  if (action === 'copy') {
    navigator.clipboard?.writeText(entry.text);
    return;
  }
  alert(`${action[0].toUpperCase()}${action.slice(1)} message: "${entry.text}"`);
};

export function TicketsScreen() {
  const { ticketId, openTicket } = useAppNavigation();
  const ticket = TICKETS.find((t) => t.id === ticketId) ?? TICKETS[0];

  // List state.
  const [listTab, setListTab] = useState('queued');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Newly created');
  const [status, setStatus] = useState('Open');
  const [selectedInboxes, setSelectedInboxes] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkModifyOpen, setBulkModifyOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState(DETAILS_TABS[0]);

  // Selection only ever covers what the search shows.
  const visible = TICKETS.filter((t) => ticketMatches(t, search));
  const checkedVisible = visible.filter((t) => checkedIds.has(t.id));
  const setCheckedAndExit = (next: Set<string>) => {
    setCheckedIds(next);
    if (next.size === 0) setSelectMode(false);
  };
  const checkAllVisible = () => setCheckedIds(new Set(visible.map((t) => t.id)));

  // The Ticket session, replaced during render when the ticket changes (React's "adjusting
  // state when a prop changes"), so nothing from the previous ticket is ever painted.
  const [stored, setSession] = useState(() => freshSession(ticket));
  const session = stored.ticketId === ticket.id ? stored : freshSession(ticket);
  if (session !== stored) setSession(session);
  const patch = (changes: Partial<TicketSession>) => setSession((s) => ({ ...s, ...changes }));
  const handleReact = useCallback(
    (messageId: string, emoji: string) =>
      setSession((s) => {
        const reactions = { ...s.reactions };
        if (s.reactions[messageId]?.emoji === emoji) delete reactions[messageId];
        else reactions[messageId] = { emoji };
        return { ...s, reactions };
      }),
    [],
  );
  const editRecipients = (action: EmailAction, field: EmailRecipientField, edit: (list: string[]) => string[]) =>
    setSession((s) => ({
      ...s,
      recipients: { ...s.recipients, [action]: { ...s.recipients[action], [field]: edit(s.recipients[action][field]) } },
    }));
  const closeEmailComposer = () => patch({ draft: '', emailAction: null });

  const isShowcase = ticket.id === 't-showcase';
  const isEmail = ticket.channel === 'email';
  const { emailAction } = session;
  const messages = CONVERSATIONS[ticket.id] ?? [];

  return (
    <>
      <HelpdeskTicketsPage
        conversationAlign={isEmail ? 'start' : 'end'}
        ticketsSection={
          <TicketsSection
            status={status}
            onStatusChange={setStatus}
            searchValue={search}
            onSearchChange={setSearch}
            onFilterClick={() => alert('Filter tickets')}
            onTagsClick={() => alert('Filter by tags')}
            dateRangeLabel="Last 7 days"
            onDateRangeClick={() => alert('Change date range')}
            inboxLabel={
              selectedInboxes.length === 0
                ? 'All inboxes'
                : selectedInboxes.length === 1
                  ? selectedInboxes[0]
                  : `${selectedInboxes.length} inboxes`
            }
            inboxOptions={INBOX_NAMES}
            selectedInboxes={selectedInboxes}
            onSelectedInboxesChange={setSelectedInboxes}
            tabs={LIST_TABS}
            activeTab={listTab}
            onTabChange={setListTab}
            sortLabel={sort}
            onSortChange={setSort}
            onLoadMore={() => alert('Load more tickets')}
            selectedCount={selectMode ? checkedVisible.length : undefined}
            allSelected={visible.length > 0 && checkedVisible.length === visible.length}
            onSelectAllChange={(checked) => (checked ? checkAllVisible() : setCheckedAndExit(new Set()))}
            onModify={() => setBulkModifyOpen(true)}
          >
            {visible.map((t) => (
              <TicketListItem
                key={t.id}
                data-anchor="ticket-row"
                data-anchor-key={t.id}
                channel={t.channel}
                user={t.user}
                avatars={t.avatarCount ? Array.from({ length: t.avatarCount }, () => ({})) : undefined}
                isNew={t.isNew}
                timestamp={t.timestamp}
                message={t.message}
                assignee={listTab === 'mine' ? undefined : t.assignee}
                unreadCount={t.unreadCount}
                selected={ticket.id === t.id}
                showCheckbox={selectMode}
                checked={checkedIds.has(t.id)}
                onCheckedChange={(next) => {
                  const nextIds = new Set(checkedIds);
                  if (next) nextIds.add(t.id);
                  else nextIds.delete(t.id);
                  setCheckedAndExit(nextIds);
                }}
                onSelect={() => setSelectMode(true)}
                onSelectAll={() => {
                  setSelectMode(true);
                  checkAllVisible();
                }}
                onMarkAsStarred={() => alert(`Mark as starred: ${t.user}`)}
                onClick={() => openTicket(t.id)}
              />
            ))}
          </TicketsSection>
        }
        conversationTopBar={
          <ConversationTopBar
            name={ticket.user}
            channel={ticket.channel}
            isNew={ticket.isNew}
            phone={ticket.phone}
            inboxName="Inbox name"
            callAvailable={ticket.channel === 'whatsapp'}
            onCall={() => alert('Start voice call')}
            onResolve={() => alert('Resolve ticket')}
            resolveLabel={session.resolveStatus}
            onResolveStatusChange={(resolveStatus) => patch({ resolveStatus })}
            onStarTicket={() => alert('Star mark ticket')}
            onMuteTicket={() => alert('Mute ticket notifications')}
          />
        }
        conversation={
          isShowcase
            ? SHOWCASE_MESSAGES.map(({ id, ...msg }) => <MessageBubble key={id} {...msg} />)
            : isEmail
              ? (EMAIL_THREADS[ticket.id] ?? []).map((email) => (
                  <EmailMessage
                    key={email.id}
                    senderName={email.senderName}
                    senderEmail={email.senderEmail}
                    date={email.date}
                    badgeLabel={email.badgeLabel}
                    preview={email.preview}
                    body={email.body}
                    defaultExpanded={email.defaultExpanded}
                    onReply={() => alert(`Reply to: ${email.senderName}`)}
                    onReplyToAll={() => alert(`Reply to all: ${email.senderName}`)}
                    onForward={() => alert(`Forward: ${email.senderName}`)}
                  />
                ))
              : undefined
        }
        // Ticket message threads can grow long, so this branch alone renders through
        // `conversationItems` (windowed/virtualized) instead of `conversation` — the
        // showcase and email branches above stay small and fixed, so they don't need it.
        conversationItems={
          !isShowcase && !isEmail
            ? messages.map((entry, i) => {
                const showDateDivider = entry.date !== messages[i - 1]?.date;
                return {
                  id: entry.id,
                  node: (
                    <ConversationMessageRow
                      entry={entry}
                      isFirst={i === 0}
                      showDateDivider={showDateDivider}
                      groupedWithPrevious={!showDateDivider && entry.side === messages[i - 1]?.side}
                      avatarInitial={ticket.assignee?.charAt(0) ?? 'A'}
                      reactionKey={entry.id}
                      reaction={session.reactions[entry.id]}
                      onReact={handleReact}
                      onMenuAction={onMessageMenuAction}
                    />
                  ),
                };
              })
            : undefined
        }
        conversationKey={ticket.id}
        composer={
          !isEmail ? (
            <TicketComposer
              mode={session.composerMode}
              onModeChange={(composerMode) => patch({ composerMode })}
              value={session.draft}
              onChange={(draft) => patch({ draft })}
              onSend={() => patch({ draft: '' })}
              onMic={() => alert('Record voice note')}
              onEmoji={() => alert('Insert emoji')}
            />
          ) : emailAction ? (
            <EmailForwardComposer
              mode={emailAction}
              {...session.recipients[emailAction]}
              onAddRecipient={(field, email) => editRecipients(emailAction, field, (list) => [...list, email])}
              onRemoveRecipient={(field, email) =>
                editRecipients(emailAction, field, (list) => list.filter((e) => e !== email))
              }
              value={session.draft}
              onChange={(draft) => patch({ draft })}
              onToggleAi={() => alert('Toggle AI assist')}
              onDelete={closeEmailComposer}
              onSend={closeEmailComposer}
            />
          ) : (
            <EmailComposerBar
              onMerge={() => alert('Merge ticket')}
              onNotes={() => alert('Open private notes')}
              onReply={() => patch({ emailAction: 'reply' })}
              onForward={() => patch({ emailAction: 'forward' })}
            />
          )
        }
        detailsPanel={
          <TicketDetailsPanel
            tabs={DETAILS_TABS}
            activeTab={detailsTab}
            onTabChange={setDetailsTab}
            ticketId={ticket.ticketId}
            agent={{ value: session.agent, options: AGENT_OPTIONS, onChange: (agent) => patch({ agent }) }}
            team={{ value: session.team, options: TEAM_OPTIONS, onChange: (team) => patch({ team }) }}
            sections={TICKET_DETAIL_SECTIONS}
          />
        }
      />

      <TicketsBulkModifyModal
        open={bulkModifyOpen}
        onClose={() => setBulkModifyOpen(false)}
        selectedCount={checkedVisible.length}
        onApply={(values) => {
          alert(`Applied changes to ${checkedVisible.length} ticket(s): ${JSON.stringify(values)}`);
          setBulkModifyOpen(false);
          setCheckedAndExit(new Set());
        }}
      />
    </>
  );
}
