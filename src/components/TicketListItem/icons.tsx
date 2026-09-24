import type { SVGProps } from 'react';

export type TicketIconName = 'whatsapp' | 'email' | 'instagram' | 'sms' | 'share' | 'dots-vertical' | 'dots-horizontal' | 'check';

const PATHS: Record<TicketIconName, string[]> = {
  whatsapp: [
    'M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9',
    'M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 -1 0',
  ],
  email: ['M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z', 'M3 7l9 6l9 -6'],
  instagram: [
    'M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z',
    'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M16.5 7.5l0 .01',
  ],
  sms: [
    'M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1',
  ],
  share: ['M15 8l4 4l-4 4', 'M4 12h14.5', 'M8 8a5 5 0 0 0 -4 4'],
  'dots-vertical': [
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],
  'dots-horizontal': [
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],
  check: ['M5 12l5 5l10 -10'],
};

const FILLED: Partial<Record<TicketIconName, boolean>> = {
  'dots-vertical': true,
  'dots-horizontal': true,
};

type IconProps = SVGProps<SVGSVGElement> & { name: TicketIconName };

const CHANNELS: ReadonlySet<TicketIconName> = new Set(['whatsapp', 'email', 'instagram', 'sms']);

export function TicketIcon({ name, className, ...props }: IconProps) {
  const filled = FILLED[name];
  return (
    <svg
      className={className ? `lc-ticket-icon ${className}` : 'lc-ticket-icon'}
      data-channel={CHANNELS.has(name) ? name : undefined}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 1 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
