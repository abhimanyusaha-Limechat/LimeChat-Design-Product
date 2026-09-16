/**
 * PublishFlowModal — LimeChat design system (Figma node 135:8061, "Publish flow").
 *
 * Confirmation dialog shown when publishing a marketing flow. Lets the user
 * review the Do-Not-Disturb window (on/off + From / For) and pick a retry
 * timing before confirming.
 *
 *   <PublishFlowModal
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     retryOptions={['Immediately', 'After 30 minutes', 'After 1 hour']}
 *     onPublish={(v) => publish(v)}
 *   />
 *
 * Presentation + light local form state — the committed values come back through
 * `onPublish`. Built on the shared `<Modal>` shell.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { NativeSelect } from '../Select';
import { Modal, ModalSwitch, ModalStepper } from '../Modal';

export interface PublishFlowValues {
  /** DND window enabled. */
  dndEnabled: boolean;
  /** Start of the DND window, "HH : MM" (24h). */
  from: string;
  /** DND duration in hours. */
  forHours: number;
  /** Selected retry-timing option value (`''` when none picked). */
  retry: string;
}

export interface PublishFlowModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the current values when "Publish" is clicked. */
  onPublish?: (values: PublishFlowValues) => void;
  title?: string;
  description?: ReactNode;
  /** Footer button label. Default `'Publish'`. */
  submitLabel?: string;
  /** Options for the "Select retry timing" dropdown. */
  retryOptions?: string[];
  retryPlaceholder?: string;
  defaults?: Partial<PublishFlowValues>;
}

function stepTime(value: string, dir: 1 | -1): string {
  const m = /^(\d{1,2})\s*:\s*(\d{1,2})$/.exec(value.trim());
  const base = m ? Number(m[1]) * 60 + Number(m[2]) : 0;
  const next = (((base + dir * 15) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(next / 60)).padStart(2, '0');
  const mm = String(next % 60).padStart(2, '0');
  return `${hh} : ${mm}`;
}

export function PublishFlowModal({
  open,
  onClose,
  onPublish,
  title = 'Publish flow',
  description = 'Activating this flow will initiate the process. Kindly verify the Do Not Disturb and Retry configurations once more.',
  submitLabel = 'Publish',
  retryOptions = [],
  retryPlaceholder = 'Choose timings from dropdown',
  defaults,
}: PublishFlowModalProps) {
  const [dndEnabled, setDndEnabled] = useState(defaults?.dndEnabled ?? true);
  const [from, setFrom] = useState(defaults?.from ?? '20 : 14');
  const [forHours, setForHours] = useState(defaults?.forHours ?? 2);
  const [retry, setRetry] = useState(defaults?.retry ?? '');

  // Snapshot the incoming defaults each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setDndEnabled(defaults?.dndEnabled ?? true);
    setFrom(defaults?.from ?? '20 : 14');
    setForHours(defaults?.forHours ?? 2);
    setRetry(defaults?.retry ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <Button
          variant="filled"
          color="primary"
          size="sm"
          onClick={() => onPublish?.({ dndEnabled, from, forHours, retry })}
        >
          {submitLabel}
        </Button>
      }
    >
      <ModalSwitch
        checked={dndEnabled}
        onChange={setDndEnabled}
        label="Turn on / off DND timings"
      />
      <div className="lc-modal__row">
        <ModalStepper
          label="From (24 H)"
          value={from}
          disabled={!dndEnabled}
          onChange={setFrom}
          onStep={(dir) => setFrom((v) => stepTime(v, dir))}
        />
        <ModalStepper
          label="For (in Hours)"
          value={String(forHours)}
          inputMode="numeric"
          disabled={!dndEnabled}
          onChange={(v) => setForHours(Math.max(0, Number(v.replace(/\D/g, '')) || 0))}
          onStep={(dir) => setForHours((h) => Math.max(0, h + dir))}
        />
      </div>

      <NativeSelect
        label="Select retry timing"
        placeholder={retryPlaceholder}
        size="sm"
        fullWidth
        data={retryOptions}
        value={retry}
        onChange={(e) => setRetry(e.currentTarget.value)}
      />
    </Modal>
  );
}

export default PublishFlowModal;
