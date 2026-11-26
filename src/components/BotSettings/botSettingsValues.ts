/**
 * Everything Bot settings saves, across its six section tabs, plus the demo defaults and
 * the per-section bookkeeping the tab dots read.
 */
import type { ButtonLayout, ButtonStyle, ProductCardElements, ProductCardLayout } from './ProductCardPreview';

export const SECTION_TABS = [
  { id: 'bot-behaviour', label: 'Bot behaviour' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'channels', label: 'Channels & input' },
  { id: 'csat', label: 'CSAT' },
  { id: 'product-cards', label: 'Product cards' },
  { id: 'advanced', label: 'Advanced' },
] as const;

export type BotSettingsSection = (typeof SECTION_TABS)[number]['id'];

/** Everything on this page that is actually a saved setting. */
export interface BotSettingsValues {
  // Bot behaviour
  aiDecisionMaking: boolean;
  /** Flow id; '' is the required-but-empty state the design shows. */
  noFlowMatchFlow: string;
  reminderEnabled: boolean;
  reminderFlow: string;
  reminderAfterSeconds: number;
  topicSwitchMessage: string;
  // Messaging
  warmerTone: boolean;
  rewritingInstructions: string;
  companyInstructionsEnabled: boolean;
  companyInstructions: string;
  translateReplies: boolean;
  keepButtonLabels: boolean;
  supportedLanguages: string[];
  languageDetectionInstructions: string;
  translationInstructions: string;
  holdingMessageEnabled: boolean;
  holdingAfterSeconds: number;
  holdingMessage: string;
  // Channels & input
  voiceTranscription: boolean;
  transcriptionModel: string;
  customEmailSummary: boolean;
  emailSummaryPrompt: string;
  // CSAT
  surveyRatingScale: string;
  // Product cards
  layout: ProductCardLayout;
  currency: string;
  elements: ProductCardElements;
  buttonCount: number;
  buttonLabels: string[];
  buttonStyle: ButtonStyle;
  buttonLayout: ButtonLayout;
  buyNowOpensPage: boolean;
  showVariants: boolean;
  cheapestVariant: boolean;
  showOutOfStock: boolean;
  // Advanced
  fastModel: boolean;
  reuseAnswers: boolean;
  executionLogs: boolean;
  selfHostedImageSearch: boolean;
}

export const DEFAULT_BOT_SETTINGS: BotSettingsValues = {
  aiDecisionMaking: true,
  noFlowMatchFlow: '',
  reminderEnabled: false,
  reminderFlow: '',
  reminderAfterSeconds: 300,
  topicSwitchMessage:
    'Acknowledge what {{customer.first_name}} just asked, then introduce the next step in one short sentence.',

  warmerTone: true,
  rewritingInstructions:
    'Keep replies under two sentences. Never use exclamation marks. Address the customer as {{customer.first_name}} when it is known.',
  companyInstructionsEnabled: true,
  companyInstructions: '',
  translateReplies: true,
  keepButtonLabels: true,
  supportedLanguages: ['English', 'Hindi', 'Tamil'],
  languageDetectionInstructions: '',
  translationInstructions:
    'Keep product names, order IDs and tracking links in English. Use the formal register in Hindi.',
  holdingMessageEnabled: true,
  holdingAfterSeconds: 15,
  holdingMessage:
    "Thanks for waiting, {{customer.first_name}}. This is taking a little longer than usual and we'll be with you shortly.",

  voiceTranscription: true,
  transcriptionModel: 'deepgram',
  customEmailSummary: true,
  emailSummaryPrompt:
    'Summarise the email in under 60 words. Keep order numbers, dates and any explicit request. Drop signatures, disclaimers and quoted history.',

  surveyRatingScale: '5',

  layout: 'compact-tile',
  currency: '₹',
  elements: {
    description: true,
    mrp: true,
    discount: true,
    rating: true,
    reviewCount: true,
    tags: true,
    ribbon: true,
  },
  buttonCount: 2,
  buttonLabels: ['Buy now', 'View details', 'Talk to us'],
  buttonStyle: 'primary-outline',
  buttonLayout: 'stacked',
  buyNowOpensPage: true,
  showVariants: true,
  cheapestVariant: false,
  showOutOfStock: false,

  fastModel: false,
  reuseAnswers: true,
  executionLogs: true,
  selfHostedImageSearch: false,
};

