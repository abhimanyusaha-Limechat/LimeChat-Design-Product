/**
 * Button — LimeChat design system (Figma node 30:3).
 *
 * Mirrors the `arceus` / Mantine v6 Button API used in the design file:
 * `variant` × `color` × `size`, plus `leftSection` / `rightSection` icon slots.
 * Renders a `<button>`, or an `<a>` when `href` is set.
 *
 *   <Button>Save</Button>
 *   <Button variant="outline" color="red" size="md" leftSection={<TrashIcon />}>
 *     Delete
 *   </Button>
 *   <Button variant="subtle" color="gray" href="/back">Back</Button>
 */
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'filled' | 'light' | 'outline' | 'subtle' | 'white' | 'default';
export type ButtonColor = 'primary' | 'green' | 'gray' | 'red' | 'yellow';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonOwnProps {
  /** Visual style. Default `filled`. */
  variant?: ButtonVariant;
  /** Colour family. `green`→success, `red`→error, `yellow`→warning. Default `primary`. */
  color?: ButtonColor;
  /** Default `sm`. */
  size?: ButtonSize;
  /** Icon / node before the label. */
  leftSection?: ReactNode;
  /** Icon / node after the label. */
  rightSection?: ReactNode;
  /** Stretch to the full width of the container. */
  fullWidth?: boolean;
  /** Show a spinner and block interaction. */
  loading?: boolean;
  /** Label casing. The design system capitalises labels; pass `none` to opt out. */
  textTransform?: 'capitalize' | 'none';
  /** Render as an `<a>` with this href instead of a `<button>`. */
  href?: string;
  children?: ReactNode;
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps>;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  {
    variant = 'filled',
    color = 'primary',
    size = 'sm',
    leftSection,
    rightSection,
    fullWidth,
    loading = false,
    textTransform = 'capitalize',
    href,
    className,
    children,
    disabled,
    type,
    ...rest
  },
  ref,
) {
  const shared = {
    className: `lc-btn${className ? ` ${className}` : ''}`,
    'data-variant': variant,
    'data-color': color,
    'data-size': size,
    'data-full-width': fullWidth || undefined,
    'data-loading': loading || undefined,
    'data-text-transform': textTransform === 'none' ? 'none' : undefined,
  };

  const content = (
    <>
      {leftSection != null && <span className="lc-btn__section lc-btn__section--left">{leftSection}</span>}
      <span className="lc-btn__label">{children}</span>
      {rightSection != null && (
        <span className="lc-btn__section lc-btn__section--right">{rightSection}</span>
      )}
      {loading && <span className="lc-btn__spinner" aria-hidden="true" />}
    </>
  );

  if (href != null) {
    const isDisabled = disabled || loading;
    return (
      <a
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        {...shared}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={isDisabled ? undefined : href}
        role="button"
        aria-disabled={isDisabled || undefined}
        data-disabled={isDisabled || undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      {...shared}
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
});

export default Button;
