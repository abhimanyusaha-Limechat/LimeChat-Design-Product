import { type SettingsTab } from '../components/SettingsPage';
import { BigCommerceIcon, BlueDartIcon, CashfreeIcon, ClickPostIcon, DelhiveryIcon, EasyEcomIcon, EzyslipsIcon, FreshdeskIcon, GoogleSheetsIcon, HubSpotIcon, InitialsIcon, KaptureIcon, MagentoIcon, OdooIcon, OnedirectIcon, PayUIcon, PickrrIcon, RazorpayIcon, SalesforceIcon, ShipDelightIcon, ShiprocketIcon, ShopifyIcon, SlackIcon, StripeIcon, UnicommerceIcon, WebhookIcon, WhatsAppBusinessIcon, WooCommerceIcon, ZendeskIcon, ZohoCrmIcon, ZohoDeskIcon, type IntegrationCategory } from '../components/IntegrationsHomePage';
import { type InboxRowData } from '../components/InboxesTable';
import { type EventRowData } from '../components/EventsTable';
import { type OptOutUserRowData } from '../components/OptOutUsersTable';
import { type BotTemplateRow } from '../components/BotTemplatesTable';
import { PAST_DATES } from './demoHelpers';

export const KB_SOURCE_TABS = [
  { id: 'doc', label: 'Doc' },
  { id: 'url', label: 'URL' },
  { id: 'domain', label: 'Domain' },
  { id: 'custom', label: 'Custom' },
];

export const KB_TABS: SettingsTab[] = [
  { id: 'upload-files', label: 'Upload files' },
  { id: 'scrape-urls', label: 'Scrape URLs' },
  { id: 'manage', label: 'Manage files / Links' },
];

export const KB_COPY: Record<string, { title: string; description: string }> = {
  'upload-files': { title: 'Upload files', description: 'Add documents your bot can use to answer questions.' },
  'scrape-urls': { title: 'Scrape URLs', description: 'Pull content from web pages into your bot’s knowledge.' },
  manage: { title: 'Manage files / Links', description: 'Review, update or remove the files and links your bot uses.' },
};

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    id: 'crm-partners',
    title: 'CRM Partners',
    partners: [
      { id: 'freshdesk', name: 'Freshdesk', icon: <FreshdeskIcon /> },
      { id: 'kapture', name: 'Kapture', icon: <KaptureIcon /> },
      { id: 'zoho-desk', name: 'Zoho Desk', icon: <ZohoDeskIcon /> },
      { id: 'onedirect', name: 'Onedirect', icon: <OnedirectIcon /> },
      { id: 'zendesk', name: 'Zendesk', icon: <ZendeskIcon /> },
      { id: 'odoo', name: 'Odoo', icon: <OdooIcon /> },
    ],
  },
  {
    id: 'logistics-partners',
    title: 'Logistics Partners',
    partners: [
      { id: 'shiprocket', name: 'Shiprocket', icon: <ShiprocketIcon /> },
      { id: 'ezyslips', name: 'Ezyslips', icon: <EzyslipsIcon /> },
      { id: 'pickrr', name: 'Pickrr', icon: <PickrrIcon /> },
      { id: 'easyecom', name: 'EasyEcom', icon: <EasyEcomIcon /> },
      { id: 'unicommerce', name: 'Unicommerce', icon: <UnicommerceIcon /> },
      { id: 'shipdelight', name: 'ShipDelight', icon: <ShipDelightIcon /> },
      { id: 'bluedart', name: 'Blue Dart', icon: <BlueDartIcon /> },
      { id: 'clickpost', name: 'ClickPost', icon: <ClickPostIcon /> },
      { id: 'delhivery', name: 'Delhivery', icon: <DelhiveryIcon /> },
    ],
  },
  {
    id: 'storefront-partners',
    title: 'Storefront Partners',
    partners: [
      { id: 'shopify', name: 'Shopify', icon: <ShopifyIcon /> },
      { id: 'woocommerce', name: 'WooCommerce', icon: <WooCommerceIcon /> },
      { id: 'magento', name: 'Magento', icon: <MagentoIcon /> },
      { id: 'bigcommerce', name: 'BigCommerce', icon: <BigCommerceIcon /> },
    ],
  },
  {
    id: 'billing-partners',
    title: 'Billing Partners',
    partners: [
      { id: 'razorpay', name: 'Razorpay', icon: <RazorpayIcon /> },
      { id: 'stripe', name: 'Stripe', icon: <StripeIcon /> },
      { id: 'payu', name: 'PayU', icon: <PayUIcon /> },
      { id: 'cashfree', name: 'Cashfree', icon: <CashfreeIcon /> },
    ],
  },
  {
    id: 'others',
    title: 'Others',
    partners: [
      { id: 'google-sheets', name: 'Google Sheets', icon: <GoogleSheetsIcon /> },
      { id: 'slack', name: 'Slack', icon: <SlackIcon /> },
      { id: 'whatsapp-business', name: 'WhatsApp Business', icon: <WhatsAppBusinessIcon /> },
      { id: 'webhook', name: 'Webhook', icon: <WebhookIcon /> },
    ],
  },
];

