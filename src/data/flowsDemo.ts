import { type FlowRowData } from '../components/FlowsHomePage';
import { type BotFlowRowData } from '../components/BotFlowsHomePage';
import { PAST_DATES, channelMetrics } from './demoHelpers';
import { NO_METRICS } from './broadcastDemo';

export const FLOW_ACTIVE_NAMES = [
  'Welcome Series', 'Abandoned Cart Recovery', 'Post-Purchase Follow-up', 'Browse Abandonment Reminder', 'Win-Back Sequence',
  'Loyalty Points Reminder', 'Review Request Flow', 'Replenishment Reminder', 'Upsell After Purchase', 'Order Confirmation Flow',
  'Shipping Update Flow', 'Subscription Renewal Reminder', 'New Customer Onboarding', 'VIP Tier Upgrade Flow', 'Referral Invite Flow',
  'Cross-Sell Recommendation', 'Product Education Series', 'Feedback Collection Flow', 'Re-Engagement Drip', 'Milestone Celebration Flow',
  'Wishlist Reminder', 'Price Drop Alert Flow', 'Back in Stock Flow', 'Support Follow-up Flow', 'Anniversary Reward Flow',
];

export const DEMO_FLOWS_ACTIVE: FlowRowData[] = FLOW_ACTIVE_NAMES.map((name, i) => ({
  id: `f-${i + 1}`,
  displayId: String(50000 + i * 677 + (i % 3) * 83),
  name,
  updatedOn: PAST_DATES[i],
  status: 'active',
  ...channelMetrics(i, 1.7, 'count'),
}));

export const FLOW_INACTIVE_NAMES = [
  'Win-Back Campaign', 'Birthday Offer', 'Legacy Welcome Flow', 'Old Cart Reminder', 'Seasonal Greeting Flow',
  'Paused Loyalty Flow', 'Retired Onboarding Flow', 'Past Promo Reminder', 'Old Review Request', 'Discontinued Product Flow',
  'Archived Survey Flow', 'Holiday 2023 Flow', 'Legacy Upsell Flow', 'Old Referral Flow', 'Paused Re-Engagement',
  'Retired VIP Flow', 'Old Shipping Update', 'Past Event Reminder', 'Deprecated Onboarding', 'Old Milestone Flow',
  'Paused Wishlist Alert', 'Retired Support Flow', 'Old Anniversary Flow', 'Legacy Cross-Sell', 'Paused Feedback Flow',
];

export const DEMO_FLOWS_INACTIVE: FlowRowData[] = FLOW_INACTIVE_NAMES.map((name, i) => ({
  id: `f-${25 + i + 1}`,
  displayId: String(70000 + i * 541 + (i % 4) * 61),
  name,
  updatedOn: PAST_DATES[PAST_DATES.length - 1 - i],
  status: 'inactive',
  ...channelMetrics(i, 0.9, 'count'),
}));

export const FLOW_DRAFT_NAMES = [
  'Loyalty Program Intro (untitled)', 'Re-engagement Sequence', 'New Onboarding Draft', 'Cart Reminder Draft', 'Review Flow Draft',
  'Upsell Sequence Draft', 'Referral Flow Draft', 'Milestone Flow Draft', 'Wishlist Alert Draft', 'Support Flow Draft',
  'Anniversary Flow Draft', 'Cross-Sell Draft', 'Shipping Update Draft', 'VIP Flow Draft', 'Price Drop Draft',
  'Back in Stock Draft', 'Subscription Draft', 'Feedback Flow Draft', 'Welcome Series Draft', 'Browse Reminder Draft',
  'Replenishment Draft', 'Order Confirmation Draft', 'Education Series Draft', 'Win-Back Draft Flow', 'Seasonal Greeting Draft',
];

export const DEMO_FLOWS_DRAFT: FlowRowData[] = FLOW_DRAFT_NAMES.map((name, i) => ({
  id: `f-${50 + i + 1}`,
  name,
  updatedOn: 'Instantly',
  status: 'draft',
  ...NO_METRICS,
}));

export const BOT_FLOW_ACTIVE_NAMES = [
  'Order Status Bot', 'Refund Assistant', 'FAQ Responder', 'Appointment Booking Bot', 'Live Agent Handoff',
  'Payment Reminder Bot', 'Lead Qualification Bot', 'Return Request Flow', 'Delivery Tracking Bot', 'Product Recommendation Bot',
  'Feedback Collector Bot', 'Cancellation Assistant', 'New User Onboarding Bot', 'Subscription Support Bot', 'Warranty Claim Bot',
];

export const BOT_FLOW_INACTIVE_NAMES = [
  'Legacy Support Bot', 'Old Onboarding Flow', 'Retired FAQ Bot', 'Paused Promo Bot', 'Archived Survey Bot',
  'Old Delivery Bot', 'Deprecated Booking Flow', 'Past Campaign Bot', 'Old Refund Flow', 'Retired Lead Bot',
];

export const BOT_FLOW_DESCRIPTIONS: (string | undefined)[] = [
  'Answers "where is my order" queries by pulling live shipment status',
  undefined,
  'Handles common help-center questions before routing to an agent',
  'Lets customers pick and confirm an appointment slot',
  'Hands the conversation to a human agent when the bot can\'t resolve it',
  undefined,
  'Scores and routes new leads based on their replies',
  'Walks a customer through initiating a product return',
  undefined,
  'Suggests related products based on the customer\'s last order',
];

export const DEMO_BOT_FLOWS_ACTIVE: BotFlowRowData[] = BOT_FLOW_ACTIVE_NAMES.map((name, i) => ({
  id: `bf-${i + 1}`,
  name,
  updatedOn: PAST_DATES[i],
  description: BOT_FLOW_DESCRIPTIONS[i % BOT_FLOW_DESCRIPTIONS.length],
  status: 'active',
  nodeCount: 6 + ((i * 5) % 24),
}));

export const DEMO_BOT_FLOWS_INACTIVE: BotFlowRowData[] = BOT_FLOW_INACTIVE_NAMES.map((name, i) => ({
  id: `bf-${20 + i + 1}`,
  name,
  updatedOn: PAST_DATES[PAST_DATES.length - 1 - i],
  description: BOT_FLOW_DESCRIPTIONS[(i + 3) % BOT_FLOW_DESCRIPTIONS.length],
  status: 'inactive',
  nodeCount: 4 + ((i * 3) % 16),
}));
