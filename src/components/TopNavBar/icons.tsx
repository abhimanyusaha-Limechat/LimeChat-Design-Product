/** Icons for the top navigation bar — shapes live in `../iconPaths`; this wrapper names the set and adds `.lc-topnav__icon`. */
import type { SVGProps } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';

export type { IconName as TopNavIconName } from '../iconPaths';

export function TopNavIcon(props: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <Icon className="lc-topnav__icon" {...props} />;
}
