/**
 * Teams tab → Edit: a team's escalation levels, each with its members, beside a panel that
 * replaces the whole team from a CSV. Levels reorder by their grip (drag, or ArrowUp / ArrowDown).
 * Edits are a draft: every change is reported through `onChange`, and the caller saves them on Update.
 * Mount with `key={team.id}` so the levels reset when another team opens.
 */
import { useId, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { initials } from '../AccountPicker/AccountPicker';
import { Avatar } from '../Avatar';
import { useDragReorder } from '../BotTemplatesTable/useDragReorder';
import type { BotTemplateRow } from '../BotTemplatesTable';
import { Button } from '../Button';
import { Icon } from '../icons';
import { Menu } from '../Menu';
import { RowActions } from '../RowActions';
import { DEMO_COLLABORATORS } from '../../data/settingsDemo';
import { parseTeamCsv, TEAM_CSV_TEMPLATE } from './teamCsv';
import './TeamEdit.css';

/** A level with a stable key, so its expanded state and drag survive reordering. */
interface Level {
  key: string;
  members: BotTemplateRow[];
}

type CsvStatus = { kind: 'ok' | 'error'; text: string };

/** Initials pinned to 12px (Avatar scales them by default), as in the Agents table. */
const AVATAR_STYLE = { '--lc-avatar-font': '12px' } as CSSProperties;

const memberCount = (n: number) => `${n} ${n === 1 ? 'member' : 'members'}`;

const TEMPLATE_HREF = `data:text/csv;charset=utf-8,${encodeURIComponent(TEAM_CSV_TEMPLATE)}`;

export function TeamEdit({ levels: initial, onChange }: { levels: BotTemplateRow[][]; onChange: (levels: BotTemplateRow[][]) => void }) {
  const listId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [levels, setLevels] = useState<Level[]>(() => initial.map((members) => ({ key: crypto.randomUUID(), members })));
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  // The Add Member menus' search; cleared each time one opens.
  const [query, setQuery] = useState('');
  const [csvStatus, setCsvStatus] = useState<CsvStatus | null>(null);

  const commit = (next: Level[]) => {
    setLevels(next);
    onChange(next.map((level) => level.members));
  };
  const patchLevel = (key: string, members: (current: BotTemplateRow[]) => BotTemplateRow[]) =>
    commit(levels.map((level) => (level.key === key ? { ...level, members: members(level.members) } : level)));
  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  const moveLevel = (from: number, to: number) => {
    const next = [...levels];
    next.splice(to, 0, ...next.splice(from, 1));
    commit(next);
  };
  const { draggingId, dragOffset, handleProps } = useDragReorder(levels.length, moveLevel);

  const taken = new Set(levels.flatMap((level) => level.members.map((m) => m.id)));
  const available = DEMO_COLLABORATORS.filter((c) => !taken.has(c.id));
  const needle = query.trim().toLowerCase();
  const matches = available.filter((c) => c.name.toLowerCase().includes(needle) || c.description.toLowerCase().includes(needle));

  const importCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = ''; // picking the same file again should import again
    if (!file) return;
    const result = parseTeamCsv(await file.text(), DEMO_COLLABORATORS);
    if ('error' in result) {
      setCsvStatus({ kind: 'error', text: result.error });
      return;
    }
    commit(result.levels.map((members) => ({ key: crypto.randomUUID(), members })));
    setExpanded(new Set());
    const total = result.levels.reduce((sum, members) => sum + members.length, 0);
    setCsvStatus({ kind: 'ok', text: `Imported ${memberCount(total)} across ${result.levels.length} ${result.levels.length === 1 ? 'level' : 'levels'}.` });
  };

  return (
    <div className="lc-te">
      <div className="lc-te__levels">
        <div role="table" aria-label="Escalation levels">
          {levels.map((level, i) => {
            const open = expanded.has(level.key);
            const dragging = level.key === draggingId;
            const handle = handleProps(level.key, i);
            return (
              <div
                key={level.key}
                role="row"
                className="lc-te__row"
                data-dragging={dragging || undefined}
                style={dragging ? { translate: `0 ${dragOffset}px` } : undefined}
              >
                <div role="cell" className="lc-te__card">
                  {/* Clicking the empty parts of the header toggles too; the chevron stays the keyboard control. */}
                  <div
                    className="lc-te__head"
                    onClick={(e) => {
                      const target = e.target as Element;
                      // React events bubble out of the Add Member menu's portal; only DOM descendants count.
                      if (e.currentTarget.contains(target) && !target.closest('button')) toggle(level.key);
                    }}
                  >
                    <button
                      type="button"
                      className="lc-te__grip"
                      aria-label={`Reorder level ${i + 1}, position ${i + 1} of ${levels.length}. Use the up and down arrow keys to move.`}
                      {...handle}
                      onPointerDown={(e) => {
                        // Rows are measured at their collapsed height, so close them before the drag starts.
                        if (expanded.size > 0) flushSync(() => setExpanded(new Set()));
                        handle.onPointerDown(e);
                      }}
                    >
                      <Icon name="grip" />
                    </button>
                    <span className="lc-te__badge">Level {i + 1}</span>
                    <span className="lc-te__count">{memberCount(level.members.length)}</span>
                    <div className="lc-te__actions">
                      <Menu
                        ariaLabel={`Add a member to level ${i + 1}`}
                        className="lc-te__menu"
                        align="end"
                        width={260}
                        items={matches.map((c) => ({
                          key: c.id,
                          label: (
                            <span className="lc-te__option">
                              <Avatar size={36} radius="xl" alt="" className="lc-te__avatar" style={AVATAR_STYLE}>
                                {initials(c.name)}
                              </Avatar>
                              <span className="lc-te__text">
                                <span className="lc-te__name">{c.name}</span>
                                <span className="lc-te__email">{c.description}</span>
                              </span>
                            </span>
                          ),
                          onClick: () => {
                            patchLevel(level.key, (members) => [...members, c]);
                            setExpanded((prev) => new Set(prev).add(level.key));
                          },
                        }))}
                        header={
                          <div className="lc-te__search">
                            <Icon name="search" size={16} aria-hidden="true" />
                            <input
                              type="search"
                              className="lc-te__search-input"
                              placeholder="Search collaborators"
                              aria-label="Search collaborators"
                              autoComplete="off"
                              autoFocus
                              value={query}
                              onChange={(e) => setQuery(e.currentTarget.value)}
                            />
                          </div>
                        }
                        emptyState={
                          <p className="lc-te__menu-empty">
                            {available.length === 0 ? 'Every collaborator is already in this team.' : 'No collaborators found.'}
                          </p>
                        }
                        trigger={({ ref, onClick }) => (
                          <Button
                            ref={ref}
                            variant="outline"
                            size="xs"
                            leftSection={<Icon name="plus" />}
                            onClick={() => {
                              setQuery('');
                              onClick();
                            }}
                          >
                            Add Member
                          </Button>
                        )}
                      />
                      <RowActions name={`level ${i + 1}`} onDelete={() => commit(levels.filter((l) => l.key !== level.key))} />
                      <button
                        type="button"
                        className="lc-te__icon-btn lc-te__chevron"
                        aria-label={`Level ${i + 1} members`}
                        aria-expanded={open}
                        aria-controls={`${listId}-${level.key}`}
                        onClick={() => toggle(level.key)}
                      >
                        <Icon name="chevron-down" size={20} />
                      </button>
                    </div>
                  </div>
                  {open && (
                    <div id={`${listId}-${level.key}`} className="lc-te__members">
                      {level.members.length === 0 ? (
                        <p className="lc-te__empty">No members yet. Use Add Member.</p>
                      ) : (
                        <ul className="lc-te__list">
                          {level.members.map((member) => (
                            <li key={member.id} className="lc-te__item">
                              <Avatar size={36} radius="xl" alt={member.name} className="lc-te__avatar" style={AVATAR_STYLE}>
                                {initials(member.name)}
                              </Avatar>
                              <div className="lc-te__text">
                                <span className="lc-te__name">{member.name}</span>
                                <span className="lc-te__email">{member.description}</span>
                              </div>
                              {member.role && <span className="lc-te__role">{member.role}</span>}
                              <button
                                type="button"
                                className="lc-te__icon-btn"
                                aria-label={`Remove ${member.name} from level ${i + 1}`}
                                onClick={() => patchLevel(level.key, (members) => members.filter((m) => m.id !== member.id))}
                              >
                                <Icon name="close" size={16} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="lc-te__insert">
          <Button variant="outline" color="gray" size="sm" leftSection={<Icon name="plus" />} onClick={() => commit([...levels, { key: crypto.randomUUID(), members: [] }])}>
            Insert A Level
          </Button>
        </div>
      </div>

      <aside className="lc-te__upload" aria-label="Upload team data">
        <h3 className="lc-te__upload-title">Upload all team data at once</h3>
        <p className="lc-te__upload-text">Download the template, fill it in, then upload it back here as a CSV.</p>
        <p className="lc-te__note">Each row needs an email and level. custom_id is optional.</p>
        <div className="lc-te__upload-actions">
          <Button variant="white" color="primary" size="xs" fullWidth leftSection={<Icon name="download" />} href={TEMPLATE_HREF} download="team-template.csv">
            Template
          </Button>
          <Button variant="white" color="gray" size="xs" fullWidth leftSection={<Icon name="plus" />} onClick={() => fileRef.current?.click()}>
            Upload CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
        </div>
        {csvStatus && (
          <p className="lc-te__status" data-kind={csvStatus.kind} role={csvStatus.kind === 'error' ? 'alert' : 'status'}>
            {csvStatus.text}
          </p>
        )}
      </aside>
    </div>
  );
}
