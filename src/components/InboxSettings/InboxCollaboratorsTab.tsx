/**
 * The Collaborators tab of InboxSettings: which agents belong to this inbox. A search box
 * and a role filter narrow both lists; "Collaborators added" can be switched to manual
 * assignment or removed (with an undo), "Available collaborators" can be added, and
 * "Create agent" makes a brand-new account agent.
 */
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { DataTable, DataTableEmpty, DataTableHead, DataTableRow, DataTableSortHeader, useTableSort } from '../DataTable';
import { Icon } from '../icons';
import { NativeSelect } from '../Select';
import { AGENT_ROLES, CreateAgentModal, type NewAgent } from './InboxCreateAgentModal';
import { SectionHeading } from './InboxSettingsSections';

export interface InboxAgent {
  id: string;
  name: string;
  email: string;
  role: string;
  /** The profile is missing details; shown in red with a warning. */
  incompleteProfile?: boolean;
}

/** The agents added to this inbox, by agent id. */
export type InboxCollaborators = Record<string, { onlyAssignManually: boolean }>;

const UNDO_MS = 8000;

/** Same avatar as the Settings → Agents table: 36px, initials pinned to 12px (Avatar scales them by default). */
const AVATAR_STYLE = { '--lc-avatar-font': '12px' } as CSSProperties;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

/** One agent's row in the shared DataTable: name + email, role, then the caller's cells. */
function AgentRow({ agent, children }: { agent: InboxAgent; children: ReactNode }) {
  return (
    <DataTableRow>
      <div role="cell" className="lc-inbs__col lc-inbs__col--name">
        <Avatar size={36} radius="xl" alt={agent.name} className="lc-inbs__avatar" style={AVATAR_STYLE}>
          {initials(agent.name)}
        </Avatar>
        <div className="lc-inbs__agent-text">
          <span className="lc-inbs__agent-name-line">
            <span className="lc-inbs__agent-name" data-incomplete={agent.incompleteProfile || undefined}>{agent.name}</span>
            {agent.incompleteProfile && (
              <span className="lc-inbs__agent-flag">
                <Icon name="alert-triangle" size={14} aria-hidden="true" />
                Incomplete profile
              </span>
            )}
          </span>
          <span className="lc-inbs__agent-email">{agent.email}</span>
        </div>
      </div>
      <div role="cell" className="lc-inbs__col lc-inbs__col--role">{agent.role}</div>
      {children}
    </DataTableRow>
  );
}

type AgentSortKey = 'name' | 'role' | 'assignment';

/**
 * A sortable agent table. Each table keeps its own sort. `assignmentOf` adds a sortable
 * Assignment column.
 */
function AgentTable({ title, agents, total, hint, empty, assignmentOf, children }: {
  title: string;
  agents: InboxAgent[];
  total: number;
  hint?: string;
  empty: string;
  assignmentOf?: (agent: InboxAgent) => number;
  children: (agent: InboxAgent) => ReactNode;
}) {
  const titleId = useId();
  const { sorted, sort, toggle } = useTableSort<InboxAgent, AgentSortKey>(agents, (agent, key) =>
    key === 'name' ? agent.name : key === 'role' ? agent.role : assignmentOf?.(agent),
  );
  const shown = agents.length;
  return (
    <section className="lc-inbs__agent-group" aria-labelledby={titleId}>
      <h3 id={titleId} className="lc-inbs__list-title">
        {title} <span className="lc-inbs__count">{shown === total ? total : `${shown} of ${total}`}</span>
      </h3>
      {hint && <p className="lc-inbs__row-desc lc-inbs__list-hint">{hint}</p>}
      <DataTable aria-label={title} className="lc-inbs__table-shell">
        {shown === 0 ? (
          <DataTableEmpty>{empty}</DataTableEmpty>
        ) : (
          <>
            <DataTableHead>
              <DataTableSortHeader className="lc-inbs__col lc-inbs__col--name lc-inbs__th lc-inbs__th--name" label="Name" sortKey="name" sort={sort} onSort={toggle} />
              <DataTableSortHeader className="lc-inbs__col lc-inbs__col--role lc-inbs__th" label="Role" sortKey="role" sort={sort} onSort={toggle} />
              {/* The other list keeps this column empty so Role and the action line up in both. */}
              {assignmentOf ? (
                <DataTableSortHeader className="lc-inbs__col lc-inbs__col--assign lc-inbs__th" label="Assignment" sortKey="assignment" sort={sort} onSort={toggle} />
              ) : (
                <div role="columnheader" className="lc-inbs__col lc-inbs__col--assign lc-inbs__th" />
              )}
              <div role="columnheader" className="lc-inbs__col lc-inbs__col--action" aria-label="Actions" />
            </DataTableHead>
            {sorted.map(children)}
          </>
        )}
      </DataTable>
    </section>
  );
}

