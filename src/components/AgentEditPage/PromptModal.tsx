/**
 * The Prompt/Instruction editor, in the dialog the prompt card opens (Figma "Agentic Bot
 * Builder", nodes 2772:16868 for the dialog and 2772:17164 for the editor inside it).
 *
 * The card itself only reads the prompt; everything that writes one lives here: the V3 rich
 * text editor, "Generate new prompt" beside the title, "Improve" at the right of its toolbar,
 * and Close / Save. Edits are the dialog's own until Save, so Close leaves the prompt as it
 * was.
 *
 * Drawn with the Agent editor's `lc-aep` classes like the rest of this family.
 */
import { useState } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { RichTextField } from '../BotSettings';
import { Icon } from '../icons';
import { StepLoader } from './sections';
import './AgentEditPage.css';

/** How long each loading message holds. Immediate under tests so they needn't wait. */
const STEP_MS = import.meta.env.MODE === 'test' ? 0 : 900;

/** An AI action in flight: what it says it is doing, and the prompt it leaves behind. */
interface Thinking {
  steps: string[];
  next: string;
}

/**
 * What generating a prompt says it is doing, one message per variant of the loading container
 * in Figma (2798:2173). The first names what is being read, so a task says "task".
 */
const generateSteps = (what: string) => [
  `Analyzing the ${what.charAt(0).toUpperCase()}${what.slice(1)}...`,
  'Collecting data and information...',
  'Reviewing flows...',
  'Preparing prompt...',
];

const improveSteps = ['Reviewing the prompt...', 'Preparing prompt...'];

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

/** The note Improve asks for, in the panel it opens over the end of the toolbar. */
function ImproveNote({ onImprove, onCancel }: { onImprove: (note: string) => void; onCancel: () => void }) {
  const [note, setNote] = useState('');

  return (
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
          if (e.key === 'Escape') onCancel();
        }}
      />
      <Button
        size="xs"
        aria-label="Improve with this note"
        disabled={note.trim() === ''}
        onClick={() => onImprove(note.trim())}
      >
        Improve
      </Button>
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
  const [improving, setImproving] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${name} Prompt`}
      // Wider than the Modal's default, and capped to the window: the overlay centres the card
      // in a grid column that would otherwise grow past a narrow screen.
      style={{ width: 'min(1020px, calc(100vw - 32px))' }}
      className="lc-aep__dialog"
      surface="framed"
      headerAction={
        <Button
          className="lc-aep__generate"
          leftSection={<Icon name="wand" size={16} />}
          disabled={!!thinking}
          onClick={() => setThinking({ steps: generateSteps(what), next: generatedPrompt(what, name) })}
        >
          Generate new prompt
        </Button>
      }
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
      {thinking ? (
        // The loader owns the wait: the prompt lands when it has been through its messages.
        <StepLoader
          steps={thinking.steps}
          stepMs={STEP_MS}
          className="lc-aep__thinking"
          onDone={() => {
            setDraft(thinking.next);
            setThinking(null);
          }}
        />
      ) : (
        <div className="lc-aep__improve">
          <RichTextField
            value={draft}
            onChange={setDraft}
            label="Description (Prompt)"
            placeholder={`Describe what this ${what} does.`}
            onImprove={() => setImproving((on) => !on)}
          />
          {improving && (
            <ImproveNote
              onCancel={() => setImproving(false)}
              onImprove={(note) => {
                setImproving(false);
                setThinking({ steps: improveSteps, next: improvedPrompt(draft, note) });
              }}
            />
          )}
        </div>
      )}
    </Modal>
  );
}

export default PromptModal;
