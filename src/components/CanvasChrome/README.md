# CanvasChrome

Floating flow-builder canvas chrome from the **LimeChat Design System — V3**
(Figma [`227:12483`](https://www.figma.com/design/DiziMftcjYxd7LVqnQNluw/Marketing-components?node-id=227-12483)
"Marketing" / [`227:12818`](https://www.figma.com/design/DiziMftcjYxd7LVqnQNluw/Marketing-components?node-id=227-12818)
"Automation").

Three overlay regions that sit on top of a flow-builder canvas:

| Region | What it holds |
| --- | --- |
| **Canvas navigation** (top) | Flow pill — back chevron, title / `flow id`, rename pencil, `ACTIVE` badge — on the left; on the right a `Saving…` indicator, a collaborator avatar stack, the CTA buttons and a kebab. |
| **Floating toolbar** (left) | A filled "add node" button above a vertical list of canvas tools, with optional divider lines. |
| **Status bar** (bottom-left) | Zoom % + fit / full-screen pill, and an undo / redo pill. |

Presentation-only and fully controlled. It renders `position: absolute; inset: 0`
and only captures pointer events on the panels — drop it inside a
`position: relative` canvas container.

## Usage

```tsx
import { CanvasChrome } from './components/CanvasChrome';
import { marketingCanvas, automationCanvas } from './components/CanvasChrome/presets';

// Marketing — Reports / Draft / Publish
<div style={{ position: 'relative', height: '100%' }}>
  <CanvasChrome
    {...marketingCanvas({ onAdd, onDownloadReports, onSaveDraft, onPublish, onMore })}
    flow={{ title: 'Welcome series', subtitle: 'flow_1a2b', badge: 'Active', onBack, onEdit }}
    activeToolId="select"
    onToolSelect={setTool}
    zoom={zoom}
    onUndo={undo}
    onRedo={redo}
  />
</div>

// Automation — Saving… + collaborators + Revert / Publish
<CanvasChrome
  {...automationCanvas({ onAdd, saving, collaborators, onRevert, onPublish, onMore })}
  flow={{ title: 'Bot flows', subtitle: 'flow_9x8y', badge: 'Active', onBack, onEdit }}
/>
```

The two product presets differ only in the right side of the canvas navigation
and the floating-toolbar contents; the shell (pills, status bar, tokens) is
shared.

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `flow` | `CanvasFlow` | `title`, `subtitle?`, `onBack?`, `onEdit?`, plus `active?` — `true` → accent border + green "Active" badge, `false` → pale border + grey "Inactive" badge, `undefined` → no badge (Figma `10653:17584`). `badge?` overrides the label. |
| `onAdd` / `addLabel` | `() => void` / `string` | Filled button on top of the toolbar. Omit to hide. |
| `nodePalette` / `onAddNode` | `CanvasNodeGroup[]` / `(id) => void` | When set, the "+" opens a searchable node palette (`{ title, items: [{ id, label, icon }] }`) instead of firing `onAdd`; picking a tile fires `onAddNode`. `flowNodePalette` ships demo data. |
| `tools` | `CanvasTool[]` | `{ id, label, icon, dividerAfter?, shortcut? }`. `shortcut` is a single key (e.g. `'v'`, `'h'`) that selects the tool via `onToolSelect` — ignored while typing. |
| `activeToolId` / `onToolSelect` | `string` / `(id) => void` | Controlled tool selection (active tool gets the light-green treatment). |
| `onCanvasSearch` / `onCanvasSearchOptions` | `(q) => void` / `() => void` | When `onCanvasSearch` is set, clicking the `search` tool opens a search bar (Figma `125:18398`); fires on each keystroke. Closes on outside‑click / Escape. |
| `showToolbar` | `boolean` | Default `true`. |
| `saving` / `savingLabel` | `boolean` / `string` | `Saving…` spinner in the canvas navigation. |
| `collaborators` / `onCollaborators` | `CanvasCollaborator[]` / `() => void` | Overlapping avatar stack + caret. |
| `actions` | `ReactNode` | CTA slot — a set of `<Button>`s. Supplied by the presets. |
| `onMore` | `() => void` | Trailing kebab — plain callback. Ignored when `menu` is set. |
| `menu` | `CanvasMenuItem[]` | Kebab opens a dropdown of these (`{ id, label, icon, onSelect, dividerBefore? }`) — Figma `173:13717` / `173:13660`. Closes on outside‑click / Escape / select. |
| `lastEditedBy` | `{ name, at, avatarSrc? }` | "Last edited by" footer inside the kebab dropdown. |
| `showStatusBar` | `boolean` | Default `true`. |
| `zoom` / `onZoomChange` | `number` / `(z) => void` | Percentage shown in the minimap pill. |
| `onFitView` / `onExpand` | `() => void` | Minimap pill buttons (`onFitView` defaults to resetting zoom to 100). |
| `onUndo` / `onRedo` / `canUndo` / `canRedo` | `() => void` / `boolean` | Undo-redo pill. |

## Tokens

Scoped to `.lc-canvas` as `--lc-canvas-*` custom properties:

```
accent       border/primary/default        #6bac1b   flow pill border, filled + button, active badge
accent-soft  background/primary/light-hover #edf5e3   active tool / badge fill
hover-bg     ~gray/gray-0                   #f5f5f4   icon-button hover
dimmed       text/dimmed                    #808975   subtitles, idle icons, zoom label
divider      gray/30                        #f0f0f0   toolbar + pill dividers
disabled     text/disabled/default          #bfbfbf   "Saving…" text
pill         radius/xs 8px · shadow 0 1px 1px #0000001A, 0 1px 1.5px #0000000D
```

Reuses the design-system [`Button`](../Button/README.md) for CTAs and
[`Avatar` / `Avatar.Group`](../Avatar) for the collaborator stack.
