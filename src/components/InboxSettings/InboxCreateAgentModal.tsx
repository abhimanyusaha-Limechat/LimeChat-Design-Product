/**
 * Create a brand-new agent for the account, optionally adding them to the inbox being
 * edited. Mounted only while open, so each opening starts with an empty form.
 */
import { useId, useState, type FormEvent } from 'react';
import { Button } from '../Button';
import { Modal, ModalCheckbox, ModalTextField } from '../Modal';
import { NativeSelect } from '../Select';

export interface NewAgent {
  name: string;
  email: string;
  role: string;
  addToInbox: boolean;
}

export const AGENT_ROLES = ['Agent', 'Administrator'];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateAgentModal({
  existingEmails,
  onClose,
  onCreate,
}: {
  /** Lower-cased emails already on the account. */
  existingEmails: string[];
  onClose: () => void;
  onCreate: (agent: NewAgent) => void;
}) {
  const formId = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(AGENT_ROLES[0]);
  const [addToInbox, setAddToInbox] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const trimmedEmail = email.trim();
  const emailError = !EMAIL.test(trimmedEmail)
    ? 'Enter a valid email address.'
    : existingEmails.includes(trimmedEmail.toLowerCase())
      ? 'An agent with this email already exists.'
      : undefined;
  const nameError = name.trim() ? undefined : 'Enter the agent’s name.';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameError || emailError) return;
    onCreate({ name: name.trim(), email: trimmedEmail, role, addToInbox });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Create agent"
      description="They'll get an email invite to set up their account."
      footer={
        <>
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button type="submit" form={formId}>Create agent</Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="lc-inbs__create-form">
        <ModalTextField label="Full name" required value={name} onChange={setName} autoComplete="off" error={submitted ? nameError : undefined} />
        <ModalTextField label="Email address" required type="email" value={email} onChange={setEmail} autoComplete="off" error={submitted ? emailError : undefined} />
        <NativeSelect
          label="Role"
          size="sm"
          fullWidth
          data={AGENT_ROLES}
          value={role}
          onChange={(e) => setRole(e.currentTarget.value)}
        />
        <ModalCheckbox checked={addToInbox} onChange={setAddToInbox} label="Add to this inbox" />
      </form>
    </Modal>
  );
}
