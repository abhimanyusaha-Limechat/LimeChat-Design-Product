/** Body of the Settings details panel: a label/value list for the selected row. */
import type { InboxRowData } from '../InboxesTable';
import type { BotTemplateRow } from '../BotTemplatesTable';

type Field = [label: string, value: string | undefined];

const list = (items?: string[]) => (items?.length ? items.join(', ') : undefined);
const yesNo = (v?: boolean) => (v === undefined ? undefined : v ? 'Yes' : 'No');

export function inboxFields(row: InboxRowData): Field[] {
  return [['Name', row.name], ['Channel', row.type], ['Identifier', row.detail], ['ID', row.id]];
}

export function rowFields(tab: string, row: BotTemplateRow): Field[] {
  const common: Field[] = [['Name', row.name], ['Description', row.description || undefined]];
  switch (tab) {
    case 'agents':
      return [...common, ['Role', row.role], ['Inboxes', list(row.inboxes?.map((i) => i.name))], ['Status', row.pending ? 'Pending' : 'Active']];
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
