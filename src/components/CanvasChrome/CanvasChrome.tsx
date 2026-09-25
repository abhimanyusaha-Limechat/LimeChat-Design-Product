/**
 * CanvasChrome — LimeChat design system (Figma nodes 227:12483 "Marketing" /
 * 227:12818 "Automation", the flow-builder canvas).
 *
 * The floating chrome that sits on top of a flow-builder canvas:
 *
 *   ┌─ Canvas navigation ─────────────────────────────────────────────┐
 *   │  [‹] Flow title            (Saving…) (avatars) [Reports][Publish] ⋮ │
 *   │      flow id  · ACTIVE                                          │
 *   ├──────────────────────────── canvas ───────────────────────────┤
 *   │  ┌──┐                                                          │
 *   │  │＋│  ← floating toolbar                                       │
 *   │  ├──┤                                                          │
 *   │  │▤ │                                                          │
 *   │  └──┘                                                          │
 *   │  [ 100%  |  ▣  ⛶ ]  [ ↺ | ↻ ]   ← status bar                   │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Presentation-only and fully controlled. Drop it inside a `position: relative`
 * canvas container — the root is `position: absolute; inset: 0` and lets pointer
 * events through except on the panels themselves.
 *
 * The two product variants (Marketing / Automation) differ only in the right side
 * of the canvas navigation and the floating-toolbar contents — build those with
 * the `marketingCanvas()` / `automationCanvas()` presets in `./presets`.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Avatar } from '../Avatar';
import { Tooltip, type TooltipPosition } from '../Tooltip';
import { CanvasIcon, type CanvasIconName } from './icons';
import { useDismiss } from '../../hooks/useDismiss';
import './CanvasChrome.css';

export interface CanvasFlow {
  /** Bold flow name in the pill (e.g. "Marketing flows", "Bot flows"). */
  title: string;
  /** Dimmed line under the title (e.g. "flow id"). */
  subtitle?: string;
  /**
   * Status of the flow — drives the pill border and the badge (Figma 10653:17584):
   * `true` → accent border + green "Active" badge · `false` → pale border + grey
   * "Inactive" badge · `undefined` → no badge.
   */
  active?: boolean;
  /** Override the badge label (defaults to "Active" / "Inactive"). */
  badge?: string;
  /** Badge colour family — `accent` (green, default) or `warning` (warm yellow, e.g. Broadcast "Scheduled"). */
  badgeTone?: 'accent' | 'warning';
  /** Back chevron — hidden when omitted. */
  onBack?: () => void;
  /** Edit pencil after the text — hidden when omitted. */
  onEdit?: () => void;
}

export interface CanvasCollaborator {
  src?: string;
  name?: string;
}

export interface CanvasTool {
  id: string;
  label: string;
  /** A named icon or a custom node. */
  icon: CanvasIconName | ReactNode;
  /** Draw a divider line under this tool. */
  dividerAfter?: boolean;
  /** Single-key shortcut that selects this tool (e.g. `'v'`, `'h'`). */
  shortcut?: string;
}

export interface CanvasMenuItem {
  id: string;
  label: string;
  /** A named icon or a custom node. */
  icon: CanvasIconName | ReactNode;
  onSelect?: () => void;
  /** Draw a divider line above this item. */
  dividerBefore?: boolean;
}

export interface CanvasNodeItem {
  id: string;
  label: string;
  icon: CanvasIconName | ReactNode;
}

export interface CanvasNodeGroup {
  title: string;
  items: CanvasNodeItem[];
}

export interface CanvasBroadcastSegment {
  name: string;
  count: number;
}

