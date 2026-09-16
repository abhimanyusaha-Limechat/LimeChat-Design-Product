import type { SVGProps } from 'react';

export type InboxIconName =
  | 'search'
  | 'sync'
  | 'whatsapp'
  | 'email'
  | 'instagram'
  | 'sms'
  | 'chevron-down';

const PATHS: Record<InboxIconName, string[]> = {
  search: ['M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
  'chevron-down': ['M6 9l6 6l6 -6'],
  sync: [
    'M4 12v-4a4 4 0 0 1 4 -4h12l-4 -4',
    'M4 8l4 4l-4 4',
    'M20 12v4a4 4 0 0 1 -4 4h-12l4 4',
    'M20 16l-4 -4l4 -4',
  ],
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
};

type IconProps = SVGProps<SVGSVGElement> & { name: InboxIconName };

export function InboxIcon({ name, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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
