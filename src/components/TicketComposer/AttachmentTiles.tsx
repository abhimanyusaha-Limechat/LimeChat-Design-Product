/** The row of attached files above the reply box: an image thumbnail (click to preview) or a paperclip, and a remove button. */
import { Icon, TrashIcon, ZoomIcon } from '../icons';

interface AttachmentTilesProps {
  files: File[];
  /** Object URL per file; empty for files that aren't images. */
  previewUrls: string[];
  onPreview: (index: number) => void;
  onRemove: (index: number) => void;
}

export function AttachmentTiles({ files, previewUrls, onPreview, onRemove }: AttachmentTilesProps) {
  return (
    <div className="lc-ticket-composer__attachments">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${file.lastModified}-${index}`}
          className="lc-ticket-composer__attachment-tile"
          data-multi={files.length > 1 || undefined}
        >
          {previewUrls[index] ? (
            <button
              type="button"
              className="lc-ticket-composer__attachment-preview"
              aria-label={`View ${file.name}`}
              onClick={() => onPreview(index)}
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
            onClick={() => onRemove(index)}
          >
            <TrashIcon size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
