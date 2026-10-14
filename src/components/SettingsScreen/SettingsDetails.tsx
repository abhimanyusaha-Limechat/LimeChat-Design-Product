/** Body of the Settings details panel: a label/value list for the selected row. */
import type { CSSProperties } from 'react';
import { InboxIcon, type InboxRowData } from '../InboxesTable';
import type { BotTemplateRow } from '../BotTemplatesTable';
import { Avatar } from '../Avatar';
import { initials } from '../AccountPicker/AccountPicker';

type Field = [label: string, value: string | undefined];

const yesNo = (v?: boolean) => (v === undefined ? undefined : v ? 'Yes' : 'No');

export function inboxFields(row: InboxRowData): Field[] {
  return [['Name', row.name], ['Channel', row.type], ['Identifier', row.detail], ['ID', row.id]];
}

/** Every tab but Agents, which has its own panel body (AgentDetails). */
export function rowFields(tab: string, row: BotTemplateRow): Field[] {
  const common: Field[] = [['Name', row.name], ['Description', row.description || undefined]];
  switch (tab) {
    case 'custom-fields':
      return [...common, ['Type', row.kind], ['Mandatory', yesNo(row.mandatory)], ['Enabled', yesNo(row.enabled)]];
    case 'automation-rules':
    case 'sla-rules':
      return [...common, ['Enabled', yesNo(row.enabled)]];
    case 'canned-responses':
      return [...common, ['Format', row.mediaType === 'image' ? 'Image' : 'Text']];
    case 'tags':
      return [...common, ['Enabled', yesNo(row.enabled)]];
    default:
      return common;
  }
}

/** Grey rounded-square initials on the white header card. */
const AVATAR_STYLE = {
  '--lc-avatar-radius': '8px',
  '--lc-avatar-font': '10px',
  '--lc-avatar-light-bg': 'var(--lc-color-gray-150)',
  '--lc-avatar-fg-accent': 'var(--lc-color-green-700)',
  borderColor: 'var(--lc-color-white)',
} as CSSProperties;

/** Profile image for the panel header — initials until a photo exists. */
export function DetailsAvatar({ name }: { name: string }) {
  return (
    <Avatar size={32} alt={name} style={AVATAR_STYLE}>
      {initials(name)}
    </Avatar>
  );
}

/** Channel icon for the panel header — the Inboxes table's icon and brand colour (.lc-ib__row-icon). */
export function InboxDetailsIcon({ type }: { type: InboxRowData['type'] }) {
  return <InboxIcon name={type} className="lc-ib__row-icon" data-type={type} />;
}

export function SettingsDetails({ fields }: { fields: Field[] }) {
  return (
    <dl className="lc-sp__detail-list">
      {fields.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
