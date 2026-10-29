/** Demo content for the SLA rules details panel: what a policy matches, targets, reminds and escalates. */

export interface SlaPolicy {
  /** "When <field> is <values>". */
  conditions: { field: string; values: string[] }[];
  /** Time allowed per metric, in minutes. */
  targets: { metric: string; minutes: number }[];
  reminders: { metric: string; to: string; minutesBefore: number }[];
  escalation: {
    metric: string;
    /** In order: 1st level, 2nd level, … */
    steps: { notify: string; afterMinutes: number; assign?: { to: string; afterMinutes: number } }[];
  };
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
    reminders: [{ metric: 'Next Response Time', to: 'abcd', minutesBefore: 30 }],
    escalation: {
      metric: 'Next Response Time',
      steps: [
        { notify: 'Current Assignee', afterMinutes: 5 },
        { notify: 'Abhishek Testing', afterMinutes: 0, assign: { to: 'Abcd', afterMinutes: 0 } },
      ],
    },
  };
}