// Shown only in the ticket panel's "Create a ticket" picker, to fill its third row.
export const EXTRA_CRM_PARTNERS: IntegrationCategory['partners'] = [
  { id: 'salesforce', name: 'Salesforce', icon: <SalesforceIcon /> },
  { id: 'hubspot', name: 'HubSpot', icon: <HubSpotIcon /> },
  { id: 'zoho-crm', name: 'Zoho CRM', icon: <ZohoCrmIcon /> },
  { id: 'pipedrive', name: 'Pipedrive', icon: <InitialsIcon text="P" bg="#111111" /> },
  { id: 'freshsales', name: 'Freshsales', icon: <InitialsIcon text="FS" bg="#ffffff" color="#1a9c5c" /> },
  { id: 'intercom', name: 'Intercom', icon: <InitialsIcon text="I" bg="#1f8ded" /> },
  { id: 'help-scout', name: 'Help Scout', icon: <InitialsIcon text="HS" bg="#1292ee" /> },
  { id: 'gorgias', name: 'Gorgias', icon: <InitialsIcon text="G" bg="#ffffff" color="#c2410c" /> },
  { id: 'kustomer', name: 'Kustomer', icon: <InitialsIcon text="K" bg="#111111" /> },
  { id: 'front', name: 'Front', icon: <InitialsIcon text="F" bg="#ffffff" color="#a855f7" /> },
  { id: 'dynamics-365', name: 'Dynamics 365', icon: <InitialsIcon text="D" bg="#0b5cd5" /> },
  { id: 'insightly', name: 'Insightly', icon: <InitialsIcon text="In" bg="#ffffff" color="#ea580c" /> },
];

// Reached from the avatar popover ("Account Settings" / "Profile settings")
// instead of the product's own Settings nav — just these two tabs.
export const USER_SETTINGS_TABS: SettingsTab[] = [
  { id: 'account', label: 'Account settings' },
  { id: 'profile', label: 'Profile settings' },
];

export const USER_SETTINGS_COPY: Record<'account' | 'profile', { title: string; description: string }> = {
  account: {
    title: 'Account settings',
    description: 'Manage account-wide settings, billing, and permissions.',
  },
  profile: {
    title: 'Profile settings',
    description: 'Manage your personal profile details and preferences.',
  },
};

export const INBOX_NAMES = [
  'Limechat (189)', 'Limechat (189) BB', 'Nonucare Support', 'Aurora Botanicals CS', 'Nimbus Coffee Orders',
  'Peak & Pine Outdoors', 'Saffron House Bookings', 'Bluebird Logistics', 'Harborlight Realty', 'Wildflower Skincare',
  'Cedar & Co. Furniture', 'Tidepool Aquariums', 'Lantern Books', 'Meridian Fitness', 'Copper Kettle Cafe',
  'Northstar Insurance', 'Willowmere Salon', 'Granite Peak Gear', 'Amberglow Candles', 'Foxglove Florist',
  'Rivermill Bakery', 'Summit Cycles', 'Oakhaven Dental', 'Coral Bay Travel', 'Ivy & Oak Interiors',
];

/** Deterministic "looks real" ID: a 5-digit number that varies per row without being sequential. */
export const inboxId = (i: number) => String(36000 + i * 421 + (i % 4) * 67);

/** Reformats PAST_DATES' "DD Month YYYY, HH:MM AM/PM" to "HH:MM AM/PM, DD Month YYYY". */
export const inboxCreatedOn = (i: number) => {
  const [datePart, timePart] = PAST_DATES[i % PAST_DATES.length].split(', ');
  return `${timePart}, ${datePart}`;
};

// Weighted so WhatsApp (the primary channel) still dominates the list.
export const INBOX_TYPES: InboxRowData['type'][] = ['whatsapp', 'whatsapp', 'facebook', 'email', 'instagram', 'sms'];

export const DEMO_INBOXES: InboxRowData[] = INBOX_NAMES.map((name, i) => ({
  id: inboxId(i),
  name,
  type: INBOX_TYPES[i % INBOX_TYPES.length],
  metaId: 'N/A',
  createdOn: inboxCreatedOn(i),
}));

const EVENT_NAMES = ['test_var', 'order_placed', 'cart_abandoned', 'checkout_started', 'order_delivered', 'test_var'];
const EVENT_PHONES = ['+91-6205127441', '+91-9876543210', '+91-8123456789', '+91-7012345678'];

