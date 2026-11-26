/**
 * The blocks an Agent's and a Task's edit page have in common: the section head, the AI
 * shortcut and its empty states, the trigger-example box, the one-box-per-line list editor
 * behind both pages' guardrails, and the Prompt/Instruction card.
 *
 * They were the Agent editor's, and both pages still draw them with its `lc-aep` classes, so
 * the two editors stay one screen family (see AgentEditPage.css, which this module loads).
 */
import { useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { Icon } from '../icons';
import { PromptModal } from './PromptModal';
import './AgentEditPage.css';


/** The prompt can be published once it says something. */
export const isPromptEmpty = ({ prompt }: { prompt: string }) => prompt.trim() === '';

/**
 * Section title + one line of help, above each block of the General tab. Once the block has
 * content, its AI shortcut moves up here from the empty state.
 */
export function SectionHead({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
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
export function AiButton({ label, onClick }: { label: string; onClick: () => void }) {
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
export function AiEmptyState({
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
export function Chip({ text, onRemove }: { text: string; onRemove?: () => void }) {
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
export function EmptyInVersion({ what }: { what: string }) {
  return <p className="lc-aep__none">No {what} in this version.</p>;
}

/** Add-one-at-a-time box for the messages that should hand the chat to this agent or task. */
export function TriggerExamples({
  value,
  onChange,
  readOnly,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
}) {
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

/** What a `ListEditor` calls itself: the Agent's and the Task's guardrails read differently. */
export interface ListEditorCopy {
  title: string;
  description: string;
  /** Names one row, e.g. "guardrail": used for the inputs' labels and the add button. */
  item: string;
  /** The AI shortcut's label, e.g. "AI suggested guardrails". */
  aiAction: string;
  /** The line inside the empty panel, above that shortcut. */
  emptyText: string;
  /** The soft green panel (guardrails) or the dashed grey one (triggers). */
  tone?: 'dashed' | 'soft';
}

/**
 * One text box per line, each with an AI rewrite and a delete button, and "+ Add <item>" at the
 * foot. Behind the Agent's and the Task's guardrails, and the Task's flow instructions.
 */
export function ListEditor({
  copy,
  value,
  onChange,
  readOnly,
}: {
  copy: ListEditorCopy;
  value: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
}) {
  const { title, description, item, aiAction, emptyText, tone = 'soft' } = copy;
  // "Add Guardrail" is a button, so `item` is capitalised; mid-sentence labels lower it again.
  const lower = item.toLowerCase();
  const plural = `${lower}s`;

  if (readOnly) {
    return (
      <section className="lc-aep__section">
        <SectionHead title={title} description={description} />
        <div className="lc-aep__field">
          {value.length === 0 ? (
            <EmptyInVersion what={plural} />
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
        title={title}
        description={description}
        action={value.length > 0 && <AiButton label={aiAction} onClick={() => alert(aiAction)} />}
      />
      <div className="lc-aep__field">
        {value.length === 0 ? (
          <>
            <AiEmptyState tone={tone} text={emptyText} action={aiAction} onAction={() => alert(aiAction)} />
            <Button variant="outline" size="xs" className="lc-aep__add" leftSection={<Icon name="plus" />} onClick={() => onChange([...value, ''])}>
              Add {item}
            </Button>
          </>
        ) : (
          <div className="lc-aep__panel">
            {value.map((text, i) => (
              <div key={i} className="lc-aep__guardrail">
                <span className="lc-aep__guardrail-box">
                  <input
                    className="lc-aep__guardrail-input"
                    aria-label={`${item} ${i + 1}`}
                    autoComplete="off"
                    value={text}
                    onChange={(e) => onChange(value.map((g, j) => (j === i ? e.currentTarget.value : g)))}
                  />
                  <button
                    type="button"
                    className="lc-aep__guardrail-ai"
                    aria-label={`Rewrite ${lower} ${i + 1} with AI`}
                    title="Rewrite with AI"
                    onClick={() => alert('Rewrite with AI')}
                  >
                    <Icon name="sparkle" size={16} />
                  </button>
                </span>
                <button
                  type="button"
                  className="lc-aep__remove"
                  aria-label={`Delete ${lower} ${i + 1}`}
                  title={`Delete ${lower}`}
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                >
                  <Icon name="trash" size={20} />
                </button>
              </div>
            ))}
            <div className="lc-aep__panel-foot">
              <button type="button" className="lc-aep__add-guardrail" onClick={() => onChange([...value, ''])}>
                <Icon name="plus" size={16} />
                Add {item}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * The agent's or task's prompt. The card only reads it: a click anywhere on it, or on its
 * edit button, opens the dialog that writes it (Figma 2772:16964, whose hover state is the
 * blue stroke this card takes on). Read-only versions get the text alone.
 */
export function PromptCard({
  value,
  onChange,
  readOnly,
  /** What the prompt belongs to, for the copy that asks for one: "agent" or "task". */
  what = 'agent',
  /** The agent's or task's name, which titles the dialog. */
  name = '',
}: {
  value: string;
  onChange: (next: string) => void;
  readOnly?: boolean;
  what?: string;
  name?: string;
}) {
  // Bumped on each opening, so the dialog starts afresh from the saved prompt; it stays
  // mounted while `open` is false so the Modal can play its exit.
  const [opening, setOpening] = useState(0);
  const [open, setOpen] = useState(false);
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

  const openDialog = () => {
    setOpening((n) => n + 1);
    setOpen(true);
  };

  return (
    <>
      {/* The whole card opens the dialog, as the design's hover state says it does, while the
          edit button stays the control a keyboard reaches. Reading the prompt often means
          selecting a line of it, so a click that ends a selection is left alone. */}
      <aside
        className="lc-aep__prompt"
        data-clickable="true"
        onClick={() => {
          if (!document.getSelection()?.toString()) openDialog();
        }}
      >
        <div className="lc-aep__prompt-head">
          <h2 className="lc-aep__prompt-title">Prompt/Instruction</h2>
          <button type="button" className="lc-aep__prompt-edit" aria-label="Edit prompt" onClick={openDialog}>
            <Icon name="edit-square" size={20} />
          </button>
        </div>
        <p className="lc-aep__prompt-body" data-empty={empty || undefined}>
          {empty ? `No prompt yet, add one to publish this ${what}.` : value}
        </p>
        {empty && <p className="lc-aep__error">Describe what the {what} does to publish it.</p>}
      </aside>

      <PromptModal
        key={opening}
        open={open}
        onClose={() => setOpen(false)}
        onSave={(next) => {
          onChange(next);
          setOpen(false);
        }}
        value={value}
        what={what}
        name={name || `This ${what}`}
      />
    </>
  );
}
