import { type TicketChannel } from '../components/TicketListItem';
import { type ComponentProps, type ReactNode } from 'react';
import { MessageBubble } from '../components/MessageBubble';
import { CrmTicketCreate, type TicketDetailsField, type TicketDetailsSection } from '../components/TicketDetailsPanel';
import { EXTRA_CRM_PARTNERS, INTEGRATION_CATEGORIES } from './settingsDemo';

export interface TicketRowData {
  id: string;
  ticketId: string;
  channel: TicketChannel;
  user: string;
  phone?: string;
  avatarCount?: number;
  isNew?: boolean;
  timestamp: string;
  message: string;
  assignee?: string;
  unreadCount?: number;
}

export interface ConversationEntry {
  id: string;
  side: 'agent' | 'customer';
  quote?: { name: string; text: string };
  text: string;
  time: string;
  /** ISO date (e.g. '2026-09-20') — consecutive entries sharing a date are grouped
   * under one day chip instead of repeating it per message. */
  date: string;
}

/** Per-ticket conversation threads, keyed by ticket id — lets the two linked tickets in each
 * channel demonstrate the same thread from an incoming (customer-first) vs. outgoing
 * (agent-first) angle. */
export const CONVERSATIONS: Record<string, ConversationEntry[]> = {
  't-1': [
    { id: 'm-1', side: 'customer', text: 'Hi, I placed an order last week and haven’t heard anything since.', time: '09:41', date: '2026-09-19' },
    { id: 'm-2', side: 'agent', text: 'Hi John! Sorry for the trouble — let me pull that up for you.', time: '09:42', date: '2026-09-19' },
    { id: 'm-3', side: 'customer', text: 'Sure, thanks. Order number is #48213.', time: '09:43', date: '2026-09-19' },
    { id: 'm-4', side: 'agent', text: 'Got it, one moment while I check the shipping status.', time: '09:44', date: '2026-09-19' },
    { id: 'm-5', side: 'agent', text: 'Looks like it’s been sitting at the local facility for a couple of days.', time: '09:46', date: '2026-09-19' },
    { id: 'm-6', side: 'customer', text: 'Hey, is my order still on its way? It has been 3 days already.', time: '10:02', date: '2026-09-20' },
    { id: 'm-7', side: 'agent', text: 'Hi John! Let me check that for you right away.', time: '10:03', date: '2026-09-20' },
    { id: 'm-8', side: 'customer', text: 'Sure, thanks. Order number is #48213.', time: '10:04', date: '2026-09-20' },
    { id: 'm-9', side: 'agent', text: 'Thanks for your patience — I’ve escalated this with our logistics partner.', time: '10:05', date: '2026-09-20' },
    { id: 'm-10', side: 'agent', text: 'Your order left the warehouse yesterday and is out for delivery today.', time: '10:06', date: '2026-09-20' },
    { id: 'm-11', side: 'customer', text: 'That’s great to hear, thank you!', time: '10:07', date: '2026-09-20' },
    { id: 'm-12', side: 'agent', text: 'Of course! You’ll get a tracking notification once it’s out for delivery.', time: '10:08', date: '2026-09-20' },
    { id: 'm-13', side: 'customer', text: 'One more thing — can I change the delivery address at this point?', time: '10:10', date: '2026-09-20' },
    { id: 'm-14', side: 'agent', text: 'Since it’s already out for delivery, we can’t redirect it, unfortunately.', time: '10:11', date: '2026-09-20' },
    { id: 'm-15', side: 'agent', text: 'But if the courier misses you, they’ll leave a reattempt slip with a reschedule option. You can also reschedule it yourself from the tracking link once it’s generated, without needing to wait for the slip. Just make sure someone’s available at the address for the next attempt, since after two missed attempts the order gets sent back to the warehouse.', time: '10:12', date: '2026-09-20' },
    { id: 'm-16', side: 'customer', text: 'Got it, that works. Thanks for clarifying!', time: '10:13', date: '2026-09-20' },
    { id: 'm-17', side: 'agent', text: 'Happy to help! Is there anything else I can do for you today?', time: '10:14', date: '2026-09-20' },
    { id: 'm-18', side: 'customer', text: 'Nope, that’s all. Thanks again!', time: '10:15', date: '2026-09-20' },
  ],
  't-2': [
    { id: 'm-1', side: 'agent', text: 'Hi John, just a heads up — your order #48213 is out for delivery today.', time: '10:06', date: '2026-09-20' },
    {
      id: 'm-2',
      side: 'customer',
      quote: { name: 'John', text: 'Hey, is my order still on its way? It has been 3 days already.' },
      text: 'Oh perfect, thank you for the update!',
      time: '10:08',
      date: '2026-09-20',
    },
    { id: 'm-3', side: 'agent', text: 'Anytime! Let us know if it does not arrive today.', time: '10:09', date: '2026-09-20' },
  ],
};

