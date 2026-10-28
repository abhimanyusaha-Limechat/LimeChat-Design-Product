/**
 * WidgetCards — Settings → Widget: one card per WhatsApp widget (channel logo, status,
 * inbox name) plus a dashed "Create a Widget" card. Clicking a card selects it (the page
 * opens its details panel); edit / delete appear on hover or keyboard focus.
 *
 *   <WidgetCards
 *     widgets={whatsappInboxes}
 *     selectedId={id}
 *     onSelect={(row) => select(row.id)}
 *     onEdit={(row) => openInbox(row.id)}
 *     onDelete={(row) => remove(row)}
 *     onCreate={() => startCreate()}
 *   />
 */
import { Icon } from '../icons';
import { Skeleton } from '../DataTable';
import type { InboxRowData } from '../InboxesTable';
import inboxGlyph from '../../assets/widget-cards/inbox.svg';
import plusGlyph from '../../assets/widget-cards/plus.svg';
import './WidgetCards.css';

/** Each kind shows its own stroke icon: the WhatsApp logo, or a globe for the website chat widget. */
export type WidgetKind = 'whatsapp' | 'web';

const KIND_LABEL: Record<WidgetKind, string> = { whatsapp: 'WhatsApp Bot', web: 'Web Widget' };

export type WidgetStatus = 'active' | 'inactive' | 'disabled' | 'error';

const STATUS_LABEL: Record<WidgetStatus, string> = { active: 'Active', inactive: 'Inactive', disabled: 'Disabled', error: 'Error' };

export interface WidgetCardsProps {
  /** Shows placeholder cards while the list loads. */
  loading?: boolean;
  widgets: InboxRowData[];
  /** Status per widget id; a widget missing here is Active. Disabled cards can't be selected. */
  statusById?: Record<string, WidgetStatus>;
  /** Kind per widget id; a widget missing here is WhatsApp. */
  kindById?: Record<string, WidgetKind>;
  selectedId?: string;
  onSelect?: (row: InboxRowData) => void;
  onEdit?: (row: InboxRowData) => void;
  onDelete?: (row: InboxRowData) => void;
  onCreate?: () => void;
}

const SKELETON_COUNT = 3;

export function WidgetCards({ loading = false, widgets, statusById, kindById, selectedId, onSelect, onEdit, onDelete, onCreate }: WidgetCardsProps) {
  return (
    <ul className="lc-wc" aria-label="Widgets" aria-busy={loading || undefined} data-anchor="widget-cards">
      {!loading && (
        <li className="lc-wc__card lc-wc__card--create">
          <button type="button" className="lc-wc__main" onClick={onCreate}>
            <span className="lc-wc__avatar lc-wc__avatar--create" aria-hidden="true">
              <img className="lc-wc__plus" src={plusGlyph} alt="" />
            </span>
            <span className="lc-wc__create-label">Create a Widget</span>
          </button>
        </li>
      )}
      {loading
        ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <li key={i} className="lc-wc__card lc-wc__card--skeleton">
              <Skeleton lines={2} />
            </li>
          ))
        : widgets.map((row) => {
          const status = statusById?.[row.id] ?? 'active';
          const kind = kindById?.[row.id] ?? 'whatsapp';
          return (
            <li
              key={row.id}
              className="lc-wc__card"
              data-status={status}
              data-anchor="widget-card"
              data-anchor-key={row.id}
              data-selected={row.id === selectedId || undefined}
            >
              <button
                type="button"
                className="lc-wc__main"
                disabled={status === 'disabled'}
                aria-pressed={onSelect ? row.id === selectedId : undefined}
                onClick={onSelect ? () => onSelect(row) : undefined}
              >
                <span className="lc-wc__avatar" aria-hidden="true">
                  <span className="lc-wc__logo">
                    <Icon name={kind === 'web' ? 'world' : 'whatsapp'} size={28} />
                  </span>
                </span>
                <span className="lc-wc__info">
                  <span className="lc-wc__kind">{KIND_LABEL[kind]}</span>
                  <span className="lc-wc__name-line">
                    <img className="lc-wc__inbox-icon" src={inboxGlyph} alt="" />
                    <span className="lc-wc__name">{row.name}</span>
                  </span>
                </span>
              </button>
              <span className="lc-wc__status">
                <span className="lc-wc__status-dot" aria-hidden="true" />
                {STATUS_LABEL[status]}
              </span>
              <div className="lc-wc__actions">
                <button type="button" className="lc-wc__action" aria-label={`Edit ${row.name}`} onClick={() => onEdit?.(row)}>
                  <Icon name="edit" size={20} />
                </button>
                <button
                  type="button"
                  className="lc-wc__action"
                  aria-label={`Delete ${row.name}`}
                  onClick={() => onDelete?.(row)}
                >
                  <Icon name="trash" size={20} />
                </button>
              </div>
            </li>
          );
        })}
    </ul>
  );
}

export default WidgetCards;
