/** Icons for the ticket list — shapes live in `../iconPaths`; this wrapper names the set. */
import { Icon, type IconProps } from '../icons';
import type { IconName } from '../iconPaths';

export type TicketIconName = IconName;

const CHANNELS: ReadonlySet<IconName> = new Set(['whatsapp', 'email', 'instagram', 'sms']);

/** Channel glyphs get `data-channel` so CSS can tint them in their own app colour. */
export function TicketIcon({ name, className, ...props }: IconProps & { name: IconName }) {
  return (
    <Icon
      name={name}
      className={className ? `lc-ticket-icon ${className}` : 'lc-ticket-icon'}
      data-channel={CHANNELS.has(name) ? name : undefined}
      {...props}
    />
  );
}
