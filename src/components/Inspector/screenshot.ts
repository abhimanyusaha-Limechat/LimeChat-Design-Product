import { toPng } from 'html-to-image';
import { isIgnoredUi } from './useInspectTarget';

/**
 * Downloads a PNG of the page as the app draws it, leaving out Inspect mode's
 * own UI (bar, overlay, panel) and, in dev, Agentation's.
 */
export async function downloadScreenshot(): Promise<void> {
  const { clientWidth: width, clientHeight: height } = document.documentElement;
  const url = await toPng(document.body, {
    width,
    height,
    pixelRatio: window.devicePixelRatio,
    cacheBust: true,
    filter: (node) => !isIgnoredUi(node),
  });
  const a = document.createElement('a');
  a.href = url;
  a.download = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
  a.click();
}
