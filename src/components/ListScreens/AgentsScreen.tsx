import { AgentsHomePage } from '../AgentsHomePage';
import { useDemoLoading } from '../../hooks/useDemoLoading';
import { AGENTS } from '../../data/agentsDemo';

/** Automation → Agents. One card per AI agent; Customise opens it for editing. */
export function AgentsScreen() {
  const loading = useDemoLoading('agents');
  return (
    <AgentsHomePage
      agents={AGENTS}
      loading={loading}
      onTestAgents={() => alert('Test agents')}
      onAddAgent={() => alert('Add agent')}
      onViewTasks={(row) => alert(`Tasks: ${row.name}`)}
      onCustomise={(row) => alert(`Customise: ${row.name}`)}
    />
  );
}
