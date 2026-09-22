/**
 * TicketComposer — LimeChat design system (Figma node 8985:37228
 * "ticket_input", `Default` + `Private note` property states), the reply
 * box beneath an open ticket's conversation.
 *
 *   <TicketComposer
 *     mode={mode} onModeChange={setMode}
 *     value={draft} onChange={setDraft}
 *     maxLength={1000}
 *     onSend={() => send(draft)}
 *   />
 */
import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes } from 'react';
import { Button } from '../Button';
import './TicketComposer.css';
import { iconProps } from '../iconProps';

/** Line height (20px) × 6 visible lines + the textarea's own vertical padding (6px top + 6px bottom). */
const MAX_TEXTAREA_HEIGHT = 20 * 6 + 12;

export type TicketComposerMode = 'reply' | 'note' | 'template';

const MODE_LABEL: Record<TicketComposerMode, string> = {
  reply: 'Reply',
  note: 'Private note',
  template: 'Template',
};

const MODE_PLACEHOLDER: Record<TicketComposerMode, string> = {
  reply: "Type a message or use '/' for quick replies.",
  note: 'Type in a private note visible only to team members',
  template: "Type a message or use '/' for quick replies.",
};

const MicIcon = () => (
  <svg {...iconProps()}>
    <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M8 21l8 0" />
    <path d="M12 17l0 4" />
  </svg>
);
const PaperclipIcon = () => (
  <svg {...iconProps()}>
    <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" />
  </svg>
);
const SmileIcon = () => (
  <svg {...iconProps()}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 10l.01 0" />
    <path d="M15 10l.01 0" />
    <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
  </svg>
);
const CheckIcon = () => (
  <svg {...iconProps()}>
    <path d="M5 12l5 5l10 -10" />
  </svg>
);

export interface TicketComposerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  mode?: TicketComposerMode;
  onModeChange?: (mode: TicketComposerMode) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  onMic?: () => void;
  onAttach?: () => void;
  onEmoji?: () => void;
  sendLabel?: string;
  onSend?: () => void;
  sendDisabled?: boolean;
}

export const TicketComposer = forwardRef<HTMLDivElement, TicketComposerProps>(function TicketComposer(
  {
    mode = 'reply',
    onModeChange,
    value,
    onChange,
    placeholder,
    maxLength = 1000,
    onMic,
    onAttach,
    onEmoji,
    sendLabel,
    onSend,
    sendDisabled,
    className,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNote = mode === 'note';

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  const tabRefs = useRef<Partial<Record<TicketComposerMode, HTMLButtonElement>>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = tabRefs.current[mode];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [mode]);

  return (
    <div
      {...rest}
      ref={ref}
      className={`lc-ticket-composer${className ? ` ${className}` : ''}`}
      data-mode={mode}
      data-focused={focused || undefined}
    >
      <div className="lc-ticket-composer__input-row">
        <textarea
          ref={textareaRef}
          className="lc-ticket-composer__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder ?? MODE_PLACEHOLDER[mode]}
          rows={1}
          maxLength={maxLength}
        />
      </div>

      <div className="lc-ticket-composer__options">
        <div className="lc-ticket-composer__tabs" role="tablist">
          {indicator && (
            <div
              className="lc-ticket-composer__tab-indicator"
              style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
              aria-hidden="true"
            />
          )}
          {(Object.keys(MODE_LABEL) as TicketComposerMode[]).map((m) => (
            <button
              key={m}
              ref={(el) => {
                if (el) tabRefs.current[m] = el;
              }}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className="lc-ticket-composer__tab"
              data-active={mode === m || undefined}
              data-mode={m}
              onClick={() => onModeChange?.(m)}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>

        {!isNote && (
          <div className="lc-ticket-composer__counter">
            {value.length} / {maxLength}
          </div>
        )}

        <div className="lc-ticket-composer__end">
          <div className="lc-ticket-composer__icons">
            {!isNote && (
              <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Record voice note" onClick={onMic}>
                <MicIcon />
              </button>
            )}
            <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Attach file" onClick={onAttach}>
              <PaperclipIcon />
            </button>
            <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Insert emoji" onClick={onEmoji}>
              <SmileIcon />
            </button>
          </div>

          {isNote ? (
            <Button
              variant="filled"
              color="yellow"
              size="sm"
              leftSection={<CheckIcon />}
              onClick={onSend}
              disabled={sendDisabled}
            >
              {sendLabel ?? 'Save'}
            </Button>
          ) : (
            <Button variant="filled" color="primary" size="sm" onClick={onSend} disabled={sendDisabled}>
              {sendLabel ?? 'Reply'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

export default TicketComposer;
