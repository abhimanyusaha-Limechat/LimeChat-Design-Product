/**
 * Text formatting for the reply box. The box is plain text, so formatting means wrapping the selection
 * in the markers the channel renders. WhatsApp and the web widget use markers (see `formatting` in channelConfig.ts);
 * email has its own editor and the other channels render none.
 */
import type { TicketChannel } from '../TicketListItem/TicketListItem';

export type TextFormat = 'bold' | 'italic' | 'strikethrough' | 'monospace';

export const TEXT_FORMATS: { format: TextFormat; label: string }[] = [
  { format: 'bold', label: 'Bold' },
  { format: 'italic', label: 'Italic' },
  { format: 'strikethrough', label: 'Strikethrough' },
  { format: 'monospace', label: 'Monospace' },
];

const MARKER_SET: Record<TextFormat, string> = { bold: '*', italic: '_', strikethrough: '~', monospace: '```' };

const MARKERS: Partial<Record<TicketChannel, Record<TextFormat, string>>> = {
  whatsapp: MARKER_SET,
  widget: MARKER_SET,
};

/** Marker positions on the line holding `pos`, paired in order: [open, close] start indexes. */
function spanAround(value: string, pos: number, marker: string): [number, number] | null {
  const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
  const nl = value.indexOf('\n', pos);
  const line = value.slice(lineStart, nl === -1 ? value.length : nl);
  for (let from = 0; ; ) {
    const open = line.indexOf(marker, from);
    const close = open === -1 ? -1 : line.indexOf(marker, open + marker.length);
    if (close === -1) return null;
    if (pos >= lineStart + open + marker.length && pos <= lineStart + close) return [lineStart + open, lineStart + close];
    from = close + marker.length;
  }
}

/**
 * Toggles the channel's marker: unwraps when the selection (or the caret's span) is already marked, wraps otherwise.
 * With nothing selected the caret lands between a new pair, and between an empty pair it removes the pair.
 */
export function applyFormat(
  value: string,
  start: number,
  end: number,
  format: TextFormat,
  channel: TicketChannel,
): { value: string; selectionStart: number; selectionEnd: number } {
  const marker = MARKERS[channel]?.[format];
  if (!marker) return { value, selectionStart: start, selectionEnd: end };
  const m = marker.length;
  const unwrap = (open: number, close: number, from: number, to: number) => ({
    value: value.slice(0, open) + value.slice(open + m, close) + value.slice(close + m),
    selectionStart: from,
    selectionEnd: to,
  });
  if (start === end) {
    const span = spanAround(value, start, marker);
    if (span) return unwrap(span[0], span[1], start - m, start - m);
  } else {
    if (value.slice(start - m, start) === marker && value.slice(end, end + m) === marker) {
      return unwrap(start - m, end, start - m, end - m);
    }
    const inner = value.slice(start, end);
    if (inner.length >= 2 * m && inner.startsWith(marker) && inner.endsWith(marker)) {
      return unwrap(start, end - m, start, end - 2 * m);
    }
  }
  return {
    value: value.slice(0, start) + marker + value.slice(start, end) + marker + value.slice(end),
    selectionStart: start + m,
    selectionEnd: end + m,
  };
}