export interface EmailThreadEntry {
  id: string;
  senderName: string;
  senderEmail: string;
  date: string;
  badgeLabel?: string;
  preview: string;
  body: ReactNode;
  defaultExpanded?: boolean;
}

/** Per-ticket email threads, keyed by ticket id — same incoming/outgoing pairing as
 * `CONVERSATIONS`, rendered as a stack of `EmailMessage` rows instead of chat bubbles. */
export const EMAIL_THREADS: Record<string, EmailThreadEntry[]> = {
  't-3': [
    {
      id: 'e-1',
      senderName: 'Aditi Rao',
      senderEmail: 'aditi.rao@example.com',
      date: 'Sep 10, 2026, 9:14 AM',
      badgeLabel: '5 days ago',
      preview: 'Following up on the refund request I submitted last week.',
      body: (
        <>
          Hi team,
          <br />
          <br />
          Following up on the refund request I submitted last week — I haven&apos;t heard back yet. Could you let me know the status?
          <br />
          <br />
          Thanks,
          <br />
          Aditi
        </>
      ),
      defaultExpanded: false,
    },
    {
      id: 'e-2',
      senderName: 'Marcus Lee',
      senderEmail: 'marcus@limechat.io',
      date: 'Sep 15, 2026, 9:31 AM',
      badgeLabel: 'Today',
      preview: 'I can confirm your refund of ₹1,200 has been processed today.',
      body: (
        <>
          Hi Aditi,
          <br />
          <br />
          Apologies for the delay — I can confirm your refund of ₹1,200 has been processed today. It should reflect in your account within 3-5 business days.
          <br />
          <br />
          Best,
          <br />
          Marcus
        </>
      ),
      defaultExpanded: true,
    },
  ],
  't-4': [
    {
      id: 'e-1',
      senderName: 'Marcus Lee',
      senderEmail: 'marcus@limechat.io',
      date: 'Sep 15, 2026, 9:31 AM',
      badgeLabel: '9 minutes ago',
      preview: 'Good news — your refund of ₹1,200 has been processed.',
      body: (
        <>
          Hi Aditi,
          <br />
          <br />
          Good news — your refund of ₹1,200 has been processed. It should reflect in your account within 3-5 business days.
          <br />
          <br />
          Best,
          <br />
          Marcus
        </>
      ),
      defaultExpanded: false,
    },
    {
      id: 'e-2',
      senderName: 'Aditi Rao',
      senderEmail: 'aditi.rao@example.com',
      date: 'Sep 15, 2026, 9:35 AM',
      badgeLabel: 'Today',
      preview: 'Great, thank you so much for the quick turnaround!',
      body: (
        <>
          Great, thank you so much for the quick turnaround!
          <br />
          <br />
          Aditi
        </>
      ),
      defaultExpanded: true,
    },
  ],
};

