/**
 * Inbox details panel, below the inbox's fields: the agents added to this inbox, searchable,
 * with "Add" for the rest and a × to remove one. It edits the same list as the inbox edit
 * page's Collaborators tab, so a change here shows there.
 * Mount with `key={inbox.id}` so the search resets when another inbox opens.
 */
import { useState, type CSSProperties } from 'react';
import { initials } from '../AccountPicker/AccountPicker';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import type { InboxAgent, InboxCollaborators } from '../InboxSettings';
import { Icon } from '../icons';
import { Menu } from '../Menu';
import './InboxCollaboratorsPanel.css';

/** Same avatar as the Agents table: 36px, initials pinned to 12px. */
const AVATAR_STYLE = { '--lc-avatar-font': '12px' } as CSSProperties;

export function InboxCollaboratorsPanel({
  agents,
  value,
  onChange,
}: {
  /** Every agent on the account. */
  agents: InboxAgent[];
  value: InboxCollaborators;
  onChange: (next: InboxCollaborators) => void;
}) {
  const [query, setQuery] = useState('');
  const added = agents.filter((a) => a.id in value);
  const available = agents.filter((a) => !(a.id in value));
  const needle = query.trim().toLowerCase();
  const shown = added.filter((a) => a.name.toLowerCase().includes(needle) || a.email.toLowerCase().includes(needle));

  return (
    <section className="lc-icp" aria-label="Collaborators">
      <div className="lc-icp__sticky">
        <div className="lc-icp__head">
          <h3 className="lc-icp__title">
            Collaborators <span className="lc-icp__count">{added.length}</span>
          </h3>
          {available.length > 0 && (
            <Menu
              ariaLabel="Add collaborator"
              align="end"
              width={260}
              className="lc-icp__menu"
              items={available.map((a) => ({
                key: a.id,
                label: (
                  <span className="lc-icp__option">
                    <Avatar size={36} radius="xl" alt="" className="lc-icp__avatar" style={AVATAR_STYLE}>
                      {initials(a.name)}
                    </Avatar>
                    <span className="lc-icp__text">
                      <span className="lc-icp__name">{a.name}</span>
                      <span className="lc-icp__sub">{a.email}</span>
                    </span>
                  </span>
                ),
                onClick: () => onChange({ ...value, [a.id]: { onlyAssignManually: false } }),
              }))}
              trigger={({ ref, onClick }) => (
                <Button ref={ref} variant="default" size="xs" leftSection={<Icon name="plus" size={14} />} onClick={onClick}>
                  Add
                </Button>
              )}
            />
          )}
        </div>
        <div className="lc-icp__search">
          <Icon name="search" size={16} aria-hidden="true" />
          <input
            type="search"
            className="lc-icp__search-input"
            placeholder="Search collaborators"
            aria-label="Search collaborators"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="lc-icp__empty">{added.length === 0 ? 'No collaborators yet.' : 'No collaborators match.'}</p>
      ) : (
        <ul className="lc-icp__list">
          {shown.map((agent) => (
            <li key={agent.id} className="lc-icp__item">
              <Avatar size={36} radius="xl" alt={agent.name} className="lc-icp__avatar" style={AVATAR_STYLE}>
                {initials(agent.name)}
              </Avatar>
              <div className="lc-icp__text">
                <span className="lc-icp__name">{agent.name}</span>
                <span className="lc-icp__sub">
                  {agent.email} · {agent.role}
                </span>
              </div>
              <button
                type="button"
                className="lc-icp__remove"
                aria-label={`Remove ${agent.name}`}
                title="Remove"
                onClick={() => onChange(Object.fromEntries(Object.entries(value).filter(([id]) => id !== agent.id)))}
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
