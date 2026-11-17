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

const FORMATS = [
  { label: 'Bold', glyph: 'B', mark: '*' },
  { label: 'Italic', glyph: 'I', mark: '_' },
  { label: 'Strikethrough', glyph: 'S', mark: '~' },
];
const EMOJIS = ['🙂', '👍', '🙏', '🎉', '❤️', '😊'];

/** The prompt can be published once it says something. */
const isPromptEmpty = ({ prompt }: Pick<AgentSetup, 'prompt'>) => prompt.trim() === '';

/**
 * Section title + one line of help, above each block of the General tab. Once the block has
 * content, its AI shortcut moves up here from the empty state.
 */
function SectionHead({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="lc-aep__head">
      <div className="lc-aep__head-row">
        <h2 className="lc-aep__head-title">{title}</h2>
        {action}
      </div>
      <p className="lc-aep__head-desc">{description}</p>
    </div>
  );
}

/** The outline button with the gradient label that asks the AI to fill a block. */
function AiButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="lc-aep__ai-btn" onClick={onClick}>
      <Icon name="sparkle" size={16} />
      <span className="lc-aep__ai-label">{label}</span>
    </button>
  );
}

/**
 * The "nothing here yet" panel, with the AI shortcut that fills the block.
 * `tone` picks the dashed grey panel (triggers) or the soft green one (guardrails).
 */
function AiEmptyState({
  tone,
  text,
  action,
  onAction,
}: {
  tone: 'dashed' | 'soft';
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="lc-aep__empty" data-tone={tone}>
      <p className="lc-aep__empty-text">{text}</p>
      <AiButton label={action} onClick={onAction} />
    </div>
  );
}

/** A green pill for a saved trigger example; removable unless the version is read-only. */
function Chip({ text, onRemove }: { text: string; onRemove?: () => void }) {
  return (
    <span className="lc-aep__chip">
      {text}
      {onRemove && (
        <button type="button" className="lc-aep__chip-x" aria-label={`Remove ${text}`} onClick={onRemove}>
          <Icon name="close" size={16} />
        </button>
      )}
    </span>
  );
}

/** Shown in place of a block's controls when an older version is on screen. */
function EmptyInVersion({ what }: { what: string }) {
  return <p className="lc-aep__none">No {what} in this version.</p>;
}

