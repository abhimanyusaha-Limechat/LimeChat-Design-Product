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
