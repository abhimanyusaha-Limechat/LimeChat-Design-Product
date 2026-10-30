/** Demo content for the Automation rules details panel: when a rule runs, what it checks and what it does. */

export interface AutomationRule {
  /** "When a <subject> is <state>". */
  event: { subject: string; state: string };
  /** "If <field> is <values>" ("is not" when `not`); every one has to match. */
  conditions: { field: string; values: string[]; not?: boolean }[];
  /** Run in order. */
  actions: { name: string; values: string[] }[];
  /** How many times the rule may run; `DEFAULT_MAX_EXECUTIONS` when unset. */
  maxExecutions?: number;
}

export const DEFAULT_MAX_EXECUTIONS = 10;

/** What the edit page offers for "When a <subject> is <state>". */
export const RULE_EVENTS: AutomationRule['event'][] = [
  { subject: 'Conversation', state: 'created' },
  { subject: 'Conversation', state: 'opened' },
  { subject: 'Conversation', state: 'resolved' },
  { subject: 'Conversation', state: 'to bot' },
  { subject: 'Message', state: 'created' },
  { subject: 'Ticket', state: 'created' },
  { subject: 'Ticket', state: 'idle' },
  { subject: 'Ticket', state: 'overdue' },
  { subject: 'CSAT rating', state: 'received' },
];

/** Each condition field, with the values it can match. ponytail: demo lists; real ones come from the API. */
export const RULE_FIELDS: Record<string, string[]> = {
  'Conversation label': ['VIP', 'Refund', 'Complaint', 'Order issue', 'Lead'],
  Inbox: ['Limechat (189)', 'Limechat (189) BB', 'Nonucare Support'],
  'Customer tier': ['Gold', 'Platinum', 'VIP'],
  Priority: ['Low', 'Medium', 'High', 'Urgent'],
  'Conversation status': ['Open', 'Pending', 'Resolved'],
  Sender: ['Customer', 'Agent', 'Bot'],
  Channel: ['WhatsApp', 'Instagram', 'Email', 'SMS'],
  Assignee: ['Unassigned', 'Me', 'Anyone'],
  'Business hours': ['Inside hours', 'Outside hours'],
  Rating: ['1', '2', '3', '4', '5'],
  'Message contains': ['refund', 'chargeback', 'cancel', 'late'],
  'Replies in': ['3 days: none'],
  'Messages from customer': ['First'],
  'No update for': ['1 hour', '24 hours', '3 days'],
  'Same customer within': ['1 hour', '24 hours'],
};

/** Each action, with the values it takes; an action with none runs as it is. */
export const RULE_ACTIONS: Record<string, string[]> = {
  'Assign Team': ['Customer Support', 'Escalations', 'Sales'],
  'Assign Agent': ['Round robin', 'Least busy'],
  'Add Tag': ['VIP', 'Channel', 'Refund'],
  'Set Priority': ['Low', 'Medium', 'High', 'Urgent'],
  'Send Message': ['Away message', 'Greeting'],
  Notify: ['Team lead', 'Assignee'],
  'Close Conversation': [],
  'Reopen Conversation': [],
  'Merge Tickets': [],
};

const rule = (
  event: [subject: string, state: string],
  conditions: [field: string, values: string[]][],
  actions: [name: string, values?: string[]][],
): AutomationRule => ({
  event: { subject: event[0], state: event[1] },
  conditions: conditions.map(([field, values]) => ({ field, values })),
  actions: actions.map(([name, values = []]) => ({ name, values })),
});

// ponytail: hand-written per demo row; real rules will come from the API.
const RULES: Record<string, AutomationRule> = {
  r1: rule(['Conversation', 'created'], [['Inbox', ['Limechat (189)', 'Limechat (189) BB']]], [['Assign Team', ['Customer Support']]]),
  r2: rule(['Conversation', 'opened'], [['Customer tier', ['VIP', 'Platinum']]], [['Add Tag', ['VIP']]]),
  r3: rule(['Ticket', 'overdue'], [['Priority', ['High', 'Urgent']]], [['Assign Team', ['Escalations']], ['Notify', ['Team lead']]]),
  r4: rule(['Conversation', 'resolved'], [['Replies in', ['3 days: none']]], [['Close Conversation']]),
  r5: rule(['Message', 'created'], [['Conversation status', ['Resolved']], ['Sender', ['Customer']]], [['Reopen Conversation']]),
  r6: rule(['Message', 'created'], [['Business hours', ['Outside hours']]], [['Send Message', ['Away message']]]),
  r7: rule(['Message', 'created'], [['Message contains', ['refund', 'chargeback']]], [['Set Priority', ['High']]]),
  r8: rule(['CSAT rating', 'received'], [['Rating', ['1', '2']]], [['Notify', ['Team lead']]]),
  rl1: rule(['Conversation', 'created'], [['Assignee', ['Unassigned']]], [['Assign Agent', ['Round robin']]]),
  rl2: rule(['Conversation', 'created'], [['Messages from customer', ['First']]], [['Send Message', ['Greeting']]]),
  rl3: rule(['Conversation', 'created'], [['Customer tier', ['Gold', 'Platinum']]], [['Set Priority', ['High']]]),
  rl4: rule(['Ticket', 'idle'], [['No update for', ['24 hours']]], [['Notify', ['Assignee']]]),
  rl5: rule(['Ticket', 'created'], [['Same customer within', ['1 hour']]], [['Merge Tickets']]),
  rl6: rule(['Conversation', 'created'], [['Channel', ['WhatsApp', 'Instagram', 'Email', 'SMS']]], [['Add Tag', ['Channel']]]),
};

/** Every demo rule row has an entry above. */
export const ruleFor = (id: string): AutomationRule => RULES[id];
