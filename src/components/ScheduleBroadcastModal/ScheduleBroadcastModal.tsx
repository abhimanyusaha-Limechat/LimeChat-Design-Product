/**
 * ScheduleBroadcastModal — LimeChat design system (Figma node 267:18733,
 * "Publish or Schedule Modal" / "Schedule Your Broadcast Campaign").
 *
 * Opened from the Broadcast canvas' schedule card. Choose "Publish now" or
 * "Schedule for later" (with a date + time), then configure the retry window
 * for failed messages.
 *
 *   <ScheduleBroadcastModal
 *     open={open}
 *     onClose={close}
 *     defaults={{ mode: 'later', date: '2026-09-14', time: '10:30' }}
 *     onSetSchedule={(v) => save(v)}
 *   />
 *
 * Built on the shared `<Modal>` shell + its `ModalRadioOption` / `ModalCheckbox`
 * / `ModalStepper` primitives.
 */
import { useEffect, useState } from 'react';
import { ActionIcon, Button, Checkbox, DatePickerInput, Group, Modal, NumberInput, Paper, RadioCardGroup, Stack, Text, TimeInput } from 'arceus';

const EDIT_ICON_PATHS = ['M7 20h-4v-4l11.5 -11.5a2.121 2.121 0 0 1 3 3l-11.5 11.5', 'M13.5 6.5l3 3'];
const CALENDAR_ICON_PATHS = [
  'M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
  'M16 3l0 4',
  'M8 3l0 4',
  'M4 11l16 0',
];
const CLOCK_ICON_PATHS = ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 7v5l3 3'];

function Icon({ paths }: { paths: string[] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
const EditIcon = () => <Icon paths={EDIT_ICON_PATHS} />;
const CalendarIcon = () => <Icon paths={CALENDAR_ICON_PATHS} />;
const ClockIcon = () => <Icon paths={CLOCK_ICON_PATHS} />;

export interface ScheduleBroadcastValues {
  mode: 'now' | 'later';
  /** ISO date, e.g. "2026-09-14" — the native `<input type="date">` value. */
  date: string;
  /** 24h time, e.g. "10:30" — the native `<input type="time">` value. */
  time: string;
  retryEnabled: boolean;
  retryDays: number;
  retryHours: number;
}

export interface ScheduleBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the current values when "Set Schedule" is clicked. */
  onSetSchedule?: (values: ScheduleBroadcastValues) => void;
  /** Pencil icon in the quiet-hours banner. */
  onEditQuietHours?: () => void;
  quietHoursLabel?: string;
  title?: string;
  description?: string;
  defaults?: Partial<ScheduleBroadcastValues>;
}

const DEFAULTS: ScheduleBroadcastValues = {
  mode: 'later',
  date: '',
  time: '',
  retryEnabled: true,
  retryDays: 1,
  retryHours: 0,
};

export function ScheduleBroadcastModal({
  open,
  onClose,
  onSetSchedule,
  onEditQuietHours,
  quietHoursLabel = 'Retry messages will not be sent between 23:01 and 08:00',
  title = 'Schedule Your Broadcast Campaign',
  description = 'Choose when to trigger this broadcast',
  defaults,
}: ScheduleBroadcastModalProps) {
  const [values, setValues] = useState<ScheduleBroadcastValues>({ ...DEFAULTS, ...defaults });

  // Snapshot the incoming defaults each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setValues({ ...DEFAULTS, ...defaults });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof ScheduleBroadcastValues>(key: K, value: ScheduleBroadcastValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <Modal
      centered
      opened={open}
      onClose={onClose}
      title={title}
      size={638}
    >
      <Stack gap="md">
        {description && <Text variant="body-2" tone="light">{description}</Text>}

        <RadioCardGroup
          value={values.mode}
          onChange={(mode) => set('mode', mode === 'now' ? 'now' : 'later')}
          options={[
            { value: 'now', label: 'Publish now', description: 'Instantly publishes your broadcast' },
            { value: 'later', label: 'Schedule for later', description: 'Schedules your broadcast for a specific time' },
          ]}
        />

        {values.mode === 'later' && (
          <Group grow align="flex-start">
            <DatePickerInput
              label="Date"
              leftSection={<CalendarIcon />}
              value={values.date || null}
              onChange={(date) => set('date', typeof date === 'string' ? date : '')}
            />
            <TimeInput
              label="Time"
              leftSection={<ClockIcon />}
              value={values.time}
              onChange={(e) => set('time', e.currentTarget.value)}
            />
          </Group>
        )}

        <Paper withBorder p="md" radius="xs"><Stack gap="sm">
          <Checkbox
            checked={values.retryEnabled}
            onChange={(e) => set('retryEnabled', e.currentTarget.checked)}
            label="Retry Broadcast"
            description="Configure the retry automation time window to determine when all failed messages will be resent, optimizing for higher delivery rates."
          />

          <Group align="flex-end">
            <Text variant="body-2">Do retries for the next</Text>
            <NumberInput
              label="Days"
              value={values.retryDays}
              min={0}
              allowDecimal={false}
              disabled={!values.retryEnabled}
              onChange={(v) => set('retryDays', Math.max(0, Number(v) || 0))}
            />
            <NumberInput
              label="Hours"
              value={values.retryHours}
              min={0}
              allowDecimal={false}
              disabled={!values.retryEnabled}
              onChange={(v) => set('retryHours', Math.max(0, Number(v) || 0))}
            />
          </Group>

          <Group justify="space-between" wrap="nowrap">
            <Text variant="body-2">{quietHoursLabel}</Text>
            <ActionIcon variant="subtle" color="gray" aria-label="Edit quiet hours" onClick={onEditQuietHours}>
              <EditIcon />
            </ActionIcon>
          </Group>
        </Stack></Paper>
      </Stack>
      <Modal.Footer>
        <Button variant="filled" color="primary" size="sm" leftSection={<CalendarIcon />} onClick={() => onSetSchedule?.(values)}>
          Set Schedule
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ScheduleBroadcastModal;