/** Which tab each setting lives on, for the tab dots. */
const SECTION_OF: Record<keyof BotSettingsValues, BotSettingsSection> = {
  aiDecisionMaking: 'bot-behaviour',
  noFlowMatchFlow: 'bot-behaviour',
  reminderEnabled: 'bot-behaviour',
  reminderFlow: 'bot-behaviour',
  reminderAfterSeconds: 'bot-behaviour',
  topicSwitchMessage: 'bot-behaviour',
  warmerTone: 'messaging',
  rewritingInstructions: 'messaging',
  companyInstructionsEnabled: 'messaging',
  companyInstructions: 'messaging',
  translateReplies: 'messaging',
  keepButtonLabels: 'messaging',
  supportedLanguages: 'messaging',
  languageDetectionInstructions: 'messaging',
  translationInstructions: 'messaging',
  holdingMessageEnabled: 'messaging',
  holdingAfterSeconds: 'messaging',
  holdingMessage: 'messaging',
  voiceTranscription: 'channels',
  transcriptionModel: 'channels',
  customEmailSummary: 'channels',
  emailSummaryPrompt: 'channels',
  surveyRatingScale: 'csat',
  layout: 'product-cards',
  currency: 'product-cards',
  elements: 'product-cards',
  buttonCount: 'product-cards',
  buttonLabels: 'product-cards',
  buttonStyle: 'product-cards',
  buttonLayout: 'product-cards',
  buyNowOpensPage: 'product-cards',
  showVariants: 'product-cards',
  cheapestVariant: 'product-cards',
  showOutOfStock: 'product-cards',
  fastModel: 'advanced',
  reuseAnswers: 'advanced',
  executionLogs: 'advanced',
  selfHostedImageSearch: 'advanced',
};

export interface UnsavedChanges {
  /** Settings that differ from the saved copy. */
  count: number;
  /** The tabs those settings are on, in tab order. */
  sections: BotSettingsSection[];
}

/** The settings edited since the last save, and which tabs they are on. */
export function unsavedChanges(values: BotSettingsValues, saved: BotSettingsValues): UnsavedChanges {
  const changed = (Object.keys(SECTION_OF) as (keyof BotSettingsValues)[]).filter(
    (key) => JSON.stringify(values[key]) !== JSON.stringify(saved[key]),
  );
  const touched = new Set(changed.map((key) => SECTION_OF[key]));
  return {
    count: changed.length,
    sections: SECTION_TABS.map((tab) => tab.id).filter((id) => touched.has(id)),
  };
}

/* --- Option lists ------------------------------------------------------- */

export const FLOW_OPTIONS = [
  { value: 'main-menu', label: 'Main menu' },
  { value: 'track-order', label: 'Track order status' },
  { value: 'returns-refunds', label: 'Returns & Refunds' },
  { value: 'talk-to-agent', label: 'Talk to an agent' },
  { value: 'product-discovery', label: 'Product discovery' },
];

export const TRANSCRIPTION_MODELS = [
  { value: 'deepgram', label: 'Deepgram' },
  { value: 'whisper', label: 'Whisper' },
  { value: 'google-stt', label: 'Google Speech-to-Text' },
];

export const RATING_SCALES = [
  { value: '3', label: '3 point scale' },
  { value: '5', label: '5 point scale' },
  { value: '10', label: '10 point scale' },
];

export const LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Punjabi',
  'Arabic',
  'Spanish',
  'French',
  'Portuguese',
];
