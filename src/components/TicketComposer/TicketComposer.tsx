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
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import type { TicketChannel } from '../TicketListItem';
import { AttachmentTiles } from './AttachmentTiles';
import { FormattingToolbar } from './FormattingToolbar';
import { MODE_CONFIG, ModeTabs, type TicketComposerMode } from './ModeTabs';
import { useFileDrop } from './useFileDrop';
import { useTextHistory } from './useTextHistory';
import { applyFormat, supportsFormatting, type TextFormat } from './textFormat';
import { CannedResponsesDrawer, type CannedResponseOption } from './CannedResponsesDrawer';
import { iconProps } from '../iconProps';
import { Icon, CloseIcon } from '../icons';
import './TicketComposer.css';

export type { TicketComposerMode };

const MicIcon = () => (
  <svg {...iconProps()}>
    <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M8 21l8 0" />
    <path d="M12 17l0 4" />
  </svg>
);
/** A reply carries at most this many files, however they were added. */
const MAX_ATTACHMENTS = 5;

/** "/" followed by a shortcut so far, e.g. "/gree" — the whole draft, so a "/" mid-sentence stays a "/". */
const SLASH_COMMAND = /^\/[\w-]*$/;

export interface TicketComposerProps {
  mode?: TicketComposerMode;
  onModeChange?: (mode: TicketComposerMode) => void;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  /** Segmented control size: control heights 24 / 32 / 40 / 48 / 56 px. */
  tabSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onMic?: () => void;
  onEmoji?: () => void;
  onSend?: () => void;
  /** Rewrites the draft with AI; the button is disabled while the box is empty. */
  onAiImprove?: () => void;
  /** Replies the drawer offers; opened by the Canned responses button or by typing "/". */
  cannedResponses?: CannedResponseOption[];
  /** Where the reply goes; decides which formatting markers the toolbar writes (none for Instagram and SMS). */
  channel?: TicketChannel;
  /** Approved templates the Templates button offers, each with a serial `code`. */
  templates?: CannedResponseOption[];
}