/** Every `MessageBubble` variant/flag, one after another, for design review — see
 * ticket `t-showcase` ("Design QA · All message states"). */
export const SHOWCASE_MESSAGES: Array<{ id: string } & ComponentProps<typeof MessageBubble>> = [
  { id: 's-1', side: 'customer', variant: 'text', time: '09:00', children: 'Hey, can you help me with a few things?' },
  { id: 's-2', side: 'agent', variant: 'text', time: '09:00', children: "Of course! Here's every message state, one by one." },
  {
    id: 's-3',
    side: 'customer',
    variant: 'quote',
    time: '09:01',
    quote: { name: 'Design QA', text: 'Here\'s every message state, one by one.' },
    children: 'Perfect, starting with quote/reply.',
  },
  {
    id: 's-4',
    side: 'agent',
    variant: 'media',
    time: '09:01',
    media: [{}, {}],
  },
  {
    id: 's-5',
    side: 'customer',
    variant: 'link',
    time: '09:02',
    link: { title: 'LimeChat Design System', description: 'Figma file with all components', domain: 'figma.com' },
  },
  {
    id: 's-6',
    side: 'agent',
    variant: 'attachment',
    time: '09:02',
    attachment: { title: 'design-states.pdf', meta: '2 pages · 66 kB', fileType: 'pdf' },
  },
  { id: 's-7', side: 'customer', variant: 'location', time: '09:03', location: {} },
  {
    id: 's-8',
    side: 'agent',
    variant: 'note',
    time: '09:03',
    onlyVisibleToMe: true,
    note: { ticketId: '123456' },
    children: 'Internal note — only the team can see this.',
  },
  { id: 's-11', side: 'customer', variant: 'opened', time: '09:05' },
  { id: 's-12', side: 'agent', variant: 'viewOnce', time: '09:05', children: 'Photo' },
  {
    id: 's-13',
    side: 'agent',
    variant: 'text',
    time: '09:06',
    forwarded: true,
    children: 'And this one was forwarded from another chat.',
  },
  {
    id: 's-14',
    side: 'customer',
    variant: 'text',
    time: '09:06',
    children: "That's the whole set — thanks!",
  },
];