export interface CanvasBroadcastAudience {
  /** Recipient count, e.g. `3000000`. */
  count: number;
  /** Dimmed line under the count, e.g. "No segments selected" or "3 selected 1 excluded". */
  description: string;
  onRefresh?: () => void;
  onEdit?: () => void;
  /** Segment breakdown shown in a hover popover over the audience card (Figma node 267:51706). */
  includedSegments?: CanvasBroadcastSegment[];
  excludedSegments?: CanvasBroadcastSegment[];
  /** Defaults to `count` when omitted. */
  totalUsers?: number;
  /** Callout at the bottom of the segments popover, e.g. opt-out disclaimer. */
  optOutNotice?: string;
}

export interface CanvasBroadcastScheduleDetail {
  label: string;
  value: string;
}

export interface CanvasBroadcastSchedule {
  /** Bold line, e.g. "Instantly" or "Sep 14 · 10:30 AM". */
  label: string;
  /** Dimmed line under the label, e.g. "No retries" or "Retry after 1 day 8 hours". */
  description: string;
  onEdit?: () => void;
  /** Extra label/value rows shown in a hover popover over the schedule card, mirroring the audience card's segments popover. */
  details?: CanvasBroadcastScheduleDetail[];
}

/**
 * Audience + schedule summary shown in the canvas nav between the flow pill and
 * the action bar (Broadcast canvas, Figma node 10863:6513).
 */
export interface CanvasBroadcastMeta {
  audience: CanvasBroadcastAudience;
  schedule: CanvasBroadcastSchedule;
  /**
   * Triggered broadcasts are already sent — swap the edit/refresh actions for a
   * single read-only "view" (eye) affordance on both cards.
   */
  readOnly?: boolean;
}

export interface CanvasChromeProps {
  flow: CanvasFlow;

  /* -- floating toolbar (left) ------------------------------------------ */
  /** Primary "add node" affordance rendered as the filled button on top. */
  onAdd?: () => void;
  addLabel?: string;
  /**
   * When set, the "+" button opens a searchable node palette instead of calling
   * `onAdd` (Figma marketing "Add node"). Selecting a tile fires `onAddNode`.
   */
  nodePalette?: CanvasNodeGroup[];
  onAddNode?: (id: string) => void;
  nodeSearchPlaceholder?: string;
  tools?: CanvasTool[];
  activeToolId?: string;
  onToolSelect?: (id: string) => void;
  /**
   * When set, clicking the `search` tool opens a canvas search bar
   * (Figma 125:18398) instead of only firing `onToolSelect`. Fires on each keystroke.
   */
  onCanvasSearch?: (query: string) => void;
  onCanvasSearchOptions?: () => void;
  canvasSearchPlaceholder?: string;
  /** Hide the floating toolbar. Default `true` (shown). */
  showToolbar?: boolean;

  /* -- canvas navigation, middle --------------------------------------- */
  /** Audience + schedule summary pill (Broadcast pattern, Figma node 10863:6513). */
  broadcastMeta?: CanvasBroadcastMeta;

  /* -- canvas navigation, right side --------------------------------- */
  /** Show the "Saving…" spinner + label (Automation pattern). */
  saving?: boolean;
  savingLabel?: string;
  /** Overlapping avatar stack + caret (Automation pattern). */
  collaborators?: CanvasCollaborator[];
  onCollaborators?: () => void;
  /** CTA node — a set of `<Button>`s (Reports / Draft / Publish, or Revert / Publish). */
  actions?: ReactNode;
  /** Trailing kebab button — plain callback. Ignored when `menu` is set. */
  onMore?: () => void;
  /** When set, the kebab toggles a dropdown of these items (Figma node 173:13717). */
  menu?: CanvasMenuItem[];
  /** "Last edited by" footer inside the kebab dropdown (Figma node 173:13660). */
  lastEditedBy?: { name: string; at: string; avatarSrc?: string };

  /* -- status bar (bottom) ------------------------------------------- */
  /** Hide the bottom status bar. Default `true` (shown). */
  showStatusBar?: boolean;
  /** Zoom percentage shown in the minimap pill. Default `100`. */
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  /** `+` / `−` buttons around the zoom label. Fallback: `onZoomChange(zoom ± 10)`. */
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  /** Fired when the minimap is expanded / collapsed (the panel state is internal). */
  onExpand?: (expanded: boolean) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;

