/**
 * TicketComposer — LimeChat design system (Figma node 8985:37228
 * "ticket_input", `Default` + `Private note` property states), the reply
 * box beneath an open ticket's conversation.
 *
 *   <TicketComposer
 *     mode={mode} onModeChange={setMode}
 *     value={draft} onChange={setDraft}
 *     channel="whatsapp"
 *     onSend={(mode) => send(mode, draft)}
 *   />
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button } from '../Button';
import { ActionMenu, Menu } from '../Menu';
import { Modal } from '../Modal';
import type { TicketChannel } from '../TicketListItem';
import { AttachmentTiles } from './AttachmentTiles';
import { CharCounter } from './CharCounter';
import { FormattingToolbar } from './FormattingToolbar';
import { MODE_CONFIG, ModeTabs, type TicketComposerMode } from './ModeTabs';
import { TemplateForm } from './TemplateForm';
import { useFileDrop } from './useFileDrop';
import { useTextHistory } from './useTextHistory';
import { applyFormat, type TextFormat } from './textFormat';
import { CHANNEL_CONFIG, NOTE_LIMIT, availableModes, isLocked, type ComposerMode, type LockReason } from './channelConfig';
import { CannedResponsesDrawer, type CannedResponseOption } from './CannedResponsesDrawer';
import { iconProps } from '../iconProps';
import { Icon, CloseIcon } from '../icons';
import './TicketComposer.css';

export type { TicketComposerMode };
export type AiImproveStyle = 'shorter' | 'professional';

const AI_STYLES: { style: AiImproveStyle; label: string }[] = [
  { style: 'shorter', label: 'Shorter' },
  { style: 'professional', label: 'Professional' },
];

const MicIcon = () => (
  <svg {...iconProps()} width={16} height={16}>
    <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M8 21l8 0" />
    <path d="M12 17l0 4" />
  </svg>
);
/** A reply carries at most this many files, however they were added. */
const MAX_ATTACHMENTS = 5;
const MAX_FILE_BYTES = 16 * 1024 * 1024;

/** "/" followed by a shortcut so far, e.g. "/gree" — the whole draft, so a "/" mid-sentence stays a "/". */
const SLASH_COMMAND = /^\/[\w-]*$/;

const LOCK_TEXT: Record<LockReason, string> = {
  billing: 'Replies are paused because of a billing issue. You can only leave a private note.',
  voicebot: 'A voicebot is handling this conversation. You can only leave a private note.',
};

export interface TicketComposerProps {
  mode?: TicketComposerMode;
  onModeChange?: (mode: TicketComposerMode) => void;
  value: string;
  onChange: (value: string) => void;
  /** Segmented control size: control heights 24 / 32 / 40 / 48 / 56 px. */
  tabSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onMic?: () => void;
  onEmoji?: () => void;
  /** Called with the mode it was sent from; a template send does not use the draft. */
  onSend?: (mode: ComposerMode) => void;
  /** Rewrites the draft with AI in the chosen style; the button is disabled while the box is empty. */
  onAiImprove?: (style: AiImproveStyle) => void;
  /** Replies the drawer offers; opened by the "/" button or by typing "/". */
  cannedResponses?: CannedResponseOption[];
  /** Where the reply goes; decides the limit, the tools and the tabs (see channelConfig.ts). */
  channel?: TicketChannel;
  /** Approved templates the Template tab offers, each with a serial `code`. */
  templates?: CannedResponseOption[];
  /** False once the channel's reply window has closed: only private notes are left. */
  windowOpen?: boolean;
  /** Shown in the closed-window banner, e.g. "2 days ago". */
  windowClosedAgo?: string;
  /** False when the contact opted out: no templates. */
  contactOptedIn?: boolean;
  /** Replies are blocked for this reason; only private notes are left. */
  lockReason?: LockReason;
}