export const DEMO_EVENTS: EventRowData[] = Array.from({ length: 24 }, (_, i) => {
  const name = EVENT_NAMES[i % EVENT_NAMES.length];
  const phone = EVENT_PHONES[i % EVENT_PHONES.length];
  return {
    id: `ev${i + 1}`,
    name,
    phone,
    createdAt: inboxCreatedOn(i),
    payload: { event: name, phone: phone.replace('-', ''), properties: { order_id: `#${10240 + i}`, value: 499 + i * 150, currency: 'INR' } },
  };
});

const OPT_OUT_NAMES = [
  'Riya Sen', 'Aditya Verma', 'Neha Joshi', 'Karan Gupta', 'Priya Nair', 'Manish Patel', 'Sanya Kohli', 'Rahul Bose',
  'Kavya Iyer', 'Dev Malhotra', 'Ishita Roy', 'Aman Sethi', 'Nandini Rao', 'Varun Chopra', 'Zoya Ahmed', 'Siddharth Jain',
];

export const DEMO_OPT_OUT_USERS: OptOutUserRowData[] = OPT_OUT_NAMES.map((name, i) => ({
  id: `oo${i + 1}`,
  name,
  phone: `+91-${9000000000 - i * 13579241}`,
}));

export const DEMO_BOT_TEMPLATES: BotTemplateRow[] = [
  { id: 'bt1', name: 'Cart & Checkout Management', description: 'Helps in managing carts and Checkout', type: 'task', usecases: ['Sales'], industries: [], scope: 'global' },
  { id: 'bt2', name: 'Product Quiz', description: 'Product Quiz', type: 'flow', usecases: ['Sales'], industries: [], scope: 'global' },
  { id: 'bt3', name: 'Track Order', description: 'Track Order', type: 'flow', usecases: [], industries: [], scope: 'account' },
  { id: 'bt4', name: 'Other Help', description: 'Other Help', type: 'flow', usecases: [], industries: [], scope: 'account' },
  { id: 'bt5', name: 'Order Tracking', description: 'Order Tracking', type: 'task', usecases: [], industries: [], scope: 'account' },
  { id: 'bt6', name: 'Track order by order id -', description: 'Shopify', type: 'flow', usecases: [], industries: ['E-Commerce [D2C]'], scope: 'global' },
  { id: 'bt7', name: 'Greeting / Main Menu', description: 'Displays Main Menu and Handles Greetings', type: 'task', usecases: [], industries: ['E-Commerce [D2C]', 'E-Commerce [B2B]', 'Retail'], scope: 'global' },
  { id: 'bt8', name: 'Abandoned Cart Recovery', description: 'Nudges shoppers to complete their purchase', type: 'flow', usecases: ['Sales', 'Marketing'], industries: ['E-Commerce [D2C]'], scope: 'global' },
  { id: 'bt9', name: 'Return & Refund Request', description: 'Collects return reasons and starts a refund', type: 'flow', usecases: ['Support'], industries: ['Ecommerce'], scope: 'global' },
  { id: 'bt10', name: 'COD Order Confirmation', description: 'Confirms cash-on-delivery orders', type: 'task', usecases: ['Support'], industries: ['E-Commerce [D2C]'], scope: 'account' },
  { id: 'bt11', name: 'Store Locator', description: 'Finds the nearest store by pincode', type: 'task', usecases: [], industries: ['Retail'], scope: 'global' },
  { id: 'bt12', name: 'Lead Qualification', description: 'Captures name, budget and intent', type: 'flow', usecases: ['Sales'], industries: ['E-Commerce [B2B]'], scope: 'account' },
  { id: 'bt13', name: 'Feedback Collection', description: 'Asks for a rating after delivery', type: 'flow', usecases: ['Marketing'], industries: [], scope: 'account' },
  { id: 'bt14', name: 'Talk to Agent', description: 'Hands the chat over to a human agent', type: 'task', usecases: ['Support'], industries: [], scope: 'global' },
  { id: 'bt15', name: 'Offers & Coupons', description: 'Shares active discount codes', type: 'task', usecases: ['Sales', 'Marketing'], industries: ['Retail', 'E-Commerce [D2C]'], scope: 'global' },
  { id: 'bt16', name: 'Bulk Order Enquiry', description: 'Routes wholesale enquiries to sales', type: 'flow', usecases: ['Sales'], industries: ['E-Commerce [B2B]'], scope: 'global' },
  { id: 'bt17', name: 'Delivery Address Update', description: 'Lets customers change their address', type: 'task', usecases: [], industries: [], scope: 'account' },
];

export const VARIABLE_DATA_TYPES = ['Text', 'Number', 'Boolean', 'Date'];