  className?: string;
  style?: CSSProperties;
}

function IconButton({
  icon,
  label,
  onClick,
  size = 'md',
  variant = 'transparent',
  active = false,
  disabled = false,
  tooltip = false,
  tooltipPosition = 'right',
}: {
  icon: CanvasIconName | ReactNode;
  label: string;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'transparent' | 'light' | 'filled';
  active?: boolean;
  disabled?: boolean;
  /** Show the design-system `Tooltip` on hover / focus instead of the native `title`. */
  tooltip?: boolean;
  tooltipPosition?: TooltipPosition;
}) {
  const button = (
    <button
      type="button"
      className="lc-canvas__icon-btn"
      data-size={size}
      data-variant={variant}
      aria-pressed={active || undefined}
      aria-label={label}
      title={tooltip ? undefined : label}
      onClick={onClick}
      disabled={disabled}
    >
      {typeof icon === 'string' ? <CanvasIcon name={icon as CanvasIconName} /> : icon}
    </button>
  );

  return tooltip ? (
    <Tooltip label={label} position={tooltipPosition}>
      {button}
    </Tooltip>
  ) : (
    button
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

function SegmentRow({
  name,
  count,
  index,
  tone,
}: CanvasBroadcastSegment & { index: number; tone: 'included' | 'excluded' }) {
  return (
    <div className="lc-canvas__segments-row">
      <span className="lc-canvas__segments-number" data-tone={tone}>
        {index}
      </span>
      <span className="lc-canvas__segments-name">{name}</span>
      <span className="lc-canvas__segments-divider" aria-hidden="true" />
      <span className="lc-canvas__segments-count">{count.toLocaleString()}</span>
    </div>
  );
}

/** Included/excluded segment breakdown popover (Figma node 267:51706). */
function BroadcastSegmentsPopover({
  label,
  description,
  included,
  excluded,
  totalUsers,
  optOutNotice,
}: {
  /** Bold line, mirrors the audience card's primary text, e.g. "370,131 users". */
  label: ReactNode;
  /** Dimmed line under the label, e.g. "3 included 1 excluded". */
  description: string;
  included: CanvasBroadcastSegment[];
  excluded: CanvasBroadcastSegment[];
  totalUsers: number;
  optOutNotice?: string;
}) {
  return (
    <div className="lc-canvas__segments">
      <div className="lc-canvas__schedule-popover-header lc-canvas__segments-header">
        <span className="lc-canvas__schedule-popover-label">{label}</span>
        <span className="lc-canvas__schedule-popover-desc">{description}</span>
      </div>
      <div className="lc-canvas__segments-list">
        {included.length > 0 && (
          <div className="lc-canvas__segments-group">
            <span className="lc-canvas__segments-chip lc-canvas__segments-chip--included">
              Included
            </span>
            {included.map((s, i) => (
              <SegmentRow key={`${s.name}-${i}`} {...s} index={i + 1} tone="included" />
            ))}
          </div>
        )}
        {excluded.length > 0 && (
          <div className="lc-canvas__segments-group">
            <span className="lc-canvas__segments-chip lc-canvas__segments-chip--excluded">
              Excluded
            </span>
            {excluded.map((s, i) => (
              <SegmentRow key={`${s.name}-${i}`} {...s} index={i + 1} tone="excluded" />
            ))}
          </div>
        )}
        <div className="lc-canvas__segments-total">
          <span>Total users</span>
          <span>{totalUsers.toLocaleString()}</span>
        </div>
      </div>
      {optOutNotice && (
        <div className="lc-canvas__segments-notice">
          <InfoIcon />
          <p>{optOutNotice}</p>
        </div>
      )}
    </div>
  );
}

/** Schedule detail breakdown popover, mirroring the audience card's segments popover. */
function BroadcastSchedulePopover({
  label,
  description,
  details,
}: {
  label: string;
  description: string;
  details?: CanvasBroadcastScheduleDetail[];
}) {
  return (
    <div className="lc-canvas__segments">
      <div className="lc-canvas__schedule-popover">
        <div className="lc-canvas__schedule-popover-header">
          <span className="lc-canvas__schedule-popover-label">{label}</span>
          <span className="lc-canvas__schedule-popover-desc">{description}</span>
        </div>
        {details && details.length > 0 && (
          <div className="lc-canvas__schedule-popover-rows">
            {details.map((d, i) => (
              <div className="lc-canvas__schedule-popover-row" key={`${d.label}-${i}`}>
                <span>{d.label}</span>
                <span>{d.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** One audience/schedule card within the broadcast meta bar — icon, two text lines, action icons. */
function BroadcastMetaCard({
  icon,
  primary,
  secondary,
  onRefresh,
  onEdit,
  onClick,
  popover,
  readOnly,
}: {
  icon: CanvasIconName;
  primary: ReactNode;
  secondary: string;
  onRefresh?: () => void;
  onEdit?: () => void;
  /** Fired when the card body is clicked — the action icons stop propagation so they don't double-fire this. */
  onClick?: () => void;
  /** Rich content shown in a popover on hover (Figma node 267:51706, "Selected segments"). */
  popover?: ReactNode;
  /** Triggered broadcast — show a single eye ("view") icon instead of edit/refresh. */
  readOnly?: boolean;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const schedule = (open: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPopoverOpen(open), delay);
  };
  const showPopover = () => popover && schedule(true, 200);
  const hidePopover = () => popover && schedule(false, 150);

  return (
    <div
      className={`lc-canvas__meta-card${popover ? ' lc-canvas__meta-card--has-popover' : ''}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onMouseEnter={showPopover}
      onMouseLeave={hidePopover}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span className="lc-canvas__meta-icon">
        <CanvasIcon name={icon} />
      </span>
      <span className="lc-canvas__meta-text">
        <span className="lc-canvas__meta-primary">{primary}</span>
        <span className="lc-canvas__meta-secondary">{secondary}</span>
      </span>
      {!readOnly && (onRefresh || onEdit) && (
        <span className="lc-canvas__meta-actions" onClick={(e) => e.stopPropagation()}>
          {onRefresh && (
            <IconButton icon="refresh" label="Refresh audience" size="xs" onClick={onRefresh} />
          )}
          {onEdit && <IconButton icon="edit" label="Edit" size="xs" onClick={onEdit} />}
        </span>
      )}
      {popover && popoverOpen && (
        <div
          className="lc-canvas__meta-popover"
          onMouseEnter={() => window.clearTimeout(timer.current)}
          onMouseLeave={hidePopover}
        >
          <span className="lc-canvas__meta-popover-arrow" aria-hidden="true" />
          {popover}
        </div>
      )}
    </div>
  );
}

/** Broadcast canvas nav middle slot — audience card, divider, schedule card (Figma node 10863:6513). */
function BroadcastMetaBar({ meta }: { meta: CanvasBroadcastMeta }) {
  const { audience, schedule, readOnly } = meta;
  const hasSegments =
    (audience.includedSegments && audience.includedSegments.length > 0) ||
    (audience.excludedSegments && audience.excludedSegments.length > 0);

  const audiencePrimary = (
    <>
      {audience.count.toLocaleString()} <span className="lc-canvas__meta-unit">users</span>
    </>
  );

  return (
    <div className="lc-canvas__meta">
      <BroadcastMetaCard
        icon="users"
        primary={audiencePrimary}
        secondary={audience.description}
        onRefresh={audience.onRefresh}
        onEdit={audience.onEdit}
        readOnly={readOnly}
        popover={
          hasSegments ? (
            <BroadcastSegmentsPopover
              label={audiencePrimary}
              description={audience.description}
              included={audience.includedSegments ?? []}
              excluded={audience.excludedSegments ?? []}
              totalUsers={audience.totalUsers ?? audience.count}
              optOutNotice={audience.optOutNotice}
            />
          ) : undefined
        }
      />
      <span className="lc-canvas__meta-divider" />
      <BroadcastMetaCard
        icon="schedule"
        primary={schedule.label}
        secondary={schedule.description}
        onEdit={schedule.onEdit}
        onClick={schedule.onEdit}
        readOnly={readOnly}
        popover={
          schedule.details && schedule.details.length > 0 ? (
            <BroadcastSchedulePopover
              label={schedule.label}
              description={schedule.description}
              details={schedule.details}
            />
          ) : undefined
        }
      />
    </div>
  );
}

function CanvasMenu({
  items,
  onSelect,
  footer,
}: {
  items: CanvasMenuItem[];
  onSelect: (item: CanvasMenuItem) => void;
  footer?: ReactNode;
}) {
  return (
    <div className="lc-canvas__menu" role="menu" aria-label="Flow options">
      {items.map((item) => (
        <div key={item.id} className="lc-canvas__menu-row">
          {item.dividerBefore && <span className="lc-canvas__menu-divider" role="separator" />}
          <button
            type="button"
            role="menuitem"
            className="lc-canvas__menu-item"
            onClick={() => onSelect(item)}
          >
            <span className="lc-canvas__menu-item-icon">
              {typeof item.icon === 'string' ? (
                <CanvasIcon name={item.icon as CanvasIconName} />
              ) : (
                item.icon
              )}
            </span>
            {item.label}
          </button>
        </div>
      ))}
      {footer != null && <div className="lc-canvas__menu-footer">{footer}</div>}
    </div>
  );
}

/**
 * Node palette (Figma marketing "Add node") — a searchable popover of node tiles
 * grouped by category, opened from the toolbar "+" button.
 */
function CanvasNodePalette({
  groups,
  onPick,
  searchPlaceholder = 'Search for anything',
}: {
  groups: CanvasNodeGroup[];
  onPick: (id: string) => void;
  searchPlaceholder?: string;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q
    ? groups
        .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
        .filter((g) => g.items.length > 0)
    : groups;

  return (
    <div className="lc-canvas__palette" role="dialog" aria-label="Add node">
      <div className="lc-canvas__palette-search">
        <CanvasIcon name="search" className="lc-canvas__icon" />
        <input
          type="search"
          value={query}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      </div>

      <div className="lc-canvas__palette-body">
        {filtered.length === 0 && <p className="lc-canvas__palette-empty">No matches</p>}
        {filtered.map((group) => (
          <div key={group.title} className="lc-canvas__palette-group">
            <span className="lc-canvas__palette-group-title">{group.title}</span>
            <div className="lc-canvas__palette-grid">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="lc-canvas__palette-tile"
                  draggable
                  onClick={() => onPick(item.id)}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('application/x-canvas-node', item.id);
                    e.dataTransfer.setData('text/plain', item.label);
                  }}
                >
                  <span className="lc-canvas__palette-tile-grip" aria-hidden="true">
                    <CanvasIcon name="grip" />
                  </span>
                  <span className="lc-canvas__palette-tile-icon">
                    {typeof item.icon === 'string' ? (
                      <CanvasIcon name={item.icon as CanvasIconName} />
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span className="lc-canvas__palette-tile-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Canvas search bar (Figma node 125:18398) — a compact underline input that
 * opens beside the "Find on canvas" tool.
 */
function CanvasSearchBar({
  placeholder = 'Search for anything',
  onSearch,
  onOptions,
}: {
  placeholder?: string;
  onSearch: (query: string) => void;
  onOptions?: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="lc-canvas__searchbar" role="search">
      <div className="lc-canvas__searchbar-field">
        <CanvasIcon name="search" className="lc-canvas__icon" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            onSearch(e.currentTarget.value);
          }}
        />
      </div>
      <IconButton
        icon="dots-vertical"
        label="Search options"
        size="sm"
        onClick={onOptions}
      />
    </div>
  );
}

/**
 * Minimap / zoom control (Figma node 62:20517) — compressed pill by default,
 * expands to a 250×180 panel with a scaled preview of the canvas.
 */
function CanvasMinimap({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  onExpandChange,
}: {
  zoom: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onExpandChange?: (expanded: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    setExpanded((e) => {
      onExpandChange?.(!e);
      return !e;
    });
  };

  return (
    <div className="lc-canvas__minimap" data-expanded={expanded || undefined}>
      <div className="lc-canvas__minimap-bar">
        <span className="lc-canvas__minimap-group">
          <IconButton icon="zoom-in" label="Zoom in" onClick={onZoomIn} />
          <span className="lc-canvas__zoom">{Math.round(zoom)}%</span>
          <IconButton icon="zoom-out" label="Zoom out" onClick={onZoomOut} />
        </span>
        <span className="lc-canvas__minimap-group">
          <span className="lc-canvas__pill-divider" />
          <IconButton icon="fit-view" label="Fit to view" onClick={onFitView} />
          <IconButton
            icon={expanded ? 'minimize' : 'expand'}
            label={expanded ? 'Collapse minimap' : 'Expand minimap'}
            onClick={toggle}
          />
        </span>
      </div>

      {expanded && (
        <div className="lc-canvas__minimap-panel" aria-hidden="true">
          {/* scaled placeholder preview — Figma node rects (62:20304–62:20311),
              coordinates translated from the card into this panel */}
          <span className="lc-canvas__minimap-paper" style={{ left: 8, top: 35, width: 226, height: 70 }} />
          <span className="lc-canvas__minimap-node" style={{ left: 29.5, top: 16.7, width: 29, height: 22.7, background: '#FAFAFA' }} />
          <span className="lc-canvas__minimap-node" style={{ left: 29.5, top: 35, width: 29, height: 4.4 }} />
          <span className="lc-canvas__minimap-node" style={{ left: 30, top: 41, width: 29, height: 52 }} />
          <span className="lc-canvas__minimap-node" style={{ left: 63, top: 53, width: 29, height: 46 }} />
          <span className="lc-canvas__minimap-node" style={{ left: 95, top: 41, width: 29, height: 46 }} />
          <span className="lc-canvas__minimap-node" style={{ left: 128, top: 54, width: 29, height: 46 }} />
          <span className="lc-canvas__minimap-node" style={{ left: 160, top: 41, width: 29, height: 46 }} />
        </div>
      )}
    </div>
  );
}

export function CanvasChrome({
  flow,
  onAdd,
  addLabel = 'Add node',
  nodePalette,
  onAddNode,
  nodeSearchPlaceholder,
  tools = [],
  activeToolId,
  onToolSelect,
  onCanvasSearch,
  onCanvasSearchOptions,
  canvasSearchPlaceholder,
  showToolbar = true,
  broadcastMeta,
  saving = false,
  savingLabel = 'Saving...',
  collaborators,
  onCollaborators,
  actions,
  onMore,
  menu,
  lastEditedBy,
  showStatusBar = true,
  zoom = 100,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  onExpand,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
  className,
  style,
}: CanvasChromeProps) {
  const menuWrapRef = useRef<HTMLDivElement>(null);
  const paletteWrapRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useDismiss([
    { open: menuOpen, ref: menuWrapRef, onClose: () => setMenuOpen(false) },
    { open: paletteOpen, ref: paletteWrapRef, onClose: () => setPaletteOpen(false) },
    { open: searchOpen, ref: searchWrapRef, onClose: () => setSearchOpen(false) },
  ]);

  // Single-key tool shortcuts (e.g. V → move, H → pan). Ignored while typing.
  useEffect(() => {
    const shortcuts = new Map(
      tools.filter((t) => t.shortcut).map((t) => [t.shortcut!.toLowerCase(), t.id]),
    );
    if (shortcuts.size === 0 || !onToolSelect) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
      )
        return;
      const id = shortcuts.get(e.key.toLowerCase());
      if (!id) return;
      e.preventDefault();
      onToolSelect(id);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [tools, onToolSelect]);

  return (
    <div className={`lc-canvas${className ? ` ${className}` : ''}`} style={style} aria-hidden={false}>
      {/* --- Canvas navigation ------------------------------------------ */}
      <div className="lc-canvas__nav">
        <div
          className="lc-canvas__flow"
          data-active={flow.active === undefined ? undefined : String(flow.active)}
          data-tone={flow.badgeTone === 'warning' ? 'warning' : undefined}
        >
          {flow.onBack && (
            <IconButton icon="chevron-left" label="Back" size="sm" onClick={flow.onBack} />
          )}
          <span className="lc-canvas__flow-text">
            <span className="lc-canvas__flow-title">{flow.title}</span>
            {flow.subtitle && <span className="lc-canvas__flow-subtitle">{flow.subtitle}</span>}
          </span>
          {flow.onEdit && (
            <IconButton icon="edit" label="Rename flow" size="xs" onClick={flow.onEdit} />
          )}
          {(flow.active !== undefined || flow.badge) && (
            <span
              className="lc-canvas__flow-badge"
              data-tone={flow.badgeTone === 'warning' ? 'warning' : undefined}
            >
              {flow.badge ?? (flow.active ? 'Active' : 'Inactive')}
            </span>
          )}
        </div>

        {broadcastMeta && <BroadcastMetaBar meta={broadcastMeta} />}

        <div className="lc-canvas__nav-right">
          {saving && (
            <span className="lc-canvas__saving" role="status">
              <CanvasIcon name="loader" className="lc-canvas__icon lc-canvas__spinner" />
              {savingLabel}
            </span>
          )}

          {(collaborators?.length || actions || onMore || menu) && (
            <div className="lc-canvas__actions">
              {collaborators && collaborators.length > 0 && (
                <button
                  type="button"
                  className="lc-canvas__collaborators"
                  onClick={onCollaborators}
                  aria-label="Collaborators"
                >
                  <Avatar.Group size="sm" radius="xl" limit={3}>
                    {collaborators.map((c, i) => (
                      <Avatar key={c.src ?? c.name ?? i} src={c.src} alt={c.name ?? ''} variant="filled">
                        {c.src ? undefined : (c.name?.trim().charAt(0) ?? '?')}
                      </Avatar>
                    ))}
                  </Avatar.Group>
                  <CanvasIcon name="chevron-down" className="lc-canvas__icon" />
                </button>
              )}

              {actions}

              {menu && menu.length > 0 ? (
                <div className="lc-canvas__menu-wrap" ref={menuWrapRef}>
                  <IconButton
                    icon="dots-vertical"
                    label="More options"
                    size="lg"
                    active={menuOpen}
                    onClick={() => setMenuOpen((o) => !o)}
                  />
                  {menuOpen && (
                    <CanvasMenu
                      items={menu}
                      onSelect={(item) => {
                        item.onSelect?.();
                        setMenuOpen(false);
                      }}
                      footer={
                        lastEditedBy && (
                          <>
                            <span className="lc-canvas__menu-footer-label">Last edited by</span>
                            <span className="lc-canvas__menu-footer-user">
                              <Avatar
                                src={lastEditedBy.avatarSrc}
                                alt={lastEditedBy.name}
                                size={32}
                                radius="xl"
                              >
                                {lastEditedBy.avatarSrc
                                  ? undefined
                                  : lastEditedBy.name.trim().charAt(0)}
                              </Avatar>
                              <span className="lc-canvas__menu-footer-meta">
                                <span className="lc-canvas__menu-footer-name">
                                  {lastEditedBy.name}
                                </span>
                                <span className="lc-canvas__menu-footer-time">
                                  {lastEditedBy.at}
                                </span>
                              </span>
                            </span>
                          </>
                        )
                      }
                    />
                  )}
                </div>
              ) : (
                onMore && (
                  <IconButton
                    icon="dots-vertical"
                    label="More options"
                    size="lg"
                    onClick={onMore}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Floating toolbar ----------------------------------------- */}
      {showToolbar && (
        <div className="lc-canvas__toolbar">
          <div className="lc-canvas__toolbar-panel" role="toolbar" aria-label="Canvas tools" aria-orientation="vertical">
            {nodePalette && nodePalette.length > 0 ? (
              <div className="lc-canvas__palette-wrap" ref={paletteWrapRef}>
                <IconButton
                  icon="plus"
                  label={addLabel}
                  size="lg"
                  variant="filled"
                  tooltip
                  active={paletteOpen}
                  onClick={() => setPaletteOpen((o) => !o)}
                />
                {paletteOpen && (
                  <CanvasNodePalette
                    groups={nodePalette}
                    searchPlaceholder={nodeSearchPlaceholder}
                    onPick={(id) => {
                      onAddNode?.(id);
                      setPaletteOpen(false);
                    }}
                  />
                )}
              </div>
            ) : (
              onAdd && (
                <IconButton
                  icon="plus"
                  label={addLabel}
                  size="lg"
                  variant="filled"
                  tooltip
                  onClick={onAdd}
                />
              )
            )}
            {tools.length > 0 && (
              <div className="lc-canvas__toolbar-list">
                {tools.map((tool) => {
                  const isSearchTool = tool.id === 'search' && !!onCanvasSearch;
                  const button = (
                    <IconButton
                      icon={tool.icon}
                      label={tool.label}
                      size="lg"
                      variant={
                        (isSearchTool && searchOpen) || tool.id === activeToolId
                          ? 'light'
                          : 'transparent'
                      }
                      active={(isSearchTool && searchOpen) || tool.id === activeToolId}
                      tooltip
                      onClick={() => {
                        if (isSearchTool) setSearchOpen((o) => !o);
                        onToolSelect?.(tool.id);
                      }}
                    />
                  );
                  return (
                    <div key={tool.id} className="lc-canvas__toolbar-item">
                      {isSearchTool ? (
                        <div className="lc-canvas__searchbar-wrap" ref={searchWrapRef}>
                          {button}
                          {searchOpen && (
                            <CanvasSearchBar
                              placeholder={canvasSearchPlaceholder}
                              onSearch={onCanvasSearch}
                              onOptions={onCanvasSearchOptions}
                            />
                          )}
                        </div>
                      ) : (
                        button
                      )}
                      {tool.dividerAfter && <span className="lc-canvas__toolbar-divider" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Status bar --------------------------------------------- */}
      {showStatusBar && (
        <div className="lc-canvas__statusbar">
          <CanvasMinimap
            zoom={zoom}
            onZoomIn={onZoomIn ?? (() => onZoomChange?.(Math.round(zoom) + 10))}
            onZoomOut={onZoomOut ?? (() => onZoomChange?.(Math.max(10, Math.round(zoom) - 10)))}
            onFitView={onFitView ?? (() => onZoomChange?.(100))}
            onExpandChange={onExpand}
          />

          <div className="lc-canvas__pill">
            <IconButton icon="undo" label="Undo" onClick={onUndo} disabled={!canUndo} />
            <span className="lc-canvas__pill-divider" />
            <IconButton icon="redo" label="Redo" onClick={onRedo} disabled={!canRedo} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CanvasChrome;
