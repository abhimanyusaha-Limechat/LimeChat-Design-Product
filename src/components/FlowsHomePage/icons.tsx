/** Icons for the Flows home page — shapes live in `../iconPaths`; this wrapper names the set and adds `.lc-fh__icon`. */
import type { SVGProps } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';

export type { IconName as FlowIconName } from '../iconPaths';

export function FlowIcon({ name, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <Icon name={name} className={`lc-fh__icon${className ? ` ${className}` : ''}`} data-icon={name} {...props} />;
}
