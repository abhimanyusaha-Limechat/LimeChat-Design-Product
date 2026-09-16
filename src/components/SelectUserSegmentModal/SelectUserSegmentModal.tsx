/**
 * SelectUserSegmentModal — LimeChat design system (Figma node 258:13354,
 * "[pre-V3] Select Segment").
 *
 * Opened from the Broadcast canvas' audience card. Search/browse saved user
 * segments across two tabs (LC Segments / Imported Segments) and mark each
 * row Include or Exclude, up to a combined cap of 4.
 *
 *   <SelectUserSegmentModal
 *     open={open}
 *     onClose={close}
 *     segments={segments}
 *     onSave={(selections) => save(selections)}
 *   />
 *
 * Built on the shared `<Modal>` shell + `<Button>` for the row toggles.
 */
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import './SelectUserSegmentModal.css';

export type SegmentChoice = 'include' | 'exclude';

export interface UserSegment {
  id: string;
  name: string;
  recommended?: boolean;
  description?: string;
  count: number;
  lastEdited: string;
  imported?: boolean;
}

export interface SelectUserSegmentModalProps {
  open: boolean;
  onClose: () => void;
  segments: UserSegment[];
  /** Called with the final include/exclude map when "Save" is clicked. */
  onSave?: (selections: Record<string, SegmentChoice>) => void;
  defaults?: Record<string, SegmentChoice>;
  maxSelected?: number;
}

const SEARCH_ICON_PATHS = ['M10 4a6 6 0 1 0 0 12a6 6 0 0 0 0 -12z', 'M21 21l-6 -6'];
const REFRESH_ICON_PATHS = [
  'M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5',
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SEARCH_ICON_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {REFRESH_ICON_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const INFO_ICON_PATHS = [
  'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
  'M12 9h.01',
  'M11 12h1v4h1',
];

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {INFO_ICON_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function SelectUserSegmentModal({
  open,
  onClose,
  segments,
  onSave,
  defaults,
  maxSelected = 4,
}: SelectUserSegmentModalProps) {
  const [tab, setTab] = useState<'lc' | 'imported'>('lc');
  const [query, setQuery] = useState('');
  const [selections, setSelections] = useState<Record<string, SegmentChoice>>(defaults ?? {});

  useEffect(() => {
    if (!open) return;
    setTab('lc');
    setQuery('');
    setSelections(defaults ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedCount = Object.keys(selections).length;

  const visible = useMemo(() => {
    const wantImported = tab === 'imported';
    const q = query.trim().toLowerCase();
    return segments.filter((s) => {
      if (Boolean(s.imported) !== wantImported) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    });
  }, [segments, tab, query]);

  const includedUserCount = useMemo(
    () =>
      segments
        .filter((s) => selections[s.id] === 'include')
        .reduce((sum, s) => sum + s.count, 0),
    [segments, selections],
  );

  const toggle = (id: string, choice: SegmentChoice) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[id] === choice) {
        delete next[id];
        return next;
      }
      if (next[id] == null && Object.keys(next).length >= maxSelected) return prev;
      next[id] = choice;
      return next;
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select user segments"
      width={1024}
      className="lc-segment-modal"
      footer={
        <div className="lc-segment-modal__footer">
          <div className="lc-segment-modal__notice">
            <InfoIcon />
            <span>You can include/exclude at max {maxSelected} segments at a time</span>
          </div>
          <div className="lc-segment-modal__footer-right">
            <span className="lc-segment-modal__total">
              <span>User count in segments</span>
              <InfoIcon />
              <strong>{includedUserCount.toLocaleString()}</strong>
            </span>
            <Button
              variant="filled"
              color="primary"
              size="sm"
              disabled={selectedCount === 0}
              onClick={() => onSave?.(selections)}
            >
              Save
            </Button>
          </div>
        </div>
      }
    >
      <div className="lc-segment-modal__toolbar">
        <div className="lc-segment-modal__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'lc'}
            className="lc-segment-modal__tab"
            data-active={tab === 'lc' || undefined}
            onClick={() => setTab('lc')}
          >
            LC Segments
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'imported'}
            className="lc-segment-modal__tab"
            data-active={tab === 'imported' || undefined}
            onClick={() => setTab('imported')}
          >
            Imported Segments
          </button>
        </div>
        <div className="lc-segment-modal__search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by ID, Name & Message"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </div>
      </div>

      <div className="lc-segment-modal__table">
        <div className="lc-segment-modal__row lc-segment-modal__row--head">
          <span>Segments</span>
          <span>Description</span>
          <span>User count</span>
          <span>Choose to include / exclude</span>
        </div>
        <div className="lc-segment-modal__body">
          {visible.map((s) => {
            const choice = selections[s.id];
            return (
              <div className="lc-segment-modal__row" key={s.id} data-choice={choice}>
                <span className="lc-segment-modal__name-cell">
                  <span className="lc-segment-modal__name-line">
                    <span className="lc-segment-modal__name">{s.name}</span>
                  </span>
                  <span className="lc-segment-modal__meta">Last edited, {s.lastEdited}</span>
                </span>
                <span className="lc-segment-modal__description">{s.description ?? ''}</span>
                <span className="lc-segment-modal__count-cell">
                  <span className="lc-segment-modal__count-line">
                    <span>{s.count.toLocaleString()}</span>
                    <RefreshIcon />
                  </span>
                  <span className="lc-segment-modal__meta">a minute ago</span>
                </span>
                <span className="lc-segment-modal__actions">
                  <Button
                    variant={choice === 'include' ? 'filled' : 'outline'}
                    color="primary"
                    size="xs"
                    onClick={() => toggle(s.id, 'include')}
                  >
                    Include
                  </Button>
                  <Button
                    variant={choice === 'exclude' ? 'filled' : 'outline'}
                    color="red"
                    size="xs"
                    onClick={() => toggle(s.id, 'exclude')}
                  >
                    Exclude
                  </Button>
                </span>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="lc-segment-modal__empty">No segments found.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default SelectUserSegmentModal;
