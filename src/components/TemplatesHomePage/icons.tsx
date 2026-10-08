/** Icons for the Templates home page — shapes live in `../iconPaths`; this wrapper names the set and adds `.lc-th__icon`. */
import type { SVGProps } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';

export type { IconName as TemplateIconName } from '../iconPaths';

export function TemplateIcon({ name, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <Icon name={name} className={`lc-th__icon${className ? ` ${className}` : ''}`} data-icon={name} {...props} />;
}
