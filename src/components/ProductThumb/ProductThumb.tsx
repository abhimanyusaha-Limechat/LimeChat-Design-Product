import { useState } from 'react';
import { Modal } from '../Modal';
import { CloseIcon, PhotoIcon, ZoomIcon } from '../icons';
import { thumbPalette } from '../catalogUtils';
import './ProductThumb.css';

/**
 * Product tile: the photo when there is one (click or Enter/Space opens it full-size in a
 * modal), otherwise a tinted placeholder whose colour is derived from `colorKey`.
 * `size` is a pixel square, or 'lg' for a full-width banner tile.
 */
export function ProductThumb({
  colorKey,
  imageUrl,
  name,
  size = 40,
}: {
  colorKey: string;
  imageUrl?: string;
  name: string;
  size?: number | 'lg';
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const palette = thumbPalette(colorKey);
  const open = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setPreviewOpen(true);
  };

  return (
    <>
      <span
        className={`lc-thumb${size === 'lg' ? ' lc-thumb--lg' : ''}`}
        style={{
          ...(size === 'lg' ? null : { width: size, height: size }),
          ...(imageUrl ? null : { background: palette.bg, color: palette.fg }),
        }}
        data-clickable={imageUrl ? true : undefined}
        role={imageUrl ? 'button' : undefined}
        tabIndex={imageUrl ? 0 : undefined}
        aria-label={imageUrl ? `View ${name} image` : undefined}
        onClick={imageUrl ? open : undefined}
        onKeyDown={
          imageUrl
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  open(e);
                }
              }
            : undefined
        }
      >
        {imageUrl ? (
          <>
            <img className="lc-thumb__img" src={imageUrl} alt="" aria-hidden="true" />
            <span className="lc-thumb__zoom" aria-hidden="true">
              <ZoomIcon />
            </span>
          </>
        ) : (
          <PhotoIcon />
        )}
      </span>

      {imageUrl && previewOpen && (
        <Modal open onClose={() => setPreviewOpen(false)} title="" width={600} className="lc-thumb-preview-modal">
          <div className="lc-thumb-preview__frame">
            <img src={imageUrl} alt={name} className="lc-thumb-preview__image" />
            <button
              type="button"
              className="lc-thumb-preview__close"
              aria-label="Close"
              onClick={() => setPreviewOpen(false)}
            >
              <CloseIcon size={14} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
