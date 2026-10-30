/** Demo content for the SLA rules details panel: what a policy matches, targets, reminds and escalates. */

export interface SlaPolicy {
  /** "When <field> is <values>". */
  conditions: { field: string; values: string[] }[];
  /** Time allowed per metric, in minutes. */
  targets: { metric: string; minutes: number; includeOutOfOffice?: boolean }[];
  reminders: { metric: string; to: string[]; minutesBefore: number }[];
  /** One per metric. */
  escalations: {
    metric: string;
    /** In order: 1st level, 2nd level, … Each notifies and/or assigns, so a level has at least one. */
    steps: { notify?: SlaRecipients; assign?: SlaRecipients }[];
  }[];
}

/** Who to notify or assign to, and how long after the breach. */
export interface SlaRecipients {
  to: string[];
  afterMinutes: number;
}

// ponytail: every rule shows this one policy with its times nudged per rule; give each rule its own when SLA rules have real data.
export function slaPolicyFor(ruleId: string): SlaPolicy {
  const nudge = [...ruleId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4;
  return {
    conditions: [
      { field: 'Inbox', values: ['36856', 'abcd'] },
      { field: 'Tag', values: ['80247', '441715', '415901'] },
      { field: 'Team Id', values: ['Test 1', 'hierrrrrkldmc,sd'] },
    ],
    targets: [
      { metric: 'First Response Time', minutes: 60 + nudge },
      { metric: 'Next Response Time', minutes: 120 },
      { metric: 'Resolution Time', minutes: 60 },
    ],
    reminders: [{ metric: 'Next Response Time', to: ['abcd'], minutesBefore: 30 }],
    escalations: [
      {
        metric: 'Next Response Time',
        steps: [
          { notify: { to: ['Current Assignee'], afterMinutes: 5 } },
          { notify: { to: ['Abhishek Testing'], afterMinutes: 0 }, assign: { to: ['Abcd'], afterMinutes: 0 } },
        ],
      },
    ],
  };
}

export const SLA_METRICS = ['First Response Time', 'Next Response Time', 'Resolution Time'];

const SLA_SHORT: Record<string, string> = { 'First Response Time': 'FRT', 'Next Response Time': 'NRT', 'Resolution Time': 'RT' };
/** "First Response Time (FRT)". */
export const metricLabel = (metric: string) => `${metric} (${SLA_SHORT[metric]})`;

/** What the edit page offers: each condition field with ids and values to suggest (any value can be typed). */
export const SLA_FIELDS: Record<string, string[]> = {
  Inbox: ['36856', 'abcd'],
  Tag: ['80247', '441715', '415901'],
  'Team Id': ['Test 1'],
  Priority: ['Low', 'Medium', 'High', 'Urgent'],
  Channel: ['WhatsApp', 'Instagram', 'Email', 'SMS'],
};

/** Who a reminder or escalation can notify or assign. */
export const SLA_RECIPIENTS = ['Current Assignee', 'Team lead', 'Abhishek Testing', 'Abcd', 'abcd'];
