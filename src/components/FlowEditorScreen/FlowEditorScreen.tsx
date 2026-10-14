/**
 * FlowEditorScreen — the Flow editor for a Broadcast, Flow or Bot flow: the canvas chrome
 * and every modal it opens. Which flow is open lives in the URL (`?flow=`); `editorSetup`
 * turns it into what the editor shows. Edits made in Flow details last until another flow opens.
 */
import { useState } from 'react';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { CanvasChrome, type CanvasBroadcastAudience, type CanvasBroadcastSchedule } from '../CanvasChrome';
import { automationCanvas, flowNodePalette, marketingCanvas } from '../CanvasChrome/presets';
import { PublishFlowModal } from '../PublishFlowModal';
import { PublishConfirmModal } from '../PublishConfirmModal';
import { FlowDetailsModal } from '../FlowDetailsModal';
import { ScheduleBroadcastModal } from '../ScheduleBroadcastModal';
import { VisualizeFlowModal } from '../VisualizeFlowModal';
import { SelectUserSegmentModal } from '../SelectUserSegmentModal';
import { DEMO_USER_SEGMENTS } from '../../data/segmentsDemo';
import { editorSetup, findFlow } from './editorSetup';

type Modal = 'publish' | 'publish-confirm' | 'details' | 'schedule' | 'visualize' | 'segments';

const FLOW_MENU = {
  onCloneFlow: () => alert('Clone flow'),
  onDeleteFlow: () => alert('Delete flow'),
  onExportFlow: () => alert('Export flow'),
  onPublishHistory: () => alert('Publish history'),
};

