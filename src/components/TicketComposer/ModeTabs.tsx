/**
 * The Reply / Private note / Template segmented control. Labels are always visible; in a narrow composer
 * they collapse to icons (see the container query in the CSS). A white pill behind the tabs follows the
 * active tab's box.
 */
import { useLayoutEffect, useRef, useState, type ReactElement } from 'react';
import { iconProps } from '../iconProps';
import { Icon } from '../icons';
import { Tooltip } from '../Tooltip';
import type { ComposerMode } from './channelConfig';

export type TicketComposerMode = ComposerMode;

const ReplyIcon = () => (
  <svg {...iconProps()}>
    <path d="M9 13l-4 -4l4 -4" />
    <path d="M5 9h7a4 4 0 1 1 0 8h-1" />
  </svg>
);
const LockIcon = () => (
  <svg {...iconProps()}>
    <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
    <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
    <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
  </svg>
);

export const MODE_CONFIG: Record<
  TicketComposerMode,
  { label: string; hint: string; sendLabel: string; placeholder: string; Icon: () => ReactElement }
> = {
  reply: { label: 'Reply', hint: 'Reply to the customer', sendLabel: 'Reply', placeholder: "Type a message... ('/' for canned responses)", Icon: ReplyIcon },
  template: { label: 'Template', hint: 'Send a pre-approved template message', sendLabel: 'Send', placeholder: 'Search templates', Icon: () => <Icon name="layout" /> },
  note: { label: 'Private note', hint: 'Private note: only your team can see this', sendLabel: 'Create', placeholder: 'Visible only to your team. Type @ to mention.', Icon: LockIcon },
};

interface ModeTabsProps {
  mode: TicketComposerMode;
  /** The tabs to show, in order. Hidden tabs are not rendered, so the arrow keys skip them. */
  modes: TicketComposerMode[];
  /** `viaKeyboard` is true when an arrow / Home / End key made the change. */
  onModeChange?: (mode: TicketComposerMode, viaKeyboard?: boolean) => void;
  /** Control heights 24 / 32 / 40 / 48 / 56 px. */
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Why only a note is left (locked ticket); shown as a tooltip on the static label. */
  lockHint?: string | null;
}

export function ModeTabs({ mode, modes, onModeChange, size, lockHint }: ModeTabsProps) {
  const tabRefs = useRef<Partial<Record<TicketComposerMode, HTMLButtonElement>>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = tabRefs.current[mode];
    if (!el) return;
    const update = () => setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    update();
    const ro = new ResizeObserver(update);
    // The label reveal animates tab widths, so the indicator follows every frame
    // of every tab's resize instead of easing on its own.
    Object.values(tabRefs.current).forEach((tab) => ro.observe(tab));
    return () => ro.disconnect();
  }, [mode, modes]);

  // Arrows move to the neighbouring visible tab and wrap; Home/End jump to the ends.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' ? 1 : -1;
    const nextMode = modes[e.key === 'Home' ? 0 : e.key === 'End' ? modes.length - 1 : (index + step + modes.length) % modes.length];
    onModeChange?.(nextMode, true);
    tabRefs.current[nextMode]?.focus();
  };

  // One mode left (locked ticket): a static label, not a one-tab tablist.
  if (modes.length === 1) {
    const { label, Icon: ModeIcon } = MODE_CONFIG[modes[0]];
    return (
      <Tooltip label={lockHint ?? MODE_CONFIG[modes[0]].hint}>
        <span className="lc-ticket-composer__mode-label">
          <ModeIcon />
          {label}
        </span>
      </Tooltip>
    );
  }

  return (
    <div className="lc-ticket-composer__tabs" role="tablist" data-size={size}>
      {indicator && (
        <div
          className="lc-ticket-composer__tab-indicator"
          style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
          aria-hidden="true"
        />
      )}
      {modes.map((m, index) => {
        const { label, hint, Icon: ModeIcon } = MODE_CONFIG[m];
        return (
          <Tooltip key={m} label={hint}>
          <button
            ref={(el) => {
              if (el) tabRefs.current[m] = el;
              else delete tabRefs.current[m];
            }}
            type="button"
            role="tab"
            aria-label={label}
            aria-selected={mode === m}
            tabIndex={mode === m ? 0 : -1}
            className="lc-ticket-composer__tab"
            data-active={mode === m || undefined}
            data-mode={m}
            onClick={() => onModeChange?.(m)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <ModeIcon />
            <span className="lc-ticket-composer__tab-label" aria-hidden="true">
              {label}
            </span>
          </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