export function CollaboratorsTab({
  agents,
  value,
  onChange,
  onCreateAgent,
}: {
  agents: InboxAgent[];
  value: InboxCollaborators;
  onChange: (next: InboxCollaborators) => void;
  /** Creates the agent on the account and returns its id. */
  onCreateAgent: (agent: Omit<NewAgent, 'addToInbox'>) => string;
}) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [creating, setCreating] = useState(false);
  const [undo, setUndo] = useState<{ agent: InboxAgent; onlyAssignManually: boolean } | null>(null);

  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undo]);

  const needle = query.trim().toLowerCase();
  const filtering = needle !== '' || role !== '';
  const matches = agents.filter(
    (a) =>
      (!needle || `${a.name} ${a.role} ${a.email}`.toLowerCase().includes(needle)) &&
      (!role || a.role === role),
  );
  const inInbox = (a: InboxAgent) => a.id in value;
  const added = matches.filter(inInbox);
  const available = matches.filter((a) => !inInbox(a));

  const remove = (agent: InboxAgent) => {
    setUndo({ agent, onlyAssignManually: value[agent.id].onlyAssignManually });
    onChange(Object.fromEntries(Object.entries(value).filter(([id]) => id !== agent.id)));
  };
  const undoRemove = () => {
    if (!undo) return;
    onChange({ ...value, [undo.agent.id]: { onlyAssignManually: undo.onlyAssignManually } });
    setUndo(null);
  };

  return (
    <section className="lc-inbs__group" aria-label="Agents">
      <SectionHeading title="Agents" description="Add or remove agents from this inbox." />
      <div className="lc-inbs__agent-tools">
        <label className="lc-inbs__search">
          <Icon name="search" size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search agents"
            placeholder="Search by name, role or email"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </label>
        <NativeSelect
          size="sm"
          aria-label="Filter by role"
          wrapperClassName="lc-inbs__role-filter"
          data={[{ value: '', label: 'All roles' }, ...AGENT_ROLES]}
          value={role}
          onChange={(e) => setRole(e.currentTarget.value)}
        />
        <Button variant="outline" size="sm" leftSection={<Icon name="plus" size={16} />} onClick={() => setCreating(true)}>
          Create agent
        </Button>
      </div>
      <AgentTable
        title="Collaborators added"
        agents={added}
        total={agents.filter(inInbox).length}
        assignmentOf={(agent) => Number(value[agent.id].onlyAssignManually)}
        hint="Agents set to “Only assign manually” are skipped by automatic assignment."
        empty={filtering ? 'No added agents match your filters.' : 'No agents added yet. Add one from the list below.'}
      >
        {(agent) => {
          const manual = value[agent.id].onlyAssignManually;
          return (
            <AgentRow key={agent.id} agent={agent}>
              <div role="cell" className="lc-inbs__col lc-inbs__col--assign">
                <button
                  type="button"
                  role="switch"
                  aria-checked={manual}
                  aria-label={`Only assign ${agent.name} manually`}
                  className="lc-inbs__switch-track"
                  onClick={() => onChange({ ...value, [agent.id]: { onlyAssignManually: !manual } })}
                >
                  <span className="lc-inbs__switch-thumb" />
                </button>
                <span className="lc-inbs__agent-switch-text">Only assign manually</span>
              </div>
              <div role="cell" className="lc-inbs__col lc-inbs__col--action">
                <Button variant="outline" color="red" size="xs" aria-label={`Remove ${agent.name}`} onClick={() => remove(agent)}>
                  Remove
                </Button>
              </div>
            </AgentRow>
          );
        }}
      </AgentTable>

      <AgentTable
        title="Available collaborators"
        hint="Agents on your account who aren’t in this inbox yet."
        agents={available}
        total={agents.filter((a) => !inInbox(a)).length}
        empty={filtering ? 'No available agents match your filters.' : 'Every agent is already in this inbox.'}
      >
        {(agent) => (
          <AgentRow key={agent.id} agent={agent}>
            {/* Empty Assignment cell keeps Role and the action in the same columns as the added list. */}
            <div role="cell" className="lc-inbs__col lc-inbs__col--assign" />
            <div role="cell" className="lc-inbs__col lc-inbs__col--action">
              <Button
                variant="outline"
                size="xs"
                aria-label={`Add ${agent.name} to inbox`}
                onClick={() => onChange({ ...value, [agent.id]: { onlyAssignManually: false } })}
              >
                Add to inbox
              </Button>
            </div>
          </AgentRow>
        )}
      </AgentTable>

      {undo && (
        <div className="lc-inbs__undo" role="status">
          <span>{undo.agent.name} was removed from this inbox.</span>
          <Button variant="subtle" size="xs" onClick={undoRemove}>Undo</Button>
        </div>
      )}

      {creating && (
        <CreateAgentModal
          existingEmails={agents.map((a) => a.email.toLowerCase())}
          onClose={() => setCreating(false)}
          onCreate={({ addToInbox, ...agent }) => {
            const id = onCreateAgent(agent);
            if (addToInbox) onChange({ ...value, [id]: { onlyAssignManually: false } });
            setCreating(false);
          }}
        />
      )}
    </section>
  );
}
