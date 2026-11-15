/**
 * What the reply box offers per channel. Plain data: the composer reads it, nothing here is stateful.
 * Limits and rules are the demo's stand-ins for each channel's real ones.
 */
import type { TicketChannel } from '../TicketListItem/TicketListItem';

export type ComposerMode = 'reply' | 'template' | 'note';
/** `rich` = a rich-text editor (email), `markers` = plain text wrapped in the channel's markers, `none` = no formatting. */
export type FormattingKind = 'rich' | 'markers' | 'none';
/** Why a ticket can only take private notes besides a closed reply window. */
export type LockReason = 'billing' | 'voicebot';

export interface ChannelConfig {
  limit: number;
  formatting: FormattingKind;
  templates: boolean;
  voice: boolean;
  emoji: boolean;
  /** How long the customer's last message keeps the reply window open. */
  window: 'none' | '24h' | '7d';
  email: boolean;
}

export const CHANNEL_CONFIG: Record<TicketChannel, ChannelConfig> = {
  whatsapp: { limit: 10000, formatting: 'markers', templates: true, voice: true, emoji: true, window: '24h', email: false },
  email: { limit: 100000, formatting: 'rich', templates: false, voice: false, emoji: false, window: 'none', email: true },
  instagram: { limit: 1000, formatting: 'none', templates: false, voice: false, emoji: true, window: '7d', email: false },
  facebook: { limit: 1000, formatting: 'none', templates: false, voice: false, emoji: true, window: '7d', email: false },
  widget: { limit: 10000, formatting: 'markers', templates: true, voice: false, emoji: true, window: 'none', email: false },
  sms: { limit: 160, formatting: 'none', templates: true, voice: false, emoji: true, window: 'none', email: false },
};

/** A private note is internal, so it ignores the channel's limit. */
export const NOTE_LIMIT = 10000;

export interface ModeContext {
  config: ChannelConfig;
  windowOpen: boolean;
  contactOptedIn: boolean;
  lockReason?: LockReason;
}

/** Only a channel with a reply window can run out of it. */
export const isLocked = ({ config, windowOpen, lockReason }: ModeContext) =>
  lockReason !== undefined || (config.window !== 'none' && !windowOpen);

/** The tabs to show, in order. A locked ticket only takes notes; an opted-out contact gets no templates. */
export function availableModes(ctx: ModeContext): ComposerMode[] {
  if (isLocked(ctx)) return ['note'];
  return ctx.config.templates && ctx.contactOptedIn ? ['reply', 'note', 'template'] : ['reply', 'note'];
}
