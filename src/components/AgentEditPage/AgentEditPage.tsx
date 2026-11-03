/**
 * AgentEditPage — Automation → Agents → Customise: one agent's Prompts and Tasks, in the Settings
 * page shell (back arrow, editable name, Saved chip, Publish). Controlled: every edit goes out
 * through `onChange`; the caller keeps the draft and publishes it.
 *
 *   <AgentEditPage agent={agent} setup={setup} onChange={patch} onBack={close} onPublish={publish} canPublish />
 */
import { useRef, useState, type ReactNode } from 'react';
import type { AgentCardData } from '../AgentsHomePage';
import { Button } from '../Button';
import { HeaderSwitch, SectionHeading } from '../InboxSettings';
import { Menu } from '../Menu';
import { SettingsPage } from '../SettingsPage';
import { TagsInput } from '../TagsInput';
import { Icon } from '../icons';
import './AgentEditPage.css';

/** What the Prompts tab edits, besides the agent's name and status. */
export interface AgentSetup {
  /** The agent's description prompt; WhatsApp-style marks: *bold*, _italic_, ~strike~. */
  prompt: string;
  guardrails: string[];
  /** Example messages that should activate the agent. */
  triggers: string[];
}

export type AgentPatch = Partial<AgentSetup & Pick<AgentCardData, 'name' | 'status'>>;

type Tab = 'prompts' | 'tasks';
const TABS: { id: Tab; label: string }[] = [
  { id: 'prompts', label: 'Prompts' },
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

/** One text box per guardrail, each with a delete button, and "+ Add Guardrail" at the foot. */
function Guardrails({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="lc-aep__stack">
      {value.map((text, i) => (
        <div key={i} className="lc-aep__guardrail">
          <input
            className="lc-inbs__input"
            aria-label={`Guardrail ${i + 1}`}
            autoComplete="off"
            value={text}
            onChange={(e) => onChange(value.map((g, j) => (j === i ? e.currentTarget.value : g)))}
          />
          <button
            type="button"
            className="lc-aep__remove"
            aria-label={`Delete guardrail ${i + 1}`}
            title="Delete guardrail"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      ))}
      <Button variant="outline" size="xs" className="lc-aep__add" leftSection={<Icon name="plus" />} onClick={() => onChange([...value, ''])}>
        Add Guardrail
      </Button>
    </div>
  );
}

/** A titled section: one bordered table holding a single stacked row. */
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="lc-inbs__group">
      <SectionHeading title={title} description={description} />
      <div className="lc-inbs__table">
        <div className="lc-inbs__row lc-inbs__row--stacked">{children}</div>
      </div>
    </div>
  );
}

const RowLabel = ({ label, description }: { label: string; description: string }) => (
  <div className="lc-inbs__row-label">
    <span className="lc-inbs__label">{label}</span>
    <p className="lc-inbs__row-desc">{description}</p>
  </div>
);

function PromptsTab({ setup, onChange }: { setup: AgentSetup; onChange: (patch: Partial<AgentSetup>) => void }) {
  return (
    <>
      <Section title="Agent Prompts" description="Tell the agent what it is responsible for.">
        <RowLabel label="Description (Prompt) *" description="What the agent does, and what it should leave alone." />
        <PromptEditor value={setup.prompt} onChange={(prompt) => onChange({ prompt })} />
        {isPromptEmpty(setup) && <p className="lc-aep__error">Describe what the agent does to publish it.</p>}
      </Section>

      <Section title="Agent Guardrails" description="Rules the agent must always follow.">
        <RowLabel label="Add Guardrails" description="Define safety and behavioural constraints for the agent" />
        <Guardrails value={setup.guardrails} onChange={(guardrails) => onChange({ guardrails })} />
      </Section>

      <Section title="Agent Trigger Examples" description="Sample customer messages that should hand the chat to this agent.">
        <TagsInput
          label="Provide examples of triggers that activate the agent"
          placeholder="Enter a trigger example"
          data={[]}
          creatable
          className="lc-aep__tags"
          value={setup.triggers}
          onChange={(triggers) => onChange({ triggers })}
        />
      </Section>
    </>
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
  const [tab, setTab] = useState<Tab>('prompts');
  return (
    <SettingsPage
      title={agent.name}
      onBack={onBack}
      onTitleChange={(name) => onChange({ name })}
      headerActions={
        <>
          <HeaderSwitch
            label={agent.status === 'active' ? 'Active' : 'Disabled'}
            checked={agent.status === 'active'}
            onChange={(on) => onChange({ status: on ? 'active' : 'disabled' })}
          />
          <span className="lc-aep__saved">
            Saved <Icon name="circle-check" size={14} />
          </span>
          <Button
            variant="filled"
            color="primary"
            size="sm"
            leftSection={<Icon name="rocket" />}
            disabled={!canPublish || !agent.name.trim() || isPromptEmpty(setup)}
            onClick={onPublish}
          >
            Publish
          </Button>
        </>
      }
    >
      <div className="lc-inbs-shell" data-anchor="agent-edit-page">
        <div className="lc-inbs">
          <div className="lc-inbs__tabbar">
            <div className="lc-inbs__tabs" role="tablist" aria-label="Agent settings">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={t.id === tab}
                  className="lc-inbs__tab"
                  data-active={t.id === tab || undefined}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="lc-inbs__panel" role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
            {tab === 'prompts' && <PromptsTab setup={setup} onChange={onChange} />}
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}

export default AgentEditPage;
