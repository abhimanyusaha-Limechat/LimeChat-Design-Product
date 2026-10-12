import type { FlowKind } from '../../hooks/navigationHash';
import type { BroadcastRowData } from '../BroadcastHomePage';
import type { FlowRowData } from '../FlowsHomePage';
import type { BotFlowRowData } from '../BotFlowsHomePage';
import type { MarketingCanvasOptions } from '../CanvasChrome/presets';
import { FLOW_ROWS } from '../../data/flowsDemo';

/** The flow open in the Flow editor: a list row, or a fresh one from "+ New". */
export type EditorFlow =
  | { kind: 'broadcast'; name: string; displayId?: string; status: BroadcastRowData['status'] }
  | { kind: 'flows'; name: string; displayId?: string; status: FlowRowData['status'] }
  | { kind: 'bot-flows'; name: string; displayId?: string; status: BotFlowRowData['status'] };

type Badge = { label: string; tone?: 'accent' | 'warning' };

const NEW_FLOW: Record<FlowKind, EditorFlow> = {
  broadcast: { kind: 'broadcast', name: 'Untitled broadcast', status: 'draft' },
  flows: { kind: 'flows', name: 'Untitled flow', status: 'draft' },
  // Bot flows have no Draft, so a new one starts Inactive.
  'bot-flows': { kind: 'bot-flows', name: 'Untitled flow', status: 'inactive' },
};

/** The flow a URL names: 'new', or a row id (navigation has already checked it exists). */
export function findFlow(kind: FlowKind, id: string): EditorFlow {
  if (id === 'new') return NEW_FLOW[kind];
  const rows: { id: string; name: string; displayId?: string; status: string }[] = Object.values(FLOW_ROWS[kind]).flat();
  const row = rows.find((r) => r.id === id);
  return row ? ({ kind, name: row.name, displayId: row.displayId, status: row.status } as EditorFlow) : NEW_FLOW[kind];
}

/** What the Flow editor shows for a flow; the screen adds the handlers. */
export interface EditorSetup {
  /** The list the editor goes back to, as the breadcrumb names it. */
  listLabel: string;
  detailsTitle: string;
  badge: Badge;
  active: boolean;
  /** Where Publish leads: the Broadcast review, the publish form, or straight to published. */
  publish: 'confirm' | 'form' | 'instant';
  /** Marketing canvas options for Broadcasts and Flows; undefined for Bot flows. */
  marketing?: Pick<MarketingCanvasOptions, 'omitTools' | 'omitActions' | 'simpleReport' | 'dateRange' | 'saveLabel'> & {
    /** Shows Test (Visualize flow) next to Publish. */
    canTest: boolean;
    /** Broadcast audience + schedule pill; read-only once it has been sent. */
    broadcastMeta?: { readOnly: boolean };
  };
}

const BROADCAST_BADGE: Record<BroadcastRowData['status'], Badge> = {
  sending: { label: 'Sending' },
  completed: { label: 'Completed' },
  scheduled: { label: 'Scheduled', tone: 'warning' },
  draft: { label: 'Draft' },
};
const FLOW_BADGE: Record<FlowRowData['status'] | BotFlowRowData['status'], Badge> = {
  active: { label: 'Active' },
  inactive: { label: 'Inactive' },
  draft: { label: 'Draft' },
};

export function editorSetup(flow: EditorFlow): EditorSetup {
  switch (flow.kind) {
    case 'broadcast': {
      const sent = flow.status === 'sending' || flow.status === 'completed';
      return {
        listLabel: 'Broadcast',
        detailsTitle: 'Broadcast details',
        badge: BROADCAST_BADGE[flow.status],
        active: flow.status !== 'draft',
        publish: 'confirm',
        marketing: {
          omitTools: ['preview', 'experiment', 'settings'],
          simpleReport: sent,
          omitActions: sent ? ['save', 'publish'] : ['reports', 'save'],
          canTest: !sent,
          broadcastMeta: { readOnly: sent },
        },
      };
    }
    case 'flows': {
      const draft = flow.status === 'draft';
      return {
        listLabel: 'Flows',
        detailsTitle: 'Flow details',
        badge: FLOW_BADGE[flow.status],
        active: flow.status === 'active',
        publish: 'form',
        marketing: {
          simpleReport: !draft,
          dateRange: draft ? undefined : 'January 14, 2023 - January 14, 2023',
          saveLabel: draft ? undefined : 'Draft',
          omitActions: draft ? ['reports'] : undefined,
          canTest: false,
        },
      };
    }
    case 'bot-flows':
      return {
        listLabel: 'Flows',
        detailsTitle: 'Flow details',
        badge: FLOW_BADGE[flow.status],
        active: flow.status === 'active',
        publish: 'instant',
      };
  }
}
