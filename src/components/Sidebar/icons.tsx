/** Icons for the sidebar rail — shapes live in `../iconPaths`; this wrapper names the set and adds `.lc-sidebar__icon`. */
import type { SVGProps } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';

export type { IconName as SidebarIconName } from '../iconPaths';

export function SidebarIcon(props: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <Icon className="lc-sidebar__icon" {...props} />;
}

/** LimeChat brand mark (leaf), from the Figma design system. */
export function LimeChatLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M28.5713 3.33333V16.3353H28.581C28.581 17.953 28.2627 19.5555 27.6435 21.0501C27.0243 22.5448 26.1167 23.9032 24.9726 25.0472C23.8285 26.1912 22.4695 27.098 20.9746 27.7171C19.5282 28.3161 17.9814 28.6307 16.417 28.6507V28.6663H13.6787V21.6517H16.2597V21.6331C16.9554 21.6331 17.6443 21.496 18.2871 21.2298C18.9299 20.9636 19.5138 20.5733 20.0058 20.0814C20.4978 19.5895 20.888 19.0053 21.1543 18.3626C21.4039 17.7599 21.5387 17.1166 21.5547 16.4652V10.1771H20.5322C19.1838 10.1771 17.8483 10.4434 16.6025 10.9593C15.3569 11.4752 14.2248 12.2317 13.2715 13.1849C12.3182 14.1381 11.5618 15.2696 11.0459 16.515C10.5299 17.7605 10.2646 19.0955 10.2646 20.4437V28.6497H3.41891V20.266H3.42087C3.4436 18.0795 3.88432 15.917 4.72165 13.8958C5.58167 11.8199 6.84251 9.93388 8.43161 8.34505C10.0207 6.75623 11.9071 5.49594 13.9834 4.63607C16.0061 3.79837 18.1702 3.35752 20.3584 3.33529V3.33333H28.5713Z"
        fill="currentColor"
      />
    </svg>
  );
}
