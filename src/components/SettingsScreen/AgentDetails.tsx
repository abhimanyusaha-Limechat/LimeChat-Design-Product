/**
 * Agents tab details panel body, one flat list: concurrency and ticket limit, email and phone
 * (copyable), signature (editable via its pencil), and assigned inboxes (addable).
 * Changes apply as they're made.
 * Mount with `key={agent.id}` so switching agents resets the signature editor.
 */
import { useId, useState } from 'react';
import type { BotTemplateRow } from '../BotTemplatesTable';
import { Button } from '../Button';
import { CheckIcon, Icon } from '../icons';
import { Menu } from '../Menu';
import { AGENT_INBOXES } from '../../data/settingsDemo';
import './AgentDetails.css';

export type AgentPatch = Partial<
  Pick<BotTemplateRow, 'name' | 'avatar' | 'role' | 'phone' | 'webrtcId' | 'platforms' | 'concurrency' | 'ticketLimit' | 'signature' | 'inboxes'>
>;

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="lc-ad__icon-btn"
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <CheckIcon size={16} /> : <Icon name="copy" size={16} />}
    </button>
  );
}

function CopyRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="lc-ad__row">
      <span className="lc-ad__label">{label}</span>
      <div className="lc-ad__value-line">
        <span className="lc-ad__value">{value || '—'}</span>
        {value && <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />}
      </div>
    </div>
  );
}

/** Just the heading and a pencil; the pencil opens a text box below and turns into a Done check. */
function SignatureRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  return (
    <div className="lc-ad__row">
      <div className="lc-ad__heading-line">
        <label className="lc-ad__label" htmlFor={editing ? id : undefined}>
          Signature
        </label>
        <button
          type="button"
          className="lc-ad__icon-btn"
          aria-label={editing ? 'Done editing signature' : 'Edit signature'}
          title={editing ? 'Done' : 'Edit signature'}
          onClick={() => setEditing((on) => !on)}
        >
          {editing ? <CheckIcon size={16} /> : <Icon name="pencil" size={16} />}
        </button>
      </div>
      {editing && (
        <textarea
          id={id}
          className="lc-ad__input"
          rows={3}
          value={value}
          autoFocus
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      )}
    </div>
  );
}

function Stat({ label, unit, value }: { label: string; unit: string; value?: number }) {
  return (
    <div className="lc-ad__stat">
      <span className="lc-ad__label">{label}</span>
      <span className="lc-ad__stat-value">{value ?? '—'}</span>
      <span className="lc-ad__label">{unit}</span>
    </div>
  );
}

export function AgentDetails({ agent, onChange }: { agent: BotTemplateRow; onChange: (patch: AgentPatch) => void }) {
  // Text box contents, kept as typed (the saved signature is trimmed).
  const [signature, setSignature] = useState(agent.signature ?? '');
  const inboxes = agent.inboxes ?? [];
  const unassigned = AGENT_INBOXES.filter((i) => !inboxes.some((a) => a.name === i.name));

  return (
    <>
      <div className="lc-ad__card">
        <div className="lc-ad__stats">
          <Stat label="Concurrency" unit="chats at once" value={agent.concurrency} />
          <Stat label="Ticket limit" unit="Open tickets daily" value={agent.ticketLimit} />
        </div>
        <CopyRow label="Email" value={agent.description} />
        <CopyRow label="Phone" value={agent.phone} />
        <SignatureRow
          value={signature}
          onChange={(value) => {
            setSignature(value);
            onChange({ signature: value.trim() || undefined });
          }}
        />
        <div className="lc-ad__row">
          <span className="lc-ad__label">Inboxes assigned</span>
          <ul className="lc-ad__chips">
            {inboxes.map((inbox) => (
              <li key={inbox.name} className="lc-ad__chip">
                {inbox.name}
              </li>
            ))}
            {unassigned.length > 0 && (
              <li>
                <Menu
                  ariaLabel="Add inbox"
                  align="start"
                  width={220}
                  items={unassigned.map((inbox) => ({
                    key: inbox.name,
                    label: inbox.name,
                    onClick: () => onChange({ inboxes: [...inboxes, inbox] }),
                  }))}
                  trigger={({ ref, onClick }) => (
                    <button ref={ref} type="button" className="lc-ad__chip lc-ad__chip--add" onClick={onClick}>
                      + Add inbox
                    </button>
                  )}
                />
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* ponytail: design placeholder — no delete behaviour yet; add onClick when one is decided. */}
      <Button
        className="lc-ad__delete"
        variant="subtle"
        color="red"
        size="xs"
        leftSection={<Icon name="trash" size={14} />}
      >
        Delete agent
      </Button>
    </>
  );
}
