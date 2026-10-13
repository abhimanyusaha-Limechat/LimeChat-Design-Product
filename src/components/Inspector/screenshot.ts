import { toCanvas } from 'html-to-image';
import { isIgnoredUi } from '../../hooks/usePageCapture';

/**
 * Downloads a PNG of the page as the app draws it, leaving out Inspect mode's
 * own UI (bar, overlay, panel) and, in dev, Agentation's. With `el`, the page
 * is cropped to that element's on-screen box, so the image matches what you
 * see — backgrounds behind it and anything overlapping it included.
 */
export async function downloadScreenshot(el?: Element): Promise<void> {
  const { clientWidth: width, clientHeight: height } = document.documentElement;
  const ratio = window.devicePixelRatio;
  // Read before the async capture, so the crop matches the frame being captured.
  const box = el?.getBoundingClientRect();
  const page = await toCanvas(document.body, {
    width,
    height,
    pixelRatio: ratio,
    cacheBust: true,
    filter: (node) => !isIgnoredUi(node),
  });
  const a = document.createElement('a');
  a.href = (box ? crop(page, box, width, height, ratio) : page).toDataURL('image/png');
  a.download = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
  a.click();
}

/** The part of `page` under `box` (viewport px), clipped to the viewport. */
export function crop(page: HTMLCanvasElement, box: DOMRect, width: number, height: number, ratio: number): HTMLCanvasElement {
  const left = Math.max(0, box.left);
  const top = Math.max(0, box.top);
  const w = Math.round((Math.min(width, box.right) - left) * ratio);
  const h = Math.round((Math.min(height, box.bottom) - top) * ratio);
  if (w <= 0 || h <= 0) throw new Error('The element is off screen');
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  out.getContext('2d')?.drawImage(page, left * ratio, top * ratio, w, h, 0, 0, w, h);
  return out;
}
