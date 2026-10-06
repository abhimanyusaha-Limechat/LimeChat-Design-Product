/** Icons for the Segments home page — shapes live in `../iconPaths`; this wrapper names the set and adds `.lc-sg__icon`. */
import type { SVGProps } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';

export type { IconName as SegmentIconName } from '../iconPaths';

export function SegmentIcon({ name, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <Icon name={name} className={`lc-sg__icon${className ? ` ${className}` : ''}`} data-icon={name} {...props} />;
}
