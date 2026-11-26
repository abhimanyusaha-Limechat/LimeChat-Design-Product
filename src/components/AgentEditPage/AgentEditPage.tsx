/**
 * AgentEditPage — Automation → Agents → Customise (Figma node 2956:5789), in the app's current
 * page shell: back arrow, agent name, Test agent / Update / overflow, then General | Tasks tabs
 * with the Active switch at the right of the tab row.
 *
 * General is two columns: the agent's Trigger Examples, Guardrails and Thinking Flows on the left,
 * its Prompt/Instruction card on the right. Controlled — every edit goes out through `onChange`;
 * the caller keeps the draft and publishes it.
 *
 *   <AgentEditPage agent={agent} setup={setup} onChange={patch} onBack={close} onPublish={publish} canPublish />
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { AgentCardData } from '../AgentsHomePage';
import { Button } from '../Button';
import { HeaderSwitch } from '../InboxSettings';
import { Menu } from '../Menu';
import { Modal, ModalTextField } from '../Modal';
import { PublishHistoryPanel } from '../PublishHistoryPanel';
import { NativeSelect } from '../Select';
import { SegmentedTabs, type SegmentedTab } from '../SegmentedTabs';
import { SettingsPage } from '../SettingsPage';
import { Icon } from '../icons';
import {
  EmptyInVersion,
  ListEditor,
  PromptCard,
  SectionHead,
  TriggerExamples,
  isPromptEmpty,
  type ListEditorCopy,
} from './sections';
import { CURRENT_EDITOR, PUBLISH_HISTORY, THINKING_FLOWS, type PublishedVersion } from '../../data/agentsDemo';
import loadingYeti from '../../assets/loading/loading-yeti.gif';
import './AgentEditPage.css';

/** What the General tab edits, besides the agent's name and status. */
export interface AgentSetup {
  /** The agent's description prompt; WhatsApp-style marks: *bold*, _italic_, ~strike~. */
  prompt: string;
  guardrails: string[];
  /** Example messages that should activate the agent. */
  triggers: string[];
  /** Flows the agent may call while it works out a reply. */
  flows?: string[];
}

export type AgentPatch = Partial<AgentSetup & Pick<AgentCardData, 'name' | 'status'>>;

type Tab = 'general' | 'tasks';
const TABS: SegmentedTab<Tab>[] = [
  { id: 'general', label: 'General' },
  { id: 'tasks', label: 'Tasks' },
];

const AGENT_GUARDRAILS: ListEditorCopy = {
  title: 'Agent Guardrails',
  description: 'Define what your agent should avoid or enforce',
  item: 'Guardrail',
  aiAction: 'AI suggested guardrails',
  emptyText: 'Add triggers by typing in or let our AI curate it for you',
};

/** The flows this agent may call while it reasons. */
function ThinkingFlows({ value, onChange, readOnly }: { value: string[]; onChange: (next: string[]) => void; readOnly?: boolean }) {
  return (
    <section className="lc-aep__section">
      <SectionHead title="Thinking Flows" description="Flows this agent can call while it works out a reply." />
      <div className="lc-aep__field">
        {readOnly && value.length === 0 ? (
          <EmptyInVersion what="thinking flows" />
        ) : (
          <NativeSelect
            aria-label="Select flows"
            fullWidth
            disabled={readOnly}
            placeholder="Select from Dropdown"
            data={THINKING_FLOWS}
            value={value[0] ?? ''}
            onChange={(e) => onChange(e.currentTarget.value ? [e.currentTarget.value] : [])}
          />
        )}
      </div>
    </section>
  );
}

