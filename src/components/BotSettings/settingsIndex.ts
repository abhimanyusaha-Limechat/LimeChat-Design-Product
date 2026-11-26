/**
 * Every setting on the Bot settings page, with its tab, label and help copy. The section
 * tabs read their row copy from here, and "Search all settings" searches it, so a row and
 * its search result always say the same thing.
 */
import { SECTION_TABS, type BotSettingsSection } from './botSettingsValues';

export interface SettingEntry {
  id: string;
  section: BotSettingsSection;
  label: string;
  /** The help tooltip, or for Product cards the field's helper copy. */
  tip: string;
  /** The switch row this sits under; it stays visible while one of its rows matches a search. */
  parent?: string;
}

const ROWS = {
  // Bot behaviour
  aiDecisionMaking: {
    section: 'bot-behaviour',
    label: 'AI decision making',
    tip: 'Lets the bot choose the next step itself, using your flows, knowledge and instructions.',
  },
  noFlowMatch: {
    section: 'bot-behaviour',
    label: 'When no flow matches',
    tip: 'The flow that runs when a message matches none of your flows.',
  },
  reminder: {
    section: 'bot-behaviour',
    label: 'Reminder when a customer goes quiet',
    tip: 'Runs a flow if the customer stops replying mid-conversation.',
  },
  reminderFlow: {
    section: 'bot-behaviour',
    label: 'Reminder flow',
    tip: 'The flow the reminder sends. Usually a short nudge with a button.',
    parent: 'reminder',
  },
  reminderAfter: {
    section: 'bot-behaviour',
    label: 'Send after',
    tip: 'How long the customer has to stay quiet before the reminder goes out.',
    parent: 'reminder',
  },
  topicSwitch: {
    section: 'bot-behaviour',
    label: 'What the bot says when it switches topic',
    tip: 'Guides the one-line bridge the bot writes before it moves to a new topic.',
  },
  // Messaging
  warmerTone: {
    section: 'messaging',
    label: 'Rewrite messages in a warmer tone',
    tip: 'The bot rephrases its own replies before sending them.',
  },
  rewritingInstructions: {
    section: 'messaging',
    label: 'Rewriting instructions',
    tip: 'Rules the rewrite follows every time, such as length, tone and how to address the customer.',
    parent: 'warmerTone',
  },
  companyInstructionsEnabled: {
    section: 'messaging',
    label: 'Company-wide AI instructions',
    tip: "Instructions every AI step in this bot follows, on top of each flow's own prompt.",
  },
  companyInstructions: {
    section: 'messaging',
    label: 'Company instructions',
    tip: 'Leave this empty to use the built-in default.',
    parent: 'companyInstructionsEnabled',
  },
  translateReplies: {
    section: 'messaging',
    label: "Translate replies to the customer's language",
    tip: 'Detects the language the customer writes in and replies in it.',
  },
  keepButtonLabels: {
    section: 'messaging',
    label: 'Keep button labels in the original language',
    tip: 'Buttons keep the label you wrote, so flows that match on them still work.',
    parent: 'translateReplies',
  },
  supportedLanguages: {
    section: 'messaging',
    label: 'Supported languages',
    tip: 'The bot replies in these only. Any other language falls back to the first one.',
    parent: 'translateReplies',
  },
  languageDetectionInstructions: {
    section: 'messaging',
    label: 'Language detection instructions',
    tip: "Extra hints for working out the customer's language, such as messages in mixed scripts.",
    parent: 'translateReplies',
  },
  translationInstructions: {
    section: 'messaging',
    label: 'Translation instructions',
    tip: 'Words and phrases the translation must keep as they are, or handle in a set way.',
    parent: 'translateReplies',
  },
  holdingMessageEnabled: {
    section: 'messaging',
    label: 'Holding message when replies run slow',
    tip: 'Sends a short message when a reply takes longer than usual to generate.',
  },
  holdingAfter: {
    section: 'messaging',
    label: 'Send after',
    tip: 'How long the customer waits before the holding message goes out.',
    parent: 'holdingMessageEnabled',
  },
  holdingMessage: {
    section: 'messaging',
    label: 'Holding message',
    tip: 'What the customer sees while they wait. Keep it short.',
    parent: 'holdingMessageEnabled',
  },
  // Channels & input
  voiceTranscription: {
    section: 'channels',
    label: 'Voice transcription',
    tip: 'Turns inbound voice notes into text the bot can act on.',
  },
  transcriptionModel: {
    section: 'channels',
    label: 'Transcription model',
    tip: 'The speech-to-text service used for voice notes.',
    parent: 'voiceTranscription',
  },
  customEmailSummary: {
    section: 'channels',
    label: 'Use a custom email summary prompt',
    tip: 'Replaces the default prompt that condenses an inbound email before the bot reads it.',
  },
  emailSummaryPrompt: {
    section: 'channels',
    label: 'Email summary prompt',
    tip: 'What the summary keeps and what it drops from each email.',
    parent: 'customEmailSummary',
  },
  // CSAT
  surveyRatingScale: {
    section: 'csat',
    label: 'Survey rating scale',
    tip: 'How many points the customer sees when rating a conversation.',
  },
  // Product cards (the fields of the existing two-column tab; search opens the tab)
  cardLayout: {
    section: 'product-cards',
    label: 'Default card layout',
    tip: 'Used whenever a product card is added to a flow. You can change it on any individual product card node.',
  },
  cardElements: {
    section: 'product-cards',
    label: 'Card elements',
    tip: 'Title, description, price, MRP, discount, rating, review count, tag pills and ribbon badge.',
  },
  currency: {
    section: 'product-cards',
    label: 'Currency symbol',
    tip: 'Applied to every price on the card.',
  },
  buttonCount: {
    section: 'product-cards',
    label: 'Number of buttons',
    tip: 'Up to three actions under every product card.',
  },
  buttonLabels: {
    section: 'product-cards',
    label: 'Button labels',
    tip: 'The text on each button, up to 25 characters.',
  },
  buttonStyle: {
    section: 'product-cards',
    label: 'Button style',
    tip: 'Primary plus outline, or every button filled in brand green.',
  },
  buttonLayout: {
    section: 'product-cards',
    label: 'Button layout',
    tip: 'Stacked, or side by side for two short labels.',
  },
  buyNowOpensPage: {
    section: 'product-cards',
    label: 'Buy now opens the product page',
    tip: 'Off sends the shopper straight to checkout with the item in their cart.',
  },
  showVariants: {
    section: 'product-cards',
    label: 'Show product variants',
    tip: 'Lets the shopper pick size, colour or flavour on the card.',
  },
  cheapestVariant: {
    section: 'product-cards',
    label: 'Select cheapest in-stock variant',
    tip: 'Opens the card on the lowest-priced variant that is in stock.',
  },
  showOutOfStock: {
    section: 'product-cards',
    label: 'Show out-of-stock products',
    tip: 'Out-of-stock items appear with their buttons disabled.',
  },
  // Advanced
  fastModel: {
    section: 'advanced',
    label: 'Use fast model for all AI steps',
    tip: 'Switches message, context and flow targeting plus input validation and language detection to the fast model together.',
  },
  reuseAnswers: {
    section: 'advanced',
    label: 'Reuse answers for similar questions',
    tip: 'Serves a cached answer when a question closely matches one already answered.',
  },
  executionLogs: {
    section: 'advanced',
    label: 'Message execution logs',
    tip: 'Records each step the bot takes on a message, for debugging in the Inspector.',
  },
  selfHostedImageSearch: {
    section: 'advanced',
    label: 'Image search model, self hosted',
    tip: 'Runs image search on your own infrastructure instead of the shared model.',
  },
} satisfies Record<string, Omit<SettingEntry, 'id'>>;

export type SettingId = keyof typeof ROWS;

/** Every setting, in page order. */
export const SETTING_ENTRIES: readonly SettingEntry[] = Object.entries(ROWS).map(([id, entry]) => ({ id, ...entry }));

/** The props a `SettingRow` or `MasterCard` needs for one setting: its anchor id, label and tip. */
export function row(id: SettingId): { id: SettingId; label: string; tip: string } {
  const { label, tip } = ROWS[id];
  return { id, label, tip };
}

/** One setting by id. */
export function settingEntry(id: string): SettingEntry | undefined {
  return SETTING_ENTRIES.find((entry) => entry.id === id);
}

/** The settings whose label, help copy or tab name contains `query`, in page order. */
export function searchSettings(query: string): SettingEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const sectionLabel = (id: BotSettingsSection) => SECTION_TABS.find((tab) => tab.id === id)!.label;
  return SETTING_ENTRIES.filter((entry) =>
    [entry.label, entry.tip, sectionLabel(entry.section)].some((text) => text.toLowerCase().includes(q)),
  );
}
