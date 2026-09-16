/**
 * Avatar — LimeChat design system (Figma node 31:53).
 *
 * Mirrors the Mantine v6 `Avatar` API. The rendered "type" is derived:
 *   - `src` set            → image (with a neutral fallback fill)
 *   - string `children`    → initials
 *   - node `children` / none → icon (defaults to a person glyph)
 *
 *   <Avatar src="/me.jpg" alt="Aditi Rao" />
 *   <Avatar radius="xl">AR</Avatar>
 *   <Avatar variant="outline" size="lg" />
 *   <Avatar.Group>
 *     <Avatar src="/a.jpg" /><Avatar src="/b.jpg" /><Avatar>+3</Avatar>
 *   </Avatar.Group>
 */
import {
  Children,
  forwardRef,
  isValidElement,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import './Avatar.css';

export type AvatarVariant = 'light' | 'filled' | 'outline';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarRadius = 'xs' | 'xl';

const SIZE_PX: Record<AvatarSize, number> = { xs: 16, sm: 24, md: 36, lg: 56, xl: 84 };

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Image URL — renders the image type. */
  src?: string;
  alt?: string;
  /** Initials (string) or a custom icon node. */
  children?: ReactNode;
  variant?: AvatarVariant;
  /** Named size or a pixel number. Default `md`. */
  size?: AvatarSize | number;
  /** `xs` → 4px, `xl` → circle, or a pixel number. Default `xs`. */
  radius?: AvatarRadius | number;
}

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

function sizeStyle(size: AvatarProps['size']): { attr?: AvatarSize; style: CSSProperties } {
  if (typeof size === 'number') {
    return {
      style: {
        '--lc-avatar-size': `${size}px`,
        '--lc-avatar-font': `${Math.round(size * 0.42)}px`,
        '--lc-avatar-line': `${Math.round(size * 0.42 * 1.2)}px`,
      } as CSSProperties,
    };
  }
  return { attr: size ?? 'md', style: {} };
}

function radiusStyle(radius: AvatarProps['radius']): { attr?: AvatarRadius; style: CSSProperties } {
  if (typeof radius === 'number') {
    return { style: { '--lc-avatar-radius': `${radius}px` } as CSSProperties };
  }
  return { attr: radius ?? 'xs', style: {} };
}

const AvatarBase = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { src, alt, children, variant = 'light', size = 'md', radius = 'xs', className, style, ...rest },
  ref,
) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = src != null;
  const showImage = hasImage && !imgFailed;
  const isInitials = !hasImage && typeof children === 'string' && children.trim() !== '';
  // A provided-but-broken image keeps the image type (neutral fill) with a person glyph.
  const type = hasImage ? 'image' : isInitials ? 'initials' : 'icon';

  const s = sizeStyle(size);
  const r = radiusStyle(radius);

  return (
    <div
      {...rest}
      ref={ref}
      className={`lc-avatar${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-type={type}
      data-size={s.attr}
      data-radius={r.attr}
      role="img"
      aria-label={alt ?? (isInitials ? String(children) : undefined)}
      style={{ ...s.style, ...r.style, ...style }}
    >
      {showImage ? (
        <img
          className="lc-avatar__img"
          src={src}
          alt={alt ?? ''}
          onError={() => setImgFailed(true)}
        />
      ) : isInitials ? (
        <span className="lc-avatar__initials">{children}</span>
      ) : (
        <span className="lc-avatar__icon">
          {!hasImage && isValidElement(children) ? children : <PersonIcon />}
        </span>
      )}
    </div>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Show at most this many avatars; the rest collapse into a `+N` chip. */
  limit?: number;
  /** Props applied to every child Avatar (e.g. `size`, `radius`). */
  size?: AvatarSize | number;
  radius?: AvatarRadius | number;
  children?: ReactNode;
}

function AvatarGroup({ limit, size, radius, children, className, ...rest }: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement) as React.ReactElement<AvatarProps>[];
  const shown = limit != null ? items.slice(0, limit) : items;
  const overflow = items.length - shown.length;

  return (
    <div className={`lc-avatar-group${className ? ` ${className}` : ''}`} {...rest}>
      {shown.map((child, i) =>
        // eslint-disable-next-line react/no-array-index-key
        <AvatarBase
          key={i}
          {...child.props}
          size={child.props.size ?? size}
          radius={child.props.radius ?? radius}
        />,
      )}
      {overflow > 0 && (
        <AvatarBase className="lc-avatar-group__overflow" size={size} radius={radius}>
          {`+${overflow}`}
        </AvatarBase>
      )}
    </div>
  );
}

export const Avatar = Object.assign(AvatarBase, { Group: AvatarGroup });
export { AvatarGroup };
export { SIZE_PX as AVATAR_SIZE_PX };
export default Avatar;
