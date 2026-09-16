/**
 * Icon set for the Flows home page — duplicated from BroadcastHomePage's icon
 * set (same visual language) with a "pause" glyph added for inactive flows.
 *
 * Tabler-style outline icons: 24x24 viewBox, `currentColor` stroke, 2px width,
 * round caps/joins, no fill — matches the convention used by the other
 * component icon sets in this library.
 */
import type { SVGProps } from 'react';

export type FlowIconName =
  | 'search'
  | 'download'
  | 'copy'
  | 'chevron-down'
  | 'circle-check'
  | 'pause'
  | 'save'
  | 'edit'
  | 'dots'
  | 'plus'
  | 'alert-triangle'
  | 'whatsapp';

const PATHS: Record<FlowIconName, string[]> = {
  search: ['M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
  download: [
    'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M12 17v-6',
    'M9.5 14.5l2.5 2.5l2.5 -2.5',
  ],
  copy: [
    'M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z',
    'M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1',
  ],
  'chevron-down': ['M6 9l6 6l6 -6'],
  'circle-check': ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M9 12l2 2l4 -4'],
  pause: [
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M10 9v6',
    'M14 9v6',
  ],
  save: [
    'M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2',
    'M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M9 4v4h6v-4',
  ],
  edit: [
    'M7 20h-4v-4l11.5 -11.5a2.121 2.121 0 0 1 3 3l-11.5 11.5',
    'M13.5 6.5l3 3',
  ],
  dots: [
    'M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],
  plus: ['M12 5l0 14', 'M5 12l14 0'],
  'alert-triangle': [
    'M12 9v4',
    'M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z',
    'M12 16h.01',
  ],
  whatsapp: [
    'M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9',
    'M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 -1 0',
  ],
};

type IconProps = SVGProps<SVGSVGElement> & { name: FlowIconName };

export function FlowIcon({ name, className, ...props }: IconProps) {
  return (
    <svg
      className={`lc-fh__icon${className ? ` ${className}` : ''}`}
      data-icon={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
