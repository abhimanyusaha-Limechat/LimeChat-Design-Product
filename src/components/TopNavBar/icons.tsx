/**
 * Icon set for the LimeChat top navigation bar.
 *
 * Tabler-style outline icons: 24x24 viewBox, `currentColor` stroke, 2px width,
 * round caps/joins, no fill. Size + colour are inherited from the parent, so a
 * single component covers every placement (12px separators, 16px CTA glyphs,
 * 24px apps menu).
 */
import type { SVGProps } from 'react';

export type TopNavIconName =
  | 'chevron-down'
  | 'slash'
  | 'edit'
  | 'phone'
  | 'plus'
  | 'grid-dots'
  | 'whatsapp';

const PATHS: Record<TopNavIconName, string[]> = {
  'chevron-down': ['M6 9l6 6l6 -6'],
  slash: ['M17 5l-10 14'],
  edit: [
    'M7 20h-4v-4l11.5 -11.5a2.121 2.121 0 0 1 3 3l-11.5 11.5',
    'M13.5 6.5l3 3',
  ],
  phone: [
    'M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2',
  ],
  plus: ['M12 5l0 14', 'M5 12l14 0'],
  'grid-dots': [
    'M5 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M19 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M5 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M19 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],
  whatsapp: [
    'M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9',
    'M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 -1 0',
  ],
};

type IconProps = SVGProps<SVGSVGElement> & { name: TopNavIconName };

export function TopNavIcon({ name, ...props }: IconProps) {
  return (
    <svg
      className="lc-topnav__icon"
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
