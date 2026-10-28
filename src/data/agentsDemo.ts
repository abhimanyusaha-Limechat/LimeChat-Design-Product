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
