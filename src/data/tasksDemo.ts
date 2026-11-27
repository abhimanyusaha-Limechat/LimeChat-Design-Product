import type { TaskCardData } from '../components/TasksHomePage';
import { NO_FILTER_RESULTS, NO_SEARCH_RESULTS } from '../hooks/screenStates';

/**
 * Automation → Tasks demo rows (Figma "Agentic Bot Builder", node 44:15839). Each task is
 * linked to one agent, which decides when to run it, and lists the flows it calls.
 *
 * The design repeats one set of metrics and one set of flow chips across every card; here each
 * task carries its own, so filtering and the "Show more" chips have something to work on.
 */
export const TASKS: TaskCardData[] = [
  {
    id: 'track-order',
    name: 'Track Order',
    agent: 'Support Agent',
    description:
      'The Track Order flow allows users to check the real-time status of their orders by entering details like order ID, phone number, or email. It fetches updates such as shipping status, estimated delivery, and tracking links, creating a smooth, self-serve experience.',
    flows: [
      'Collect Order ID',
      'Collect Phone Number',
      'Track Order Status',
      'Order Status Message',
      'Order ID Not Found',
      'Courier Mishap Feedback',
      'Offer for Upsell',
    ],
    metrics: { triggers: 987342, accounts: 23466, automation: 42, dropOff: 18 },
    status: 'active',
  },
  {
    id: 'return-or-replace',
    name: 'Return or Replace Product',
    agent: 'Sales Agent',
    description:
      'The Return or Replace flow allows users to request a product return or replacement based on their order details and issue type. The flow checks the return window, confirms a pickup address and hands the request to the warehouse.',
    flows: [
      'Collect Order ID',
      'Identify Return Reason',
      'Check Return Window',
      'Confirm Pickup Address',
      'Refund or Replacement Choice',
      'Return Request Summary',
    ],
    metrics: { triggers: 412890, accounts: 18204, automation: 56, dropOff: 12 },
    status: 'active',
  },
  {
    id: 'product-inquiry',
    name: 'Product Inquiry / Before Purchase Questions',
    agent: 'Support Agent',
    description:
      'This flow helps customers get quick answers to product-related questions before purchasing, such as availability, material info, sizing, offers, or usage guidance. It improves pre-sale engagement and nudges the user toward checkout or human assistance.',
    flows: [
      'Identify Product of Interest',
      'FAQs (Size, Fit, Material, Warranty)',
      'Live Inventory Check (Optional)',
      'Offer/Discount Info',
      'Recommend Similar Products',
      'Redirect to Add to Cart / Agent',
      'Feedback',
    ],
    metrics: { triggers: 236470, accounts: 11903, automation: 38, dropOff: 24 },
    status: 'active',
  },
  {
    id: 'csat',
    name: 'CSAT',
    agent: 'Support Agent',
    description:
      'This flow asks the customer to rate the conversation once it ends, collects a comment on a low rating and records the score against the agent and the task that handled the chat.',
    flows: ['Send Rating Prompt', 'Collect Rating', 'Ask for Comments', 'Thank the Customer'],
    metrics: { triggers: 150224, accounts: 9418, automation: 71, dropOff: 9 },
    status: 'active',
  },
];

/** Every agent a task can be linked to, for the "Filter by" agent dropdown. */
export const TASK_AGENTS = ['Support Agent', 'Sales Agent', 'Payment Agent'];

/** Every flow a task can call, for the "Filter by" flow dropdown. */
export const TASK_FLOWS = [...new Set(TASKS.flatMap((task) => task.flows))].sort((a, b) => a.localeCompare(b));

/**
 * The search and filters each state of the Screen opens with, by state id. A state the search
 * or the filters produce shows the controls that led to it; the others open cleared.
 */
export const TASK_STATE_FILTERS: Readonly<
  Record<string, { search?: string; agent?: string; flow?: string } | undefined>
