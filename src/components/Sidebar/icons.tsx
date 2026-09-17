/**
 * Outline icon set used by the LimeChat sidebar rail.
 *
 * Icons are Tabler-style: 24x24 viewBox, `currentColor` stroke, 2px stroke width,
 * round line caps/joins, no fill. They inherit colour + size from the parent
 * (`.lc-sidebar__icon` sets `width`/`height` via a CSS variable), so they render
 * crisply at the 20px rail size and scale with it.
 */
import type { SVGProps } from 'react';

export type SidebarIconName =
  | 'message-circle'
  | 'chart-bar'
  | 'speakerphone'
  | 'users'
  | 'settings'
  | 'home'
  | 'share'
  | 'layout'
  | 'list-check'
  | 'headset'
  | 'sitemap'
  | 'robot'
  | 'help-circle'
  | 'school'
  | 'gauge'
  | 'license'
  | 'book'
  | 'whatsapp'
  | 'bell'
  | 'user'
  | 'logout';

type IconProps = SVGProps<SVGSVGElement> & { name: SidebarIconName };

const PATHS: Record<SidebarIconName, string[]> = {
  'message-circle': [
    'M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1',
  ],
  'chart-bar': [
    'M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M4 20h14',
  ],
  speakerphone: [
    'M18 8a3 3 0 0 1 0 6',
    'M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5',
    'M12 8h0l4.524 -3.77a0.9 .9 0 0 1 1.476 .692v11.156a0.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h8',
  ],
  users: [
    'M9 7a4 4 0 1 0 0 8a4 4 0 0 0 0 -8',
    'M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
    'M16 3.13a4 4 0 0 1 0 7.75',
    'M21 21v-2a4 4 0 0 0 -3 -3.85',
  ],
  settings: [
    'M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z',
    'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0',
  ],
  home: [
    'M5 12l-2 0l9 -9l9 9l-2 0',
    'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7',
    'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6',
  ],
  share: [
    'M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M8.7 10.7l6.6 -3.4',
    'M8.7 13.3l6.6 3.4',
  ],
  layout: ['M4 4h6v8h-6z', 'M4 16h6v4h-6z', 'M14 12h6v8h-6z', 'M14 4h6v4h-6z'],
  'list-check': [
    'M3.5 5.5l1.5 1.5l2.5 -2.5',
    'M3.5 11.5l1.5 1.5l2.5 -2.5',
    'M3.5 17.5l1.5 1.5l2.5 -2.5',
    'M11 6l9 0',
    'M11 12l9 0',
    'M11 18l9 0',
  ],
  headset: [
    'M4 14v-3a8 8 0 0 1 16 0v3',
    'M18 19c0 1.657 -2.686 3 -6 3',
    'M4 14a2 2 0 0 1 2 -2h1a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-1a2 2 0 0 1 -2 -2z',
    'M20 14a2 2 0 0 0 -2 -2h-1a1 1 0 0 0 -1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2 -2z',
  ],
  sitemap: [
    'M3 15m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M15 15m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M9 6m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M6 15v-3a3 3 0 0 1 3 -3h6a3 3 0 0 1 3 3v3',
    'M12 9v6',
  ],
  robot: [
    'M7 7h10a2 2 0 0 1 2 2v1l1 1v3l-1 1v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-3l-1 -1v-3l1 -1v-1a2 2 0 0 1 2 -2z',
    'M10 16h4',
    'M9 11v2',
    'M15 11v2',
    'M11 4h2',
    'M12 4v3',
  ],
  'help-circle': [
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M12 17l0 .01',
    'M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4',
  ],
  school: [
    'M22 9l-10 -4l-10 4l10 4l10 -4v6',
    'M6 10.6v5.4a6 3 0 0 0 12 0v-5.4',
  ],
  gauge: [
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M12 12l4 -4',
    'M8.5 12a3.5 3.5 0 0 1 3.5 -3.5',
  ],
  license: [
    'M15 21h-9a3 3 0 0 1 -3 -3v-1h10v2a2 2 0 0 0 4 0v-14a2 2 0 0 0 -2 -2h-10a3 3 0 0 0 -3 3v11',
    'M9 7l4 0',
    'M9 11l4 0',
  ],
  book: [
    'M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0',
    'M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0',
    'M3 6l0 13',
    'M12 6l0 13',
    'M21 6l0 13',
  ],
  whatsapp: [
    'M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9',
    'M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 0 1',
  ],
  bell: [
    'M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6',
    'M9 17v1a3 3 0 0 0 6 0v-1',
  ],
  user: [
    'M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0',
    'M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
  ],
  logout: [
    'M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2',
    'M7 12h14l-3 -3',
    'M18 15l3 -3',
  ],
};

export const SIDEBAR_ICON_NAMES = Object.keys(PATHS) as SidebarIconName[];

export function SidebarIcon({ name, ...props }: IconProps) {
  return (
    <svg
      className="lc-sidebar__icon"
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

/** LimeChat brand mark (leaf), from the Figma design system. */
export function LimeChatLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M28.5713 3.33333V16.3353H28.581C28.581 17.953 28.2627 19.5555 27.6435 21.0501C27.0243 22.5448 26.1167 23.9032 24.9726 25.0472C23.8285 26.1912 22.4695 27.098 20.9746 27.7171C19.5282 28.3161 17.9814 28.6307 16.417 28.6507V28.6663H13.6787V21.6517H16.2597V21.6331C16.9554 21.6331 17.6443 21.496 18.2871 21.2298C18.9299 20.9636 19.5138 20.5733 20.0058 20.0814C20.4978 19.5895 20.888 19.0053 21.1543 18.3626C21.4039 17.7599 21.5387 17.1166 21.5547 16.4652V10.1771H20.5322C19.1838 10.1771 17.8483 10.4434 16.6025 10.9593C15.3569 11.4752 14.2248 12.2317 13.2715 13.1849C12.3182 14.1381 11.5618 15.2696 11.0459 16.515C10.5299 17.7605 10.2646 19.0955 10.2646 20.4437V28.6497H3.41891V20.266H3.42087C3.4436 18.0795 3.88432 15.917 4.72165 13.8958C5.58167 11.8199 6.84251 9.93388 8.43161 8.34505C10.0207 6.75623 11.9071 5.49594 13.9834 4.63607C16.0061 3.79837 18.1702 3.35752 20.3584 3.33529V3.33333H28.5713Z"
        fill="currentColor"
      />
    </svg>
  );
}
