/**
 * IntegrationIcons — small abstract marks for each partner tile.
 *
 * These are simplified, non-trademarked glyphs colored to evoke each
 * partner's brand at a glance — not a reproduction of any partner's logo.
 */

import type { ReactNode } from 'react';

function Circle({ children, bg }: { children: ReactNode; bg: string }) {
  return (
    <span className="lc-ihp__icon-circle" style={{ background: bg }}>
      {children}
    </span>
  );
}

export const FreshdeskIcon = () => (
  <Circle bg="#ffffff">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4a7 7 0 0 0-7 7v5a2 2 0 0 0 2 2h1v-6H6a6 6 0 0 1 12 0h-2v6h1a2 2 0 0 0 2-2v-5a7 7 0 0 0-7-7Z"
        fill="#0e8a5f"
      />
      <circle cx="9" cy="15" r="1.6" fill="#ffffff" />
      <circle cx="15" cy="15" r="1.6" fill="#ffffff" />
    </svg>
  </Circle>
);

export const KaptureIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 4v16l14-8L6 4Z" fill="#d92b2b" />
    </svg>
  </Circle>
);

export const ZohoDeskIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a9c5c" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5v6a4 4 0 0 0 4 4h1" />
      <path d="M17 12l3 3-3 3" />
    </svg>
  </Circle>
);

export const OnedirectIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#d92b2b" />
      <circle cx="12" cy="12" r="3.4" fill="#ffffff" />
      <circle cx="12" cy="12" r="1.5" fill="#111111" />
    </svg>
  </Circle>
);

export const ZendeskIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h9L4 17V6Z" fill="#03363d" />
      <path d="M20 18h-9l9-11v11Z" fill="#03363d" />
    </svg>
  </Circle>
);

export const OdooIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9c4dcc" strokeWidth={2.4}>
      <circle cx="12" cy="12" r="7" />
    </svg>
  </Circle>
);

export const ShiprocketIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 4l14 8-14 8V4Z" fill="#6c2bd9" />
    </svg>
  </Circle>
);

export const EzyslipsIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth={1.8} strokeLinejoin="round">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" fill="#eaf1ff" />
      <path d="M4 7.5L12 12l8-4.5M12 12v9" />
    </svg>
  </Circle>
);

export const PickrrIcon = () => (
  <Circle bg="#ffffff">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="6" width="12" height="12" rx="3" transform="rotate(45 12 12)" fill="#e8586b" />
    </svg>
  </Circle>
);

export const EasyEcomIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a9c5c" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 15l6-6 6 6" />
    </svg>
  </Circle>
);

export const UnicommerceIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#17a2b8" strokeWidth={2.2} strokeLinecap="round">
      <path d="M4 13c1.5 2 3 2 4.5 0s3-2 4.5 0 3 2 4.5 0 3-2 4.5 0" />
    </svg>
  </Circle>
);

export const ShipDelightIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v5c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6l7-3Z" fill="#c62828" />
      <path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  </Circle>
);

export const BlueDartIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 5l16 7-16 7V5Z" fill="#1a5bb8" />
    </svg>
  </Circle>
);

export const ClickPostIcon = () => (
  <Circle bg="#1660d1">
    <span className="lc-ihp__icon-text">CP</span>
  </Circle>
);

export const DelhiveryIcon = () => (
  <Circle bg="#ffffff">
    <span className="lc-ihp__icon-text" style={{ color: '#111111' }}>
      D
    </span>
  </Circle>
);

// --- Storefront partners ------------------------------------------------

export const ShopifyIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M8 4l8 1 2 15-13 1L8 4Z" fill="#95bf47" />
      <path d="M14 8c-.4-1.4-1.2-2-2.1-2-1.5 0-2.5 1.3-2.5 3.2 0 1.1.5 1.7 1.4 2.2l1 .5c.6.3.8.6.8 1s-.3.8-1 .8c-.9 0-1.6-.5-2.1-1l-.6 1.9c.6.6 1.7 1.1 2.8 1.1 1.8 0 3-1.2 3-3 0-1.1-.5-1.8-1.5-2.3l-1-.5c-.5-.3-.8-.5-.8-.9s.3-.7.9-.7c.6 0 1.1.3 1.4.8l.3-2.1Z" fill="#ffffff" />
    </svg>
  </Circle>
);

export const WooCommerceIcon = () => (
  <Circle bg="#7f54b3">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="11" rx="3" fill="#ffffff" />
      <path d="M7 11l1 3 1.5-3L11 14l1-3" stroke="#7f54b3" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M13.5 11l1 3 1.5-3L17.5 14" stroke="#7f54b3" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  </Circle>
);

export const MagentoIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 4.6v9L12 21l-8-4.4v-9L12 3Z" fill="#f26322" />
      <path d="M9 9v7M15 9v7M12 9v4" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  </Circle>
);

export const BigCommerceIcon = () => (
  <Circle bg="#121118">
    <span className="lc-ihp__icon-text">B</span>
  </Circle>
);

// --- Billing partners -----------------------------------------------------

export const RazorpayIcon = () => (
  <Circle bg="#ffffff">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14 3L6 13.5h5L9 21l9-11.5h-5L14 3Z" fill="#0c2451" />
    </svg>
  </Circle>
);

export const StripeIcon = () => (
  <Circle bg="#635bff">
    <span className="lc-ihp__icon-text">S</span>
  </Circle>
);

export const PayUIcon = () => (
  <Circle bg="#ffffff">
    <span className="lc-ihp__icon-text" style={{ color: '#4caf1e' }}>
      PU
    </span>
  </Circle>
);

export const CashfreeIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3395ff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 9a5 5 0 1 0 0 6" />
    </svg>
  </Circle>
);

// --- Others -----------------------------------------------------------

export const GoogleSheetsIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l4 4v14H7V3Z" fill="#0f9d58" />
      <rect x="9.5" y="11" width="6" height="6.5" fill="#ffffff" />
      <path d="M9.5 13.6h6M12.5 11v6.5" stroke="#0f9d58" strokeWidth={0.9} />
    </svg>
  </Circle>
);

export const SlackIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="3" height="8" rx="1.5" fill="#36c5f0" />
      <rect x="13" y="13" width="3" height="8" rx="1.5" fill="#2eb67d" />
      <rect x="13" y="3" width="8" height="3" rx="1.5" fill="#ecb22e" />
      <rect x="3" y="13" width="8" height="3" rx="1.5" fill="#e01e5a" />
    </svg>
  </Circle>
);

export const WhatsAppBusinessIcon = () => (
  <Circle bg="#25d366">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Zm0 16.2a7.1 7.1 0 0 1-3.6-1l-.3-.2-2.7.7.7-2.6-.2-.3A7.2 7.2 0 1 1 12 19.2Z" />
    </svg>
  </Circle>
);

export const WebhookIcon = () => (
  <Circle bg="#ffffff">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#57534e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="7" r="2" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
      <path d="M6 9v6M8 7h6a4 4 0 0 1 4 4v0M16 17h0" />
    </svg>
  </Circle>
);