> = {
  [NO_SEARCH_RESULTS.id]: { search: 'pricing' },
  // No task is linked to the Payment Agent, so the two filters together leave nothing to show.
  [NO_FILTER_RESULTS.id]: { agent: 'Payment Agent' },
};

/** What a task's General tab edits, besides its name, its agent and its status. */
export interface TaskSetup {
  /** The task's prompt; WhatsApp-style marks: *bold*, _italic_, ~strike~. */
  prompt: string;
  /** Example messages that should set the task off. */
  triggers: string[];
  guardrails: string[];
  /** Instructions that apply to this task's flows only. */
  flowInstructions: string[];
}

/** One flow this task can call, as the Flows tab lists it. */
export interface TaskFlowRow {
  id: string;
  name: string;
  /** Already formatted, as the design shows it: "08:00 AM, 10 Sept 2024". */
  updatedAt: string;
  /** What should send the conversation into this flow. */
  trigger: string;
  /** The agent calls it while it reasons rather than handing the chat over; shown as a tag. */
  thinking?: boolean;
  active: boolean;
}

/** What each task's General tab starts from, by task id. */
export const TASK_SETUPS: Record<string, TaskSetup> = {
  'track-order': {
    prompt:
      'The Track Order task answers "where is my order" for a customer who has already bought something. It collects an order ID or the phone number the order was placed with, verifies the customer, then reads the courier status back in plain language with the tracking link.\n\nIt covers shipping status, estimated delivery and courier mishaps. It does not handle returns, refunds or exchanges; those belong to the Return or Replace task.',
    triggers: ['Where is my order?', 'Has my order shipped?', 'Track order 10294', 'When will it arrive?'],
    guardrails: [
      'Do not share order details before the customer’s identity is verified.',
      'Never promise a delivery date the courier has not confirmed.',
    ],
    flowInstructions: [
      'Ask for the order ID first; fall back to the phone number only if the customer does not have it.',
      'Read the courier status back in the customer’s own language.',
    ],
  },
  'return-or-replace': {
    prompt:
      'The Return or Replace task takes a customer through returning or exchanging something they have already received. It identifies the order and the item, asks what went wrong, checks the return window, then books a pickup or raises a replacement.',
    triggers: ['I want to return this', 'Can I exchange it for another size?', 'This arrived damaged'],
    guardrails: ['Do not promise a refund before the return window has been checked.'],
    flowInstructions: ['Confirm the pickup address before the request is raised.'],
  },
  'product-inquiry': {
    prompt:
      'The Product Inquiry task answers questions asked before a purchase: availability, sizing, material, warranty, offers and how to use the product. It draws on the approved Knowledge Base and nudges the customer towards checkout or a person when it cannot answer.',
    triggers: ['Is this available in medium?', 'What is it made of?', 'Any offers on this?'],
    guardrails: ['Do not quote a price the catalogue does not carry.'],
    flowInstructions: [],
  },
  csat: {
    prompt:
      'The CSAT task asks the customer to rate the conversation once it ends, collects a comment on a low rating, and records the score against the agent and the task that handled the chat.',
    triggers: ['Thanks, that helped', 'All sorted now'],
    guardrails: ['Ask for a rating once per conversation, never twice.'],
    flowInstructions: [],
  },
};

/**
 * The flows each task calls, newest first, for its Flows tab. The design repeats one row of
 * placeholder copy; each flow here says what actually sends the conversation into it.
 */
