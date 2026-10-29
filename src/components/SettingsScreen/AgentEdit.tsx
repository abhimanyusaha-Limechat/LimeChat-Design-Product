/**
 * Agents tab → Edit: one agent's profile, access, limits and inboxes, as label | control rows
 * (same look as the inbox edit page). Edits are a draft: the caller saves them when Update is clicked.
 * Mount with `key={agent.id}` so the text boxes reset when another agent opens.
 *
 * The table has one `role` (Admin / Editor / Viewer). This page splits it the way the account
 * form does: Role (Agent or Administrator) and, for agents, Define users access (Editor or Viewer).
 */
import { useId, useState } from 'react';
import { Button } from '../Button';
import type { BotTemplateRow } from '../BotTemplatesTable';
import { InboxIcon } from '../InboxesTable';
import { RadioRow, Row, SectionHeading } from '../InboxSettings';
import { Icon } from '../icons';
import { AvatarPicker } from '../ProfileSettings';
import { NativeSelect } from '../Select';
import { AGENT_INBOXES } from '../../data/settingsDemo';
import type { AgentPatch } from './AgentDetails';
import './AgentEdit.css';

const ACCOUNT_ROLES = ['Agent', 'Administrator'];
const PLATFORMS = ['Helpdesk', 'Marketing', 'Automation'];
const ACCESS_CHOICES = [
  { value: 'Viewer', label: 'Viewer' },
  { value: 'Editor', label: 'Editor' },
];

/** A whole number >= 1, or undefined while the box is empty. */
const toLimit = (text: string) => (text === '' ? undefined : Math.max(1, Math.floor(Number(text)) || 1));

function NumberRow({ label, description, value, onChange }: {
  label: string;
  description: string;
  value?: number;
  onChange: (next?: number) => void;
}) {
  return (
    <Row label={label} description={description}>
      <input
        className="lc-inbs__input"
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        aria-label={label}
        value={value ?? ''}
        onChange={(e) => onChange(toLimit(e.currentTarget.value))}
      />
    </Row>
  );
}

