/**
 * Icon set for the Templates home page (Campaigns → Templates).
 *
 * Tabler-style outline icons: 24x24 viewBox, `currentColor` stroke, 2px width,
 * round caps/joins, no fill — matches the convention used by the other
 * component icon sets in this library (see BroadcastHomePage/icons.tsx).
 */
import type { SVGProps } from 'react';

export type TemplateIconName =
  | 'search'
  | 'refresh'
  | 'download'
  | 'plus'
  | 'chevron-down'
  | 'dots-vertical'
  | 'copy'
  | 'trash'
  | 'edit'
  | 'photo'
  | 'dots';

const PATHS: Record<TemplateIconName, string[]> = {
  search: ['M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
  refresh: ['M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4', 'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4'],
  download: [
    'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M12 17v-6',
    'M9.5 14.5l2.5 2.5l2.5 -2.5',
  ],
  plus: ['M12 5l0 14', 'M5 12l14 0'],
  'chevron-down': ['M6 9l6 6l6 -6'],
  'dots-vertical': [
    'M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],
  copy: [
    'M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z',
    'M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1',
  ],
  trash: [
    'M4 7l16 0',
    'M10 11l0 6',
    'M14 11l0 6',
    'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
    'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
  ],
  edit: ['M7 20h-4v-4l11.5 -11.5a2.121 2.121 0 0 1 3 3l-11.5 11.5', 'M13.5 6.5l3 3'],
  photo: [
    'M15 8h.01',
    'M6.5 21h11a3.5 3.5 0 0 0 3.5 -3.5v-11a3.5 3.5 0 0 0 -3.5 -3.5h-11a3.5 3.5 0 0 0 -3.5 3.5v11a3.5 3.5 0 0 0 3.5 3.5z',
    'M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5',
    'M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3',
  ],
  dots: [
    'M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],
};

type IconProps = SVGProps<SVGSVGElement> & { name: TemplateIconName };

export function TemplateIcon({ name, className, ...props }: IconProps) {
  return (
    <svg
      className={`lc-th__icon${className ? ` ${className}` : ''}`}
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
