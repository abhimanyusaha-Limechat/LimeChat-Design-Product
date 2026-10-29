/**
 * WebhooksTable — Settings → Integration → Webhook: the endpoints ticket events
 * are sent to, each with its delivery status and a ⋯ menu with Edit / Delete, as in InboxesTable. Same
 * table anatomy as EventsTable and reuses its "lc-ev" styles.
 *
 *   <WebhooksTable webhooks={rows} onEdit={(row) => …} onDelete={(row) => …} />
 */
import { Icon } from '../icons';
import { ActionMenu } from '../Menu';
import { RowActions } from '../RowActions';
import {
  DataTable,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableSkeleton,
  DataTableSortHeader,
  Skeleton,
  useTableSort,
} from '../DataTable';
import '../EventsTable/EventsTable.css';
import './WebhooksTable.css';

/** `active` — the last delivery succeeded. `failing` — the endpoint rejected it or didn't respond. */
export type WebhookStatus = 'active' | 'failing';

export interface WebhookRowData {
  id: string;
  url: string;
  status: WebhookStatus;
}

export interface WebhooksTableProps {
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  webhooks: WebhookRowData[];
  onEdit?: (row: WebhookRowData) => void;
  onDelete?: (row: WebhookRowData) => void;
  /** Shows Edit and Delete icon buttons in each row instead of the ⋯ menu. */
  iconActions?: boolean;
}

const STATUS_LABEL: Record<WebhookStatus, string> = {
  active: 'Delivering',
  failing: 'Failing — the last delivery didn’t go through',
};

export function WebhooksTable({ webhooks, onEdit, onDelete, iconActions = false, loading = false }: WebhooksTableProps) {
  const { sorted, sort, toggle } = useTableSort(webhooks, (row, key: 'url' | 'status') =>
    key === 'status' ? Number(row.status === 'active') : row.url,
  );

  return (
    <div className="lc-ev">
      <DataTable aria-busy={loading || undefined} aria-label="Webhook endpoints">
        <DataTableHead>
          <DataTableSortHeader className="lc-ev__cell lc-ev__cell--name" label="Webhook endpoint" sortKey="url" sort={sort} onSort={toggle} />
          <DataTableSortHeader className="lc-ev__cell lc-wh__cell--status" label="Status" sortKey="status" sort={sort} onSort={toggle} />
          <div role="columnheader" className="lc-ev__cell lc-ev__cell--actions" aria-label="Actions" />
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            <div className="lc-ev__cell lc-ev__cell--name">
              <Skeleton />
            </div>
            <div className="lc-ev__cell lc-wh__cell--status">
              <Skeleton />
            </div>
            <div className="lc-ev__cell lc-ev__cell--actions" />
          </DataTableSkeleton>
        ) : webhooks.length === 0 ? (
          <DataTableEmpty>No webhooks added yet</DataTableEmpty>
        ) : (
          sorted.map((row) => (
            <DataTableRow key={row.id}>
              <div role="cell" className="lc-ev__cell lc-ev__cell--name lc-ev__name">{row.url}</div>
              <div role="cell" className="lc-ev__cell lc-wh__cell--status">
                <span className="lc-wh__status" data-status={row.status} role="img" aria-label={STATUS_LABEL[row.status]} title={STATUS_LABEL[row.status]}>
                  <Icon name={row.status === 'active' ? 'circle-check' : 'alert-triangle'} width={20} height={20} />
                </span>
              </div>
              <div role="cell" className="lc-ev__cell lc-ev__cell--actions">
                {iconActions ? (
                  <RowActions name={row.url} onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row)} />
                ) : (
                  <ActionMenu
                    ariaLabel={`Actions for ${row.url}`}
                    icon={<Icon name="dots-vertical" />}
                    items={[
                      { label: 'Edit', onClick: () => onEdit?.(row) },
                      { label: 'Delete', danger: true, onClick: () => onDelete?.(row) },
                    ]}
                  />
                )}
              </div>
            </DataTableRow>
          ))
        )}
      </DataTable>
    </div>
  );
}

export default WebhooksTable;
