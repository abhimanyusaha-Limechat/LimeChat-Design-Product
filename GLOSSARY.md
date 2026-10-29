# LimeChat Design Prototype

A frontend-only, clickable prototype of the whole LimeChat product. It is the design source of truth, and reviewers leave feedback on it directly.

## Navigation

**Product**:
One of the three top-level LimeChat products a reviewer can switch between: Helpdesk, Marketing or Automation.
_Avoid_: Bot, product area, module

**Screen**:
One restorable navigation state of the prototype (product, sidebar item and sub-view), addressable by a URL.
_Avoid_: Page (when meaning a reviewer-visible place), route

**Settings tab**:
One named sub-view of the Settings Screen, listed per Product and part of the Screen's URL.
_Avoid_: Page, section

**List tab**:
One named sub-view of a list Screen, such as Draft broadcasts or the SMS templates channel, and part of the Screen's URL. Search, filters and the page number are not.
_Avoid_: Section, filter, view

## Flows

**Broadcast**:
A one-off Marketing message sent to an audience at a scheduled time.
_Avoid_: Campaign, blast

**Flow**:
An automated Marketing message journey.
_Avoid_: Automation flow, campaign flow

**Bot flow**:
An Automation chatbot conversation.
_Avoid_: Automation, flow (on its own)

**Flow editor**:
The canvas where one Broadcast, Flow or Bot flow is built, opened from its list or with "+ New"; which one is open is part of the Screen's URL.
_Avoid_: Canvas, builder

## Commenting

**Comment**:
A reviewer's feedback pinned to a place on a Screen. It is the start of a thread, and it carries a Status and an assignee.
_Avoid_: Issue, annotation, feedback, note

**Anchor**:
A named element on a Screen that a Comment can be pinned to. The name says what the element is, not where it sits, and is unique within a Screen; repeated items (rows, cards) share a name and differ by key.
_Avoid_: Target, hook, element id

**Pin**:
The marker drawn on a Screen at a Comment's position.
_Avoid_: Marker, dot

**Loose comment**:
A Comment with no Anchor, positioned as a fraction of the viewport (so it drifts when the window size changes).
_Avoid_: Free comment, unanchored comment

**Detached comment**:
A Comment whose Anchor name no longer exists in the current build. A Comment whose Anchor is merely off-screen, unrendered or missing its keyed item is not Detached.
_Avoid_: Orphaned, broken, lost comment

**Designer**:
A person allowed to triage: change any Status, assign, and delete any Comment. Today that is one account, defined only by `is_designer()` in the database, and triage means Resolve.
_Avoid_: Admin, owner, triager

**Reply**:
A message inside a Comment's thread. It has no pin and no Status of its own.
_Avoid_: Sub-comment, child comment

**Status**:
Where a Comment stands in triage: Open, Accepted, Won't fix or Resolved. Only Open and Resolved exist so far.
_Avoid_: State

## Inspecting

**Inspect mode**:
A read-only reviewer tool, opened from a draggable button or Shift+I, that shows an element's padding, gap and typography and flags values outside the design scale. Its bar also hosts the Comment tool, the entry point to Commenting; inspecting itself stays separate: the element it holds on to is a *pinned element*, not a Pin, and it needs no Anchor.
_Avoid_: Dev mode, inspector pin, redlines

**Design scale**:
The spacing grid and font sizes that Inspect mode checks values against, kept in `src/components/Inspector/designScale.ts`.
_Avoid_: Tokens (none exist yet for spacing or type)

## Tickets

**Ticket session**:
What an agent works with while one ticket is open: the reply draft, email recipients, Resolve status, assigned agent and team, message reactions, and the Commerce session. It starts fresh when the ticket changes; the details panel tab is not part of it.
_Avoid_: Ticket state, conversation state

## Commerce

**Commerce session**:
The cart and orders an agent works with while one ticket is open; part of the Ticket session. It starts fresh when the ticket changes.
_Avoid_: Basket, checkout

**Catalog product**:
An item synced from the company's store (Shopify), listed read-only on Settings > Products and browsed by agents in a ticket's Products tab. Not to be confused with a Product (Helpdesk, Marketing, Automation).
_Avoid_: SKU, listing, store item

**Cart**:
The products an agent has collected during a Commerce session, before turning them into an order.
_Avoid_: Basket

**Cart line**:
One product variant in the Cart (product, size and color) with its quantity. A variant is on at most one line: adding it again, or changing another line into it, merges the two.
_Avoid_: Cart item, row

**Order**:
A customer's purchase of one or more products, with its prices, addresses and Order status.
_Avoid_: Purchase, invoice

**Order status**:
Where an Order stands: Placed, Processing, Shipped, Delivered, Returned, Cancelled or Refunded.
_Avoid_: State, Status (that word belongs to Comments)

**Extra charge**:
A named, one-off amount an agent adds to an Order on top of shipping. It is not taxed.
_Avoid_: Fee, surcharge

**Order draft**:
The pre-filled Create order form that carries the Cart's items; it is discarded if the agent goes back to the Cart.
_Avoid_: Pending order

**Saved address**:
An address kept in the Commerce session for reuse in the Create order form. It lasts as long as the session does.
_Avoid_: Address book entry