export function AgentEdit({ agent, onChange }: { agent: BotTemplateRow; onChange: (patch: AgentPatch) => void }) {
  const nameId = useId();
  // Kept as typed; the saved name only changes to a non-blank one so the list never shows an empty row.
  const [name, setName] = useState(agent.name);
  const nameError = name.trim() ? undefined : 'Enter the agent’s name.';
  const isAdmin = agent.role === 'Admin';
  const platforms = agent.platforms ?? PLATFORMS;
  const inboxes = agent.inboxes ?? [];
  const unassigned = AGENT_INBOXES.filter((i) => !inboxes.some((a) => a.name === i.name));

  return (
    <div className="lc-inbs">
      <section className="lc-inbs__group" aria-label="Profile">
        <SectionHeading title="Profile" description="How the agent appears to teammates and customers." />
        <div className="lc-inbs__table">
          <Row label="Profile picture" description="JPG, PNG or WebP, up to 2 MB.">
            <div className="lc-ae__avatar">
              <AvatarPicker
                name={name}
                src={agent.avatar}
                onChange={(file) => onChange({ avatar: file ? URL.createObjectURL(file) : undefined })}
              />
            </div>
          </Row>
          <Row label="Agent name" description="Shown on tickets and in replies.">
            <div>
              <input
                id={nameId}
                className="lc-inbs__input"
                aria-label="Agent name"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? `${nameId}-error` : undefined}
                autoComplete="off"
                value={name}
                onChange={(e) => {
                  const next = e.currentTarget.value;
                  setName(next);
                  if (next.trim()) onChange({ name: next.trim() });
                }}
              />
              {nameError && (
                <p id={`${nameId}-error`} className="lc-ae__error" role="alert">
                  {nameError}
                </p>
              )}
            </div>
          </Row>
          <Row label="Email address" description="Used to sign in. It can't be changed here.">
            <input className="lc-inbs__input" aria-label="Email address" value={agent.description} readOnly />
          </Row>
          <Row label="Phone number" description="Shown to teammates, not customers.">
            <input
              className="lc-inbs__input"
              type="tel"
              aria-label="Phone number"
              placeholder="Enter a phone number"
              autoComplete="off"
              value={agent.phone ?? ''}
              onChange={(e) => onChange({ phone: e.currentTarget.value || undefined })}
            />
          </Row>
          <Row label="WebRTC ID" description="The agent's calling ID.">
            <input
              className="lc-inbs__input"
              aria-label="WebRTC ID"
              placeholder="Please enter a WebRTC ID of the agent"
              autoComplete="off"
              value={agent.webrtcId ?? ''}
              onChange={(e) => onChange({ webrtcId: e.currentTarget.value || undefined })}
            />
          </Row>
          <Row label="Signature" description="Added to the end of the agent's replies.">
            <textarea
              className="lc-inbs__input lc-inbs__textarea"
              aria-label="Signature"
              rows={3}
              value={agent.signature ?? ''}
              onChange={(e) => onChange({ signature: e.currentTarget.value || undefined })}
            />
          </Row>
        </div>
      </section>

      <section className="lc-inbs__group" aria-label="Access">
        <SectionHeading title="Access" description="What the agent can open and change." />
        <div className="lc-inbs__table">
          <Row label="Role" description="Administrators can manage the account.">
            <NativeSelect
              size="sm"
              fullWidth
              aria-label="Role"
              data={ACCOUNT_ROLES}
              value={isAdmin ? 'Administrator' : 'Agent'}
              onChange={(e) => {
                const admin = e.currentTarget.value === 'Administrator';
                if (admin !== isAdmin) onChange({ role: admin ? 'Admin' : 'Editor' });
              }}
            />
          </Row>
          <Row label="Platform access" description="The Products the agent can open.">
            <div className="lc-ae__checks" role="group" aria-label="Platform access">
              {PLATFORMS.map((platform) => {
                const checked = platforms.includes(platform);
                return (
                  <label key={platform} className="lc-inbs__radio">
                    <input
                      type="checkbox"
                      checked={checked}
                      // At least one Product stays on, or the agent couldn't sign in to anything.
                      disabled={checked && platforms.length === 1}
                      onChange={(e) =>
                        onChange({
                          platforms: PLATFORMS.filter((p) => (p === platform ? e.currentTarget.checked : platforms.includes(p))),
                        })
                      }
                    />
                    {platform}
                  </label>
                );
              })}
            </div>
          </Row>
          <RadioRow
            label="Define users access"
            description={isAdmin ? 'Administrators always have full access.' : 'Editors can change settings; viewers can only look.'}
            choices={ACCESS_CHOICES}
            value={agent.role === 'Viewer' ? 'Viewer' : 'Editor'}
            off={isAdmin}
            onChange={(role) => onChange({ role })}
          />
          <Row label="Password" description="Forgot password? Send the agent a link to reset it.">
            <div>
              <Button variant="outline" size="sm" onClick={() => alert(`Password reset link sent to ${agent.description}`)}>
                Reset password
              </Button>
            </div>
          </Row>
        </div>
      </section>

      <section className="lc-inbs__group" aria-label="Limits">
        <SectionHeading title="Limits" description="Stops one agent from taking on more than they can handle." />
        <div className="lc-inbs__table">
          <NumberRow
            label="Concurrency"
            description="Chats the agent can handle at once."
            value={agent.concurrency}
            onChange={(concurrency) => onChange({ concurrency })}
          />
          <NumberRow
            label="Ticket limit"
            description="Open tickets that can be assigned to the agent each day."
            value={agent.ticketLimit}
            onChange={(ticketLimit) => onChange({ ticketLimit })}
          />
        </div>
      </section>

      <section className="lc-inbs__group" aria-label="Inboxes">
        <SectionHeading title="Inboxes" description="The agent can see and reply to tickets in these inboxes." />
        <div className="lc-inbs__table">
          <Row label="Add inbox" description="Pick an inbox to add the agent to it.">
            <NativeSelect
              size="sm"
              fullWidth
              aria-label="Add inbox"
              disabled={unassigned.length === 0}
              data={[
                { value: '', label: unassigned.length ? 'Select inbox for agent' : 'Every inbox is added' },
                ...unassigned.map((i) => ({ value: i.name, label: i.name })),
              ]}
              value=""
              onChange={(e) => {
                const inbox = unassigned.find((i) => i.name === e.currentTarget.value);
                if (inbox) onChange({ inboxes: [...inboxes, inbox] });
              }}
            />
          </Row>
          <div className="lc-ae__chips-row">
            {inboxes.length === 0 ? (
              <p className="lc-inbs__row-desc">No inboxes yet.</p>
            ) : (
              <ul className="lc-ae__chips" aria-label="Inboxes assigned">
                {inboxes.map((inbox) => (
                  <li key={inbox.name} className="lc-ae__chip">
                    <span className="lc-ae__chip-icon" aria-hidden="true">
                      <InboxIcon name={inbox.type} />
                    </span>
                    {inbox.name}
                    <button
                      type="button"
                      className="lc-ae__chip-remove"
                      aria-label={`Remove ${inbox.name}`}
                      onClick={() => onChange({ inboxes: inboxes.filter((i) => i.name !== inbox.name) })}
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
