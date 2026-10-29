/**
 * AgentsHomePage — Automation → Agents landing view: one card per AI agent
 * (model badge, status, goal and the tasks it can run) over
 * its Tasks / Customise actions, with "Test agents" and "+ Add agent" above
 * the grid.
 *
 *   <AgentsHomePage
 *     agents={rows}
 *     onAddAgent={() => createAgent()}
 *     onCustomise={(row) => openAgent(row.id)}
 *   />
 */
import { Button } from '../Button';
import { Skeleton } from '../DataTable';
import { Icon } from '../icons';
import './AgentsHomePage.css';

export type AgentStatus = 'active' | 'disabled';

export interface AgentCardData {
  id: string;
  /** Model behind the agent, shown in the card header, e.g. "LimeGPT". */
  model: string;
  name: string;
  description: string;
  goal: string;
  /** Task names, shown as chips. */
  tasks: string[];
  status: AgentStatus;
  /** Adds the "Unsaved" chip — edits that haven't been published yet. */
  unsaved?: boolean;
}

export interface AgentsHomePageProps {
  /** Shows placeholder cards in place of the grid while it loads. */
  loading?: boolean;
  agents: AgentCardData[];
  onTestAgents?: () => void;
  onAddAgent?: () => void;
  onViewTasks?: (row: AgentCardData) => void;
  onCustomise?: (row: AgentCardData) => void;
}

const SKELETON_COUNT = 3;

/**
 * Up to this many agents fill a single row at desktop width, and a lone row sits in the
 * middle of the page instead of hugging the toolbar. More than that and the grid goes
 * back to filling the page from the top.
 */
const SINGLE_ROW_MAX = 3;

const gridClass = (count: number) => `lc-ag__grid${count <= SINGLE_ROW_MAX ? ' lc-ag__grid--centered' : ''}`;

const STATUS_LABEL: Record<AgentStatus, string> = { active: 'Active', disabled: 'Disabled' };

function AgentCard({
  row,
  onViewTasks,
  onCustomise,
}: {
  row: AgentCardData;
  onViewTasks?: (row: AgentCardData) => void;
  onCustomise?: (row: AgentCardData) => void;
}) {
  return (
    <li className="lc-ag__card" data-status={row.status} data-anchor="agent-card" data-anchor-key={row.id}>
      <div className="lc-ag__card-head">
        <span className="lc-ag__model">
          <Icon name="brand-openai" className="lc-ag__model-icon" />
          {row.model}
        </span>
        <span className="lc-ag__badges">
          {row.unsaved && <span className="lc-ag__badge lc-ag__badge--unsaved">Unsaved</span>}
          <span className={`lc-ag__badge lc-ag__badge--${row.status}`}>{STATUS_LABEL[row.status]}</span>
        </span>
      </div>

      <h3 className="lc-ag__name">{row.name}</h3>
      <p className="lc-ag__description">{row.description}</p>

      <div className="lc-ag__field">
        <span className="lc-ag__label">Goal</span>
        <p className="lc-ag__goal">{row.goal}</p>
      </div>

      <div className="lc-ag__field">
        <span className="lc-ag__label">Tasks</span>
        <ul className="lc-ag__tasks">
          {row.tasks.map((task) => (
            <li key={task} className="lc-ag__task">
              <Icon name="list-check" className="lc-ag__task-icon" />
              {task}
            </li>
          ))}
        </ul>
      </div>

      <div className="lc-ag__card-actions">
        <Button variant="default" size="sm" fullWidth className="lc-ag__btn" onClick={() => onViewTasks?.(row)}>
          Tasks
        </Button>
        <Button
          variant="filled"
          color="primary"
          size="sm"
          fullWidth
          className="lc-ag__btn"
          leftSection={<Icon name="settings" />}
          onClick={() => onCustomise?.(row)}
        >
          Customise
        </Button>
      </div>
    </li>
  );
}

export function AgentsHomePage({
  loading = false,
  agents,
  onTestAgents,
  onAddAgent,
  onViewTasks,
  onCustomise,
}: AgentsHomePageProps) {
  return (
    <div className="lc-ag" data-anchor="agents-page">
      <div className="lc-ag__toolbar">
        <Button
          variant="outline"
          color="primary"
          className="lc-ag__btn"
          leftSection={<Icon name="flask" />}
          onClick={onTestAgents}
          data-anchor="test-agents-button"
        >
          Test agents
        </Button>
        <Button
          variant="filled"
          color="primary"
          className="lc-ag__btn"
          leftSection={<Icon name="plus" />}
          onClick={onAddAgent}
          data-anchor="add-agent-button"
        >
          Add agent
        </Button>
      </div>

      {loading ? (
        <ul className={gridClass(SKELETON_COUNT)} aria-label="Agents" aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <li key={i} className="lc-ag__card lc-ag__card--skeleton">
              <Skeleton lines={2} />
            </li>
          ))}
        </ul>
      ) : agents.length === 0 ? (
        <div className="lc-ag__empty" data-anchor="agents-empty">
          <Icon name="robot" className="lc-ag__empty-icon" />
          <p className="lc-ag__empty-title">No agents yet</p>
          <p className="lc-ag__empty-text">Add an agent to answer questions and run tasks for your customers.</p>
          <Button variant="filled" color="primary" className="lc-ag__btn" leftSection={<Icon name="plus" />} onClick={onAddAgent}>
            Add agent
          </Button>
        </div>
      ) : (
        <ul className={gridClass(agents.length)} aria-label="Agents">
          {agents.map((row) => (
            <AgentCard key={row.id} row={row} onViewTasks={onViewTasks} onCustomise={onCustomise} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default AgentsHomePage;
