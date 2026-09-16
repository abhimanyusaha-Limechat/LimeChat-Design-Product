/**
 * Product presets for the flow-builder canvas chrome.
 *
 * The Marketing and Automation canvases (Figma nodes 227:12483 / 227:12818)
 * share the shell and differ only in the right side of the canvas navigation and
 * the floating-toolbar contents. Each factory returns a partial
 * `CanvasChromeProps` — spread it and override `flow` / handlers:
 *
 *   <CanvasChrome
 *     {...marketingCanvas({ onPublish, onSaveDraft })}
 *     flow={{ title: 'Welcome series', subtitle: 'flow_1a2b', badge: 'Active', onBack, onEdit }}
 *   />
 */
import { Button } from '../Button';
import { CanvasIcon } from './icons';
import type {
  CanvasBroadcastMeta,
  CanvasChromeProps,
  CanvasCollaborator,
  CanvasMenuItem,
  CanvasNodeGroup,
  CanvasTool,
} from './CanvasChrome';

/** "Add node" palette contents for the flow builder (Figma "Add node"). */
export const flowNodePalette: CanvasNodeGroup[] = [
  {
    title: 'Trigger',
    items: [
      { id: 'intent-keyword', label: 'Intent & Keyword', icon: 'target' },
      { id: 'bolt', label: 'Bolt', icon: 'bolt' },
      { id: 'trigger-csat', label: 'Trigger CSAT', icon: 'star' },
    ],
  },
  {
    title: 'Message',
    items: [
      { id: 'text-media', label: 'Text & media', icon: 'text' },
      { id: 'list-message', label: 'List Message', icon: 'list' },
    ],
  },
  {
    title: 'Products',
    items: [
      { id: 'static-product-card', label: 'Static Product Card', icon: 'card' },
      { id: 'dynamic-product-card', label: 'Dynamic Product Card', icon: 'card' },
      { id: 'carousel', label: 'Carousel', icon: 'carousel' },
      { id: 'collection', label: 'Collection', icon: 'copy' },
    ],
  },
  {
    title: 'Actions',
    items: [
      { id: 'time-delay', label: 'Time Delay', icon: 'hourglass' },
      { id: 'apply-tags', label: 'Apply Tags', icon: 'tag' },
      { id: 'assign-agent', label: 'Assign Agent', icon: 'headset' },
      { id: 'csat-action', label: 'CSAT Action node', icon: 'sparkle' },
    ],
  },
  {
    title: 'Function',
    items: [
      { id: 'api', label: 'API', icon: 'code' },
      { id: 'conditional', label: 'Conditional', icon: 'branch' },
      { id: 'user-input', label: 'User Input', icon: 'form' },
    ],
  },
];

/* Shared navigation / selection tools that head every product toolbar. */
const BASE_TOOLS: CanvasTool[] = [
  { id: 'select', label: 'Move node | V', icon: 'cursor', shortcut: 'v' },
  { id: 'pan', label: 'Pan | H', icon: 'hand', shortcut: 'h' },
  { id: 'swap', label: 'Rearrange nodes', icon: 'swap' },
  { id: 'search', label: 'Find on canvas', icon: 'search' },
];

/** Clone / Delete / Export / Publish-history kebab items (Figma node 173:13717). */
export function flowMenu(handlers: {
  onCloneFlow?: () => void;
  onDeleteFlow?: () => void;
  onExportFlow?: () => void;
  onPublishHistory?: () => void;
}): CanvasMenuItem[] {
  return [
    { id: 'clone', label: 'Clone flow', icon: 'copy', onSelect: handlers.onCloneFlow },
    { id: 'delete', label: 'Delete flow', icon: 'trash', onSelect: handlers.onDeleteFlow },
    { id: 'export', label: 'Export flow', icon: 'logout', onSelect: handlers.onExportFlow },
    {
      id: 'history',
      label: 'Publish history',
      icon: 'history',
      onSelect: handlers.onPublishHistory,
    },
  ];
}

export interface MarketingCanvasOptions {
  /** Primary "add node" button on top of the floating toolbar. */
  onAdd?: () => void;
  onDownloadReports?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  /** When set, renders a secondary "Test" button left of Publish (Broadcast). */
  onTest?: () => void;
  /** Tool ids to drop from the floating toolbar (e.g. `['preview', 'settings']` for Broadcast). */
  omitTools?: string[];
  /** CTA ids to drop from the canvas-nav action bar (`'reports'` | `'save'` | `'publish'`). */
  omitActions?: string[];
  /** Audience + schedule summary pill shown in the canvas nav (Broadcast only). */
  broadcastMeta?: CanvasBroadcastMeta;
  /* kebab dropdown (Figma node 173:13717) */
  onCloneFlow?: () => void;
  onDeleteFlow?: () => void;
  onExportFlow?: () => void;
  onPublishHistory?: () => void;
}

