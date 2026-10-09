/**
 * InboxPanel — the right-hand panel for one inbox: who it is, its collaborators, and the basic
 * actions (Open settings, Reauthorize when needed, Delete).
 *
 * "Add collaborators" swaps the list for a picker of agents not yet on the inbox. Adding and
 * removing happen straight away (no confirm, like the legacy app). It is a docked, non-modal
 * region: Esc or ✕ closes it (Esc in the picker goes back to the list first), focus moves in on
 * open and returns to where it was on close.
 *
 * Not built yet (kept out on purpose): the legacy per-collaborator "only assign manually" flag.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { InboxChannelIcon } from './InboxChannelIcon';
import { InboxIcon } from './icons';
import { STATUS_LABEL, TYPE_LABEL, availableAgents, canReauthorize, filterAgents, initialsOf, type InboxAgent, type InboxRowData } from './inboxes';

export interface InboxPanelProps {
  inbox: InboxRowData;
  /** Every agent that can be added as a collaborator. */
  agents: InboxAgent[];
  onClose: () => void;
  onOpenSettings: () => void;
  onReauthorize: () => void;
  onDelete: () => void;
  onAddMember: (agent: InboxAgent) => void;
  onRemoveMember: (agent: InboxAgent) => void;
}

function PersonRow({ agent, action }: { agent: InboxAgent; action: ReactNode }) {
  return (
    <li className="lc-ibp__person">
      <Avatar size={28} radius="xl" variant="light" aria-hidden="true">
        {initialsOf(agent.name)}
      </Avatar>
      <div className="lc-ibp__person-text">
        <span className="lc-ibp__person-name" title={agent.name}>
          {agent.name}
        </span>
        <span className="lc-ibp__person-meta" title={agent.email}>
          {[agent.email, agent.role].filter(Boolean).join(' · ')}
        </span>
      </div>
      {action}
    </li>
  );
}

/** Collaborator list and the add picker. Keyed by inbox id, so search and picker reset when another inbox opens. */
function Collaborators({ inbox, agents, onAddMember, onRemoveMember }: Pick<InboxPanelProps, 'inbox' | 'agents' | 'onAddMember' | 'onRemoveMember'>) {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const people = adding ? availableAgents(agents, inbox) : inbox.members;
  const shown = filterAgents(people, search);

  const switchMode = (nextAdding: boolean) => {
    setAdding(nextAdding);
    setSearch('');
    setNotice('');
  };

  const onKeyDown = (e: KeyboardEvent) => {
    // Esc in the picker steps back to the list; the panel only closes from the list.
    if (e.key === 'Escape' && adding) {
      e.stopPropagation();
      switchMode(false);
    }
  };

  const remove = (agent: InboxAgent) => {
    onRemoveMember(agent);
    setNotice(`Removed ${agent.name}`);
    // The button that had focus is gone; keep focus inside the list.
    listRef.current?.focus();
  };

  const add = (agent: InboxAgent) => {
    onAddMember(agent);
    setNotice(`Added ${agent.name}`);
    searchRef.current?.focus();
  };

  const emptyText = search.trim() !== '' ? 'No one matches your search.' : adding ? 'Every agent is already on this inbox.' : 'No collaborators yet.';

  return (
    <section className="lc-ibp__section" aria-label="Collaborators" onKeyDown={onKeyDown}>
      <div className="lc-ibp__section-head">
        {adding ? (
          <>
            <Button variant="subtle" color="gray" size="xs" leftSection={<InboxIcon name="chevron-left" />} onClick={() => switchMode(false)}>
              Back
            </Button>
            <h3 className="lc-ibp__heading">Add collaborators</h3>
          </>
        ) : (
          <>
            <h3 className="lc-ibp__heading">
              Collaborators <span className="lc-ibp__count">{inbox.members.length}</span>
            </h3>
            <Button variant="default" size="xs" leftSection={<InboxIcon name="plus" />} onClick={() => switchMode(true)}>
              Add collaborators
            </Button>
          </>
        )}
      </div>

      <div className="lc-ibp__search">
        <InboxIcon name="search" className="lc-ibp__search-icon" />
        <input
          ref={searchRef}
          className="lc-ibp__search-input"
          type="text"
          aria-label={adding ? 'Search agents' : 'Search collaborators'}
          placeholder={adding ? 'Search agents by name or email' : 'Search collaborators'}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </div>

      <p role="status" className="lc-dt__sr-only">
        {notice}
      </p>

      {shown.length === 0 ? (
        <p className="lc-ibp__empty">{emptyText}</p>
      ) : (
        <ul ref={listRef} tabIndex={-1} className="lc-ibp__list" aria-label={adding ? 'Agents you can add' : 'Collaborators on this inbox'}>
          {shown.map((agent) => (
            <PersonRow
              key={agent.id}
              agent={agent}
              action={
                adding ? (
                  <Button variant="default" size="xs" aria-label={`Add ${agent.name}`} onClick={() => add(agent)}>
                    Add
                  </Button>
                ) : (
                  <button type="button" className="lc-ibp__remove" aria-label={`Remove ${agent.name} from this inbox`} onClick={() => remove(agent)}>
                    <InboxIcon name="close" />
                  </button>
                )
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export function InboxPanel({ inbox, onClose, onOpenSettings, onReauthorize, onDelete, ...collab }: InboxPanelProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const attention = inbox.status !== 'connected';

  // Move focus in on open and put it back where it was on close (usually the row that was clicked).
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  return (
    <aside
      ref={panelRef}
      className="lc-ibp"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-anchor="inbox-panel"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <button type="button" className="lc-ibp__close" aria-label="Close panel" onClick={onClose}>
        <InboxIcon name="close" />
      </button>

      <header className="lc-ibp__head">
        <div className="lc-ibp__profile">
          <InboxChannelIcon row={inbox} size="tile" />
          <div className="lc-ibp__id">
            <h2 id={titleId} className="lc-ibp__title" title={inbox.name}>
              {inbox.name}
            </h2>
            <p className="lc-ibp__meta">
              {TYPE_LABEL[inbox.type]}
              <span aria-hidden="true"> · </span>
              <span className="lc-ibp__status" data-status={inbox.status}>
                {attention && <InboxIcon name="alert-triangle" />}
                {STATUS_LABEL[inbox.status]}
              </span>
            </p>
          </div>
        </div>
        <div className="lc-ibp__actions">
          <Button variant="filled" color="primary" size="xs" onClick={onOpenSettings}>
            Open settings
          </Button>
          {canReauthorize(inbox) && (
            <Button variant="default" size="xs" leftSection={<InboxIcon name="refresh" />} onClick={onReauthorize}>
              Reauthorize
            </Button>
          )}
          <Button className="lc-ibp__delete" variant="subtle" color="red" size="xs" onClick={onDelete}>
            Delete inbox
          </Button>
        </div>
      </header>

      <Collaborators key={inbox.id} inbox={inbox} {...collab} />
    </aside>
  );
}
