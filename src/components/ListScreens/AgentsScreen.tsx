import { AgentEditPage, type AgentPatch, type AgentSetup } from '../AgentEditPage';
import { AgentsHomePage, type AgentCardData } from '../AgentsHomePage';
import { useSavedEdits } from '../SettingsScreen/useSavedEdits';
import { useDemoLoading } from '../../hooks/useDemoLoading';
import { AGENTS, AGENT_SETUPS } from '../../data/agentsDemo';

const EMPTY_SETUP: AgentSetup = { prompt: '', guardrails: [], triggers: [] };

/**
 * Automation → Agents. One card per AI agent; Customise opens its edit page (`?agent=<id>`).
 * Edits are an unpublished draft until Publish, and the card shows "Unsaved" meanwhile.
 * ponytail: one draft at a time (opening another agent's page keeps the first's edits only until the next edit).
 */
export function AgentsScreen({ agentId, onAgentChange }: { agentId: string; onAgentChange: (id: string) => void }) {
  const loading = useDemoLoading('agents');
  const edits = useSavedEdits<AgentPatch>();

  const withEdits = (row: AgentCardData): AgentCardData => {
    const draft = edits.draftFor(row.id);
    return { ...row, ...edits.saves[row.id], ...draft, unsaved: draft ? true : edits.saves[row.id] ? false : row.unsaved };
  };
  const agents = AGENTS.map(withEdits);
  const edited = agents.find((a) => a.id === agentId);

  if (edited) {
    return (
      <AgentEditPage
        key={edited.id}
        agent={edited}
        setup={{ ...(AGENT_SETUPS[edited.id] ?? EMPTY_SETUP), ...edits.saves[edited.id], ...edits.draftFor(edited.id) }}
        onChange={(patch) => edits.patch(edited.id, patch)}
        onBack={() => onAgentChange('')}
        canPublish={!!edited.unsaved}
        onPublish={() => edits.save(edited.id)}
      />
    );
  }

  return (
    <AgentsHomePage
      agents={agents}
      loading={loading}
      onTestAgents={() => alert('Test agents')}
      onAddAgent={() => alert('Add agent')}
      onViewTasks={(row) => alert(`Tasks: ${row.name}`)}
      onCustomise={(row) => onAgentChange(row.id)}
    />
  );
}
