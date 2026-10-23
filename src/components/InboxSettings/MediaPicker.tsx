/**
 * A file slot in InboxSettings: a card with a thumbnail, the file's name and kind, and
 * Remove / Replace. Empty, it shows a placeholder card whose edit button picks a file.
 * Uploads become object URLs, freed when replaced or removed.
 */
import { useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { Icon, PhotoIcon } from '../icons';

export interface MediaFile {
  name: string;
  kind: 'image' | 'video';
  /** Unset for a built-in file, which shows `fallbackThumb`. */
  src?: string;
}

const KINDS: Record<MediaFile['kind'], { types: string[]; hint: string }> = {
  image: { types: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'], hint: 'a PNG, JPG, WebP or SVG image' },
  video: { types: ['video/mp4', 'video/webm'], hint: 'an MP4 or WebM video' },
};

export function MediaPicker({
  label,
  placeholder,
  kind,
  maxMb,
  value,
  fallbackThumb,
  off,
  onChange,
}: {
  /** Names the buttons for screen readers ("Replace {label}"). */
  label: string;
  /** Shown in the empty card. */
  placeholder: string;
  /** What can be picked: images or videos. */
  kind: MediaFile['kind'];
  maxMb: number;
  value: MediaFile | null;
  fallbackThumb?: ReactNode;
  off: boolean;
  onChange: (next: MediaFile | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const [error, setError] = useState<string | null>(null);
  const replace = (next: MediaFile | null) => {
    if (value?.src) URL.revokeObjectURL(value.src);
    onChange(next);
  };
  const thumb = !value ? (
    <span className="lc-inbs__media-thumb lc-inbs__media-thumb--empty" aria-hidden="true">
      <PhotoIcon size={24} />
    </span>
  ) : !value.src ? (
    fallbackThumb
  ) : value.kind === 'video' ? (
    <video className="lc-inbs__media-thumb" src={value.src} muted aria-hidden="true" />
  ) : (
    <img className="lc-inbs__media-thumb" src={value.src} alt="" />
  );
  return (
    <div className="lc-inbs__field">
      <div className="lc-inbs__media">
        {thumb}
        <div className="lc-inbs__media-text">
          <span className="lc-inbs__media-name">{value ? value.name : placeholder}</span>
          {value && <span className="lc-inbs__row-desc">{value.kind === 'video' ? 'Video' : 'Image'}</span>}
        </div>
        {value && (
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            className="lc-inbs__icon-btn"
            aria-label={`Remove ${label}`}
            disabled={off}
            onClick={() => replace(null)}
          >
            <Icon name="trash" size={16} />
          </Button>
        )}
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          className="lc-inbs__icon-btn"
          aria-label={`${value ? 'Replace' : 'Upload'} ${label}`}
          disabled={off}
          onClick={() => inputRef.current?.click()}
        >
          <Icon name="edit" size={16} />
        </Button>
      </div>
      {error && (
        <p id={errorId} className="lc-inbs__error" role="alert">
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={KINDS[kind].types.join(',')}
        hidden
        aria-label={`Choose ${label} file`}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = ''; // so picking the same file again still fires
          if (!file) return;
          if (!KINDS[kind].types.includes(file.type)) return setError(`Use ${KINDS[kind].hint}.`);
          if (file.size > maxMb * 1024 * 1024) return setError(`File must be ${maxMb} MB or smaller.`);
          setError(null);
          replace({ name: file.name, kind: file.type.startsWith('video/') ? 'video' : 'image', src: URL.createObjectURL(file) });
        }}
      />
    </div>
  );
}
