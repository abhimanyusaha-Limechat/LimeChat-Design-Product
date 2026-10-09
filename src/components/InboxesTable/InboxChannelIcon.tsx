/**
 * InboxChannelIcon — the channel logo with a small status dot on its corner.
 * Green = connected, amber = needs reauthorization or setup is incomplete. The dot is never the
 * only signal: the icon carries a text label ("WhatsApp, Needs reauthorization") and a hover title.
 */
import { InboxIcon, type InboxIconName } from './icons';
import { STATUS_LABEL, TYPE_LABEL, type InboxRowData, type InboxType } from './inboxes';

const TYPE_ICON: Record<InboxType, InboxIconName> = {
  whatsapp: 'whatsapp',
  email: 'email',
  instagram: 'instagram',
  sms: 'sms',
  facebook: 'facebook',
};

export function InboxChannelIcon({ row, size = 'md' }: { row: Pick<InboxRowData, 'type' | 'status'>; size?: 'md' | 'tile' }) {
  const label = `${TYPE_LABEL[row.type]}, ${STATUS_LABEL[row.status]}`;
  return (
    <span className="lc-ib__channel" data-size={size} data-type={row.type} role="img" aria-label={label} title={label}>
      <InboxIcon name={TYPE_ICON[row.type]} className="lc-ib__row-icon" data-type={row.type} />
      <span className="lc-ib__dot" data-status={row.status} />
    </span>
  );
}