/** Add-one-at-a-time box for the messages that should hand the chat to this agent. */
function TriggerExamples({ value, onChange, readOnly }: { value: string[]; onChange: (next: string[]) => void; readOnly?: boolean }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const text = draft.trim();
    if (!text || value.includes(text)) return;
    onChange([...value, text]);
    setDraft('');
  };

  if (readOnly) {
    return (
      <section className="lc-aep__section">
        <SectionHead title="Trigger Examples" description="Examples of user messages that should trigger this agent" />
        <div className="lc-aep__field">
          {value.length === 0 ? (
            <EmptyInVersion what="trigger examples" />
          ) : (
            <div className="lc-aep__panel">
              <div className="lc-aep__chips">
                {value.map((text) => (
                  <Chip key={text} text={text} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="lc-aep__section">
      <SectionHead
        title="Trigger Examples"
        description="Examples of user messages that should trigger this agent"
        action={value.length > 0 && <AiButton label="AI suggested triggers" onClick={() => alert('AI suggested triggers')} />}
      />
      <div className="lc-aep__field">
        <div className="lc-aep__add-row">
          <input
            className="lc-aep__input"
            aria-label="Add trigger example"
            placeholder="Add examples"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" className="lc-aep__enter" aria-label="Add trigger example" disabled={!draft.trim()} onClick={add}>
            <Icon name="corner-down-left" size={24} />
          </button>
        </div>

        {value.length === 0 ? (
          <AiEmptyState
            tone="dashed"
            text="Create triggers manually or allow our AI to select them for you."
            action="AI suggested triggers"
            onAction={() => alert('AI suggested triggers')}
          />
        ) : (
          <div className="lc-aep__panel">
            <div className="lc-aep__chips">
              {value.map((text) => (
                <Chip key={text} text={text} onRemove={() => onChange(value.filter((t) => t !== text))} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** One text box per guardrail, each with a delete button, and "+ Add Guardrail" at the foot. */
function Guardrails({ value, onChange, readOnly }: { value: string[]; onChange: (next: string[]) => void; readOnly?: boolean }) {
  if (readOnly) {
    return (
      <section className="lc-aep__section">
        <SectionHead title="Agent Guardrails" description="Define what your agent should avoid or enforce" />
        <div className="lc-aep__field">
          {value.length === 0 ? (
            <EmptyInVersion what="guardrails" />
          ) : (
            <div className="lc-aep__panel">
              {value.map((text, i) => (
                <p key={i} className="lc-aep__guardrail-static">
                  {text}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="lc-aep__section">
      <SectionHead
        title="Agent Guardrails"
        description="Define what your agent should avoid or enforce"
        action={value.length > 0 && <AiButton label="AI suggested guardrails" onClick={() => alert('AI suggested guardrails')} />}
      />
      <div className="lc-aep__field">
        {value.length === 0 ? (
          <>
            <AiEmptyState
              tone="soft"
              text="Add triggers by typing in or let our AI curate it for you"
              action="AI suggested guardrails"
              onAction={() => alert('AI suggested guardrails')}
            />
            <Button variant="outline" size="xs" className="lc-aep__add" leftSection={<Icon name="plus" />} onClick={() => onChange([...value, ''])}>
              Add Guardrail
            </Button>
          </>
        ) : (
          <div className="lc-aep__panel">
            {value.map((text, i) => (
              <div key={i} className="lc-aep__guardrail">
                <span className="lc-aep__guardrail-box">
                  <input
                    className="lc-aep__guardrail-input"
                    aria-label={`Guardrail ${i + 1}`}
                    autoComplete="off"
                    value={text}
                    onChange={(e) => onChange(value.map((g, j) => (j === i ? e.currentTarget.value : g)))}
                  />
                  <button
                    type="button"
                    className="lc-aep__guardrail-ai"
                    aria-label={`Rewrite guardrail ${i + 1} with AI`}
                    title="Rewrite with AI"
                    onClick={() => alert('Rewrite with AI')}
                  >
                    <Icon name="sparkle" size={16} />
                  </button>
                </span>
                <button
                  type="button"
                  className="lc-aep__remove"
                  aria-label={`Delete guardrail ${i + 1}`}
                  title="Delete guardrail"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                >
                  <Icon name="trash" size={20} />
                </button>
              </div>
            ))}
            <div className="lc-aep__panel-foot">
              <button type="button" className="lc-aep__add-guardrail" onClick={() => onChange([...value, ''])}>
                <Icon name="plus" size={16} />
                Add Guardrail
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

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

/** A textarea with a Bold / Italic / Strikethrough / emoji strip and a character count. */
function PromptEditor({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const area = useRef<HTMLTextAreaElement>(null);

  /** Replaces the selection with `wrap(selected)`, keeping the caret after it. */
  const edit = (wrap: (selected: string) => string) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: from, selectionEnd: to } = el;
    const inserted = wrap(value.slice(from, to));
    onChange(value.slice(0, from) + inserted + value.slice(to));
    const caret = from + inserted.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="lc-aep__editor">
      <textarea
        ref={area}
        aria-label="Description (Prompt)"
        aria-required="true"
        aria-invalid={isPromptEmpty({ prompt: value }) || undefined}
        className="lc-aep__textarea"
        rows={9}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
      <div className="lc-aep__toolbar">
        {FORMATS.map(({ label, glyph, mark }) => (
          <button
            key={label}
            type="button"
            className={`lc-aep__fmt lc-aep__fmt--${label.toLowerCase()}`}
            aria-label={label}
            title={label}
            onClick={() => edit((s) => `${mark}${s}${mark}`)}
          >
            {glyph}
          </button>
        ))}
        <span className="lc-aep__sep" aria-hidden="true" />
        <Menu
          ariaLabel="Insert emoji"
          items={EMOJIS.map((emoji) => ({ label: emoji, onClick: () => edit(() => emoji) }))}
          trigger={({ ref, onClick }) => (
            <button ref={ref} type="button" className="lc-aep__fmt" aria-label="Insert emoji" title="Insert emoji" onClick={onClick}>
              <Icon name="mood-smile" size={16} />
            </button>
          )}
        />
        <span className="lc-aep__count">{value.length} characters</span>
      </div>
    </div>
  );
}

/** The agent's prompt: read-only until the edit button opens the editor. */
function PromptCard({ value, onChange, readOnly }: { value: string; onChange: (next: string) => void; readOnly?: boolean }) {
  const [editing, setEditing] = useState(false);
  const empty = isPromptEmpty({ prompt: value });

  if (readOnly) {
    return (
      <aside className="lc-aep__prompt">
        <div className="lc-aep__prompt-head">
          <h2 className="lc-aep__prompt-title">Prompt/Instruction</h2>
        </div>
        <p className="lc-aep__prompt-body" data-empty={empty || undefined}>
          {empty ? 'This version had no prompt.' : value}
        </p>
      </aside>
    );
  }

  return (
    <aside className="lc-aep__prompt" data-editing={editing || undefined}>
      <div className="lc-aep__prompt-head">
        <h2 className="lc-aep__prompt-title">Prompt/Instruction</h2>
        <button
          type="button"
          className="lc-aep__prompt-edit"
          aria-label={editing ? 'Done editing prompt' : 'Edit prompt'}
          aria-pressed={editing}
          onClick={() => setEditing((on) => !on)}
        >
          <Icon name={editing ? 'circle-check' : 'edit-square'} size={20} />
        </button>
      </div>
      {editing ? (
        <PromptEditor value={value} onChange={onChange} />
      ) : (
        <p className="lc-aep__prompt-body" data-empty={empty || undefined}>
          {empty ? 'No prompt yet — add one to publish this agent.' : value}
        </p>
      )}
      {empty && <p className="lc-aep__error">Describe what the agent does to publish it.</p>}
    </aside>
  );
}

function GeneralTab({
  setup,
  onChange,
  readOnly,
}: {
  setup: AgentSetup;
  onChange: (patch: Partial<AgentSetup>) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="lc-aep__cols">
      <div className="lc-aep__main">
        <TriggerExamples value={setup.triggers} onChange={(triggers) => onChange({ triggers })} readOnly={readOnly} />
        <hr className="lc-aep__rule" />
        <Guardrails value={setup.guardrails} onChange={(guardrails) => onChange({ guardrails })} readOnly={readOnly} />
        <hr className="lc-aep__rule" />
        <ThinkingFlows value={setup.flows ?? []} onChange={(flows) => onChange({ flows })} readOnly={readOnly} />
      </div>
      <PromptCard value={setup.prompt} onChange={(prompt) => onChange({ prompt })} readOnly={readOnly} />
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
            <GeneralTab setup={shown} onChange={onChange} readOnly={!!viewing} />
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
