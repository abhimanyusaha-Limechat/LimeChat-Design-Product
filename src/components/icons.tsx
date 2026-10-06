/**
 * Shared inline icons. `<Icon name>` renders any shape from `./iconPaths`; the
 * named exports below are shorthands for the most common ones.
 */
import type { SVGProps } from 'react';
import { iconProps } from './iconProps';
import { ICON_PATHS, type IconName } from './iconPaths';

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Sets both width and height (defaults to the 24x24 viewBox's natural size). */
  size?: number;
}

/** Any shape from `ICON_PATHS`. Size + colour inherit from CSS unless set. */
export function Icon({ name, size, ...rest }: IconProps & { name: IconName }) {
  return (
    <svg {...iconProps()} focusable="false" width={size} height={size} {...rest}>
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export const ChevronDownIcon = (props: IconProps) => <Icon {...props} name="chevron-down" />;
export const CheckIcon = (props: IconProps) => <Icon {...props} name="check" />;
export const CloseIcon = (props: IconProps) => <Icon {...props} name="close" />;
export const TrashIcon = (props: IconProps) => <Icon {...props} name="trash" />;
export const ZoomIcon = (props: IconProps) => <Icon {...props} name="zoom-in" />;

export function PhotoIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...iconProps()} width={size} height={size} {...rest}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M4 15l4.5 -4.5c0.8 -0.8 2 -0.8 2.8 0l5.7 5.5" />
      <path d="M14.5 13.5l1.5 -1.5c0.8 -0.8 2 -0.8 2.8 0l1.2 1.2" />
    </svg>
  );
}
