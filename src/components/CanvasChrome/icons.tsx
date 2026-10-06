/** Icons for the canvas chrome — shapes live in `../iconPaths`; this wrapper names the set and adds `.lc-canvas__icon`. */
import type { SVGProps } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';

export type { IconName as CanvasIconName } from '../iconPaths';

export function CanvasIcon(props: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <Icon className="lc-canvas__icon" {...props} />;
}
