/**
 * Shared inline icons — the handful of Tabler-style outline shapes (chevron-down,
 * check, close, trash) that were being redefined locally, near-identically, in a
 * dozen-plus components. Anything used in only one place stays local to that
 * component; only genuinely repeated shapes live here.
 */
import type { SVGProps } from 'react';
import { iconProps } from './iconProps';

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Sets both width and height (defaults to the 24x24 viewBox's natural size). */
  size?: number;
}

export function ChevronDownIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...iconProps()} width={size} height={size} {...rest}>
      <path d="M6 9l6 6l6 -6" />
    </svg>
  );
}

export function CheckIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...iconProps()} width={size} height={size} {...rest}>
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
}

export function CloseIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...iconProps()} width={size} height={size} {...rest}>
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function TrashIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...iconProps()} width={size} height={size} {...rest}>
      <path d="M4 7l16 0" />
      <path d="M10 11l0 6" />
      <path d="M14 11l0 6" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
    </svg>
  );
}
