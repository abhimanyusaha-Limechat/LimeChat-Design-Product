/**
 * Canned responses tab → Edit: how agents find the reply (Shortcut), whether it is text or an
 * image (Format) and what it sends (Message / Attachment). Controlled: every edit goes out through
 * `onChange` and the caller saves the draft when Update is clicked.
 */
import { useId, useRef } from 'react';
import type { BotTemplateRow } from '../BotTemplatesTable';
import { Button } from '../Button';
import { Icon } from '../icons';
import { NativeSelect } from '../Select';
import { Card, RemoveButton } from './RuleEdit';

export interface CannedResponse {
  name: string;
  /** Typed after "/" in the composer to insert the reply; letters, numbers, "-" and "_". */
  shortcut: string;
  mediaType: 'text' | 'image';
  /** The reply for a text response; the caption for an image. */
  message: string;
  /** The image's file name; empty for a text response. */
  attachment: string;
  /** The chosen image's blob URL, for the preview; empty for a saved file that isn't loaded here. */
  attachmentUrl: string;
}

const FORMATS = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
];

/** "Size guide" → "size-guide". */
const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** What the edit page starts from: a list row. ponytail: demo rows have no stored message, so the list's description stands in for it. */
export function cannedFor(row: BotTemplateRow): CannedResponse {
  const image = row.mediaType === 'image';
  return {
    name: row.name,
    shortcut: slug(row.name),
    mediaType: image ? 'image' : 'text',
    message: image ? '' : row.description,
    attachment: image ? `${slug(row.name)}.png` : '',
    attachmentUrl: '',
  };
}

/** The image's name and preview, a way to replace or remove it, and a button to choose one while there is none. */
function AttachmentPicker({
  name,
  url,
  onChange,
}: {
  name: string;
  url: string;
  onChange: (patch: Pick<CannedResponse, 'attachment' | 'attachmentUrl'>) => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="lc-ce__attach">
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        aria-label="Choose an image"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          // ponytail: a blob URL stands in for an upload (it lasts until the page closes); this becomes the file's address once there is a server.
          if (file) onChange({ attachment: file.name, attachmentUrl: URL.createObjectURL(file) });
          e.currentTarget.value = ''; // picking the same file again still counts
        }}
      />
      {name ? (
        <div className="lc-ce__picked">
          <div className="lc-ce__preview" role="img" aria-label={url ? `Preview of ${name}` : `${name}, no preview available`}>
            {url ? <img src={url} alt="" /> : <Icon name="photo" size={32} />}
          </div>
          <div className="lc-ce__info">
            <span className="lc-ce__filename" title={name}>
              {name}
            </span>
            {!url && <span className="lc-re__hint">Saved image. Choose a new one to see a preview.</span>}
            <div className="lc-ce__buttons">
              <Button variant="outline" size="xs" onClick={() => input.current?.click()}>
                Replace image
              </Button>
              <RemoveButton label="Remove image" onClick={() => onChange({ attachment: '', attachmentUrl: '' })} />
            </div>
          </div>
        </div>
      ) : (
        <button type="button" className="lc-ce__drop" onClick={() => input.current?.click()}>
          <Icon name="photo" size={24} />
          <span className="lc-ce__drop-title">Choose an image</span>
          <span className="lc-re__hint">PNG, JPG, GIF or WebP</span>
        </button>
      )}
    </div>
  );
}

/** The response can be saved once it can be found and has something to send. */
export const isCannedComplete = ({ shortcut, mediaType, message, attachment }: CannedResponse) =>
  shortcut !== '' && (mediaType === 'image' ? attachment !== '' : message.trim() !== '');

export function CannedEdit({ response, onChange }: { response: CannedResponse; onChange: (patch: Partial<CannedResponse>) => void }) {
  const { shortcut, mediaType, message, attachment, attachmentUrl } = response;
  const shortcutId = useId();
  const image = mediaType === 'image';

  return (
    <div className="lc-re">
      <Card title="Shortcut" description="Agents type / and this word in the reply box to insert the response.">
        <div className="lc-re__unit">
          <label className="lc-re__word" htmlFor={shortcutId}>
            /
          </label>
          <input
            id={shortcutId}
            className="lc-inbs__input lc-ce__shortcut"
            type="text"
            placeholder="greeting"
            maxLength={32}
            autoComplete="off"
            spellCheck={false}
            value={shortcut}
            onChange={(e) => onChange({ shortcut: e.currentTarget.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
          />
        </div>
      </Card>

      <Card title="Format" description="Text sends the message as it is. Image sends the picture below, with the message as its caption.">
        <NativeSelect
          size="sm"
          aria-label="Format"
          wrapperClassName="lc-re__control"
          data={FORMATS}
          value={mediaType}
          onChange={(e) => onChange({ mediaType: e.currentTarget.value === 'image' ? 'image' : 'text' })}
        />
        {image && <AttachmentPicker name={attachment} url={attachmentUrl} onChange={onChange} />}
      </Card>

      <Card title={image ? 'Caption' : 'Message'} description="What the customer receives. Press Enter for a new line.">
        <textarea
          aria-label={image ? 'Caption' : 'Message'}
          className="lc-inbs__input lc-inbs__textarea"
          rows={6}
          value={message}
          onChange={(e) => onChange({ message: e.currentTarget.value })}
        />
        {!image && message.trim() === '' && <p className="lc-re__hint">Write the message to send.</p>}
      </Card>
    </div>
  );
}