function GeneralTab({
  name,
  setup,
  onChange,
  readOnly,
}: {
  /** The agent's name, which titles the prompt dialog. */
  name: string;
  setup: AgentSetup;
  onChange: (patch: Partial<AgentSetup>) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="lc-aep__cols">
      <div className="lc-aep__main">
        <TriggerExamples value={setup.triggers} onChange={(triggers) => onChange({ triggers })} readOnly={readOnly} />
        <hr className="lc-aep__rule" />
        <ListEditor
          copy={AGENT_GUARDRAILS}
          value={setup.guardrails}
          onChange={(guardrails) => onChange({ guardrails })}
          readOnly={readOnly}
        />
        <hr className="lc-aep__rule" />
        <ThinkingFlows value={setup.flows ?? []} onChange={(flows) => onChange({ flows })} readOnly={readOnly} />
      </div>
      <PromptCard value={setup.prompt} onChange={(prompt) => onChange({ prompt })} readOnly={readOnly} name={name} />
    </div>
  );
}

export interface AgentEditPageProps {
  agent: AgentCardData;
  setup: AgentSetup;
  onChange: (patch: AgentPatch) => void;
  onBack: () => void;
  onPublish: () => void;
  /** There are edits that aren't published yet. */
  canPublish: boolean;
}

export function AgentEditPage({ agent, setup, onChange, onBack, onPublish, canPublish }: AgentEditPageProps) {
  const [tab, setTab] = useState<Tab>('general');
  const [renaming, setRenaming] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [draftName, setDraftName] = useState(agent.name);
  // An older publish being previewed. While one is on screen the page shows its setup, read-only.
  const [viewing, setViewing] = useState<PublishedVersion | null>(null);
  // Picked from the history and still loading — the page shows the loader until it lands.
  const [loading, setLoading] = useState<PublishedVersion | null>(null);
  const active = agent.status === 'active';
  const shown = viewing ? viewing.setup : setup;

  const selectVersion = (version: PublishedVersion) => {
    setViewing(null);
    setLoading(version);
  };

  const restoreVersion = (version: PublishedVersion) => {
    onChange({ ...version.setup });
    setViewing(null);
  };

  const openRename = () => {
    setDraftName(agent.name);
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
      <Button variant="outline" color="primary" size="sm" leftSection={<Icon name="flask" />} onClick={() => alert(`Test ${agent.name}`)}>
        Test agent
      </Button>
      <Button
        variant="filled"
        color="primary"
        size="sm"
        leftSection={<Icon name="rocket" />}
        disabled={!!viewing || !!loading || !canPublish || !agent.name.trim() || isPromptEmpty(setup)}
        onClick={onPublish}
      >
        Publish
      </Button>
      <Menu
        ariaLabel="More agent actions"
        items={[
          { label: 'Rename agent', onClick: openRename },
          { label: 'See publish history', onClick: () => setHistoryOpen(true) },
          { label: 'Duplicate agent', onClick: () => alert('Duplicate agent') },
          { label: 'Delete agent', onClick: () => alert('Delete agent') },
        ]}
        trigger={({ ref, onClick }) => (
          <button ref={ref} type="button" className="lc-aep__kebab" aria-label="More agent actions" onClick={onClick}>
            <Icon name="dots-vertical" size={20} />
          </button>
        )}
      />
    </>
  );

  return (
    <SettingsPage title={agent.name} onBack={onBack} headerActions={headerActions}>
      <Modal
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Rename agent"
        description="The name customers never see — it labels this agent across Automation."
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
        <ModalTextField label="Agent name" value={draftName} onChange={setDraftName} required autoComplete="off" />
      </Modal>
      {historyOpen && (
        <PublishHistoryPanel
          current={{ editor: CURRENT_EDITOR }}
          versions={PUBLISH_HISTORY}
          onDownloadCurrent={() => alert('Download the current snapshot')}
          selectedId={loading?.id ?? viewing?.id}
          onSelect={selectVersion}
          // Closing the list is not leaving the version: whatever is on screen stays, and
          // the banner keeps the ways out of it.
          onClose={() => setHistoryOpen(false)}
          onDownload={(v) => alert(`Download ${v.publishedAt}`)}
        />
      )}
      {viewing && <VersionBanner version={viewing} onRestore={() => restoreVersion(viewing)} onExit={() => setViewing(null)} />}
      <div className="lc-aep" data-anchor="agent-edit-page" data-loading={loading ? 'true' : undefined}>
        <div className="lc-aep__tabbar">
          <SegmentedTabs ariaLabel="Agent settings" tabs={TABS} value={tab} onChange={setTab} />
          <HeaderSwitch
            label={active ? 'Active' : 'Disabled'}
            checked={active}
            onChange={(on) => onChange({ status: on ? 'active' : 'disabled' })}
          />
        </div>
        <div className="lc-aep__tabpanel" role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
          {loading ? (
            <VersionLoader
              onDone={() => {
                setViewing(loading);
                setLoading(null);
              }}
            />
          ) : tab === 'general' ? (
            <GeneralTab name={agent.name} setup={shown} onChange={onChange} readOnly={!!viewing} />
          ) : (
            <TasksPlaceholder />
          )}
        </div>
      </div>
    </SettingsPage>
  );
}