export const DEMO_VARIABLES: BotTemplateRow[] = [
  { id: 'v1', name: 'message_metadata.contact.email', description: 'Contact email from the incoming message', type: 'task', usecases: [], industries: [], scope: 'global', dataType: 'Text' },
  { id: 'v2', name: 'email_attachment', description: 'Attachment received with the email', type: 'task', usecases: [], industries: [], scope: 'global', dataType: 'Text' },
  { id: 'v3', name: 'message_metadata.contact.name', description: 'Contact name from the incoming message', type: 'task', usecases: [], industries: [], scope: 'global', dataType: 'Text' },
  { id: 'v4', name: 'message_metadata.contact.phone', description: 'Contact phone from the incoming message', type: 'task', usecases: [], industries: [], scope: 'global', dataType: 'Number' },
  { id: 'v5', name: 'message_metadata.channel', description: 'Channel the message arrived on', type: 'task', usecases: [], industries: [], scope: 'global', dataType: 'Text' },
  { id: 'v6', name: 'conversation.id', description: 'Unique conversation identifier', type: 'task', usecases: [], industries: [], scope: 'global', dataType: 'Number' },
  { id: 'v7', name: 'conversation.created_at', description: 'When the conversation started', type: 'task', usecases: [], industries: [], scope: 'global', dataType: 'Date' },
  { id: 'v8', name: 'order.total', description: 'Total value of the latest order', type: 'task', usecases: [], industries: [], scope: 'global', dataType: 'Number' },
  { id: 'v9', name: 'order.is_cod', description: 'Whether the order is cash on delivery', type: 'task', usecases: [], industries: [], scope: 'global', dataType: 'Boolean' },
];

export const DEMO_INDUSTRIES: BotTemplateRow[] = [
  { id: 'i1', name: 'E-Commerce [D2C]', description: 'Direct-to-consumer online brands', type: 'task', usecases: ['Order tracking', 'Returns', 'Cart recovery'], industries: ['E-Commerce [D2C]'], scopes: ['Agent', 'Task', 'Flows'], scope: 'global' },
  { id: 'i2', name: 'E-Commerce [B2B]', description: 'Wholesale and business buyers', type: 'task', usecases: ['Bulk orders', 'Quotes'], industries: ['E-Commerce [B2B]'], scopes: ['Task', 'Flows'], scope: 'global' },
  { id: 'i3', name: 'Retail', description: 'Physical and omnichannel stores', type: 'task', usecases: ['Store locator', 'Loyalty'], industries: ['Retail'], scopes: ['Agent'], scope: 'account' },
  { id: 'i4', name: 'Healthcare', description: '', type: 'task', usecases: ['Appointments', 'Reminders', 'Reports', 'Billing', 'Feedback'], industries: ['Healthcare'], scopes: ['Agent', 'Task'], scope: 'global' },
  { id: 'i5', name: 'Education', description: '', type: 'task', usecases: [], industries: ['Education'], scopes: ['Flows'], scope: 'account' },
];

export const DEMO_USE_CASES: BotTemplateRow[] = [
  { id: 'u1', name: 'Order tracking', description: '', type: 'task', usecases: [], industries: ['Ecommerce'], scopes: ['Agent', 'Flows'], scope: 'global' },
  { id: 'u2', name: 'Returns & refunds', description: '', type: 'task', usecases: [], industries: ['Ecommerce'], scopes: ['Task', 'Flows'], scope: 'global' },
  { id: 'u3', name: 'Course enquiries', description: '', type: 'task', usecases: [], industries: ['Edtech'], scopes: ['Flows'], scope: 'global' },
  { id: 'u4', name: 'Fee reminders', description: '', type: 'task', usecases: [], industries: ['Edtech'], scopes: ['Agent', 'Task'], scope: 'account' },
  { id: 'u5', name: 'Table reservations', description: '', type: 'task', usecases: [], industries: ['Hospitality'], scopes: ['Agent', 'Task', 'Flows'], scope: 'global' },
  { id: 'u6', name: 'Guest feedback', description: '', type: 'task', usecases: [], industries: ['Hospitality'], scopes: ['Task'], scope: 'account' },
  { id: 'u7', name: 'Site visit booking', description: '', type: 'task', usecases: [], industries: ['Real estate'], scopes: ['Agent', 'Flows'], scope: 'global' },
  { id: 'u8', name: 'Lead qualification', description: '', type: 'task', usecases: [], industries: ['Real estate'], scopes: ['Task'], scope: 'account' },
];

export const AGENT_INBOXES = INBOX_NAMES.slice(0, 6).map((name, i) => ({ name, type: INBOX_TYPES[i] }));

