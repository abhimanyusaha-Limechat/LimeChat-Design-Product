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
import { useEffect, useState } from 'react';
import { Button, Group, Modal, NumberInput, Select, Stack, Switch, TimeInput } from 'arceus';

export interface PublishFlowValues {
  /** DND window enabled. */
  dndEnabled: boolean;
  /** Start of the DND window, "HH:mm" (24h). */
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
  description?: string;
  /** Footer button label. Default `'Publish'`. */
  submitLabel?: string;
  /** Options for the "Select retry timing" dropdown. */
  retryOptions?: string[];
  retryPlaceholder?: string;
  defaults?: Partial<PublishFlowValues>;
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
  const [from, setFrom] = useState(defaults?.from ?? '20:14');
  const [forHours, setForHours] = useState(defaults?.forHours ?? 2);
  const [retry, setRetry] = useState(defaults?.retry ?? '');

  // Snapshot the incoming defaults each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setDndEnabled(defaults?.dndEnabled ?? true);
    setFrom(defaults?.from ?? '20:14');
    setForHours(defaults?.forHours ?? 2);
    setRetry(defaults?.retry ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      centered
      opened={open}
      onClose={onClose}
      title={title}
      description={description}
    >
      <Stack gap="md">
      <Switch
        checked={dndEnabled}
        onChange={(e) => setDndEnabled(e.currentTarget.checked)}
        label="Turn on / off DND timings"
      />
      <Group grow align="flex-start">
        <TimeInput
          label="From (24 H)"
          value={from}
          disabled={!dndEnabled}
          onChange={(e) => setFrom(e.currentTarget.value)}
        />
        <NumberInput
          label="For (in Hours)"
          value={forHours}
          min={0}
          allowDecimal={false}
          disabled={!dndEnabled}
          onChange={(v) => setForHours(Math.max(0, Number(v) || 0))}
        />
      </Group>

      <Select
        label="Select retry timing"
        placeholder={retryPlaceholder}
        size="sm"
        w="100%"
        data={retryOptions}
        value={retry || null}
        onChange={(v) => setRetry((v ?? ''))}
      />
      </Stack>
      <Modal.Footer><Button
          variant="filled"
          color="primary"
          size="sm"
          onClick={() => onPublish?.({ dndEnabled, from, forHours, retry })}
        >
          {submitLabel}
        </Button></Modal.Footer>
    </Modal>
  );
}

export default PublishFlowModal;
