/**
 * Text formatting for the reply box. The box is plain text, so formatting means wrapping the selection
 * in the markers each channel renders: WhatsApp's own, email's markdown. Channels with no formatting
 * support (Instagram, SMS) have no entry, and the toolbar stays hidden for them.
 */
import type { TicketChannel } from '../TicketListItem/TicketListItem';

export type TextFormat = 'bold' | 'italic' | 'strikethrough' | 'monospace';

export const TEXT_FORMATS: { format: TextFormat; label: string }[] = [
  { format: 'bold', label: 'Bold' },
  { format: 'italic', label: 'Italic' },
  { format: 'strikethrough', label: 'Strikethrough' },
  { format: 'monospace', label: 'Monospace' },
];

const MARKERS: Partial<Record<TicketChannel, Record<TextFormat, string>>> = {
  whatsapp: { bold: '*', italic: '_', strikethrough: '~', monospace: '```' },
  email: { bold: '**', italic: '_', strikethrough: '~~', monospace: '`' },
};

export const supportsFormatting = (channel?: TicketChannel) => channel !== undefined && channel in MARKERS;

/** Wraps value[start, end) in the channel's markers; with nothing selected the caret lands between them. */
export function applyFormat(
  value: string,
  start: number,
  end: number,
  format: TextFormat,
  channel: TicketChannel,
): { value: string; selectionStart: number; selectionEnd: number } {
  const marker = MARKERS[channel]?.[format];
  if (!marker) return { value, selectionStart: start, selectionEnd: end };
  return {
    value: value.slice(0, start) + marker + value.slice(start, end) + marker + value.slice(end),
    selectionStart: start + marker.length,
    selectionEnd: end + marker.length,
  };
}
