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
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { iconProps } from '../iconProps';
import { Icon, CloseIcon, TrashIcon, ZoomIcon } from '../icons';
import './TicketComposer.css';

export type TicketComposerMode = 'reply' | 'note';

const MicIcon = () => (
  <svg {...iconProps()}>
    <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M8 21l8 0" />
    <path d="M12 17l0 4" />
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

const MODE_CONFIG: Record<TicketComposerMode, { label: string; placeholder: string; Icon: () => ReactElement }> = {
  reply: { label: 'Reply', placeholder: "Type a message or use '/' for quick replies.", Icon: ReplyIcon },
  note: { label: 'Private note', placeholder: 'Type in a private note visible only to team members', Icon: LockIcon },
};
const MODES = Object.keys(MODE_CONFIG) as TicketComposerMode[];

export interface TicketComposerProps {
  mode?: TicketComposerMode;
  onModeChange?: (mode: TicketComposerMode) => void;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  onMic?: () => void;
  onEmoji?: () => void;
  onSend?: () => void;
}

export function TicketComposer({
  mode = 'reply',
  onModeChange,
  value,
  onChange,
  maxLength = 1000,
  onMic,
  onEmoji,
  onSend,
}: TicketComposerProps) {
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const isNote = mode === 'note';
  const placeholder = MODE_CONFIG[mode].placeholder;
  // Nothing to send: empty text and no attachments.
  const cannotSend = value.trim() === '' && attachments.length === 0;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length > 0) setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviewIndex((current) => (current === index ? null : current));
  };

  const handleSend = () => {
    if (cannotSend) return;
    onSend?.();
    setAttachments([]);
  };

  const previewUrls = useMemo(
    () => attachments.map((file) => (file.type.startsWith('image/') ? URL.createObjectURL(file) : '')),
    [attachments],
  );
  useEffect(() => () => previewUrls.forEach((url) => url && URL.revokeObjectURL(url)), [previewUrls]);

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

  // Two tabs: either arrow flips to the other one; Home/End jump to the ends.
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const nextMode = MODES[e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - index];
    onModeChange?.(nextMode);
    tabRefs.current[nextMode]?.focus();
  };

  const previewFile = previewIndex !== null ? attachments[previewIndex] : null;
  const previewUrl = previewIndex !== null ? previewUrls[previewIndex] : undefined;

  return (
    <>
    <div className="lc-ticket-composer" data-mode={mode} data-focused={focused || undefined}>
      {attachments.length > 0 && (
        <div className="lc-ticket-composer__attachments">
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="lc-ticket-composer__attachment-tile"
              data-multi={attachments.length > 1 || undefined}
            >
              {previewUrls[index] ? (
                <button
                  type="button"
                  className="lc-ticket-composer__attachment-preview"
                  aria-label={`View ${file.name}`}
                  onClick={() => setPreviewIndex(index)}
                >
                  <img src={previewUrls[index]} alt="" className="lc-ticket-composer__attachment-thumb" />
                  <span className="lc-ticket-composer__attachment-zoom" aria-hidden="true">
                    <ZoomIcon />
                  </span>
                </button>
              ) : (
                <Icon name="paperclip" />
              )}
              <button
                type="button"
                className="lc-ticket-composer__attachment-bin"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeAttachment(index)}
              >
                <TrashIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="lc-ticket-composer__input-row">
        <textarea
          className="lc-ticket-composer__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // Modifier+Enter rather than bare Enter: agents write multi-line replies, and a
          // bare-Enter send is the most common accidental-send path in chat tools.
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
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
                aria-selected={mode === m}
                tabIndex={mode === m ? 0 : -1}
                className="lc-ticket-composer__tab"
                data-active={mode === m || undefined}
                data-mode={m}
                onClick={() => onModeChange?.(m)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
              >
                <ModeIcon />
                {label}
              </button>
            );
          })}
        </div>

        <div className="lc-ticket-composer__end">
          {!isNote && (
            <span className="lc-ticket-composer__counter" aria-live="polite">
              {value.length}/{maxLength}
            </span>
          )}
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
              <Icon name="paperclip" />
            </button>
            <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Insert emoji" onClick={onEmoji}>
              <Icon name="mood-smile" />
            </button>
          </div>

          <Button
            variant="filled"
            color={isNote ? 'yellow' : 'primary'}
            size="sm"
            onClick={handleSend}
            disabled={cannotSend}
            title={isNote ? 'Save note (⌘/Ctrl + Enter)' : 'Send (⌘/Ctrl + Enter)'}
          >
            {isNote ? 'Save' : 'Reply'}
          </Button>
        </div>
      </div>
    </div>

    {previewFile && (
      <Modal open onClose={() => setPreviewIndex(null)} title="" width={600} className="lc-ticket-composer__preview-modal">
        <div className="lc-ticket-composer__preview-frame">
          <img src={previewUrl} alt={previewFile.name} className="lc-ticket-composer__preview-image" />
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
}

export default TicketComposer;