export const TICKET_CUSTOM_FIELDS: TicketDetailsField[] = [
  { id: 'order-ref', label: 'Order reference', type: 'text', defaultValue: 'ORD-10241' },
  { id: 'follow-up', label: 'Follow-up date', type: 'date', defaultValue: '2026-09-25' },
  {
    id: 'priority',
    label: 'Priority',
    type: 'select',
    defaultValue: 'medium',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
  {
    id: 'issue-category',
    label: 'Issue category',
    type: 'cascading',
    options: [
      {
        value: 'product',
        label: 'Product',
        children: [
          {
            value: 'sizing',
            label: 'Sizing',
            children: [
              { value: 'too-small', label: 'Too small' },
              { value: 'too-large', label: 'Too large' },
              { value: 'wrong-size', label: 'Wrong size shipped' },
            ],
          },
          {
            value: 'quality',
            label: 'Quality',
            children: [
              { value: 'defective', label: 'Defective item' },
              { value: 'damaged', label: 'Damaged in transit' },
            ],
          },
          {
            value: 'availability',
            label: 'Availability',
            children: [
              { value: 'out-of-stock', label: 'Out of stock' },
              { value: 'restock-eta', label: 'Restock ETA' },
            ],
          },
        ],
      },
      {
        value: 'order',
        label: 'Order',
        children: [
          {
            value: 'shipping',
            label: 'Shipping',
            children: [
              { value: 'delayed', label: 'Delayed delivery' },
              { value: 'lost', label: 'Lost in transit' },
            ],
          },
          {
            value: 'payment',
            label: 'Payment',
            children: [
              { value: 'failed', label: 'Payment failed' },
              { value: 'refund', label: 'Refund status' },
            ],
          },
        ],
      },
      {
        value: 'account',
        label: 'Account',
        children: [
          {
            value: 'login',
            label: 'Login issue',
            children: [
              { value: 'password-reset', label: 'Password reset' },
              { value: 'otp', label: 'OTP not received' },
            ],
          },
        ],
      },
    ],
  },
];

export const TICKET_DETAIL_SECTIONS: TicketDetailsSection[] = [
  {
    id: 'previous-tickets',
    label: 'Previous tickets',
    group: 'tickets',
    hideAdd: true,
    items: [
      { title: 'Email_Sales', timestamp: '6 months ago', preview: 'Hi, Looks like you are away from our...' },
      { title: 'WhatsApp_Support', timestamp: '4 months ago', preview: 'My order hasn\'t arrived yet, can you...' },
      { title: 'Email_Billing', timestamp: '2 months ago', preview: 'I was charged twice for my last order...' },
      { title: 'WhatsApp_Support', timestamp: '3 weeks ago', preview: 'Thanks for the quick resolution earlier!' },
    ],
  },
  {
    id: 'sub-tickets',
    label: 'Sub tickets',
    group: 'tickets',
    emptyText: 'There are no sub tickets for this customer',
    items: [
      { title: 'Refund_Request', timestamp: '5 days ago', preview: 'Splitting this off to track the refund separately...' },
      { title: 'Replacement_Item', timestamp: '2 days ago', preview: 'Logging the replacement request for the damaged item.' },
    ],
  },
  {
    id: 'voice-logs',
    label: 'Voice logs',
    group: 'tickets',
    emptyText: 'There are no voice logs for this customer',
    hideAdd: true,
    items: [
      { title: 'Ananya Rao', timestamp: '5th Aug | 10:00 am', duration: '5 minutes 10 seconds' },
      { title: 'Ananya Rao', timestamp: '2nd Aug | 3:45 pm', duration: '2 minutes 45 seconds' },
    ],
  },
  {
    id: 'crm-tickets',
    label: 'CRM tickets',
    focusedLabel: (detail) => (detail ? `New ${detail.label} ticket` : 'Create a ticket'),
    focusedContent: ({ detail, setDetail, formId }) => (
      <CrmTicketCreate
        partners={[...INTEGRATION_CATEGORIES[0].partners, ...EXTRA_CRM_PARTNERS]}
        partnerId={detail?.id}
        formId={formId}
        onSelect={(partner) => setDetail(partner && { id: partner.id, label: partner.name })}
        onCreated={() => setDetail(null)}
      />
    ),
    group: 'tickets',
    emptyText: 'There are no CRM tickets for this customer',
    items: [
      { title: 'Salesforce_Case_00931', timestamp: '3 months ago', preview: 'Escalated to account manager for loyalty credit...' },
      { title: 'HubSpot_Ticket_4021', timestamp: '1 month ago', preview: 'Customer requested invoice copy for reimbursement...' },
    ],
  },
  {
    id: 'conversation-tags',
    label: 'Conversation tags',
    group: 'tags',
    emptyText: 'There are no tags for this customer',
    tags: ['Order delay', 'Delivery issue', 'Follow-up needed'],
  },
  {
    id: 'contact-tags',
    label: 'Contact tags',
    group: 'tags',
    emptyText: 'There are no tags for this customer',
    tags: ['Returning customer', 'VIP'],
  },
  {
    id: 'shopify-tags',
    label: 'Shopify tags',
    group: 'tags',
    emptyText: 'There are no tags for this customer',
    tags: ['Shopify Plus', 'High LTV'],
  },
  {
    id: 'conversation-fields',
    label: 'Conversation fields',
    group: 'fields',
    emptyText: 'There are no fields for this customer',
    hideAdd: true,
    fields: TICKET_CUSTOM_FIELDS,
  },
  {
    id: 'contact-fields',
    label: 'Contact fields',
    group: 'fields',
    emptyText: 'There are no fields for this customer',
    hideAdd: true,
    fields: TICKET_CUSTOM_FIELDS,
  },
];

/** Demo tickets — t-1..t-4 are 2 linked pairs (WhatsApp incoming/outgoing, Email
 * incoming/outgoing) that exercise both message directions; t-5..t-14 pad out the
 * list with a variety of channels, assignees, and unread states. */
export const TICKETS: TicketRowData[] = [
  { id: 't-1', ticketId: '100230', channel: 'whatsapp', user: 'John', phone: '98765 43210', avatarCount: 2, isNew: true, timestamp: '4 minutes ago', message: 'Hey, is my order still on its way? It has been 3 days already.', assignee: 'Jane', unreadCount: 2 },
  { id: 't-2', ticketId: '100231', channel: 'whatsapp', user: 'John', phone: '98765 43210', avatarCount: 2, timestamp: '2 minutes ago', message: 'Anytime! Let us know if it does not arrive today.', assignee: 'Jane' },
  { id: 't-3', ticketId: '100232', channel: 'email', user: 'Aditi Rao', timestamp: '12 minutes ago', message: 'Following up on the refund request I submitted last week.', assignee: 'Marcus', unreadCount: 1 },
  { id: 't-4', ticketId: '100233', channel: 'email', user: 'Aditi Rao', timestamp: '9 minutes ago', message: "You're welcome! Let us know if there's anything else.", assignee: 'Marcus' },
  { id: 't-5', ticketId: '100234', channel: 'instagram', user: 'the.skincare.edit', isNew: true, timestamp: '20 minutes ago', message: 'Do you restock the lavender candle? Sold out everywhere.', unreadCount: 3 },
  { id: 't-6', ticketId: '100235', channel: 'sms', user: 'Rahul Verma', timestamp: '35 minutes ago', message: 'OTP did not arrive, can you resend it please?', assignee: 'Jane' },
  { id: 't-7', ticketId: '100236', channel: 'whatsapp', user: 'Priya Nair', avatarCount: 2, timestamp: '1 hour ago', message: 'Thanks for the quick help earlier, resolved now!', assignee: 'Marcus' },
  { id: 't-8', ticketId: '100237', channel: 'email', user: 'Support Team', timestamp: '2 hours ago', message: 'Escalation: customer requesting a callback about billing.', assignee: 'Marcus', unreadCount: 5 },
  { id: 't-9', ticketId: '100238', channel: 'instagram', user: 'urban.threads.co', timestamp: '3 hours ago', message: 'Is the summer collection back in stock yet?', assignee: 'Jane' },
  { id: 't-10', ticketId: '100239', channel: 'sms', user: 'Karan Mehta', isNew: true, timestamp: '4 hours ago', message: 'Package shows delivered but I never received it.', unreadCount: 1 },
  { id: 't-11', ticketId: '100240', channel: 'whatsapp', user: 'Sneha Iyer', avatarCount: 1, timestamp: '5 hours ago', message: 'Can I exchange this for a different size?', assignee: 'Marcus' },
  { id: 't-12', ticketId: '100241', channel: 'email', user: 'Vikram Singh', timestamp: '6 hours ago', message: 'Invoice copy needed for reimbursement, please advise.', assignee: 'Jane' },
  { id: 't-13', ticketId: '100242', channel: 'instagram', user: 'thefitnessjourney', timestamp: '8 hours ago', message: 'Do you ship internationally to Singapore?', unreadCount: 2 },
  { id: 't-14', ticketId: '100243', channel: 'sms', user: 'Neha Kapoor', timestamp: '1 day ago', message: 'Thanks, the replacement arrived today!', assignee: 'Marcus' },
  {
    id: 't-showcase',
    ticketId: '100244',
    channel: 'whatsapp',
    user: 'Design QA',
    timestamp: 'Just now',
    message: 'All message states — for design review',
    assignee: 'You',
  },
];