/** The work the page pretends to do while an older publish is pulled back in. */
/**
 * The product's own loading messages, one per variant of the Container component in Figma
 * (2798:2173), shown beside the same animated mark.
 */
const LOAD_STEPS = [
  'Analyzing the Agent...',
  'Collecting data and information...',
  'Preparing prompt...',
  'Reviewing flows...',
];

const STEP_MS = 650;

/**
 * Stands in for the General tab while a version loads, so an older publish never appears
 * without warning. Walks the messages above, then hands over.
 */
function VersionLoader({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  // Held in a ref so a new `onDone` identity on each render can't restart the sequence.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    const last = step >= LOAD_STEPS.length - 1;
    const timer = setTimeout(() => (last ? done.current() : setStep((s) => s + 1)), STEP_MS);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="lc-aep__loader" role="status" aria-live="polite" data-anchor="version-loader">
      {/* The mark carries no meaning the message does not; it is the message that is announced. */}
      <img className="lc-aep__loader-mark" src={loadingYeti} alt="" width={56} height={56} />
      <p className="lc-aep__loader-text">{LOAD_STEPS[step]}</p>
    </div>
  );
}

/**
 * Sits at the bottom of the page while an older version is on screen: which version it is, who
 * published it, and the way back — restore it, or leave the preview.
 */
function VersionBanner({
  version,
  onRestore,
  onExit,
}: {
  version: PublishedVersion;
  onRestore: () => void;
  onExit: () => void;
}) {
  // The publish's own number when it has one; otherwise its date and time stands in as the name.
  const label = version.version ?? version.publishedAt;
  return (
    <div className="lc-aep__banner" role="status" data-anchor="version-banner">
      <Icon name="history" size={18} className="lc-aep__banner-icon" />
      <div className="lc-aep__banner-body">
        <p className="lc-aep__banner-head">
          <span className="lc-aep__banner-title">Viewing {label}</span>
          <span className="lc-aep__banner-rule" aria-hidden="true" />
          <span className="lc-aep__banner-meta">
            {version.author}
            {version.version && ` · ${version.publishedAt}`}
          </span>
        </p>
        {/* Restoring overwrites the draft, so the way to keep it is said here rather than in a
            dialog after the fact. */}
        <p className="lc-aep__banner-note">Publish your current changes first, or restoring will replace them.</p>
        <div className="lc-aep__banner-actions">
          <Button variant="subtle" color="gray" size="xs" textTransform="none" onClick={onExit}>
            Dismiss
          </Button>
          <Button variant="filled" color="primary" size="xs" textTransform="none" onClick={onRestore}>
            Restore this version
          </Button>
        </div>
      </div>
      <button type="button" className="lc-aep__banner-close" aria-label="Exit version preview" onClick={onExit}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

/** The Tasks tab isn't in this design; it keeps the tab honest until it is. */
function TasksPlaceholder(): ReactNode {
  return (
    <div className="lc-aep__placeholder">
      <Icon name="list-check" className="lc-aep__placeholder-icon" />
      <p>Tasks for this agent live on the Tasks tab of the agent list.</p>
    </div>
  );
}

export default AgentEditPage;
