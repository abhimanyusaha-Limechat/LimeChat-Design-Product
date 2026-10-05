/** Deterministic "looks real" formatter — thousands separators, no locale surprises. */
export const fmtNum = (n: number) => Math.round(n).toLocaleString('en-US');

/**
 * Generates a believable-but-varied metrics block for row `i` (scale tunes the
 * overall volume). `deliverySecondary` picks how the delivery sub-line reads:
 * a delivery-rate percentage (Broadcasts) or a hard retry-delivered count (Flows).
 */
export function channelMetrics(i: number, scale: number, deliverySecondary: 'percentage' | 'count' = 'percentage') {
  const sent = (15000 + i * 2137 + (i % 4) * 511) * scale;
  const deliveryRate = 0.94 + (i % 7) * 0.006;
  const delivered = sent * deliveryRate;
  const engagementRate = 0.26 + (i % 5) * 0.03;
  const engagement = delivered * engagementRate;
  const dropoff = sent - delivered;
  const revenuePerEngaged = 5.5 + (i % 6) * 1.6;
  const revenue = engagement * revenuePerEngaged;
  const secondaryRevenue = revenue * 0.12;
  const retryDelivered = Math.round(delivered * (0.02 + (i % 4) * 0.01));
  return {
    sent: fmtNum(sent),
    delivery: {
      primary: fmtNum(delivered),
      secondary: deliverySecondary === 'count' ? fmtNum(retryDelivered) : `${(deliveryRate * 100).toFixed(1)}%`,
    },
    engagement: fmtNum(engagement),
    dropoff: fmtNum(dropoff),
    revenue: { primary: `$${fmtNum(revenue)}`, secondary: `$${fmtNum(secondaryRevenue)}` },
  };
}

// Past dates — shared across the "already sent" broadcast/flow tables.
export const PAST_DATES = [
  '02 March 2024, 10:00 AM', '17 April 2024, 02:45 PM', '26 September 2024, 08:40 AM',
  '12 October 2024, 09:15 AM', '19 October 2024, 06:30 PM', '13 August 2024, 03:05 PM',
  '02 November 2024, 11:00 AM', '09 October 2024, 01:50 PM', '05 January 2024, 09:30 AM',
  '14 February 2024, 04:15 PM', '21 February 2024, 11:45 AM', '03 April 2024, 07:20 AM',
  '29 April 2024, 02:00 PM', '11 May 2024, 10:10 AM', '30 May 2024, 05:40 PM',
  '18 June 2024, 09:00 AM', '07 July 2024, 12:30 PM', '22 July 2024, 03:50 PM',
  '04 August 2024, 08:15 AM', '27 August 2024, 06:05 PM', '15 September 2024, 10:25 AM',
  '03 November 2024, 01:35 PM', '20 November 2024, 09:50 AM', '08 December 2024, 04:40 PM',
  '22 December 2024, 11:20 AM',
];

// Future dates — for anything still "scheduled" (all after today, 15 Sep 2026).
export const FUTURE_DATES = [
  '20 September 2026, 09:00 AM', '28 September 2026, 06:00 PM', '05 October 2026, 12:00 PM',
  '13 October 2026, 08:30 AM', '22 October 2026, 03:15 PM', '30 October 2026, 10:00 AM',
  '07 November 2026, 05:45 PM', '15 November 2026, 09:20 AM', '24 November 2026, 01:10 PM',
  '02 December 2026, 11:00 AM', '10 December 2026, 04:30 PM', '19 December 2026, 08:00 AM',
  '27 December 2026, 02:20 PM', '04 January 2027, 06:50 PM', '12 January 2027, 09:40 AM',
  '20 January 2027, 12:15 PM', '28 January 2027, 10:05 AM', '05 February 2027, 03:30 PM',
  '13 February 2027, 07:45 AM', '21 February 2027, 05:00 PM', '01 March 2027, 09:10 AM',
  '09 March 2027, 01:50 PM', '17 March 2027, 06:25 PM', '25 March 2027, 11:35 AM',
  '02 April 2027, 04:05 PM',
];
