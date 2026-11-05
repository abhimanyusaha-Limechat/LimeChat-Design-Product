/** The row of attached files above the reply box: an image thumbnail (click to preview) or a file box (extension, size, name), and a remove button. */
import { TrashIcon, ZoomIcon } from '../icons';

interface AttachmentTilesProps {
  files: File[];
  /** Object URL per file; empty for files that aren't images. */
  previewUrls: string[];
  onPreview: (index: number) => void;
  onRemove: (index: number) => void;
}

/** "512 B", "48 KB", "1.2 MB"; empty for zero-byte stand-ins (canned-response attachments). */
function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "report.final.pdf" → "PDF"; "FILE" when there's no extension. */
function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1, dot + 5).toUpperCase() : 'FILE';
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
            <div className="lc-ticket-composer__attachment-file" title={file.name}>
              <span className="lc-ticket-composer__attachment-ext" aria-hidden="true">
                {fileExtension(file.name)}
              </span>
              <span className="lc-ticket-composer__attachment-size">{formatFileSize(file.size)}</span>
              <span className="lc-ticket-composer__attachment-name">{file.name}</span>
            </div>
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
