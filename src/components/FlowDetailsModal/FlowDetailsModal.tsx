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
import { Button } from '../Button';
import { Modal, ModalSwitch, ModalTextField, ModalTextarea } from '../Modal';

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
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Button
          variant="filled"
          color="primary"
          size="sm"
          onClick={() => onSave?.({ name, active, description })}
        >
          Save
        </Button>
      }
    >
      <ModalTextField label="Flow name" required value={name} onChange={setName} />

      <div className="lc-modal__callout">
        <ModalSwitch
          checked={active}
          onChange={(next) => {
            setActive(next);
            onActiveChange?.(next);
          }}
          label="Make flow active / inactive"
        />
      </div>

      <div className="lc-modal__row lc-modal__row--end">
        <ModalTextField label="Flow Id" required disabled value={flowId} />
        <Button
          variant="default"
          color="primary"
          size="sm"
          textTransform="none"
          onClick={() => onCopyFlowId?.(flowId)}
        >
          Copy
        </Button>
      </div>

      <ModalTextarea
        label="Description"
        placeholder="Type in a description of your flow"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
      />
    </Modal>
  );
}

export default FlowDetailsModal;
