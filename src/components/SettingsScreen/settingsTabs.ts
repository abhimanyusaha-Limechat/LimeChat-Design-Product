import { type SettingsTab } from '../SettingsPage';
import { type SidebarProduct } from '../Sidebar/presets';

// Settings tab metadata: which tabs each Product lists, and the copy, CTA and list-page variant for each.
// Navigation (URL validation) and the breadcrumb read the same tables as the Settings Screen.

export const SETTINGS_TABS: SettingsTab[] = [
  { id: 'inboxes', label: 'Inboxes' },
  { id: 'opt-out-users', label: 'Opt out users' },
  { id: 'bot-configurations', label: 'Bot configurations' },
  { id: 'events', label: 'Events' },
  { id: 'attribution', label: 'Attribution' },
  { id: 'integrations', label: 'Integrations' },
];

// HelpDesk's Settings nav is its own set entirely — ticketing/agent
// operations config instead of the generic list above.
export const HELPDESK_SETTINGS_TABS: SettingsTab[] = [
  { id: 'inboxes', label: 'Inboxes' },
  { id: 'agents', label: 'Agents' },
  { id: 'teams', label: 'Teams' },
  { id: 'automation-rules', label: 'Automation rules' },
  { id: 'custom-fields', label: 'Custom fields' },
  { id: 'ticket-assignment', label: 'Ticket Assignment' },
  { id: 'sla-rules', label: 'SLA rules' },
  { id: 'canned-responses', label: 'Canned responses' },
  { id: 'tags', label: 'Tags' },
  { id: 'hd-attribution', label: 'Attribution' },
  { id: 'data-security', label: 'Data security' },
  { id: 'hd-integration', label: 'Integration' },
  { id: 'products', label: 'Products' },
  { id: 'bot-csat', label: 'Bot CSAT' },
  { id: 'billing', label: 'Billing' },
];

// Automation's Settings nav is a different set entirely — no opt-out users,
// events, or attribution; bot-specific config instead.
export const AUTOMATION_SETTINGS_TABS: SettingsTab[] = [
  { id: 'bot-brain', label: 'Bot brain' },
  { id: 'bot-settings', label: 'Bot settings' },
  { id: 'inboxes', label: 'Inboxes' },
  { id: 'bot-inbox-mapping', label: 'Bot Inbox mapping' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'collaborators', label: 'Collaborators' },
  { id: 'variable', label: 'Variable' },
  { id: 'bot-templates', label: 'Bot templates' },
];

export const SETTINGS_TABS_BY_PRODUCT: Record<SidebarProduct, SettingsTab[]> = {
  helpdesk: HELPDESK_SETTINGS_TABS,
  marketing: SETTINGS_TABS,
  automation: AUTOMATION_SETTINGS_TABS,
};

