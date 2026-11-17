import type { AgentSetup } from '../components/AgentEditPage';
import type { AgentCardData } from '../components/AgentsHomePage';

export const AGENTS: AgentCardData[] = [
  {
    id: 'support',
    model: 'LimeGPT',
    name: 'Support Agent',
    description:
      'Enhancing customer satisfaction by providing expert assistance and resolving issues efficiently. With strong product knowledge it answers questions in the customer’s own words.',
    goal:
      'To reduce support load and improve customer satisfaction by enabling users to independently track orders, verify OTPs and resolve common issues.',
    tasks: ['Track My Order', 'OTP Verification', 'CSAT', 'Main Menu', 'Product Quiz', 'Support Redirection', 'Feedback', 'Assign to Agent'],
    status: 'active',
  },
  {
    id: 'sales',
    model: 'LimeGPT',
    name: 'Sales Agent',
    description:
      'The Sales Agent bot is designed to guide customers through their purchase journey—answering product questions, comparing options and closing the sale on chat.',
    goal:
      'To increase conversions and average order value by helping users discover, understand and buy the right product for them.',
    tasks: [
      'Product Discovery',
      'Product Comparison',
      'Personalized Recommendation',
      'Low Stock / Urgency Trigger',
      'Buy Now',
      'Checkout on Chat',
      'Bundle / Upsell Suggestions',
    ],
    status: 'active',
    unsaved: true,
  },
  {
    id: 'payment',
    model: 'LimeGPT',
    name: 'Payment Agent',
    description:
      'Enhancing customer satisfaction by providing expert assistance and resolving issues efficiently. With strong payment context it picks up where checkout left off.',
    goal:
      'To reduce support load and improve customer satisfaction by enabling users to independently track payments, retry failed orders and request refunds.',
    tasks: ['Track My Order', 'OTP Verification', 'CSAT', 'Main Menu', 'Product Quiz', 'Support Redirection', 'Feedback', 'Assign to Agent'],
    status: 'disabled',
  },
];

/** What each agent's Customise page starts from, by agent id. */
export const AGENT_SETUPS: Record<string, AgentSetup> = {
  support: {
    prompt:
      'The Support Agent helps customers with post-purchase topics: order tracking, OTP verification, feedback and handing the chat to a person when it cannot resolve the issue.\n\nIt relies on the approved Knowledge Base and the tasks listed on the Tasks tab.',
    guardrails: ['Do not share order details before the customer’s OTP is verified.'],
    triggers: ['Where is my order?', 'I did not get my OTP', 'Talk to a person'],
  },
  sales: {
    prompt:
      'The Sales Agent is responsible for handling frequently asked questions (FAQs) related exclusively to pre-purchase topics. These include queries about products, supplement guidance, product usage information, ingredients, flavour availability, pricing-related questions, offers, subscriptions, shipping information, contact details, and similar information required before placing an order.\n\nTo respond to these queries, the agent relies on the approved Knowledge Base and the official website https://beastlife.in, which contain all approved and relevant information. All pre-purchase–related queries are handled through the task “Pre-purchase – Question and Answer.”\n\nThe agent must not respond to post-purchase queries such as order tracking, returns, cancellations, refunds, replacement requests, payment failures related to placed orders, or delivery-related escalations.',
    guardrails: ['Do not entertain the post purchase related queries.', 'Do not entertain the queries which are not related to Beastlife'],
    triggers: ['is products are available in the flipkart?', 'is products are available in the amazon?', 'thanks', 'got it', 'Beastilfe products', 'How can I contact you?'],
  },
  payment: {
    prompt:
      'The Payment Agent helps customers with payments: tracking a payment, retrying a failed order and requesting a refund.',
    guardrails: ['Never ask the customer for card numbers or CVV.'],
    triggers: ['My payment failed', 'Where is my refund?'],
  },
};

/** Flows an agent can call while it reasons, offered on the Customise page's Thinking Flows block. */
export const THINKING_FLOWS = [
  'Order tracking',
  'Returns and exchanges',
  'Product recommendation',
  'Payment retry',
  'Hand off to a person',
];

/**
 * One published version of an agent, newest first, for the Publish history panel. Each carries
 * the setup as it stood when it was published, so selecting one can show that configuration.
 */
export interface PublishedVersion {
  id: string;
  /**
   * Version names run v<day>.<publish>: a day that sees a publish takes the next whole number,
   * and every further publish that same day adds a decimal — v2, then v2.2, v2.3, v2.4. So
   * "v9.3" is the third publish on the ninth day this agent was published.
   *
   * Optional only so a publish that predates the scheme can fall back to its date and time.
   */
  version?: string;
  /** Already formatted, as the design shows it: "2:45 pm, 3rd Aug 26". */
  publishedAt: string;
  author: string;
  setup: AgentSetup;
}

/** Who has the agent open right now. The current state has not been published. */
export const CURRENT_EDITOR = 'Arjun Mehta';

