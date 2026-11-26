/**
 * TasksHomePage — Automation → Tasks landing view (Figma "Agentic Bot Builder", node 44:15839):
 * one card per task, with the agent it is linked to, how it has been performing, the flows it
 * calls, and its Configure action over an on/off switch. Search and two "Filter by" dropdowns
 * sit above the list, with "+ Add task" at the right.
 *
 * Built from AgentsHomePage (same page chrome, card language, badges, chips, skeletons and
 * empty state); a task's card is a full-width row rather than one of three in a grid, and it
 * carries the fields only a task has: its agent, its metrics and its flows.
 *
 *   <TasksHomePage
 *     tasks={rows}
 *     onAddTask={() => createTask()}
 *     onConfigure={(row) => openTask(row.id)}
 *   />
 */
import { useState } from 'react';
import { Button } from '../Button';
import { Skeleton } from '../DataTable';
import { NativeSelect } from '../Select';
import { Tooltip } from '../Tooltip';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';
import './TasksHomePage.css';

export type TaskStatus = 'active' | 'disabled';

/** How the task has been doing, as the card's four pills read it. */
export interface TaskMetrics {
  /** Times customers set the task off. */
  triggers: number;
  /** Customers it has run for. */
  accounts: number;
  /** Share of those conversations it finished on its own, 0 to 100. */
  automation: number;
  /** Share that left part-way through, 0 to 100. */
  dropOff: number;
}

export interface TaskCardData {
  id: string;
  name: string;
  /** The agent this task is linked to; the agent decides when to trigger it. */
  agent: string;
  description: string;
  /** Flow names, shown as chips. */
  flows: string[];
  metrics: TaskMetrics;
  status: TaskStatus;
}

/** The value both "Filter by" dropdowns start on, and what their first option sets them back to. */
export const ALL_FILTER = 'all';

const SKELETON_COUNT = 3;

/** Flow chips a collapsed card shows; the rest wait behind "Show more". */
const COLLAPSED_FLOWS = 5;

const formatCount = (value: number) => value.toLocaleString('en-US');

/** The four pills, in the order the design lists them. */
const METRICS: { key: keyof TaskMetrics; icon: IconName; label: string; percent?: boolean }[] = [
  { key: 'triggers', icon: 'hand', label: 'Times triggered' },
  { key: 'accounts', icon: 'user', label: 'Customers reached' },
  { key: 'automation', icon: 'settings-automation', label: 'Automated end to end', percent: true },
  { key: 'dropOff', icon: 'arrow-drop-off', label: 'Dropped off part-way', percent: true },
];

