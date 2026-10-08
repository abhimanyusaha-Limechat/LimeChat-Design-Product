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
A Comment with no Anchor, positioned relative to the viewport.
_Avoid_: Free comment, unanchored comment

**Detached comment**:
A Comment whose Anchor name no longer exists in the current build. A Comment whose Anchor is merely off-screen, unrendered or missing its keyed item is not Detached.
_Avoid_: Orphaned, broken, lost comment

**Designer**:
A person allowed to triage: change any Status, assign, and delete any Comment.
_Avoid_: Admin, owner, triager

**Reply**:
A message inside a Comment's thread. It has no pin and no Status of its own.
_Avoid_: Sub-comment, child comment

**Status**:
Where a Comment stands in triage: Open, Accepted, Won't fix or Resolved.
_Avoid_: State

## Inspecting

**Inspect mode**:
A read-only reviewer tool, opened from a draggable button or Shift+I, that shows an element's padding, gap and typography and flags values outside the design scale. It is separate from Commenting: the element it holds on to is a *pinned element*, not a Pin, and it needs no Anchor.
_Avoid_: Dev mode, inspector pin, redlines

**Design scale**:
The spacing grid and font sizes that Inspect mode checks values against, kept in `src/components/Inspector/designScale.ts`.
_Avoid_: Tokens (none exist yet for spacing or type)

## Commerce

**Commerce session**:
The cart and orders an agent works with while one ticket is open. It starts fresh when the ticket changes.
_Avoid_: Basket, checkout

**Cart**:
The products an agent has collected during a Commerce session, before turning them into an order.
_Avoid_: Basket

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