export const SETTINGS_COPY: Record<string, { title: string; description: string }> = {
  inboxes: {
    title: 'Inboxes',
    description:
      'Manage your inboxes within the CRM platform to streamline communication, track customer interactions, and organize messages efficiently.',
  },
  'opt-out-users': {
    title: 'Opt out users',
    description: 'View and manage users who have opted out of receiving communications.',
  },
  'bot-configurations': {
    title: 'Bot configurations',
    description: 'Configure how your bots respond and hand off conversations.',
  },
  events: {
    title: 'Events',
    description: 'Track and manage the events triggered across your workspace.',
  },
  attribution: {
    title: 'Attribution',
    description: 'Understand which channels and campaigns drive your conversions.',
  },
  integrations: {
    title: 'Integrations',
    description: 'Connect third-party tools and services to your workspace.',
  },
  'bot-brain': {
    title: 'Bot brain',
    description: "Manage the knowledge your bot draws on when answering questions.",
  },
  'bot-settings': {
    title: 'Bot settings',
    description: 'Configure how your bot behaves across conversations.',
  },
  'bot-inbox-mapping': {
    title: 'Bot Inbox mapping',
    description: 'Map this bot to the inboxes it should respond in.',
  },
  collaborators: {
    title: 'Collaborators',
    description: 'Manage who has access to this bot and what they can do.',
  },
  variable: {
    title: 'Variable',
    description: 'Define reusable variables your bot can reference in flows.',
  },
  'bot-templates': {
    title: 'Bot templates',
    description: 'Manage reusable templates available to this bot.',
  },
  agents: {
    title: 'Agents',
    description: 'Manage the agents who handle tickets on this account.',
  },
  teams: {
    title: 'Teams',
    description: 'Group agents into teams and control how tickets route to them.',
  },
  'automation-rules': {
    title: 'Automation rules',
    description: 'Automatically assign, tag, or update tickets based on conditions you define.',
  },
  'custom-fields': {
    title: 'Custom fields',
    description: 'Add custom fields to capture the ticket details your team needs.',
  },
  'ticket-assignment': {
    title: 'Ticket Assignment',
    description: 'Configure how incoming tickets are distributed across agents and teams.',
  },
  'sla-rules': {
    title: 'SLA rules',
    description: 'Set response and resolution time targets for your tickets.',
  },
  'canned-responses': {
    title: 'Canned responses',
    description: 'Manage reusable replies agents can insert into tickets.',
  },
  tags: {
    title: 'Tags',
    description: 'Manage the tags used to categorize tickets and conversations.',
  },
  'hd-attribution': {
    title: 'Attribution',
    description: 'Understand which channels and sources tickets are coming from.',
  },
  'data-security': {
    title: 'Data security',
    description: 'Manage data retention, masking, and access controls for this account.',
  },
  'hd-integration': {
    title: 'Integration',
    description: 'Connect third-party tools and services to your HelpDesk workspace.',
  },
  products: {
    title: 'Products',
    description: 'Manage the product catalog referenced across tickets and conversations.',
  },
  'bot-csat': {
    title: 'Bot CSAT',
    description: 'Configure the satisfaction survey your bot sends after resolving a ticket.',
  },
  billing: {
    title: 'Billing',
    description: 'Manage your plan, payment method, and billing history.',
  },
};

// Helpdesk Settings tabs with a primary "+ <thing>" CTA in the header.
export const HELPDESK_ADD_CTA: Record<string, string> = {
  inboxes: 'Inbox',
  agents: 'Agent',
  teams: 'Team',
  'automation-rules': 'Automation rule',
  'custom-fields': 'Custom field',
  'sla-rules': 'SLA rule',
  'canned-responses': 'Canned response',
  tags: 'Tag',
};

export const SEARCH_PLACEHOLDER: Record<string, string> = {
  variable: 'Search for variables',
  collaborators: 'Search for collaborators',
  agents: 'Search for agents',
  teams: 'Search for teams',
  'automation-rules': 'Search for automation rules',
  'canned-responses': 'Search for canned responses',
  'sla-rules': 'Search for SLA rules',
  'custom-fields': 'Search for custom fields',
};

export const VARIABLE_SCOPES = [
  { id: 'system', label: 'System' },
  { id: 'bot', label: 'Bot' },
  { id: 'flows', label: 'Flows' },
];

export const USE_CASE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'Ecommerce', label: 'Ecommerce' },
  { id: 'Edtech', label: 'Edtech' },
  { id: 'Hospitality', label: 'Hospitality' },
  { id: 'Real estate', label: 'Real estate' },
];

export const PEOPLE_VARIANT: Record<string, 'collaborators' | 'agents' | 'teams' | 'rules' | 'fields'> = {
  collaborators: 'collaborators',
  agents: 'agents',
  teams: 'teams',
  'automation-rules': 'rules',
  'canned-responses': 'teams', // name-only list, same as Teams
  'sla-rules': 'rules',
  'custom-fields': 'fields',
};

export const RULE_TABS = [
  { id: 'created', label: 'Created' },
  { id: 'library', label: 'Library' },
];

// Segmented tabs for the shared list pages; the first tab is the default.
export const LIST_PAGE_TABS: Record<string, { id: string; label: string }[]> = {
  'automation-rules': RULE_TABS,
  'canned-responses': RULE_TABS,
  'sla-rules': RULE_TABS,
  'custom-fields': [
    { id: 'conversation', label: 'Conversation' },
    { id: 'contact', label: 'Contact' },
  ],
};

export const INDUSTRY_TABS = [
  { id: 'industries', label: 'Industries' },
  { id: 'use-cases', label: 'Use Cases' },
];
