/** Icons for the Broadcast home page — shapes live in `../iconPaths`; this wrapper names the set and adds `.lc-bh__icon`. */
import type { SVGProps } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';

export type { IconName as BroadcastIconName } from '../iconPaths';

/** 8 radial ticks with fading opacity — reads better mid-spin than a single arc. */
const LOADER_TICKS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * 360) / 8;
  return { angle, opacity: 0.25 + (i / 7) * 0.75 };
});

export function BroadcastIcon({ name, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const cls = `lc-bh__icon${className ? ` ${className}` : ''}`;
  if (name !== 'loader') return <Icon name={name} className={cls} data-icon={name} {...props} />;

  return (
    <svg
      className={cls}
      data-icon={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {LOADER_TICKS.map(({ angle, opacity }) => (
        <line key={angle} x1="12" y1="5" x2="12" y2="8.5" opacity={opacity} transform={`rotate(${angle} 12 12)`} />
      ))}
    </svg>
  );
}