export function FlowEditorScreen() {
  const { flowKind, flowId, leaveCanvas } = useAppNavigation();
  // ponytail: App only renders this in the editor, where navigation always has a kind.
  const kind = flowKind ?? 'broadcast';
  const flow = findFlow(kind, flowId);
  const setup = editorSetup(flow);

  const [modal, setModal] = useState<Modal | null>(null);
  const close = () => setModal(null);
  const [zoom, setZoom] = useState(100);
  const setZoomClamped = (z: number) => setZoom(Math.min(400, Math.max(25, Math.round(z))));
  const [activeTool, setActiveTool] = useState('select');
  const [grabbing, setGrabbing] = useState(false);

  // Flow details edits, replaced during render when another flow opens.
  const key = `${kind}:${flowId}`;
  const [storedEdits, setEdits] = useState({ key, name: flow.name, active: setup.active });
  const edits = storedEdits.key === key ? storedEdits : { key, name: flow.name, active: setup.active };
  if (edits !== storedEdits) setEdits(edits);

  // Broadcast audience + schedule — shown in the canvas meta bar and reused as
  // the review summary in the pre-publish confirmation modal.
  const broadcastAudience: CanvasBroadcastAudience = {
    count: 370131,
    description: '3 included 1 excluded',
    onRefresh: () => alert('Refresh audience'),
    onEdit: () => setModal('segments'),
    includedSegments: [
      { name: 'Engaged App Users Who Opened The App In Last 30 Days', count: 182391 },
      { name: 'Recent Purchasers Who Bought Something Last Week', count: 123208 },
      { name: 'Cart Abandoners Who Left Items Unpurchased Twice', count: 98745 },
    ],
    excludedSegments: [{ name: 'Visited Pricing Page And Compared Premium Plans Closely', count: 34213 }],
    totalUsers: 370131,
    optOutNotice: 'Phone numbers which are in Opt Out list will not be included in the broadcast.',
  };
  const broadcastSchedule: CanvasBroadcastSchedule = {
    label: 'Sep 14 · 10:30 AM',
    description: 'Retry after 1 day 8 hours',
    onEdit: () => setModal('schedule'),
    details: [
      { label: 'Timezone', value: 'Asia/Kolkata (GMT+5:30)' },
      { label: 'Retry policy', value: 'Retry after 1 day 8 hours' },
      { label: 'Max retries', value: '2' },
    ],
  };

  const onPublish = () =>
    setup.publish === 'confirm' ? setModal('publish-confirm') : setup.publish === 'form' ? setModal('publish') : alert('Published');

  const chromeFlow = {
    title: edits.name,
    active: edits.active,
    badge: setup.badge.label,
    badgeTone: setup.badge.tone,
    onBack: leaveCanvas,
    onEdit: () => setModal('details'),
  };
  const canvasProps = {
    nodePalette: flowNodePalette,
    onAddNode: (id: string) => alert(`Add node: ${id}`),
    onCanvasSearch: (q: string) => console.log('search', q),
    onCanvasSearchOptions: () => alert('Search options'),
    activeToolId: activeTool,
    onToolSelect: setActiveTool,
    zoom,
    onZoomChange: setZoomClamped,
  };
  const { marketing } = setup;

  return (
    <div
      onPointerDown={() => activeTool === 'pan' && setGrabbing(true)}
      onPointerUp={() => setGrabbing(false)}
      onPointerLeave={() => setGrabbing(false)}
      style={{ position: 'absolute', inset: 0, cursor: activeTool === 'pan' ? (grabbing ? 'grabbing' : 'grab') : undefined }}
    >
      {/* 12px inset so the canvas chrome doesn't sit flush against the shell. */}
      <div style={{ position: 'absolute', inset: 12 }}>
        {marketing ? (
          <CanvasChrome
            {...marketingCanvas({
              omitTools: marketing.omitTools,
              omitActions: marketing.omitActions,
              simpleReport: marketing.simpleReport,
              dateRange: marketing.dateRange,
              saveLabel: marketing.saveLabel,
              onTest: marketing.canTest ? () => setModal('visualize') : undefined,
              broadcastMeta: marketing.broadcastMeta && {
                audience: broadcastAudience,
                schedule: broadcastSchedule,
                readOnly: marketing.broadcastMeta.readOnly,
              },
              onDownloadReports: () => alert('Download reports'),
              onSaveDraft: () => alert('Saved'),
              onPublish,
              ...FLOW_MENU,
            })}
            flow={chromeFlow}
            {...canvasProps}
            showHistory={false}
            onUndo={() => console.log('undo')}
            onRedo={() => console.log('redo')}
          />
        ) : (
          <CanvasChrome
            {...automationCanvas({
              onPublish,
              onCollaborators: () => alert('Collaborators'),
              ...FLOW_MENU,
              lastEditedBy: {
                name: 'Rajeev Sanyal',
                at: '3:00 PM, Nov 24, 2025',
                avatarSrc: 'https://i.pravatar.cc/64?img=13',
              },
            })}
            flow={chromeFlow}
            {...canvasProps}
          />
        )}
      </div>

      <PublishFlowModal
        open={modal === 'publish'}
        onClose={close}
        retryOptions={['Immediately', 'After 30 minutes', 'After 1 hour', 'After 3 hours']}
        onPublish={(v) => {
          console.log('publish', v);
          close();
        }}
      />

      <PublishConfirmModal
        open={modal === 'publish-confirm'}
        onClose={close}
        audience={broadcastAudience}
        schedule={broadcastSchedule}
        onEditAudience={() => setModal('segments')}
        onEditSchedule={() => setModal('schedule')}
        onConfirm={() => {
          console.log('publish broadcast', edits.name);
          close();
          alert('Broadcast published');
        }}
      />

      <FlowDetailsModal
        open={modal === 'details'}
        onClose={close}
        title={setup.detailsTitle}
        defaults={{ name: edits.name, flowId: flow.displayId, active: edits.active }}
        onCopyFlowId={(id) => navigator.clipboard?.writeText(id)}
        onActiveChange={(active) => setEdits((e) => ({ ...e, active }))}
        onSave={(v) => {
          setEdits((e) => ({ ...e, name: v.name, active: v.active }));
          close();
        }}
      />

      <ScheduleBroadcastModal
        open={modal === 'schedule'}
        onClose={close}
        defaults={{ mode: 'later', date: '2026-09-14', time: '10:30' }}
        onEditQuietHours={() => alert('Edit quiet hours')}
        onSetSchedule={(v) => {
          console.log('schedule broadcast', v);
          close();
        }}
      />

      <VisualizeFlowModal
        open={modal === 'visualize'}
        onClose={close}
        onSend={(v) => {
          console.log('visualize flow send', v);
          close();
        }}
      />

      <SelectUserSegmentModal
        open={modal === 'segments'}
        onClose={close}
        segments={DEMO_USER_SEGMENTS}
        onSave={(selections) => {
          console.log('segment selections', selections);
          close();
        }}
      />
    </div>
  );
}
