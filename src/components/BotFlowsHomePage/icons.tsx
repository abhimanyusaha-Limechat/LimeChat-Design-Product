/** Icons for the Bot Flows home page — shapes live in `../iconPaths`; this wrapper names the set and adds `.lc-bf__icon`. */
import type { SVGProps } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';

export type { IconName as BotFlowIconName } from '../iconPaths';

export function BotFlowIcon({ name, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <Icon name={name} className={`lc-bf__icon${className ? ` ${className}` : ''}`} data-icon={name} {...props} />;
}