export const DEMO_COLLABORATORS: BotTemplateRow[] = [
  { id: 'c1', name: 'Aarav Mehta', description: 'aarav@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Admin' },
  { id: 'c2', name: 'Isha Kapoor', description: 'isha@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Editor' },
  { id: 'c3', name: 'Rohan Iyer', description: 'rohan@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Editor' },
  { id: 'c4', name: 'Meera Nair', description: 'meera@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Viewer' },
  { id: 'c5', name: 'Kabir Singh', description: 'kabir@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Viewer' },
  { id: 'c6', name: 'Ananya Rao', description: 'ananya@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Editor' },
  { id: 'c7', name: 'Vikram Desai', description: 'vikram@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Viewer' },
  { id: 'c8', name: 'Sneha Pillai', description: 'sneha@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Admin' },
  { id: 'c9', name: 'Arjun Malhotra', description: 'arjun@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Editor' },
  { id: 'c10', name: 'Diya Sharma', description: 'diya@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Viewer' },
  { id: 'c11', name: 'Nikhil Bhatt', description: 'nikhil@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Editor' },
  { id: 'c12', name: 'Tara Menon', description: 'tara@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Viewer' },
  { id: 'c13', name: 'Yash Agarwal', description: 'yash@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Admin' },
  { id: 'c14', name: 'Pooja Reddy', description: 'pooja@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Editor' },
  { id: 'c15', name: 'Sameer Khan', description: 'sameer@limechat.ai', type: 'task', usecases: [], industries: [], scope: 'account', role: 'Viewer' },
];

export const DEMO_TEAMS: BotTemplateRow[] = [
  { id: 't1', name: 'Customer Support', description: 'Handles first-line customer queries across all inboxes', type: 'task', usecases: [], industries: [], scope: 'account' },
  { id: 't2', name: 'Billing & Payments', description: 'Resolves invoice, refund and payment-failure tickets', type: 'task', usecases: [], industries: [], scope: 'account' },
  { id: 't3', name: 'Order Fulfilment', description: 'Tracks shipments, delays and delivery issues', type: 'task', usecases: [], industries: [], scope: 'account' },
  { id: 't4', name: 'Returns & Exchanges', description: 'Processes return requests and replacement orders', type: 'task', usecases: [], industries: [], scope: 'account' },
  { id: 't5', name: 'VIP Care', description: 'Priority support for high-value and loyalty customers', type: 'task', usecases: [], industries: [], scope: 'account' },
  { id: 't6', name: 'Technical Support', description: 'Troubleshoots product defects and setup problems', type: 'task', usecases: [], industries: [], scope: 'account' },
  { id: 't7', name: 'Sales Enquiries', description: 'Answers pre-purchase questions and recommends products', type: 'task', usecases: [], industries: [], scope: 'account' },
  { id: 't8', name: 'Escalations', description: 'Owns complex or high-severity tickets from other teams', type: 'task', usecases: [], industries: [], scope: 'account' },
  { id: 't9', name: 'Social Media', description: 'Responds to Instagram and Facebook messages and comments', type: 'task', usecases: [], industries: [], scope: 'account' },
];

