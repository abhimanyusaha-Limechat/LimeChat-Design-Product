import { type BroadcastRowData } from '../components/BroadcastHomePage';
import { FUTURE_DATES, PAST_DATES, channelMetrics } from './demoHelpers';

export const BROADCAST_NAMES = [
  'Spring Launch', 'Member Update', 'Feature Release', 'Diwali Mega Sale Blast', 'Weekend Flash Sale',
  'Monthly Roundup', 'New Collection Teaser', 'Customer Stories', 'Loyalty Rewards Update', 'Flash Sale Countdown',
  'Product Restock Alert', 'Holiday Gift Guide', 'App Update Highlights', 'Referral Bonus Reminder', 'VIP Early Access',
  'Cart Abandonment Nudge', 'Anniversary Sale', 'New Arrivals Drop', 'Subscriber Exclusive Offer', 'End of Season Clearance',
  'Birthday Reward Reminder', 'Community Spotlight', 'Sustainability Update', 'Back in Stock Alert', 'Year in Review',
];

export const DEMO_BROADCASTS: BroadcastRowData[] = BROADCAST_NAMES.map((name, i) => ({
  id: `b-${i + 1}`,
  displayId: String(40000 + i * 733 + (i % 3) * 97),
  name,
  sentOn: PAST_DATES[i],
  status: i === 0 ? 'sending' : 'completed',
  ...channelMetrics(i, 1, 'count'),
  ...(i % 7 === 5 ? { retry: { attempt: 1, total: 2 } } : {}),
}));

// Scheduled/draft broadcasts haven't sent yet, so there's nothing to report on.
export const NO_METRICS = {
  sent: '—',
  delivery: { primary: '—' },
  engagement: '—',
  dropoff: '—',
  revenue: { primary: '—' },
} as const;

export const SCHEDULED_BROADCAST_NAMES = [
  'Black Friday Preview', 'Winter Restock Alert', 'Year-End Thank You', 'New Year Kickoff', "Valentine's Day Special",
  'Spring Collection Preview', 'Loyalty Tier Upgrade', 'Referral Program Boost', 'Summer Sale Countdown', 'Founders Day Celebration',
  'App Feature Sneak Peek', 'Customer Appreciation Week', 'Flash Restock Notice', 'Mid-Season Clearance', 'Exclusive Preview Access',
  'Back to School Sale', 'Festive Bundle Offer', 'Anniversary Countdown', 'Product Launch Teaser', 'Subscriber Milestone Reward',
  'Weekend Deal Alert', 'Holiday Shipping Reminder', 'New Store Opening', 'Community Meetup Invite', 'Year-End Survey Request',
];

export const DEMO_SCHEDULED_BROADCASTS: BroadcastRowData[] = SCHEDULED_BROADCAST_NAMES.map((name, i) => ({
  id: `s-${i + 1}`,
  name,
  sentOn: FUTURE_DATES[i],
  status: 'scheduled',
  ...NO_METRICS,
}));

export const DRAFT_BROADCAST_NAMES = [
  'Spring Preview (untitled)', 'App Update Announcement', 'Referral Program Launch', 'Loyalty Tier Draft', 'Summer Sale Draft',
  'New Feature Teaser', 'Customer Survey Invite', 'Product Bundle Idea', 'Win-Back Draft', 'Flash Sale Concept',
  'Anniversary Message Draft', 'Holiday Campaign Draft', 'Subscriber Welcome Draft', 'Restock Notice Draft', 'VIP Access Draft',
  'Community Update Draft', 'Sustainability Message Draft', 'Feedback Request Draft', 'Milestone Celebration Draft', 'New Arrivals Draft',
  'Clearance Sale Draft', 'Membership Renewal Draft', 'Event Invite Draft', 'Survey Follow-up Draft', 'Year-End Recap Draft',
];

export const DEMO_DRAFT_BROADCASTS: BroadcastRowData[] = DRAFT_BROADCAST_NAMES.map((name, i) => ({
  id: `d-${i + 1}`,
  name,
  sentOn: 'Instantly',
  status: 'draft',
  ...NO_METRICS,
}));
