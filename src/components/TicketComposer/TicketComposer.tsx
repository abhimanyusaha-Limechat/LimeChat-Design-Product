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
import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactElement } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import './TicketComposer.css';
import { iconProps } from '../iconProps';
import { CloseIcon, TrashIcon } from '../icons';

/** Line height (20px) × 6 visible lines + the textarea's own vertical padding (6px top + 6px bottom). */
const MAX_TEXTAREA_HEIGHT = 20 * 6 + 12;

export type TicketComposerMode = 'reply' | 'note';

const MODE_LABEL: Record<TicketComposerMode, string> = {
  reply: 'Reply',
  note: 'Private note',
};

const MODES = Object.keys(MODE_LABEL) as TicketComposerMode[];

const MODE_PLACEHOLDER: Record<TicketComposerMode, string> = {
  reply: "Type a message or use '/' for quick replies.",
  note: 'Type in a private note visible only to team members',
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
const ZoomIcon = () => (
  <svg {...iconProps()}>
    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
    <path d="M21 21l-6 -6" />
    <path d="M7 10l6 0" />
    <path d="M10 7l0 6" />
  </svg>
);

const MODE_ICON: Record<TicketComposerMode, () => ReactElement> = {
  reply: ReplyIcon,
  note: LockIcon,
};

export interface TicketComposerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  mode?: TicketComposerMode;
  onModeChange?: (mode: TicketComposerMode) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  onMic?: () => void;
  onAttach?: (files: File[]) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const isNote = mode === 'note';

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setAttachments((prev) => [...prev, ...files]);
    onAttach?.(files);
  };

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviewIndex((current) => (current === index ? null : current));
  };

  const handleSend = () => {
    onSend?.();
    setAttachments([]);
  };

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = attachments.map((file) => (file.type.startsWith('image/') ? URL.createObjectURL(file) : ''));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => url && URL.revokeObjectURL(url));
  }, [attachments]);

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
    if (!el) return;
    const update = () => setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el.parentElement ?? el);
    return () => ro.disconnect();
  }, [mode]);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % MODES.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + MODES.length) % MODES.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = MODES.length - 1;
    if (nextIndex === null) return;
    e.preventDefault();
    const nextMode = MODES[nextIndex];
    onModeChange?.(nextMode);
    tabRefs.current[nextMode]?.focus();
  };

  const previewFile = previewIndex !== null ? attachments[previewIndex] : null;
  const previewUrl = previewIndex !== null ? previewUrls[previewIndex] : null;

  return (
    <>
    <div
      {...rest}
      ref={ref}
      className={`lc-ticket-composer${className ? ` ${className}` : ''}`}
      data-mode={mode}
      data-focused={focused || undefined}
    >
      {attachments.length > 0 && (
        <div className="lc-ticket-composer__attachments">
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="lc-ticket-composer__attachment-tile"
              data-multi={attachments.length > 1 || undefined}
              data-clickable={previewUrls[index] ? true : undefined}
              role={previewUrls[index] ? 'button' : undefined}
              tabIndex={previewUrls[index] ? 0 : undefined}
              aria-label={previewUrls[index] ? `View ${file.name}` : undefined}
              onClick={previewUrls[index] ? () => setPreviewIndex(index) : undefined}
              onKeyDown={
                previewUrls[index]
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPreviewIndex(index);
                      }
                    }
                  : undefined
              }
            >
              {previewUrls[index] ? (
                <>
                  <img src={previewUrls[index]} alt={file.name} className="lc-ticket-composer__attachment-thumb" />
                  <div className="lc-ticket-composer__attachment-zoom" aria-hidden="true">
                    <ZoomIcon />
                  </div>
                </>
              ) : (
                <PaperclipIcon />
              )}
              <button
                type="button"
                className="lc-ticket-composer__attachment-bin"
                aria-label={`Remove ${file.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeAttachment(index);
                }}
              >
                <TrashIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="lc-ticket-composer__input-row">
        <textarea
          ref={textareaRef}
          className="lc-ticket-composer__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder ?? MODE_PLACEHOLDER[mode]}
          aria-label={placeholder ?? MODE_PLACEHOLDER[mode]}
          rows={1}
          maxLength={maxLength}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        onChange={handleFilesSelected}
        style={{ display: 'none' }}
      />

      <div className="lc-ticket-composer__options">
        <div className="lc-ticket-composer__tabs" role="tablist">
          {indicator && (
            <div
              className="lc-ticket-composer__tab-indicator"
              style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
              aria-hidden="true"
            />
          )}
          {MODES.map((m, index) => {
            const Icon = MODE_ICON[m];
            return (
              <button
                key={m}
                ref={(el) => {
                  if (el) tabRefs.current[m] = el;
                  else delete tabRefs.current[m];
                }}
                type="button"
                role="tab"
                aria-selected={mode === m}
                tabIndex={mode === m ? 0 : -1}
                className="lc-ticket-composer__tab"
                data-active={mode === m || undefined}
                data-mode={m}
                onClick={() => onModeChange?.(m)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
              >
                <Icon />
                {MODE_LABEL[m]}
              </button>
            );
          })}
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
            <button
              type="button"
              className="lc-ticket-composer__icon-btn"
              aria-label="Attach file"
              onClick={() => fileInputRef.current?.click()}
            >
              <PaperclipIcon />
            </button>
            <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Insert emoji" onClick={onEmoji}>
              <SmileIcon />
            </button>
          </div>

          {isNote ? (
            <Button variant="filled" color="yellow" size="sm" onClick={handleSend} disabled={sendDisabled}>
              {sendLabel ?? 'Save'}
            </Button>
          ) : (
            <Button variant="filled" color="primary" size="sm" onClick={handleSend} disabled={sendDisabled}>
              {sendLabel ?? 'Reply'}
            </Button>
          )}
        </div>
      </div>
    </div>

    {previewFile && (
      <Modal open onClose={() => setPreviewIndex(null)} title="" width={600} className="lc-ticket-composer__preview-modal">
        <div className="lc-ticket-composer__preview-frame">
          <img src={previewUrl ?? undefined} alt={previewFile.name} className="lc-ticket-composer__preview-image" />
          <button
            type="button"
            className="lc-ticket-composer__preview-close"
            aria-label="Close"
            onClick={() => setPreviewIndex(null)}
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </Modal>
    )}
    </>
  );
});

export default TicketComposer;
