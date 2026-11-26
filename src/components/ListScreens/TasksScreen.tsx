import { useState, type ReactNode } from 'react';
import { ALL_FILTER, TasksHomePage, type TaskCardData, type TaskStatus } from '../TasksHomePage';
import { TaskEditPage, type TaskPatch } from '../TaskEditPage';
import { StateSwitcher } from '../StateSwitcher';
import { useSavedEdits } from '../SettingsScreen/useSavedEdits';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { ZERO_STATE } from '../../hooks/screenStates';
import {
  SUB_FLOW_OPTIONS,
  TASKS,
  TASK_AGENTS,
  TASK_FLOWS,
  TASK_FLOW_ROWS,
  TASK_SETUPS,
  TASK_STATE_FILTERS,
  type TaskFlowRow,
  type TaskSetup,
} from '../../data/tasksDemo';

const EMPTY_SETUP: TaskSetup = { prompt: '', triggers: [], guardrails: [], flowInstructions: [] };

/**
 * Automation → Tasks. One card per task; Configure opens its edit page (`?task=<id>`).
 * Edits are an unpublished draft until Update, like the Agent editor's.
 * The state switcher is a reviewer tool, floating over the page rather than part of it.
 */
export function TasksScreen() {
  const { task: taskId, setTask, screenStates, screenState, setScreenState } = useAppNavigation();
  const edits = useSavedEdits<TaskPatch>();
  // The switch and the Flows tab are the reviewer's doing, so they are this screen's state.
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>({});
  const [flows, setFlows] = useState<Record<string, TaskFlowRow[]>>({});

  /** A row as the screen shows it: the demo data, then the switch, then this task's edits. */
  const withEdits = (row: TaskCardData): TaskCardData => {
    // A patch also carries the General tab's fields; only these three belong on a card.
    const { name, agent, status } = { ...edits.saves[row.id], ...edits.draftFor(row.id) };
    return {
      ...row,
      status: status ?? statuses[row.id] ?? row.status,
      ...(name ? { name } : {}),
      ...(agent ? { agent } : {}),
    };
  };
  const edited = TASKS.map(withEdits).find((row) => row.id === taskId);

  if (edited) {
    const draft = edits.draftFor(edited.id);
    return (
      <TaskEditPage
        key={edited.id}
        task={edited}
        setup={{ ...(TASK_SETUPS[edited.id] ?? EMPTY_SETUP), ...edits.saves[edited.id], ...draft }}
        flows={flows[edited.id] ?? TASK_FLOW_ROWS[edited.id] ?? []}
        agentOptions={TASK_AGENTS}
        flowOptions={SUB_FLOW_OPTIONS}
        onChange={(patch) => edits.patch(edited.id, patch)}
        onFlowsChange={(next) => setFlows((prev) => ({ ...prev, [edited.id]: next }))}
        onBack={() => setTask('')}
        canUpdate={!!draft}
        onUpdate={() => edits.save(edited.id)}
      />
    );
  }

  const opening = TASK_STATE_FILTERS[screenState];
  return (
    <>
      <TasksList
        // Each state opens the page afresh, on the search or filters that produce it.
        key={screenState}
        tasks={screenState === ZERO_STATE.id ? [] : TASKS.map(withEdits)}
        initialSearch={opening?.search ?? ''}
        initialAgent={opening?.agent ?? ALL_FILTER}
        initialFlow={opening?.flow ?? ALL_FILTER}
        onConfigure={(row) => setTask(row.id)}
        onStatusChange={(row, active) => setStatuses((prev) => ({ ...prev, [row.id]: active ? 'active' : 'disabled' }))}
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
  onConfigure,
  onStatusChange,
}: {
  tasks: TaskCardData[];
  initialSearch: string;
  initialAgent: string;
  initialFlow: string;
  onConfigure: (row: TaskCardData) => void;
  onStatusChange: (row: TaskCardData, active: boolean) => void;
}): ReactNode {
  const list = useListScreen({ agent: initialAgent, flow: initialFlow });
  // The search is this screen's own, not `useListScreen`'s, so a state can open with one typed.
  // Like every list Screen, it only narrows what is already loaded, so it doesn't replay the fetch.
  const [search, setSearch] = useState(initialSearch);

  const { agent, flow } = list.filters;
  const shown = tasks.filter(
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
      onConfigure={onConfigure}
      onStatusChange={onStatusChange}
    />
  );
}