export function marketingCanvas(options: MarketingCanvasOptions = {}): Partial<CanvasChromeProps> {
  const {
    onAdd,
    onDownloadReports,
    onSaveDraft,
    onPublish,
    onTest,
    omitTools = [],
    omitActions = [],
    broadcastMeta,
    ...menuHandlers
  } = options;
  const showAction = (id: string) => !omitActions.includes(id);

  const tools: CanvasTool[] = [
    ...BASE_TOOLS.map((t, i) =>
      i === BASE_TOOLS.length - 1 ? { ...t, dividerAfter: true } : t,
    ),
    { id: 'preview', label: 'Visualize flow', icon: 'eye' },
    { id: 'experiment', label: 'Test mode', icon: 'flask', dividerAfter: true },
    { id: 'settings', label: 'Flow settings', icon: 'settings' },
  ].filter((t) => !omitTools.includes(t.id));
  // no dangling divider after the last remaining tool
  if (tools.length > 0 && tools[tools.length - 1].dividerAfter) {
    tools[tools.length - 1] = { ...tools[tools.length - 1], dividerAfter: false };
  }

  return {
    onAdd,
    tools,
    menu: flowMenu(menuHandlers),
    broadcastMeta,
    actions: (
      <>
        {showAction('reports') && (
          <Button
            variant="default"
            color="gray"
            size="sm"
            textTransform="none"
            leftSection={<CanvasIcon name="download" />}
            rightSection={<CanvasIcon name="chevron-down" />}
            onClick={onDownloadReports}
          >
            Reports
          </Button>
        )}
        {showAction('save') && (
          <Button
            variant="outline"
            color="primary"
            size="sm"
            textTransform="none"
            leftSection={<CanvasIcon name="floppy" />}
            onClick={onSaveDraft}
          >
            Save
          </Button>
        )}
        {onTest && (
          <Button
            variant="default"
            color="gray"
            size="sm"
            textTransform="none"
            leftSection={<CanvasIcon name="flask" />}
            onClick={onTest}
          >
            Test
          </Button>
        )}
        {showAction('publish') && (
          <Button
            variant="filled"
            color="primary"
            size="sm"
            textTransform="none"
            leftSection={<CanvasIcon name="rocket" />}
            onClick={onPublish}
          >
            Publish
          </Button>
        )}
      </>
    ),
  };
}

export interface AutomationCanvasOptions {
  /** Primary "add node" button on top of the floating toolbar. */
  onAdd?: () => void;
  saving?: boolean;
  collaborators?: CanvasCollaborator[];
  onCollaborators?: () => void;
  onRevert?: () => void;
  onPublish?: () => void;
  /* kebab dropdown (Figma nodes 173:13717 / 173:13660) */
  onCloneFlow?: () => void;
  onDeleteFlow?: () => void;
  onExportFlow?: () => void;
  onPublishHistory?: () => void;
  lastEditedBy?: CanvasChromeProps['lastEditedBy'];
}

const DEFAULT_COLLABORATORS: CanvasCollaborator[] = [
  { name: 'Aditi Rao', src: 'https://i.pravatar.cc/48?img=47' },
  { name: 'Marco Diaz', src: 'https://i.pravatar.cc/48?img=12' },
];

export function automationCanvas(options: AutomationCanvasOptions = {}): Partial<CanvasChromeProps> {
  const {
    onAdd,
    saving = true,
    collaborators = DEFAULT_COLLABORATORS,
    onCollaborators,
    onRevert,
    onPublish,
    lastEditedBy,
    ...menuHandlers
  } = options;

  return {
    onAdd,
    saving,
    collaborators,
    onCollaborators,
    menu: flowMenu(menuHandlers),
    lastEditedBy,
    tools: [
      ...BASE_TOOLS.map((t, i) =>
        i === BASE_TOOLS.length - 1 ? { ...t, dividerAfter: true } : t,
      ),
      { id: 'test-run', label: 'Run Simulation', icon: 'play' },
      { id: 'experiment', label: 'Test mode', icon: 'flask' },
    ],
    actions: (
      <>
        <Button
          variant="default"
          color="gray"
          size="sm"
          textTransform="none"
          leftSection={<CanvasIcon name="undo" />}
          onClick={onRevert}
        >
          Revert to original
        </Button>
        <Button
          variant="filled"
          color="primary"
          size="sm"
          textTransform="none"
          leftSection={<CanvasIcon name="rocket" />}
          onClick={onPublish}
        >
          Publish
        </Button>
      </>
    ),
  };
}

export const canvasPresets = {
  marketing: marketingCanvas,
  automation: automationCanvas,
} as const;

export type CanvasProduct = keyof typeof canvasPresets;
