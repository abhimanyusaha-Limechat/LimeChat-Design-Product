/**
 * Create a brand-new agent for the account, optionally adding them to the inbox being
 * edited. Mounted only while open, so each opening starts with an empty form.
 */
import { useId, useState, type FormEvent } from 'react';
import { Button, Checkbox, Modal, NativeSelect, TextInput } from 'arceus';

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
      centered
      opened
      onClose={onClose}
      title="Create agent"
      description="They'll get an email invite to set up their account."
    >
      <form id={formId} onSubmit={submit} noValidate className="lc-inbs__create-form">
        <TextInput label="Full name" required value={name} onChange={(e) => setName(e.currentTarget.value)} autoComplete="off" error={submitted ? nameError : undefined} />
        <TextInput label="Email address" required type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} autoComplete="off" error={submitted ? emailError : undefined} />
        <NativeSelect
          label="Role"
          size="sm"
          w="100%"
          data={AGENT_ROLES}
          value={role}
          onChange={(e) => setRole(e.currentTarget.value)}
        />
        <Checkbox checked={addToInbox} onChange={(e) => setAddToInbox(e.currentTarget.checked)} label="Add to this inbox" />
      </form>
      <Modal.Footer><>
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button type="submit" form={formId}>Create agent</Button>
        </></Modal.Footer>
    </Modal>
  );
}
