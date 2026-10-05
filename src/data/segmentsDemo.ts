import { type SegmentRowData } from '../components/SegmentsHomePage';
import { type UserSegment } from '../components/SelectUserSegmentModal';

export const SEGMENT_NAMES = [
  'DermaGPT MVP Cohort', 'Discount Buyers', 'Recent Shopper', 'High Value Customers', 'Cart Abandoners',
  'Newsletter Subscribers', 'First-Time Buyers', 'Repeat Purchasers', 'Inactive Users (90 Days)', 'VIP Loyalty Members',
  'Mobile App Users', 'Referral Program Members', 'Wishlist Users', 'Seasonal Shoppers', 'Discount Code Redeemers',
  'High Engagement Users', 'Churn Risk Customers', 'Location: Metro Cities', 'Age 18-24 Shoppers', 'Age 25-34 Shoppers',
  'Product Reviewers', 'Email Opt-In Users', 'WhatsApp Opted-In Users', 'Birthday This Month', 'Support Ticket Raisers',
];

export const SEGMENT_DESCRIPTIONS: (string | undefined)[] = [
  undefined,
  'Customers who have made a purchase using a discount within the past year',
  'Customers who have made a purchase within the last month',
  'Customers with lifetime spend above $500',
  'Users who added items to cart but did not complete checkout in the last 30 days',
  'Users who have opted in to receive the weekly newsletter',
  'Customers who completed their first purchase in the last 90 days',
  'Customers who have made 3 or more purchases',
  'Users who have not opened the app or website in the last 90 days',
  'Customers enrolled in the top loyalty tier',
  undefined,
  'Customers who joined through the referral program',
  'Users who have added at least one item to their wishlist',
  'Customers who only purchase during major sale events',
  undefined,
  'Users who opened 5 or more campaigns in the last 60 days',
  'Customers showing declining engagement over the past quarter',
  'Customers located in Tier 1 metro cities',
  'Customers within the 18 to 24 age bracket',
  'Customers within the 25 to 34 age bracket',
  'Customers who have left at least one product review',
  undefined,
  'Customers who have opted in to receive WhatsApp updates',
  'Customers whose birthday falls within the current month',
  'Customers who have raised a support ticket in the last 6 months',
];

export const SEGMENT_EDITED = [
  '04:37 PM, 19 April 2025', '12:50 PM, 02 December 2024', '12:44 PM, 02 December 2024', '09:15 AM, 14 January 2025',
  '03:20 PM, 28 February 2025', '11:05 AM, 10 March 2025', '05:45 PM, 22 March 2025', '08:30 AM, 05 April 2025',
  '02:10 PM, 18 April 2025', '10:55 AM, 30 April 2025', '06:40 PM, 12 May 2025', '09:25 AM, 25 May 2025',
  '01:15 PM, 08 June 2025', '04:50 PM, 21 June 2025', '07:35 AM, 03 July 2025', '11:20 AM, 16 July 2025',
  '02:05 PM, 29 July 2025', '05:40 PM, 11 August 2025', '08:55 AM, 24 August 2025', '12:30 PM, 06 September 2025',
  '03:15 PM, 19 September 2025', '06:00 PM, 02 October 2025', '09:45 AM, 15 October 2025', '01:30 PM, 28 October 2025',
  '04:20 PM, 10 November 2025',
];

export const DEMO_SEGMENTS: SegmentRowData[] = SEGMENT_NAMES.map((name, i) => ({
  id: `sg-${i + 1}`,
  name,
  lastEditedOn: SEGMENT_EDITED[i],
  description: SEGMENT_DESCRIPTIONS[i],
  size: i === 0 ? 0 : Math.round(5000 + i * 41213 + (i % 4) * 3170),
  sizeUpdatedOn: '03 August 2026',
}));

export const DEMO_USER_SEGMENTS: UserSegment[] = [
  {
    id: 'seg-1',
    name: 'Weekend Support Escalation',
    recommended: true,
    description: 'Users who raised a ticket during the weekend on-call window.',
    count: 3262,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-2',
    name: 'Sales Inquiry Follow-Up',
    recommended: true,
    description: 'Leads who asked a pricing question but did not convert.',
    count: 274,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-3',
    name: 'VIP Customer Support',
    description: 'Top-tier accounts routed to the priority support queue.',
    count: 154,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-4',
    name: 'Technical Support Escalation',
    description: 'Tickets escalated past first-line technical support.',
    count: 877,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-5',
    name: 'Standard Support Response',
    description: 'General queries handled within the standard SLA.',
    count: 883,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-6',
    name: 'Customer Inquiry Response',
    count: 447,
    lastEdited: '12 June 2023',
  },
  {
    id: 'seg-7',
    name: 'Abandoned Checkout Reminder',
    description: 'Shoppers who added items to cart but did not check out.',
    count: 1620,
    lastEdited: '9 June 2023',
  },
  {
    id: 'seg-8',
    name: 'Inactive Users — Last 90 Days',
    description: 'Contacts with no session activity in the last quarter.',
    count: 2894,
    lastEdited: '5 June 2023',
  },
  {
    id: 'seg-9',
    name: 'Refund Requested',
    description: 'Users who opened a refund or return request ticket.',
    count: 312,
    lastEdited: '2 June 2023',
  },
  {
    id: 'seg-10',
    name: 'CRM Import — Newsletter Subscribers',
    description: 'Imported from the marketing CRM opt-in list.',
    count: 5210,
    lastEdited: '3 May 2023',
    imported: true,
  },
  {
    id: 'seg-11',
    name: 'CRM Import — Trade Show Leads',
    description: 'Contacts collected at the Q2 trade show booth.',
    count: 964,
    lastEdited: '18 April 2023',
    imported: true,
  },
];
