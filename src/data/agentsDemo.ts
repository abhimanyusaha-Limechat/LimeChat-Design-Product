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
