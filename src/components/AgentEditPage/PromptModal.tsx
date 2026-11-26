/**
 * The Prompt/Instruction editor, in the dialog the prompt card opens (Figma "Agentic Bot
 * Builder", nodes 2772:16868 for the dialog and 2772:17164 for the editor inside it).
 *
 * The card itself only reads the prompt; everything that writes one lives here: the text
 * area with its formatting strip, "Generate new prompt" in the header, "Improve" at the
 * foot of the strip, and Close / Save. Edits are the dialog's own until Save, so Close
 * leaves the prompt as it was.
 *
 * Drawn with the Agent editor's `lc-aep` classes like the rest of this family.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { Menu } from '../Menu';
import { Modal } from '../Modal';
import { Icon } from '../icons';
import './AgentEditPage.css';

const FORMATS = [
  { label: 'Bold', glyph: 'B', mark: '*' },
  { label: 'Italic', glyph: 'I', mark: '_' },
  { label: 'Strikethrough', glyph: 'S', mark: '~' },
];
const EMOJIS = ['🙂', '👍', '🙏', '🎉', '❤️', '😊'];

/** How long the demo lets an AI action think. Immediate under tests so they needn't wait. */
const THINK_MS = import.meta.env.MODE === 'test' ? 0 : 1400;

/** An AI action in flight: what to say while it runs, and the prompt it leaves behind. */
interface Thinking {
  label: string;
  next: string;
}

/**
 * ponytail: no model writes these yet. "Generate" hands back a prompt in the shape a real
 * one takes, and "Improve" folds the note into the prompt as a line of its own.
 */
const generatedPrompt = (what: string, name: string) =>
  [
    `${name} is the first stop for every conversation this ${what} is given.`,
    'It reads what the customer is asking for, keeps the conversation inside what this workspace supports, and hands the request on to whichever flow can finish it.',
    'Where a request falls outside that scope, it says so plainly and offers to bring in a human.',
  ].join('\n\n');

const improvedPrompt = (prompt: string, note: string) => `${prompt.trim()}\n\n${note.trim()}`;

/** A textarea with a Bold / Italic / Strikethrough / emoji strip and a character count. */
function PromptEditor({
  value,
  onChange,
  action,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Sits at the right of the formatting strip; the Improve button goes here. */
  action?: ReactNode;
}) {
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
        aria-invalid={value.trim() === '' || undefined}
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
        {action}
      </div>
    </div>
  );
}

/** The note the Improve button asks for, in the small panel it opens over the editor. */
function ImproveButton({ onImprove, disabled }: { onImprove: (note: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  const submit = () => {
    const text = note.trim();
    if (!text) return;
    onImprove(text);
    setNote('');
    setOpen(false);
  };

  return (
    <div className="lc-aep__improve">
      <button
        type="button"
        className="lc-aep__ai-btn lc-aep__improve-btn"
        /* The panel's own button says "Improve" too, so this one says what it opens. */
        aria-label="Improve with AI"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((on) => !on)}
      >
        <Icon name="wand" size={14} />
        <span className="lc-aep__ai-label">Improve</span>
      </button>
      {open && (
        <div className="lc-aep__improve-panel">
          <textarea
            className="lc-aep__improve-input"
            aria-label="Tell us what we need to improve"
            placeholder="Tell us what we need to improve"
            rows={3}
            autoFocus
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
            }}
          />
          <Button size="xs" onClick={submit} disabled={note.trim() === ''}>
            Improve
          </Button>
        </div>
      )}
    </div>
  );
}

export function PromptModal({
  open,
  onClose,
  onSave,
  value,
  /** What the prompt belongs to: "agent" or "task". */
  what,
  /** The agent's or task's name, which titles the dialog. */
  name,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (next: string) => void;
  value: string;
  what: string;
  name: string;
}) {
  // The dialog is keyed on each opening, so this starts from the saved prompt every time.
  const [draft, setDraft] = useState(value);
  const [thinking, setThinking] = useState<Thinking | null>(null);

  useEffect(() => {
    if (!thinking) return;
    const timer = window.setTimeout(() => {
      setDraft(thinking.next);
      setThinking(null);
    }, THINK_MS);
    return () => window.clearTimeout(timer);
  }, [thinking]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${name} Prompt`}
      // Wider than the Modal's default, and capped to the window: the overlay centres the card
      // in a grid column that would otherwise grow past a narrow screen.
      style={{ width: 'min(1020px, calc(100vw - 32px))' }}
      className="lc-aep__dialog"
      footer={
        <>
          <Button variant="subtle" color="red" onClick={onClose}>
            Close
          </Button>
          <Button size="md" onClick={() => onSave(draft)}>
            Save
          </Button>
        </>
      }
    >
      <div className="lc-aep__dialog-top">
        <Button
          leftSection={<Icon name="wand" size={16} />}
          disabled={!!thinking}
          onClick={() => setThinking({ label: `Analyzing the ${what}...`, next: generatedPrompt(what, name) })}
        >
          Generate new prompt
        </Button>
      </div>

      {thinking ? (
        <div className="lc-aep__editor lc-aep__thinking" role="status">
          <Icon name="sparkle" size={24} className="lc-aep__thinking-icon" />
          {thinking.label}
        </div>
      ) : (
        <PromptEditor
          value={draft}
          onChange={setDraft}
          action={
            <ImproveButton
              onImprove={(note) => setThinking({ label: 'Improving the prompt...', next: improvedPrompt(draft, note) })}
            />
          }
        />
      )}
    </Modal>
  );
}

export default PromptModal;