function TaskMetricPills({ metrics }: { metrics: TaskMetrics }) {
  return (
    <ul className="lc-tk__metrics">
      {METRICS.map(({ key, icon, label, percent }) => {
        const value = percent ? `${metrics[key]}%` : formatCount(metrics[key]);
        return (
          <li key={key}>
            <Tooltip label={label}>
              {/* The number alone says nothing, so the pill carries what it counts as its name,
                  and takes focus so the tooltip is reachable from the keyboard too. */}
              <span className="lc-tk__metric" role="img" aria-label={`${label}: ${value}`} tabIndex={0}>
                <Icon name={icon} className="lc-tk__metric-icon" />
                {value}
              </span>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}

function TaskCard({
  row,
  onConfigure,
  onStatusChange,
}: {
  row: TaskCardData;
  onConfigure?: (row: TaskCardData) => void;
  onStatusChange?: (row: TaskCardData, active: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const active = row.status === 'active';
  const hidden = row.flows.length - COLLAPSED_FLOWS;
  const flows = expanded ? row.flows : row.flows.slice(0, COLLAPSED_FLOWS);

  return (
    <li className="lc-tk__card" data-status={row.status} data-anchor="task-card" data-anchor-key={row.id}>
      <div className="lc-tk__card-head">
        <div className="lc-tk__headline">
          <h3 className="lc-tk__name">{row.name}</h3>
          <span className="lc-tk__agent">
            <Icon name="headset-pill" className="lc-tk__agent-icon" />
            {row.agent}
          </span>
          <TaskMetricPills metrics={row.metrics} />
        </div>

        <div className="lc-tk__card-actions">
          <Button
            variant="outline"
            color="primary"
            size="sm"
            className="lc-tk__btn"
            leftSection={<Icon name="settings" />}
            onClick={() => onConfigure?.(row)}
          >
            Configure
          </Button>
          <Tooltip label={active ? 'Turn this task off' : 'Turn this task on'}>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              aria-label={active ? `Turn off ${row.name}` : `Turn on ${row.name}`}
              className="lc-tk__toggle"
              data-checked={active || undefined}
              onClick={() => onStatusChange?.(row, !active)}
            >
              <span className="lc-tk__toggle-thumb" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      </div>

      <p className="lc-tk__description">{row.description}</p>

      <div className="lc-tk__field">
        <span className="lc-tk__label">Flows</span>
        <ul className="lc-tk__flows">
          {flows.map((flow) => (
            <li key={flow} className="lc-tk__flow">
              <Icon name="share" className="lc-tk__flow-icon" />
              {flow}
            </li>
          ))}
        </ul>
      </div>

      {hidden > 0 && (
        <button type="button" className="lc-tk__show-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : `Show ${hidden} more`}
          <Icon name="chevron-down" className="lc-tk__show-more-icon" />
        </button>
      )}
    </li>
  );
}

export interface TasksHomePageProps {
  /** Shows placeholder cards in place of the list while it loads. */
  loading?: boolean;
  tasks: TaskCardData[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Agent names the "All agents" dropdown offers, besides its own first option. */
  agentOptions?: string[];
  agentFilter?: string;
  onAgentFilterChange?: (value: string) => void;
  /** Flow names the "All flows" dropdown offers, besides its own first option. */
  flowOptions?: string[];
  flowFilter?: string;
  onFlowFilterChange?: (value: string) => void;
  /** Puts both dropdowns and the search back to showing everything. */
  onClearFilters?: () => void;
  onAddTask?: () => void;
  onConfigure?: (row: TaskCardData) => void;
  onStatusChange?: (row: TaskCardData, active: boolean) => void;
}

export function TasksHomePage({
  loading = false,
  tasks,
  searchValue = '',
  onSearchChange,
  agentOptions = [],
  agentFilter = ALL_FILTER,
  onAgentFilterChange,
  flowOptions = [],
  flowFilter = ALL_FILTER,
  onFlowFilterChange,
  onClearFilters,
  onAddTask,
  onConfigure,
  onStatusChange,
}: TasksHomePageProps) {
  // Nothing to show can mean three different things, and each wants its own copy and way out.
  const searching = searchValue.trim() !== '';
  const filtering = agentFilter !== ALL_FILTER || flowFilter !== ALL_FILTER;
  const narrowed = searching || filtering;

  return (
    <div className="lc-tk" data-anchor="tasks-page">
      <div className="lc-tk__toolbar">
        <div className="lc-tk__search">
          <Icon name="search" className="lc-tk__search-icon" />
          <input
            className="lc-tk__search-input"
            type="text"
            placeholder="Search by name"
            aria-label="Search tasks by name"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          />
        </div>

        <div className="lc-tk__filters">
          <span className="lc-tk__filter-label">Filter by</span>
          <NativeSelect
            aria-label="Filter tasks by agent"
            size="xs"
            wrapperClassName="lc-tk__filter"
            data={[{ value: ALL_FILTER, label: 'All agents' }, ...agentOptions.map((name) => ({ value: name, label: name }))]}
            value={agentFilter}
            onChange={(e) => onAgentFilterChange?.(e.currentTarget.value)}
          />
          <NativeSelect
            aria-label="Filter tasks by flow"
            size="xs"
            wrapperClassName="lc-tk__filter"
            data={[{ value: ALL_FILTER, label: 'All flows' }, ...flowOptions.map((name) => ({ value: name, label: name }))]}
            value={flowFilter}
            onChange={(e) => onFlowFilterChange?.(e.currentTarget.value)}
          />
        </div>

        <Button
          variant="filled"
          color="primary"
          className="lc-tk__btn"
          leftSection={<Icon name="plus" />}
          onClick={onAddTask}
          data-anchor="add-task-button"
        >
          Add task
        </Button>
      </div>

      {loading ? (
        <ul className="lc-tk__list" aria-label="Tasks" aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <li key={i} className="lc-tk__card lc-tk__card--skeleton">
              <Skeleton lines={2} />
            </li>
          ))}
        </ul>
      ) : tasks.length === 0 ? (
        // A status region, so the change is announced when a filter or search empties the list.
        <div className="lc-tk__empty" role="status" data-anchor="tasks-empty">
          <Icon name={narrowed ? 'filter-off' : 'list-check'} className="lc-tk__empty-icon" />
          <p className="lc-tk__empty-title">
            {searching ? 'No tasks match this search' : filtering ? 'No tasks match these filters' : 'No tasks yet'}
          </p>
          <p className="lc-tk__empty-text">
            {searching
              ? 'Try another name, or put the agent and flow filters back to showing everything.'
              : filtering
                ? 'Try removing one of the filters, or put both back to showing everything.'
                : 'Add a task to give your agents something to run for your customers.'}
          </p>
          {narrowed ? (
            <Button variant="outline" color="gray" className="lc-tk__btn" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button variant="filled" color="primary" className="lc-tk__btn" leftSection={<Icon name="plus" />} onClick={onAddTask}>
              Add task
            </Button>
          )}
        </div>
      ) : (
        <ul className="lc-tk__list" aria-label="Tasks">
          {tasks.map((row) => (
            <TaskCard key={row.id} row={row} onConfigure={onConfigure} onStatusChange={onStatusChange} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default TasksHomePage;
