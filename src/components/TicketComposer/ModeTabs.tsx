/**
 * The Reply / Private note segmented control. The active tab shows its label and the other collapses to
 * its icon; a white pill behind them follows the active tab's box on every frame of that resize.
 */
import { useLayoutEffect, useRef, useState, type ReactElement } from 'react';
import { iconProps } from '../iconProps';

export type TicketComposerMode = 'reply' | 'note';

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

export const MODE_CONFIG: Record<TicketComposerMode, { label: string; placeholder: string; Icon: () => ReactElement }> = {
  reply: { label: 'Reply', placeholder: "Type a message, press '/' for canned responses, or choose from templates", Icon: ReplyIcon },
  note: { label: 'Private note', placeholder: 'Type in a private note visible only to team members', Icon: LockIcon },
};
const MODES = Object.keys(MODE_CONFIG) as TicketComposerMode[];

interface ModeTabsProps {
  mode: TicketComposerMode;
  onModeChange?: (mode: TicketComposerMode) => void;
  /** Control heights 24 / 32 / 40 / 48 / 56 px. */
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ModeTabs({ mode, onModeChange, size }: ModeTabsProps) {
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
  }, [mode]);

  // Two tabs: either arrow flips to the other one; Home/End jump to the ends.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const nextMode = MODES[e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - index];
    onModeChange?.(nextMode);
    tabRefs.current[nextMode]?.focus();
  };

  return (
    <div className="lc-ticket-composer__tabs" role="tablist" data-size={size}>
      {indicator && (
        <div
          className="lc-ticket-composer__tab-indicator"
          style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
          aria-hidden="true"
        />
      )}
      {MODES.map((m, index) => {
        const { label, Icon: ModeIcon } = MODE_CONFIG[m];
        return (
          <button
            key={m}
            ref={(el) => {
              if (el) tabRefs.current[m] = el;
              else delete tabRefs.current[m];
            }}
            type="button"
            role="tab"
            aria-label={label}
            title={label}
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
              <span>{label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
