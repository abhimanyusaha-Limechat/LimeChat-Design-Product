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