// Tags nest up to three levels: `parentId` points at the parent tag; siblings keep this order.
export const DEMO_TAGS: BotTemplateRow[] = [
  { id: 'tg-orders', name: 'Orders', description: 'Anything about placing or receiving an order', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'tg-delivery', name: 'Delivery', description: 'Shipping and courier issues', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true, parentId: 'tg-orders' },
  { id: 'tg-delay', name: 'Delivery delay', description: 'Order is late or stuck in transit', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true, parentId: 'tg-delivery' },
  { id: 'tg-address', name: 'Wrong address', description: 'Shipped to an old or incorrect address', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false, parentId: 'tg-delivery' },
  { id: 'tg-returns', name: 'Returns', description: 'Customer wants to send something back', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true, parentId: 'tg-orders' },
  { id: 'tg-damaged', name: 'Damaged item', description: 'Product arrived broken or defective', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true, parentId: 'tg-returns' },
  { id: 'tg-wrong', name: 'Wrong item', description: 'Customer received a different product', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false, parentId: 'tg-returns' },
  { id: 'tg-payments', name: 'Payments', description: 'Charges, refunds and payment methods', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'tg-refund', name: 'Refund', description: 'Customer is asking for money back on an order', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true, parentId: 'tg-payments' },
  { id: 'tg-failed', name: 'Payment failed', description: 'Charge declined or money deducted without an order', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true, parentId: 'tg-payments' },
  { id: 'tg-feedback', name: 'Feedback', description: 'Compliments, suggestions or general feedback', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false },
  { id: 'tg-spam', name: 'Spam', description: 'Irrelevant or automated messages', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
];

export const DEMO_CONTACT_TAGS: BotTemplateRow[] = [
  { id: 'tgc-type', name: 'Customer type', description: 'Who the contact is to the business', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'tgc-vip', name: 'VIP', description: 'High-value customer; prioritise the reply', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true, parentId: 'tgc-type' },
  { id: 'tgc-repeat', name: 'Repeat buyer', description: 'Has ordered more than once', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true, parentId: 'tgc-type' },
  { id: 'tgc-new', name: 'New customer', description: 'First order placed in the last 30 days', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false, parentId: 'tgc-type' },
  { id: 'tgc-business', name: 'Business', description: 'Contacts buying for a company', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'tgc-wholesale', name: 'Wholesale', description: 'Buys in bulk on business pricing', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true, parentId: 'tgc-business' },
  { id: 'tgc-dnc', name: 'Do not contact', description: 'Opted out of marketing messages', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
];

export const DEMO_RULES: BotTemplateRow[] = [
  { id: 'r1', name: 'Auto-assign by inbox', description: 'Routes new tickets to the team that owns the inbox', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'r2', name: 'Tag VIP customers', description: 'Adds the VIP tag when a high-value customer writes in', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'r3', name: 'Escalate overdue tickets', description: 'Moves tickets past their SLA to the Escalations team', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false },
  { id: 'r4', name: 'Auto-close resolved tickets', description: 'Closes tickets with no reply 3 days after they are resolved', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'r5', name: 'Reopen on customer reply', description: 'Reopens a resolved ticket when the customer replies', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'r6', name: 'Out-of-hours reply', description: 'Sends an away message outside business hours', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false },
  { id: 'r7', name: 'Set priority from keywords', description: 'Raises priority when a message mentions refund or chargeback', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'r8', name: 'Notify on negative CSAT', description: 'Alerts the team lead when a low CSAT rating comes in', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
];

export const DEMO_RULE_LIBRARY: BotTemplateRow[] = [
  { id: 'rl1', name: 'Round-robin assignment', description: 'Shares new tickets evenly across available agents', type: 'task', usecases: [], industries: [], scope: 'global', enabled: false },
  { id: 'rl2', name: 'Auto-reply on first contact', description: 'Acknowledges a customer’s first message instantly', type: 'task', usecases: [], industries: [], scope: 'global', enabled: false },
  { id: 'rl3', name: 'Priority by customer tier', description: 'Sets ticket priority from the customer’s plan or tier', type: 'task', usecases: [], industries: [], scope: 'global', enabled: false },
  { id: 'rl4', name: 'Follow up after 24 hours', description: 'Pings the assignee when a ticket has had no update for a day', type: 'task', usecases: [], industries: [], scope: 'global', enabled: false },
  { id: 'rl5', name: 'Merge duplicate tickets', description: 'Combines tickets raised by the same customer within an hour', type: 'task', usecases: [], industries: [], scope: 'global', enabled: false },
  { id: 'rl6', name: 'Tag by channel', description: 'Adds a tag for WhatsApp, Instagram, Email or SMS tickets', type: 'task', usecases: [], industries: [], scope: 'global', enabled: false },
];

export const DEMO_CANNED: BotTemplateRow[] = [
  { id: 'cr1', name: 'Greeting', description: 'Hi! Thanks for reaching out, how can I help today?', type: 'task', usecases: [], industries: [], scope: 'account', mediaType: 'text' },
  { id: 'cr2', name: 'Order status', description: 'Share the order ID and I will check where it is right away', type: 'task', usecases: [], industries: [], scope: 'account', mediaType: 'text' },
  { id: 'cr3', name: 'Refund timeline', description: 'Refunds reach your original payment method in 5-7 working days', type: 'task', usecases: [], industries: [], scope: 'account', mediaType: 'text' },
  { id: 'cr4', name: 'Size guide', description: 'Sends the size chart image for the product category', type: 'task', usecases: [], industries: [], scope: 'account', mediaType: 'image' },
  { id: 'cr5', name: 'Return label', description: 'Attaches the prepaid return label PDF', type: 'task', usecases: [], industries: [], scope: 'account', mediaType: 'image' },
  { id: 'cr6', name: 'Store locations', description: 'Links to the store locator page', type: 'task', usecases: [], industries: [], scope: 'account', mediaType: 'text' },
  { id: 'cr7', name: 'Escalation notice', description: 'Lets the customer know a senior agent will follow up', type: 'task', usecases: [], industries: [], scope: 'account', mediaType: 'text' },
  { id: 'cr8', name: 'Closing note', description: 'Wraps up the chat and asks for a CSAT rating', type: 'task', usecases: [], industries: [], scope: 'account', mediaType: 'text' },
];

export const DEMO_CANNED_LIBRARY: BotTemplateRow[] = [
  { id: 'crl1', name: 'Business hours', description: 'Shares your support timings and holiday schedule', type: 'task', usecases: [], industries: [], scope: 'global', mediaType: 'text' },
  { id: 'crl2', name: 'Payment options', description: 'Lists accepted payment methods and COD availability', type: 'task', usecases: [], industries: [], scope: 'global', mediaType: 'text' },
  { id: 'crl3', name: 'Warranty claim steps', description: 'Attaches the step-by-step warranty claim guide', type: 'task', usecases: [], industries: [], scope: 'global', mediaType: 'image' },
  { id: 'crl4', name: 'Track your order', description: 'Links to the order tracking page', type: 'task', usecases: [], industries: [], scope: 'global', mediaType: 'text' },
  { id: 'crl5', name: 'Feedback request', description: 'Asks the customer to share feedback after resolution', type: 'task', usecases: [], industries: [], scope: 'global', mediaType: 'image' },
  { id: 'crl6', name: 'Out-of-stock apology', description: 'Apologises and offers a restock notification', type: 'task', usecases: [], industries: [], scope: 'global', mediaType: 'text' },
];

export const DEMO_SLA: BotTemplateRow[] = [
  { id: 'sla1', name: 'First response – urgent', description: 'Reply within 15 minutes for tickets marked urgent', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'sla2', name: 'First response – standard', description: 'Reply within 4 hours for normal-priority tickets', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'sla3', name: 'Resolution – high priority', description: 'Resolve within 8 hours for high-priority tickets', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false },
  { id: 'sla4', name: 'Resolution – standard', description: 'Resolve within 48 hours for everything else', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'sla5', name: 'VIP customers', description: 'Tighter response and resolution targets for VIP accounts', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'sla6', name: 'Out-of-hours pause', description: 'Stops the SLA clock outside business hours', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false },
  { id: 'sla7', name: 'Waiting on customer', description: 'Pauses the clock while we wait for the customer to reply', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'sla8', name: 'Voice call-back', description: 'Call back within 30 minutes for missed voice calls', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
];

export const DEMO_SLA_LIBRARY: BotTemplateRow[] = [
  { id: 'slal1', name: 'Next business day', description: 'Resolve every ticket by the end of the next business day', type: 'task', usecases: [], industries: [], scope: 'global', enabled: false },
  { id: 'slal2', name: 'Gold support plan', description: '1 hour first response, 8 hours resolution', type: 'task', usecases: [], industries: [], scope: 'global', enabled: true },
  { id: 'slal3', name: 'Silver support plan', description: '4 hours first response, 24 hours resolution', type: 'task', usecases: [], industries: [], scope: 'global', enabled: true },
  { id: 'slal4', name: 'Bronze support plan', description: '8 hours first response, 72 hours resolution', type: 'task', usecases: [], industries: [], scope: 'global', enabled: false },
  { id: 'slal5', name: 'Weekend coverage', description: 'Reduced targets for tickets raised on weekends', type: 'task', usecases: [], industries: [], scope: 'global', enabled: true },
];

export const DEMO_CONVERSATION_FIELDS: BotTemplateRow[] = [
  { id: 'cf1', name: 'Order ID', description: 'The order number the customer is asking about', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'cf2', name: 'Product SKU', description: 'SKU of the product the ticket relates to', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'cf3', name: 'Issue category', description: 'Dropdown to classify the ticket, e.g. delivery, payment, product', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false },
  { id: 'cf4', name: 'Preferred contact time', description: 'When the customer would like to be reached', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'cf5', name: 'Refund amount', description: 'Amount to be refunded, in rupees', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'cf6', name: 'Delivery pincode', description: 'Pincode used to check serviceability and delays', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false },
  { id: 'cf7', name: 'Customer tier', description: 'Standard, Gold or VIP', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'cf8', name: 'Escalated to', description: 'Person or team the ticket was escalated to', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
];

export const DEMO_CONTACT_FIELDS: BotTemplateRow[] = [
  { id: 'cfc1', name: 'Date of birth', description: 'Used for birthday offers and age checks', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'cfc2', name: 'City', description: 'City the customer lives in', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'cfc3', name: 'Company', description: 'Organisation the customer works for', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false },
  { id: 'cfc4', name: 'Preferred language', description: 'Language to use when replying', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'cfc5', name: 'Loyalty ID', description: 'Membership number in the loyalty programme', type: 'task', usecases: [], industries: [], scope: 'account', enabled: true },
  { id: 'cfc6', name: 'Alternate phone', description: 'A second number to reach the customer on', type: 'task', usecases: [], industries: [], scope: 'account', enabled: false },
];

export const CUSTOM_FIELD_TYPES = ['Text', 'Number', 'Date', 'Dropdown'];

// Demo: give each custom field a data type and a couple of inboxes so the Type / Inbox filters have something to match,
// and mark a scattered few as mandatory.
export const withFieldMeta = (rows: BotTemplateRow[]): BotTemplateRow[] =>
  rows.map((r, i) => ({
    ...r,
    mandatory: (i * 7) % 5 < 2,
    kind: CUSTOM_FIELD_TYPES[i % CUSTOM_FIELD_TYPES.length],
    inboxes: [AGENT_INBOXES[i % AGENT_INBOXES.length], AGENT_INBOXES[(i + 2) % AGENT_INBOXES.length]],
  }));

// Demo: each agent sits in 2–3 of the first few inboxes, and a few are still pending verification.
export const DEMO_AGENTS: BotTemplateRow[] = DEMO_COLLABORATORS.map((c, i) => ({
  ...c,
  pending: i % 5 === 0,
  inboxes: Array.from({ length: 2 + (i % 2) }, (_, k) => AGENT_INBOXES[(i + k) % AGENT_INBOXES.length]),
}));

export const DEMO_KB_FILES: Record<string, BotTemplateRow[]> = {
  doc: [
    { id: 'doc1', name: 'Return policy.pdf', description: 'Ready · 19.88/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '1.2 MB' },
    { id: 'doc2', name: 'Product catalogue.pdf', description: 'Ready · 12.40/min · took 3s · $0.01', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '8.4 MB' },
    { id: 'doc3', name: 'Shipping FAQ.docx', description: 'Ready · 21.05/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '320 KB' },
    { id: 'doc4', name: 'Warranty terms.pdf', description: 'Ready · 18.20/min · took 2s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '640 KB' },
    { id: 'doc5', name: 'Size guide.html', description: 'Ready · 24.75/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '210 KB' },
    { id: 'doc6', name: 'Store locations.json', description: 'Ready · 9.60/min · took 4s · $0.01', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '95 KB' },
    { id: 'doc7', name: 'Onboarding handbook.md', description: 'Ready · 15.33/min · took 2s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '1.8 MB' },
    { id: 'doc8', name: 'Privacy policy.pdf', description: 'Ready · 20.11/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '430 KB' },
    { id: 'doc9', name: 'Pricing sheet.xlsx', description: 'Ready · 11.84/min · took 3s · $0.01', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '152 KB' },
    { id: 'doc10', name: 'Returns workflow.txt', description: 'Ready · 17.52/min · took 2s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '2.3 MB' },
    { id: 'doc11', name: 'Festive offers 2026.pptx', description: 'Ready · 8.90/min · took 5s · $0.02', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '5.1 MB' },
    { id: 'doc12', name: 'Delivery partners.csv', description: 'Ready · 22.47/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '275 KB' },
    { id: 'doc13', name: 'Support scripts.md', description: 'Ready · 19.02/min · took 2s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '388 KB' },
  ],
  url: [
    { id: 'url1', name: 'https://www.nestkart.in/faqs', description: 'Ready · 16.30/min · took 2s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Daily' },
    { id: 'url2', name: 'https://www.urbanleaf.co/refund-policy', description: 'Failed · 1 failed · took 12h 14m · $0.00', status: 'failed', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Weekly' },
    { id: 'url3', name: 'https://help.shopsphere.com/shipping', description: 'Partial · 260/259 pages · 4 failed · 26.33 urls/min · took 9m 28', status: 'partial', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Monthly' },
    { id: 'url4', name: 'https://www.bluecart.store/track-order', description: 'Ready · 21.48/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Weekly' },
    { id: 'url5', name: 'https://support.freshbasket.in/returns', description: 'Ready · 11.85/min · took 3s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Daily' },
    { id: 'url6', name: 'https://www.zenwear.shop/warranty', description: 'Ready · 18.22/min · took 2s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Monthly' },
    { id: 'url7', name: 'https://www.greenmile.io/payment-options', description: 'Ready · 25.59/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Manual' },
    { id: 'url8', name: 'https://faq.craftnest.co.uk/cod', description: 'Ready · 15.96/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Weekly' },
    { id: 'url9', name: 'https://www.homelane.in/size-guide', description: 'Ready · 22.33/min · took 2s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Monthly' },
    { id: 'url10', name: 'https://shop.petalpure.com/gift-cards', description: 'Ready · 12.70/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Daily' },
    { id: 'url11', name: 'https://www.trendora.in/offers', description: 'Ready · 19.07/min · took 4s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Weekly' },
    { id: 'url12', name: 'https://www.snapmart.app/contact-us', description: 'Ready · 26.44/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Manual' },
    { id: 'url13', name: 'https://care.glowbar.in/privacy-policy', description: 'Ready · 16.81/min · took 2s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Monthly' },
    { id: 'url14', name: 'https://www.kiranastore.in/terms', description: 'Ready · 23.18/min · took 3s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Weekly' },
    { id: 'url15', name: 'https://help.tastybox.co/about', description: 'Ready · 13.55/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Daily' },
    { id: 'url16', name: 'https://www.bookbarn.in/careers', description: 'Ready · 20.92/min · took 2s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Monthly' },
    { id: 'url17', name: 'https://www.fitfuel.store/store-locator', description: 'Ready · 10.29/min · took 1s · $0.00', type: 'task', usecases: [], industries: [], scope: 'account', dataType: 'Weekly' },
  ],
  domain: [], // same rows as URL — filled in below
  custom: [
    { id: 'custom1', name: 'Brand tone notes', description: 'Added by Aarav Mehta', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '12 KB' },
    { id: 'custom2', name: 'Escalation rules', description: 'Added by Isha Kapoor', type: 'task', usecases: [], industries: [], scope: 'account', dataType: '8 KB' },
  ],
};

DEMO_KB_FILES.domain = DEMO_KB_FILES.url;

export const BOT_TEMPLATE_INDUSTRIES = ['E-Commerce [D2C]', 'E-Commerce [B2B]', 'Retail'];
