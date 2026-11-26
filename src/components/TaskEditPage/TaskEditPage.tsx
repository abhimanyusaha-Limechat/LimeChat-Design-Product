/**
 * TaskEditPage — Automation → Tasks → Configure (Figma "Agentic Bot Builder", nodes 2860:16254
 * and 2860:15178), in the app's current page shell: back arrow, task name, Test task / Update /
 * overflow, then General | Flows tabs with the Active switch at the right of the tab row.
 *
 * General is two columns: the agent the task is linked to, its Trigger Examples, Task Guardrails
 * and Custom Instructions for flows on the left, its Prompt/Instruction card on the right. Flows
 * lists the flows the task calls, each with what should trigger it and a switch.
 *
 * The blocks it shares with the Agent editor come from `AgentEditPage/sections`; only the agent
 * row and the Flows tab are this page's own. Controlled, like the Agent editor: every edit goes
 * out through `onChange` and the caller keeps the draft.
 *
 *   <TaskEditPage task={task} setup={setup} flows={rows} onChange={patch} onBack={close} onUpdate={save} canUpdate />
 */
import { useState } from 'react';
import type { TaskCardData } from '../TasksHomePage';
import {
  ListEditor,
  PromptCard,
  SectionHead,
  TriggerExamples,
  isPromptEmpty,
  type ListEditorCopy,
} from '../AgentEditPage/sections';
import { Button } from '../Button';
import { HeaderSwitch } from '../InboxSettings';
import { Menu } from '../Menu';
import { Modal, ModalTextField } from '../Modal';
import { NativeSelect } from '../Select';
import { SegmentedTabs, type SegmentedTab } from '../SegmentedTabs';
import { SettingsPage } from '../SettingsPage';
import { Tooltip } from '../Tooltip';
import { Icon } from '../icons';
import type { TaskFlowRow, TaskSetup } from '../../data/tasksDemo';
import './TaskEditPage.css';

export type TaskPatch = Partial<TaskSetup & Pick<TaskCardData, 'name' | 'agent' | 'status'>>;

type Tab = 'general' | 'flows';
const TABS: SegmentedTab<Tab>[] = [
  { id: 'general', label: 'General' },
  { id: 'flows', label: 'Flows' },
];

const TASK_GUARDRAILS: ListEditorCopy = {
  title: 'Task Guardrails',
  description: 'Define what your agent should avoid or enforce',
  item: 'Guardrail',
  aiAction: 'AI suggested guardrails',
  emptyText: 'Add triggers by typing in or let our AI curate it for you',
};

const FLOW_INSTRUCTIONS: ListEditorCopy = {
  title: 'Custom Instructions for flows',
  description: 'Instructions applicable for flows only, write instructions',
  item: 'Instruction',
  aiAction: 'AI suggested instructions',
  emptyText: 'Write instructions for this task’s flows, or let our AI curate them for you',
};