/** Newest first. Three publishes on 3rd Aug and two on 1st Aug show how a day's decimals run. */
export const PUBLISH_HISTORY: PublishedVersion[] = [
  {
    id: 'v9-3',
    version: 'v9.3',
    publishedAt: "2:45 pm, 3rd Aug 26",
    author: 'Arjun Mehta',
    setup: {
      prompt:
        'The Support Agent helps customers with post-purchase topics: order tracking, OTP verification, feedback and handing the chat to a person when it cannot resolve the issue.\n\nIt relies on the approved Knowledge Base and the tasks listed on the Tasks tab.',
      guardrails: ['Do not share order details before the customer\u2019s OTP is verified.'],
      triggers: ['Where is my order?', 'I did not get my OTP', 'Talk to a person'],
      flows: ['Order tracking'],
    },
  },
  {
    id: 'v9-2',
    version: 'v9.2',
    publishedAt: "11:50 am, 3rd Aug 26",
    author: 'Priya Sharma',
    setup: {
      prompt:
        'The Support Agent helps customers with post-purchase topics: order tracking, OTP verification and feedback.\n\nIt relies on the approved Knowledge Base and the tasks listed on the Tasks tab.',
      guardrails: ['Do not share order details before the customer\u2019s OTP is verified.'],
      triggers: ['Where is my order?', 'I did not get my OTP'],
      flows: ['Order tracking'],
    },
  },
  {
    id: 'v9-1',
    version: 'v9',
    publishedAt: "9:10 am, 3rd Aug 26",
    author: 'Arjun Mehta',
    setup: {
      prompt:
        'The Support Agent helps customers with post-purchase topics: order tracking, OTP verification and feedback.',
      guardrails: ['Do not share order details before the customer\u2019s OTP is verified.', 'Never promise a delivery date the courier has not confirmed.'],
      triggers: ['Where is my order?', 'I did not get my OTP'],
      flows: ['Order tracking'],
    },
  },
  {
    id: 'v8-2',
    version: 'v8.2',
    publishedAt: "4:05 pm, 1st Aug 26",
    author: 'Arjun Mehta',
    setup: {
      prompt:
        'The Support Agent answers post-purchase questions about orders and OTPs. It hands the chat to a person whenever it is unsure.',
      guardrails: ['Do not share order details before the customer\u2019s OTP is verified.', 'Never promise a delivery date the courier has not confirmed.'],
      triggers: ['Where is my order?', 'I did not get my OTP'],
      flows: ['Order tracking', 'Returns and exchanges'],
    },
  },
  {
    id: 'v8-1',
    version: 'v8',
    publishedAt: "11:20 am, 1st Aug 26",
    author: 'Priya Sharma',
    setup: {
      prompt:
        'The Support Agent answers post-purchase questions about orders and OTPs. It hands the chat to a person whenever it is unsure.',
      guardrails: ['Do not share order details before the customer\u2019s OTP is verified.', 'Never promise a delivery date the courier has not confirmed.'],
      triggers: ['Where is my order?', 'I did not get my OTP'],
      flows: ['Order tracking'],
    },
  },
  {
    id: 'v7-1',
    version: 'v7',
    publishedAt: "4:10 pm, 28th Jul 26",
    author: 'Rajeev Sanyal',
    setup: {
      prompt: 'The Support Agent answers questions about orders and refunds after a purchase.',
      guardrails: ['Never promise a delivery date the courier has not confirmed.'],
      triggers: ['Where is my order?', 'I want a refund'],
      flows: ['Returns and exchanges'],
    },
  },
  {
    id: 'v6-1',
    version: 'v6',
    publishedAt: "9:35 am, 25th Jul 26",
    author: 'Neha Kapoor',
    setup: {
      prompt: 'The Support Agent answers questions about orders after a purchase.',
      guardrails: [],
      triggers: ['Where is my order?'],
      flows: [],
    },
  },
  {
    id: 'v5-1',
    version: 'v5',
    publishedAt: "3:00 pm, 20th Jul 26",
    author: 'Vikram Patel',
    setup: {
      prompt: 'The Support Agent tracks orders and nothing else yet.',
      guardrails: [],
      triggers: [],
      flows: [],
    },
  },
  {
    id: 'v4-1',
    version: 'v4',
    publishedAt: "10:15 am, 15th Jul 26",
    author: 'Ananya Desai',
    setup: { prompt: 'Early draft of the Support Agent.', guardrails: [], triggers: ['Order status'], flows: [] },
  },
  {
    id: 'v3-1',
    version: 'v3',
    publishedAt: "1:50 pm, 10th Jul 26",
    author: 'Karthik Iyer',
    setup: { prompt: 'Early draft of the Support Agent.', guardrails: [], triggers: [], flows: [] },
  },
  {
    id: 'v2-1',
    version: 'v2',
    publishedAt: "8:30 am, 5th Jul 26",
    author: 'Sanya Reddy',
    setup: { prompt: 'First pass at a support assistant.', guardrails: [], triggers: [], flows: [] },
  },
  {
    id: 'v1-1',
    version: 'v1',
    publishedAt: "5:00 pm, 30th Jun 26",
    author: 'Rohan Gupta',
    setup: { prompt: 'First pass at a support assistant.', guardrails: [], triggers: [], flows: [] },
  },
];
