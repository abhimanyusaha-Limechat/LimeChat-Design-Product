import { useState, type ReactNode } from 'react';
import { ALL_FILTER, TasksHomePage, type TaskCardData, type TaskStatus } from '../TasksHomePage';
import { StateSwitcher } from '../StateSwitcher';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { ZERO_STATE } from '../../hooks/screenStates';
import { TASKS, TASK_AGENTS, TASK_FLOWS, TASK_STATE_FILTERS } from '../../data/tasksDemo';

/**
 * Automation → Tasks. One card per task; Configure opens its editor (not built yet).
 * The state switcher is a reviewer tool, floating over the page rather than part of it.
 */
export function TasksScreen() {
  const { screenStates, screenState, setScreenState } = useAppNavigation();
  const opening = TASK_STATE_FILTERS[screenState];
  return (
    <>
      <TasksList
        // Each state opens the page afresh, on the search or filters that produce it.
        key={screenState}
        tasks={screenState === ZERO_STATE.id ? [] : TASKS}
        initialSearch={opening?.search ?? ''}
        initialAgent={opening?.agent ?? ALL_FILTER}
        initialFlow={opening?.flow ?? ALL_FILTER}
      />
      {screenStates.length > 1 && (
        <div className="lc-tk__state-switcher">
          <StateSwitcher states={screenStates} value={screenState} onChange={setScreenState} />
        </div>
      )}
    </>
  );
}

function TasksList({
  tasks,
  initialSearch,
  initialAgent,
  initialFlow,
}: {
  tasks: TaskCardData[];
  initialSearch: string;
  initialAgent: string;
  initialFlow: string;
}): ReactNode {
  const list = useListScreen({ agent: initialAgent, flow: initialFlow });
  // The search is this screen's own, not `useListScreen`'s, so a state can open with one typed.
  // Like every list Screen, it only narrows what is already loaded, so it doesn't replay the fetch.
  const [search, setSearch] = useState(initialSearch);
  // The switch is the reviewer's doing, so it is this screen's state rather than the demo data's.
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>({});

  const { agent, flow } = list.filters;
  const shown = tasks
    .map((row) => ({ ...row, status: statuses[row.id] ?? row.status }))
    .filter(
      (row) =>
        matchesSearch(search, row.name, row.agent) &&
        (agent === ALL_FILTER || row.agent === agent) &&
        (flow === ALL_FILTER || row.flows.includes(flow)),
    );

  return (
    <TasksHomePage
      tasks={shown}
      loading={list.loading}
      searchValue={search}
      onSearchChange={setSearch}
      agentOptions={TASK_AGENTS}
      agentFilter={agent}
      onAgentFilterChange={(value) => list.setFilter('agent', value)}
      flowOptions={TASK_FLOWS}
      flowFilter={flow}
      onFlowFilterChange={(value) => list.setFilter('flow', value)}
      onClearFilters={() => {
        setSearch('');
        list.setFilter('agent', ALL_FILTER);
        list.setFilter('flow', ALL_FILTER);
      }}
      onAddTask={() => alert('Add task')}
      onConfigure={(row) => alert(`Configure: ${row.name}`)}
      onStatusChange={(row, active) => setStatuses((prev) => ({ ...prev, [row.id]: active ? 'active' : 'disabled' }))}
    />
  );
}