/** The one agent that decides when to run this task. */
function AgentLinked({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  return (
    <section className="lc-aep__section">
      <SectionHead
        title="Agent linked"
        description="The task is linked to a single agent, the agent will decide when to trigger the task"
      />
      <div className="lc-aep__field">
        <NativeSelect
          aria-label="Agent linked"
          wrapperClassName="lc-tep__agent-select"
          data={options}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </div>
    </section>
  );
}

function GeneralTab({
  task,
  setup,
  agentOptions,
  onChange,
}: {
  task: TaskCardData;
  setup: TaskSetup;
  agentOptions: string[];
  onChange: (patch: TaskPatch) => void;
}) {
  return (
    <div className="lc-aep__cols">
      <div className="lc-aep__main">
        <AgentLinked value={task.agent} options={agentOptions} onChange={(agent) => onChange({ agent })} />
        <hr className="lc-aep__rule" />
        <TriggerExamples value={setup.triggers} onChange={(triggers) => onChange({ triggers })} />
        <hr className="lc-aep__rule" />
        <ListEditor copy={TASK_GUARDRAILS} value={setup.guardrails} onChange={(guardrails) => onChange({ guardrails })} />
        <hr className="lc-aep__rule" />
        <ListEditor
          copy={FLOW_INSTRUCTIONS}
          value={setup.flowInstructions}
          onChange={(flowInstructions) => onChange({ flowInstructions })}
        />
      </div>
      <PromptCard value={setup.prompt} onChange={(prompt) => onChange({ prompt })} what="task" name={task.name} />
    </div>
  );
}

/** One flow the task calls: what it is called, when it fires, and whether it is on. */
function FlowRow({
  row,
  onTriggerChange,
  onActiveChange,
  onRemove,
}: {
  row: TaskFlowRow;
  onTriggerChange: (next: string) => void;
  onActiveChange: (next: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <li className="lc-tep__row" data-anchor="task-flow-row" data-anchor-key={row.id}>
      <div className="lc-tep__row-name">
        <span className="lc-tep__flow-title">
          {row.name}
          {row.thinking && (
            <Tooltip label="The agent calls this flow while it reasons, rather than handing the chat over">
              <span className="lc-tep__tag">Thinking flow</span>
            </Tooltip>
          )}
        </span>
        <span className="lc-tep__flow-time">{row.updatedAt}</span>
      </div>

      <span className="lc-tep__trigger">
        <input
          className="lc-tep__trigger-input"
          aria-label={`When to trigger ${row.name}`}
          autoComplete="off"
          value={row.trigger}
          onChange={(e) => onTriggerChange(e.currentTarget.value)}
        />
        <button
          type="button"
          className="lc-tep__trigger-ai"
          aria-label={`Rewrite the trigger for ${row.name} with AI`}
          title="Rewrite with AI"
          onClick={() => alert('Rewrite with AI')}
        >
          <Icon name="sparkle" size={16} />
        </button>
      </span>

      <div className="lc-tep__row-actions">
        <Menu
          ariaLabel={`More actions for ${row.name}`}
          items={[
            { label: 'Open flow', onClick: () => alert(`Open flow: ${row.name}`) },
            { label: 'Duplicate flow', onClick: () => alert(`Duplicate flow: ${row.name}`) },
            { label: 'Remove from task', danger: true, onClick: onRemove },
          ]}
          trigger={({ ref, onClick }) => (
            <button ref={ref} type="button" className="lc-tep__kebab" aria-label={`More actions for ${row.name}`} onClick={onClick}>
              <Icon name="dots-vertical" size={20} />
            </button>
          )}
        />
        <Tooltip label={row.active ? 'Turn this flow off' : 'Turn this flow on'}>
          <button
            type="button"
            role="switch"
            aria-checked={row.active}
            aria-label={row.active ? `Turn off ${row.name}` : `Turn on ${row.name}`}
            className="lc-tep__toggle"
            data-checked={row.active || undefined}
            onClick={() => onActiveChange(!row.active)}
          >
            <span className="lc-tep__toggle-thumb" aria-hidden="true" />
          </button>
        </Tooltip>
      </div>
    </li>
  );
}

function FlowsTab({
  flows,
  options,
  onFlowsChange,
}: {
  flows: TaskFlowRow[];
  options: string[];
  onFlowsChange: (next: TaskFlowRow[]) => void;
}) {
  const [picked, setPicked] = useState('');
  const taken = new Set(flows.map((row) => row.name));
  const available = options.filter((name) => !taken.has(name));

  const add = () => {
    if (!picked) return;
    onFlowsChange([
      ...flows,
      {
        id: picked.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        name: picked,
        updatedAt: 'Just now',
        trigger: '',
        active: false,
      },
    ]);
    setPicked('');
  };

  return (
    <div className="lc-tep__flows">
      <div className="lc-tep__add-row">
        <NativeSelect
          aria-label="Search or select a sub flow"
          wrapperClassName="lc-tep__flow-select"
          placeholder="Search/Select for Sub Flows"
          data={available}
          value={picked}
          onChange={(e) => setPicked(e.currentTarget.value)}
        />
        <Button
          variant="outline"
          color="primary"
          className="lc-tep__add-btn"
          leftSection={<Icon name="plus" />}
          disabled={!picked}
          onClick={add}
        >
          Add
        </Button>
      </div>

      {flows.length === 0 ? (
        <div className="lc-tep__empty" role="status">
          <Icon name="share" className="lc-tep__empty-icon" />
          <p className="lc-tep__empty-title">No flows on this task yet</p>
          <p className="lc-tep__empty-text">Add a flow above to give the task something to run.</p>
        </div>
      ) : (
        <>
          <div className="lc-tep__row-head" aria-hidden="true">
            <span className="lc-tep__row-name">Flows</span>
            <span>When to trigger?</span>
          </div>
          <ul className="lc-tep__rows" aria-label="Flows on this task">
            {flows.map((row) => (
              <FlowRow
                key={row.id}
                row={row}
                onTriggerChange={(trigger) => onFlowsChange(flows.map((f) => (f.id === row.id ? { ...f, trigger } : f)))}
                onActiveChange={(active) => onFlowsChange(flows.map((f) => (f.id === row.id ? { ...f, active } : f)))}
                onRemove={() => onFlowsChange(flows.filter((f) => f.id !== row.id))}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export interface TaskEditPageProps {
  task: TaskCardData;
  setup: TaskSetup;
  flows: TaskFlowRow[];
  /** Agents the task can be linked to. */
  agentOptions: string[];
  /** Flows the task can be given, for the Flows tab's picker. */
  flowOptions: string[];
  onChange: (patch: TaskPatch) => void;
  onFlowsChange: (next: TaskFlowRow[]) => void;
  onBack: () => void;
  onUpdate: () => void;
  /** There are edits that have not been pushed live yet. */
  canUpdate: boolean;
}

export function TaskEditPage({
  task,
  setup,
  flows,
  agentOptions,
  flowOptions,
  onChange,
  onFlowsChange,
  onBack,
  onUpdate,
  canUpdate,
}: TaskEditPageProps) {
  const [tab, setTab] = useState<Tab>('general');
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(task.name);
  const active = task.status === 'active';

  const openRename = () => {
    setDraftName(task.name);
    setRenaming(true);
  };
  const saveRename = () => {
    const name = draftName.trim();
    if (!name) return;
    onChange({ name });
    setRenaming(false);
  };

  const headerActions = (
    <>
      <Button variant="outline" color="primary" size="sm" leftSection={<Icon name="flask" />} onClick={() => alert(`Test ${task.name}`)}>
        Test task
      </Button>
      <Button
        variant="filled"
        color="primary"
        size="sm"
        leftSection={<Icon name="rocket" />}
        disabled={!canUpdate || !task.name.trim() || isPromptEmpty(setup)}
        onClick={onUpdate}
      >
        Update
      </Button>
      <Menu
        ariaLabel="More task actions"
        items={[
          { label: 'Rename task', onClick: openRename },
          { label: 'Duplicate task', onClick: () => alert('Duplicate task') },
          { label: 'Delete task', danger: true, onClick: () => alert('Delete task') },
        ]}
        trigger={({ ref, onClick }) => (
          <button ref={ref} type="button" className="lc-tep__kebab" aria-label="More task actions" onClick={onClick}>
            <Icon name="dots-vertical" size={20} />
          </button>
        )}
      />
    </>
  );

  return (
    <SettingsPage title={task.name} onBack={onBack} headerActions={headerActions}>
      <Modal
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Rename task"
        description="The name customers never see — it labels this task across Automation."
        footer={
          <>
            <Button variant="default" size="sm" onClick={() => setRenaming(false)}>
              Cancel
            </Button>
            <Button variant="filled" color="primary" size="sm" disabled={!draftName.trim()} onClick={saveRename}>
              Save
            </Button>
          </>
        }
      >
        <ModalTextField label="Task name" value={draftName} onChange={setDraftName} required autoComplete="off" />
      </Modal>

      <div className="lc-aep lc-tep" data-anchor="task-edit-page">
        <div className="lc-aep__tabbar">
          <SegmentedTabs ariaLabel="Task settings" tabs={TABS} value={tab} onChange={setTab} />
          <HeaderSwitch
            label={active ? 'Active' : 'Disabled'}
            checked={active}
            onChange={(on) => onChange({ status: on ? 'active' : 'disabled' })}
          />
        </div>
        <div className="lc-aep__tabpanel" role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
          {tab === 'general' ? (
            <GeneralTab task={task} setup={setup} agentOptions={agentOptions} onChange={onChange} />
          ) : (
            <FlowsTab flows={flows} options={flowOptions} onFlowsChange={onFlowsChange} />
          )}
        </div>
      </div>
    </SettingsPage>
  );
}

export default TaskEditPage;
