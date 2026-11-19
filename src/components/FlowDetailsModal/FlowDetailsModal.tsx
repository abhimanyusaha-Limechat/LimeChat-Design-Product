/**
 * FlowDetailsModal — LimeChat design system (Figma node 195:59804, "Flow details").
 *
 * Opened from the canvas "Rename flow" pencil. Edit the flow name, toggle
 * active/inactive, copy the (read-only) flow id, and edit the description.
 *
 *   <FlowDetailsModal
 *     open={open}
 *     onClose={close}
 *     defaults={{ name: 'Welcome series', flowId: '123456677', active: true }}
 *     onSave={(v) => save(v)}
 *   />
 *
 * Built on the shared `<Modal>` shell.
 */
import { useEffect, useState } from 'react';
import { Button, Group, Modal, Paper, Stack, Switch, TextInput, Textarea } from 'arceus';

export interface FlowDetailsValues {
  name: string;
  active: boolean;
  description: string;
}

export interface FlowDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (values: FlowDetailsValues) => void;
  /** Fires immediately when the active / inactive switch is toggled. */
  onActiveChange?: (active: boolean) => void;
  onCopyFlowId?: (flowId: string) => void;
  title?: string;
  defaults?: Partial<FlowDetailsValues> & { flowId?: string };
}

export function FlowDetailsModal({
  open,
  onClose,
  onSave,
  onActiveChange,
  onCopyFlowId,
  title = 'Flow details',
  defaults,
}: FlowDetailsModalProps) {
  const flowId = defaults?.flowId ?? '';
  const [name, setName] = useState(defaults?.name ?? '');
  const [active, setActive] = useState(defaults?.active ?? true);
  const [description, setDescription] = useState(defaults?.description ?? '');

  // Snapshot the incoming defaults each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setName(defaults?.name ?? '');
    setActive(defaults?.active ?? true);
    setDescription(defaults?.description ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      centered
      opened={open}
      onClose={onClose}
      title={title}
    >
      <Stack gap="md">
      <TextInput label="Flow name" required value={name} onChange={(e) => setName(e.currentTarget.value)} />

      <Paper withBorder p="sm" radius="xs" bg="var(--mantine-color-primary-0)">
        <Switch
          checked={active}
          onChange={(e) => {
            const next = e.currentTarget.checked;
            setActive(next);
            onActiveChange?.(next);
          }}
          label="Make flow active / inactive"
        />
      </Paper>

      <Group align="flex-end" wrap="nowrap">
        <TextInput label="Flow Id" required disabled value={flowId} />
        <Button
          variant="default"
          color="primary"
          size="sm"
          onClick={() => onCopyFlowId?.(flowId)}
        >
          Copy
        </Button>
      </Group>

      <Textarea
        minRows={3}
        label="Description"
        placeholder="Type in a description of your flow"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
      />
      </Stack>
      <Modal.Footer><Button
          variant="filled"
          color="primary"
          size="sm"
          onClick={() => onSave?.({ name, active, description })}
        >
          Save
        </Button></Modal.Footer>
    </Modal>
  );
}

export default FlowDetailsModal;
