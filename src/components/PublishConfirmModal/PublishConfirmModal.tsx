/**
 * PublishConfirmModal — last-confirmation dialog shown before a broadcast is
 * published. Summarizes the audience (segments included/excluded) and the
 * schedule, each with an "Edit" CTA that reopens the section's own modal
 * (SelectUserSegmentModal / ScheduleBroadcastModal) instead of editing inline.
 *
 *   <PublishConfirmModal
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     audience={broadcastMeta.audience}
 *     schedule={broadcastMeta.schedule}
 *     onEditAudience={() => setSegmentModalOpen(true)}
 *     onEditSchedule={() => setScheduleOpen(true)}
 *     onConfirm={() => publish()}
 *   />
 */
import { useEffect, useState } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import type {
  CanvasBroadcastAudience,
  CanvasBroadcastSchedule,
} from '../CanvasChrome';
import './PublishConfirmModal.css';

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

/** One reel of stacked 0-9 digits — rolls to `digit` shortly after mount. */
function RollingDigit({ digit, delay }: { digit: number; delay: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => setShown(digit), delay);
    return () => window.clearTimeout(id);
  }, [digit, delay]);

  return (
    <span className="lc-publish-confirm__roll-digit">
      <span
        className="lc-publish-confirm__roll-track"
        style={{ transform: `translateY(-${shown * 10}%)` }}
      >
        {DIGITS.map((n) => (
          <span key={n} className="lc-publish-confirm__roll-num">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Formats `value` and rolls each digit into place, e.g. for "370,131 users". */
function RollingNumber({ value }: { value: number }) {
  const chars = value.toLocaleString().split('');
  let digitIndex = 0;
  return (
    <span className="lc-publish-confirm__rolling">
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <RollingDigit key={i} digit={Number(ch)} delay={30 + digitIndex++ * 35} />
        ) : (
          <span key={i} className="lc-publish-confirm__roll-sep">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

function EditIcon() {
  return (
    <svg
      className="lc-publish-confirm__edit-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 20h-4v-4l11.5 -11.5a2.121 2.121 0 0 1 3 3l-11.5 11.5" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  );
}

export interface PublishConfirmModalProps {
  open: boolean;
  onClose: () => void;
  audience: CanvasBroadcastAudience;
  schedule: CanvasBroadcastSchedule;
  /** Opens the segment picker (SelectUserSegmentModal) so the user can change the audience. */
  onEditAudience?: () => void;
  /** Opens the schedule picker (ScheduleBroadcastModal) so the user can change the timing. */
  onEditSchedule?: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

function SegmentList({
  title,
  segments,
}: {
  title: string;
  segments?: { name: string; count: number }[];
}) {
  if (!segments || segments.length === 0) return null;
  return (
    <div className="lc-publish-confirm__segment-group">
      <span className="lc-publish-confirm__segment-group-title">{title}</span>
      <ul className="lc-publish-confirm__segment-list">
        {segments.map((s) => (
          <li key={s.name} className="lc-publish-confirm__segment-item">
            <span className="lc-publish-confirm__segment-name">{s.name}</span>
            <span className="lc-publish-confirm__segment-count">{s.count.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublishConfirmModal({
  open,
  onClose,
  audience,
  schedule,
  onEditAudience,
  onEditSchedule,
  onConfirm,
  title = 'Confirm & publish',
  description = 'Review the audience and schedule one last time before this broadcast goes out.',
  confirmLabel = 'Confirm & Publish',
}: PublishConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      width={552}
      footer={
        <>
          <Button variant="default" color="gray" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" color="primary" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="lc-publish-confirm">
        <section className="lc-publish-confirm__section">
          <div className="lc-publish-confirm__section-header">
            <span className="lc-publish-confirm__section-title">Audience</span>
            <button
              type="button"
              className="lc-publish-confirm__edit"
              onClick={onEditAudience}
            >
              <EditIcon />
              Edit
            </button>
          </div>
          <div className="lc-publish-confirm__summary">
            <span className="lc-publish-confirm__count">
              <RollingNumber value={audience.count} /> users
            </span>
            <span className="lc-publish-confirm__desc">{audience.description}</span>
          </div>
          {(audience.includedSegments?.length || audience.excludedSegments?.length) && (
            <div className="lc-publish-confirm__segments">
              <SegmentList title="Included" segments={audience.includedSegments} />
              <SegmentList title="Excluded" segments={audience.excludedSegments} />
            </div>
          )}
          {audience.optOutNotice && (
            <p className="lc-publish-confirm__note">{audience.optOutNotice}</p>
          )}
        </section>

        <section className="lc-publish-confirm__section">
          <div className="lc-publish-confirm__section-header">
            <span className="lc-publish-confirm__section-title">Schedule</span>
            <button
              type="button"
              className="lc-publish-confirm__edit"
              onClick={onEditSchedule}
            >
              <EditIcon />
              Edit
            </button>
          </div>
          <div className="lc-publish-confirm__summary">
            <span className="lc-publish-confirm__count">{schedule.label}</span>
            <span className="lc-publish-confirm__desc">{schedule.description}</span>
          </div>
        </section>
      </div>
    </Modal>
  );
}

export default PublishConfirmModal;