export const TASK_FLOW_ROWS: Record<string, TaskFlowRow[]> = {
  'track-order': [
    {
      id: 'collect-order-id',
      name: 'Collect Order ID',
      updatedAt: '08:00 AM, 10 Sept 2024',
      trigger: 'The customer asks about an order without naming one',
      thinking: true,
      active: true,
    },
    {
      id: 'collect-phone-number',
      name: 'Collect Phone Number',
      updatedAt: '08:00 AM, 10 Sept 2024',
      trigger: 'The customer does not have their order ID to hand',
      active: true,
    },
    {
      id: 'track-order-status',
      name: 'Track Order Status',
      updatedAt: '08:00 AM, 10 Sept 2024',
      trigger: 'An order has been identified and needs its courier status',
      active: true,
    },
    {
      id: 'order-status-message',
      name: 'Order Status Message',
      updatedAt: '09:30 AM, 12 Sept 2024',
      trigger: 'The courier status is back and ready to read out',
      active: true,
    },
    {
      id: 'order-id-not-found',
      name: 'Order ID Not Found',
      updatedAt: '09:30 AM, 12 Sept 2024',
      trigger: 'The order ID the customer gave matches nothing',
      active: true,
    },
    {
      id: 'courier-mishap-feedback',
      name: 'Courier Mishap Feedback',
      updatedAt: '04:15 PM, 18 Sept 2024',
      trigger: 'The parcel is late, lost or came back to the warehouse',
      active: false,
    },
    {
      id: 'offer-for-upsell',
      name: 'Offer for Upsell',
      updatedAt: '04:15 PM, 18 Sept 2024',
      trigger: 'The order is delivered and the customer sounds happy',
      active: false,
    },
  ],
  'return-or-replace': [
    {
      id: 'identify-return-reason',
      name: 'Identify Return Reason',
      updatedAt: '11:20 AM, 2 Oct 2024',
      trigger: 'The customer wants to send something back',
      thinking: true,
      active: true,
    },
    {
      id: 'check-return-window',
      name: 'Check Return Window',
      updatedAt: '11:20 AM, 2 Oct 2024',
      trigger: 'The item is known and its eligibility needs checking',
      active: true,
    },
    {
      id: 'confirm-pickup-address',
      name: 'Confirm Pickup Address',
      updatedAt: '03:45 PM, 5 Oct 2024',
      trigger: 'A return has been approved and needs collecting',
      active: true,
    },
    {
      id: 'refund-or-replacement-choice',
      name: 'Refund or Replacement Choice',
      updatedAt: '03:45 PM, 5 Oct 2024',
      trigger: 'The customer has to pick between money back and a swap',
      active: true,
    },
  ],
  'product-inquiry': [
    {
      id: 'identify-product-of-interest',
      name: 'Identify Product of Interest',
      updatedAt: '10:05 AM, 21 Oct 2024',
      trigger: 'The customer asks about a product without naming it',
      thinking: true,
      active: true,
    },
    {
      id: 'live-inventory-check',
      name: 'Live Inventory Check (Optional)',
      updatedAt: '10:05 AM, 21 Oct 2024',
      trigger: 'The customer asks whether something is in stock',
      active: true,
    },
    {
      id: 'offer-discount-info',
      name: 'Offer/Discount Info',
      updatedAt: '06:30 PM, 24 Oct 2024',
      trigger: 'The customer asks about offers, coupons or pricing',
      active: false,
    },
  ],
  csat: [
    {
      id: 'send-rating-prompt',
      name: 'Send Rating Prompt',
      updatedAt: '08:00 AM, 3 Nov 2024',
      trigger: 'The conversation has ended and nothing is outstanding',
      active: true,
    },
    {
      id: 'ask-for-comments',
      name: 'Ask for Comments',
      updatedAt: '08:00 AM, 3 Nov 2024',
      trigger: 'The customer rated the conversation three or below',
      active: true,
    },
  ],
};

/** Flows a task can be given on its Flows tab, offered by the "Search/Select for Sub Flows" box. */
export const SUB_FLOW_OPTIONS = [
  'Feedback Collection for Orders',
  'Order Feedback Tracker',
  'Customer Review Collection for Orders',
  'Order Satisfaction Feedback',
  'Order Experience Feedback Collection',
  'Feedback Gathering for Purchases',
  'Order Feedback Survey',
];