export function TicketComposer({
  mode = 'reply',
  onModeChange,
  value,
  onChange,
  maxLength = 1000,
  tabSize = 'sm',
  onMic,
  onEmoji,
  onSend,
  onAiImprove,
  cannedResponses = [],
  channel,
  templates = [],
}: TicketComposerProps) {
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  // Bumped each time a file is turned away, so the notice shows again (and its timer restarts) on every attempt.
  const [limitNotice, setLimitNotice] = useState(0);
  useEffect(() => {
    if (limitNotice === 0) return;
    const timer = setTimeout(() => setLimitNotice(0), 4000);
    return () => clearTimeout(timer);
  }, [limitNotice]);
  const isNote = mode === 'note';

  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const drawerId = useId();
  // "/" opens the canned list and the Templates button the template list. Either way the box doubles as the
  // search field: text after "/" searches canned responses, any text searches templates.
  const [drawer, setDrawer] = useState<'canned' | 'templates' | null>(null);
  const drawerOpen = drawer !== null;
  const [activeIndex, setActiveIndex] = useState(0);
  const [formatOpen, setFormatOpen] = useState(false);
  const canFormat = !isNote && supportsFormatting(channel);
  const history = useTextHistory(value, onChange);

  const formatToggleRef = useRef<HTMLButtonElement>(null);

  const format = (kind: TextFormat) => {
    const box = textareaRef.current;
    if (!box || !channel) return;
    history.record(false);
    const next = applyFormat(value, box.selectionStart, box.selectionEnd, kind, channel);
    onChange(next.value);
    // The new value lands on the next render; put the selection back after it.
    requestAnimationFrame(() => {
      box.focus();
      box.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  };
  const query =
    drawer === 'templates'
      ? value.trim().toLowerCase()
      : SLASH_COMMAND.test(value)
        ? value.slice(1).toLowerCase().replace(/[-_]/g, ' ')
        : '';
  const shown = (drawer === 'templates' ? templates : cannedResponses).filter(
    (r) => r.name.toLowerCase().includes(query) || r.code?.includes(query),
  );
  const active = Math.min(activeIndex, shown.length - 1);

  const closeDrawer = () => setDrawer(null);
  const openDrawer = (kind: 'canned' | 'templates') => {
    // Each drawer starts from a clean box: canned responses from a "/", templates from empty (it then reads
    // "Search for templates"). Whatever was typed is replaced, and typing on narrows the list.
    const start = kind === 'canned' ? '/' : '';
    if (value !== start) {
      history.record(false);
      onChange(start);
    }
    setDrawer(kind);
    setActiveIndex(0);
    textareaRef.current?.focus();
  };

  const handleChange = (next: string) => {
    history.record(true);
    onChange(next);
    // Typing "/" opens the canned drawer and narrows it; other text there means the agent is writing, not searching.
    // The templates drawer stays open while typing, until a pick, Esc or a click outside.
    setDrawer((current) => (current === 'templates' ? current : SLASH_COMMAND.test(next) ? 'canned' : null));
    setActiveIndex(0);
  };

  const pickCanned = (option: CannedResponseOption) => {
    history.record(false);
    // ponytail: the demo has no picture data, so the image is an empty file carrying only its name.
    if (option.attachment) {
      addFiles([new File([], option.attachment)]);
      if (drawer === 'templates' || SLASH_COMMAND.test(value)) onChange(''); // drop the search text that found it
    } else onChange(option.message);
    closeDrawer();
    textareaRef.current?.focus();
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && ['z', 'y'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      if (e.key.toLowerCase() === 'y' || e.shiftKey) history.redo();
      else history.undo();
      return;
    }
    if (!drawerOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (shown.length > 0) setActiveIndex((active + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length);
    } else if (e.key === 'Enter' && shown[active]) {
      e.preventDefault();
      pickCanned(shown[active]);
    }
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeDrawer();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [drawerOpen]);
  const placeholder = MODE_CONFIG[mode].placeholder;
  // The empty reply box shows a hint sentence (with the Templates button inline) instead of the placeholder.
  const showHint = !isNote && value.length === 0 && attachments.length === 0 && drawer !== 'templates';

  const addFiles = (files: File[]) => {
    if (files.length > MAX_ATTACHMENTS - attachments.length) setLimitNotice((n) => n + 1);
    if (files.length > 0) setAttachments((prev) => [...prev, ...files].slice(0, MAX_ATTACHMENTS)); // extras are dropped
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = ''; // lets the same file be chosen again
  };

  // Dragging files over the composer turns the reply box into a dropzone.
  const { dragging, dropHandlers } = useFileDrop(addFiles);

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviewIndex((current) => (current === index ? null : current));
  };

  const handleSend = () => {
    onSend?.();
    setAttachments([]);
    history.reset();
  };

  const previewUrls = useMemo(
    () => attachments.map((file) => (file.type.startsWith('image/') ? URL.createObjectURL(file) : '')),
    [attachments],
  );
  useEffect(() => () => previewUrls.forEach((url) => url && URL.revokeObjectURL(url)), [previewUrls]);

  const previewFile = previewIndex !== null ? attachments[previewIndex] : null;
  const previewUrl = previewIndex !== null ? previewUrls[previewIndex] : undefined;

  return (
    <>
    <div
      ref={rootRef}
      className="lc-ticket-composer"
      data-mode={mode}
      data-focused={focused || undefined}
      {...dropHandlers}
    >
      {dragging && (
        <div className="lc-ticket-composer__dropzone" aria-hidden="true">
          <Icon name="paperclip" size={20} />
          <span>Drop files to attach</span>
          <span className="lc-ticket-composer__dropzone-hint">Up to {MAX_ATTACHMENTS} files</span>
        </div>
      )}

      {limitNotice > 0 && (
        <div className="lc-ticket-composer__notice" role="status">
          {MAX_ATTACHMENTS} files can be added as attachments
          <button type="button" aria-label="Dismiss" onClick={() => setLimitNotice(0)}>
            <CloseIcon size={12} />
          </button>
        </div>
      )}

      {drawerOpen && (
        <CannedResponsesDrawer
          id={drawerId}
          label={drawer === 'templates' ? 'Templates' : 'Canned responses'}
          options={shown}
          query={query}
          activeIndex={active}
          onActiveChange={setActiveIndex}
          onPick={pickCanned}
        />
      )}

      {attachments.length > 0 && (
        <AttachmentTiles files={attachments} previewUrls={previewUrls} onPreview={setPreviewIndex} onRemove={removeAttachment} />
      )}

      <div className="lc-ticket-composer__input-row">
        <textarea
          ref={textareaRef}
          className="lc-ticket-composer__textarea"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          aria-controls={drawerOpen ? drawerId : undefined}
          aria-activedescendant={drawerOpen && shown.length > 0 ? `${drawerId}-${active}` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={drawer === 'templates' ? 'Search for templates' : showHint ? '' : placeholder}
          aria-label={placeholder}
          rows={1}
          maxLength={maxLength}
        />
        {drawer === 'canned' && value === '/' && (
          // A textarea placeholder only shows when empty, so this prompt trails the "/" itself.
          <div className="lc-ticket-composer__slash-hint" aria-hidden="true">
            <span>/</span>Search for canned responses
          </div>
        )}
        {showHint && (
          // One sentence in place of the placeholder; click-through, so only the Templates button takes clicks.
          <div className="lc-ticket-composer__hint">
            Type a message, press / for canned responses, or choose from
            <Button variant="default" color="gray" size="xs" textTransform="none" onClick={() => openDrawer('templates')}>
              Templates
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        onChange={handleFilesSelected}
        style={{ display: 'none' }}
      />

      {canFormat && (
        <FormattingToolbar
          open={formatOpen}
          toggleRef={formatToggleRef}
          containerRef={rootRef}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={history.undo}
          onRedo={history.redo}
          onFormat={format}
        />
      )}

      <div className="lc-ticket-composer__options">
        <div className="lc-ticket-composer__start">
          <ModeTabs mode={mode} onModeChange={onModeChange} size={tabSize} />
          {canFormat && (
            <button
              type="button"
              ref={formatToggleRef}
              className="lc-ticket-composer__icon-btn lc-ticket-composer__format-toggle"
              aria-label="Formatting options"
              title="Formatting options"
              aria-pressed={formatOpen}
              onClick={() => setFormatOpen((open) => !open)}
            >
              Aa
            </button>
          )}
          <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Insert emoji" onClick={onEmoji}>
            <Icon name="mood-smile" />
          </button>
          <button
            type="button"
            className="lc-ticket-composer__icon-btn"
            aria-label="Improve with AI"
            title="Improve with AI"
            disabled={value.trim() === ''}
            onClick={onAiImprove}
          >
            <Icon name="sparkle" />
          </button>
        </div>

        {!isNote && (
          <div className="lc-ticket-composer__counter">
            {value.length} / {maxLength}
          </div>
        )}

        <div className="lc-ticket-composer__end">
          <div className="lc-ticket-composer__icons">
            {!isNote && (
              <button
                type="button"
                className="lc-ticket-composer__icon-btn"
                aria-label="Canned responses"
                title="Canned responses"
                aria-haspopup="listbox"
                aria-pressed={drawer === 'canned'}
                onClick={() => openDrawer('canned')}
              >
                <Icon name="bolt" />
              </button>
            )}
            {!isNote && (
              <button
                type="button"
                className="lc-ticket-composer__icon-btn"
                aria-label="Templates"
                title="Templates"
                aria-haspopup="listbox"
                aria-pressed={drawer === 'templates'}
                onClick={() => openDrawer('templates')}
            >
                <Icon name="layout" />
              </button>
            )}
            {!isNote && (
              <button type="button" className="lc-ticket-composer__icon-btn" aria-label="Record voice note" onClick={onMic}>
                <MicIcon />
              </button>
            )}
            <button
              type="button"
              className="lc-ticket-composer__icon-btn"
              aria-label="Attach file"
              title={attachments.length >= MAX_ATTACHMENTS ? `You can attach up to ${MAX_ATTACHMENTS} files` : 'Attach file'}
              disabled={attachments.length >= MAX_ATTACHMENTS}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="paperclip" />
            </button>
          </div>

          <Button variant="filled" color={isNote ? 'yellow' : 'primary'} size="sm" onClick={handleSend}>
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