export function TicketComposer({
  mode: requestedMode = 'reply',
  onModeChange,
  value,
  onChange,
  tabSize = 'sm',
  onMic,
  onEmoji,
  onSend,
  onAiImprove,
  cannedResponses = [],
  channel = 'whatsapp',
  templates = [],
  windowOpen = true,
  windowClosedAgo,
  contactOptedIn = true,
  lockReason,
}: TicketComposerProps) {
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  // A new object on every refusal, so the notice shows again (and its timer restarts) on every attempt.
  const [notice, setNotice] = useState<{ message: string } | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const config = CHANNEL_CONFIG[channel];
  const modeContext = { config, windowOpen, contactOptedIn, lockReason };
  const locked = isLocked(modeContext);
  const modes = availableModes(modeContext);
  // A tab that is not offered (locked ticket, opted-out contact) falls back to the first one that is.
  const mode = modes.includes(requestedMode) ? requestedMode : modes[0];
  const isNote = mode === 'note';
  const inTemplate = mode === 'template';
  const limit = isNote ? NOTE_LIMIT : config.limit;
  const lockText = lockReason
    ? LOCK_TEXT[lockReason]
    : locked
      ? `Reply window closed${windowClosedAgo ? ` ${windowClosedAgo}` : ''}. You can only leave a private note.`
      : null;

  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const drawerId = useId();
  // "/" (or its button) opens the canned list; the box doubles as the search field. The Template tab keeps its
  // own search text, so the draft survives a visit there.
  const [cannedOpen, setCannedOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<CannedResponseOption | null>(null);
  const [paramValues, setParamValues] = useState<string[]>([]);
  const drawer = inTemplate ? (picked ? null : 'templates') : cannedOpen && mode === 'reply' ? 'canned' : null;
  const [activeIndex, setActiveIndex] = useState(0);
  // The Aa strip takes the place of the tools strip while it is open.
  const [formatOpen, setFormatOpen] = useState(false);
  const canFormat = mode === 'reply' && config.formatting === 'markers';
  const formatShown = formatOpen && canFormat;
  const history = useTextHistory(value, onChange);

  const format = (kind: TextFormat) => {
    const box = textareaRef.current;
    if (!box) return;
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
      ? search.trim().toLowerCase()
      : drawer === 'canned' && SLASH_COMMAND.test(value)
        ? value.slice(1).toLowerCase().replace(/[-_]/g, ' ')
        : '';
  const shown = (drawer === 'templates' ? templates : cannedResponses).filter(
    (r) => r.name.toLowerCase().includes(query) || r.code?.includes(query),
  );
  const active = Math.min(activeIndex, shown.length - 1);

  const changeMode = (next: ComposerMode, viaKeyboard?: boolean) => {
    setCannedOpen(false);
    setFormatOpen(false);
    onModeChange?.(next);
    // A click on a tab moves on to the field it opens; arrow keys stay on the tab so they keep working.
    if (!viaKeyboard) requestAnimationFrame(() => (next === 'template' ? searchRef : textareaRef).current?.focus());
  };

  // Focus stays in the box, so the strip swap never drops it and Esc still reaches the composer.
  const toggleFormat = (open: boolean) => {
    setFormatOpen(open);
    textareaRef.current?.focus();
  };

  const openCanned = () => {
    // The drawer starts from a clean box: whatever was typed is replaced by "/", and typing on narrows the list.
    if (value !== '/') {
      history.record(false);
      onChange('/');
    }
    setFormatOpen(false);
    setCannedOpen(true);
    setActiveIndex(0);
    textareaRef.current?.focus();
  };

  const handleChange = (next: string) => {
    history.record(true);
    onChange(next);
    // Typing "/" opens the canned drawer and narrows it; other text there means the agent is writing, not searching.
    setCannedOpen(SLASH_COMMAND.test(next));
    setActiveIndex(0);
  };

  const pickCanned = (option: CannedResponseOption) => {
    history.record(false);
    // ponytail: the demo has no picture data, so the image is an empty file carrying only its name.
    if (option.attachment) {
      addFiles([new File([], option.attachment)]);
      if (SLASH_COMMAND.test(value)) onChange(''); // drop the search text that found it
    } else onChange(option.message);
    setCannedOpen(false);
    textareaRef.current?.focus();
  };

  const pickTemplate = (option: CannedResponseOption) => {
    setPicked(option);
    setParamValues((option.params ?? []).map(() => ''));
  };

  const pickOption = drawer === 'templates' ? pickTemplate : pickCanned;

  const canSend = inTemplate
    ? picked !== null && paramValues.every((v) => v.trim() !== '')
    : (value.trim() !== '' || attachments.length > 0) && value.length <= limit;
  // An empty reply box on a voice channel offers the mic where Send would be.
  const showMic = config.voice && mode === 'reply' && value === '' && attachments.length === 0;

  const handleSend = () => {
    onSend?.(mode);
    if (inTemplate) {
      setPicked(null);
      setSearch('');
      setParamValues([]);
    } else {
      setAttachments([]);
      history.reset();
    }
  };

  /** Arrows move through an open list and Enter picks from it. Returns whether the key was used. */
  const handleListKey = (e: React.KeyboardEvent): boolean => {
    if (!drawer) return false;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (shown.length > 0) setActiveIndex((active + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length);
      return true;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (shown[active]) pickOption(shown[active]);
      return true;
    }
    return false;
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && ['z', 'y'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      if (e.key.toLowerCase() === 'y' || e.shiftKey) history.redo();
      else history.undo();
      return;
    }
    if (handleListKey(e)) return;
    // Enter sends, Shift+Enter is a new line. Enter while an input method is composing belongs to the method.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) handleSend();
    }
  };

  // Esc closes whichever picker is open: the canned list, a picked template's form, the Aa strip.
  const handleRootKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape' || !(cannedOpen || formatShown || picked)) return;
    e.preventDefault();
    setCannedOpen(false);
    setFormatOpen(false);
    setPicked(null);
  };

  useEffect(() => {
    if (drawer !== 'canned') return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setCannedOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [drawer]);
  const placeholder = MODE_CONFIG[mode].placeholder;

  const addFiles = (files: File[]) => {
    const fits = files.filter((file) => file.size <= MAX_FILE_BYTES);
    if (fits.length < files.length) setNotice({ message: 'Files over 16 MB can not be attached' });
    else if (files.length > MAX_ATTACHMENTS - attachments.length) {
      setNotice({ message: `${MAX_ATTACHMENTS} files can be added as attachments` });
    }
    if (fits.length > 0) setAttachments((prev) => [...prev, ...fits].slice(0, MAX_ATTACHMENTS)); // extras are dropped
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

  const previewUrls = useMemo(
    () => attachments.map((file) => (file.type.startsWith('image/') ? URL.createObjectURL(file) : '')),
    [attachments],
  );
  useEffect(() => () => previewUrls.forEach((url) => url && URL.revokeObjectURL(url)), [previewUrls]);

  const previewFile = previewIndex !== null ? attachments[previewIndex] : null;
  const previewUrl = previewIndex !== null ? previewUrls[previewIndex] : undefined;

  const hasDraft = value.trim() !== '';
  const showEmoji = config.emoji && !inTemplate;
  const showCanned = mode === 'reply';
  const full = attachments.length >= MAX_ATTACHMENTS;

  // Narrow composers fold emoji, Aa and "/" into one "+" menu (the CSS container query swaps the two).
  const moreItems = [
    ...(showEmoji ? [{ key: 'emoji', label: 'Insert emoji', icon: <Icon name="mood-smile" />, onClick: () => onEmoji?.() }] : []),
    ...(canFormat
      ? [{ key: 'format', label: 'Formatting options', icon: <span aria-hidden="true">Aa</span>, disabled: !hasDraft, onClick: () => toggleFormat(true) }]
      : []),
    ...(showCanned ? [{ key: 'canned', label: 'Canned responses', icon: <Icon name="slash" />, onClick: openCanned }] : []),
  ];

  return (
    <>
    <div
      ref={rootRef}
      className="lc-ticket-composer"
      data-mode={mode}
      data-focused={focused || undefined}
      onKeyDown={handleRootKeyDown}
      {...dropHandlers}
    >
      {dragging && (
        <div className="lc-ticket-composer__dropzone" aria-hidden="true">
          <Icon name="paperclip" size={20} />
          <span>Drop files to attach</span>
          <span className="lc-ticket-composer__dropzone-hint">Up to {MAX_ATTACHMENTS} files</span>
        </div>
      )}

      {notice && (
        <div className="lc-ticket-composer__notice" role="status">
          {notice.message}
          <button type="button" aria-label="Dismiss" onClick={() => setNotice(null)}>
            <CloseIcon size={12} />
          </button>
        </div>
      )}

      {drawer && (
        <CannedResponsesDrawer
          id={drawerId}
          label={drawer === 'templates' ? 'Templates' : 'Canned responses'}
          options={shown}
          query={query}
          activeIndex={active}
          onActiveChange={setActiveIndex}
          onPick={pickOption}
        />
      )}

      {lockText && (
        <div className="lc-ticket-composer__banner" role="status">
          <Icon name="alert-triangle" size={16} />
          {lockText}
        </div>
      )}

      {attachments.length > 0 && (
        <AttachmentTiles files={attachments} previewUrls={previewUrls} onPreview={setPreviewIndex} onRemove={removeAttachment} />
      )}

      <div className="lc-ticket-composer__input-row">
        {inTemplate && picked ? (
          <TemplateForm template={picked} values={paramValues} onChange={setParamValues} onBack={() => setPicked(null)} />
        ) : inTemplate ? (
          <input
            ref={searchRef}
            type="search"
            className="lc-ticket-composer__textarea lc-ticket-composer__search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleListKey}
            aria-controls={drawerId}
            aria-activedescendant={shown.length > 0 ? `${drawerId}-${active}` : undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
        ) : (
          <textarea
            ref={textareaRef}
            className="lc-ticket-composer__textarea"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            aria-controls={drawer ? drawerId : undefined}
            aria-activedescendant={drawer && shown.length > 0 ? `${drawerId}-${active}` : undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            aria-label={placeholder}
            rows={1}
            maxLength={limit}
          />
        )}
        {drawer === 'canned' && value === '/' && (
          // A textarea placeholder only shows when empty, so this prompt trails the "/" itself.
          <div className="lc-ticket-composer__slash-hint" aria-hidden="true">
            <span>/</span>Search for canned responses
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

      <div className="lc-ticket-composer__tools-row">
        {formatShown ? (
          <FormattingToolbar
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            onBack={() => toggleFormat(false)}
            onUndo={history.undo}
            onRedo={history.redo}
            onFormat={format}
          />
        ) : (
          <div className="lc-ticket-composer__tools" role="toolbar" aria-label="Tools">
            {showEmoji && (
              <button type="button" className="lc-ticket-composer__icon-btn lc-ticket-composer__collapsible" aria-label="Insert emoji" title="Insert emoji" onClick={onEmoji}>
                <Icon name="mood-smile" />
              </button>
            )}
            {canFormat && (
              <button
                type="button"
                className="lc-ticket-composer__icon-btn lc-ticket-composer__format-toggle lc-ticket-composer__collapsible"
                aria-label="Formatting options"
                title="Formatting options"
                disabled={!hasDraft}
                onClick={() => toggleFormat(true)}
              >
                Aa
              </button>
            )}
            {moreItems.length > 0 && (
              <span className="lc-ticket-composer__more">
                <ActionMenu
                  ariaLabel="More tools"
                  tooltip="More tools"
                  align="start"
                  icon={<Icon name="plus" />}
                  items={moreItems}
                  triggerClassName="lc-ticket-composer__icon-btn"
                />
              </span>
            )}
            <Menu
              ariaLabel="Improve with AI"
              align="start"
              width={160}
              items={AI_STYLES.map(({ style, label }) => ({ key: style, label, onClick: () => onAiImprove?.(style) }))}
              trigger={({ ref, onClick, open }) => (
                <button
                  type="button"
                  ref={ref}
                  className="lc-ticket-composer__icon-btn"
                  aria-label="Improve with AI"
                  title="Improve with AI"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  disabled={!hasDraft || inTemplate}
                  onClick={onClick}
                >
                  <Icon name="sparkle" />
                </button>
              )}
            />
            <button
              type="button"
              className="lc-ticket-composer__icon-btn"
              aria-label="Attach file"
              title={full ? `${MAX_ATTACHMENTS}/${MAX_ATTACHMENTS} files attached` : `Attach file (${attachments.length}/${MAX_ATTACHMENTS})`}
              disabled={full || inTemplate}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="paperclip" />
            </button>
            {showCanned && (
              <button
                type="button"
                className="lc-ticket-composer__icon-btn lc-ticket-composer__collapsible"
                aria-label="Canned responses"
                title="Canned responses ( / )"
                aria-haspopup="listbox"
                aria-pressed={drawer === 'canned'}
                onClick={openCanned}
              >
                <Icon name="slash" />
              </button>
            )}
          </div>
        )}

        {!inTemplate && <CharCounter length={value.length} limit={limit} />}
      </div>

      <div className="lc-ticket-composer__footer">
        <ModeTabs mode={mode} modes={modes} onModeChange={changeMode} size={tabSize} />
        <Button
          variant="filled"
          color={isNote ? 'yellow' : 'primary'}
          size="sm"
          aria-label={showMic ? 'Record voice note' : undefined}
          disabled={!showMic && !canSend}
          onClick={showMic ? onMic : handleSend}
        >
          {showMic ? <MicIcon /> : MODE_CONFIG[mode].sendLabel}
        </Button>
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
