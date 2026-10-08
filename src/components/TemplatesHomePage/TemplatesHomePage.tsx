/**
 * TemplatesHomePage — Campaigns → Templates landing view: search + inbox/type/
 * category filters, refresh, Download report / Create template actions, a
 * single "Whatsapp" tab, and a table of message templates with status,
 * category and fallback metadata.
 *
 *   <TemplatesHomePage
 *     templates={rows}
 *     onCreateTemplate={() => setOpen(true)}
 *   />
 */
import { useState, type ReactNode } from 'react';
import { Button } from '../Button';
import { NativeSelect } from '../Select';
import { Tooltip } from '../Tooltip';
import { ActionMenu } from '../Menu';
import { TemplateIcon } from './icons';
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
import './TemplatesHomePage.css';

export type TemplateStatus = 'in-review' | 'active' | 'rejected' | 'paused';
export type TemplateType = 'text' | 'image';
export type TemplateChannel = 'whatsapp' | 'sms' | 'email';

export interface TemplateRowData {
  id: string;
  displayId: string;
  name: string;
  status: TemplateStatus;
  /** Language code shown under the status, e.g. "EN US", "EN". */
  language: string;
  type: TemplateType;
  /** Truncated body preview shown under the name. */
  preview: string;
  category: string;
  /** Linked inbox/business account, shown under the category. */
  businessTag?: string;
  /** "N/A" when there is no fallback configured. */
  fallbackTemplate?: string;
}

const STATUS_LABEL: Record<TemplateStatus, string> = {
  'in-review': 'In-Review',
  active: 'Active',
  rejected: 'Rejected',
  paused: 'Paused',
};

const CHANNELS: { id: TemplateChannel; label: string }[] = [
  { id: 'whatsapp', label: 'Whatsapp' },
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'Email' },
];

/** SMS only recognizes two categories — collapse Whatsapp's finer-grained ones down to these. */
function smsCategory(category: string) {
  return category === 'Marketing' ? 'Marketing' : 'Promotional';
}

function TypeBadge({ type }: { type: TemplateType }) {
  return (
    <span className="lc-th__type-badge" data-type={type} aria-hidden="true">
      {type === 'text' ? 'T' : <TemplateIcon name="photo" />}
    </span>
  );
}

function IdChip({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Tooltip label={copied ? 'Copied!' : `Copy ID ${id}`}>
      <button
        type="button"
        className="lc-th__id-chip"
        data-copied={copied || undefined}
        aria-label={`Copy ID ${id}`}
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard?.writeText(id);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {id}
      </button>
    </Tooltip>
  );
}

function CreateTemplateButton({ onCreate }: { onCreate?: () => void }) {
  return (
    <Button
      variant="filled"
      color="primary"
      size="sm"
      leftSection={<TemplateIcon name="plus" />}
      onClick={onCreate}
    >
      Template
    </Button>
  );
}

function RowActions({
  row,
  onEdit,
  onClone,
  onDelete,
}: {
  row: TemplateRowData;
  onEdit?: (row: TemplateRowData) => void;
  onClone?: (row: TemplateRowData) => void;
  onDelete?: (row: TemplateRowData) => void;
}) {
  return (
    <ActionMenu
      ariaLabel="Template actions"
      icon={<TemplateIcon name="dots-vertical" />}
      items={[
        { label: 'Edit template', icon: <TemplateIcon name="edit" />, onClick: () => onEdit?.(row) },
        { label: 'Clone', icon: <TemplateIcon name="copy" />, onClick: () => onClone?.(row) },
        { label: 'Delete', icon: <TemplateIcon name="trash" />, danger: true, onClick: () => onDelete?.(row) },
      ]}
    />
  );
}

export interface TemplatesHomePageProps {
  /** Shows skeleton rows in place of the list while its data loads. */
  loading?: boolean;
  templates: TemplateRowData[];
  activeChannel?: TemplateChannel;
  onChannelChange?: (channel: TemplateChannel) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  inboxFilter?: string;
  onInboxFilterChange?: (value: string) => void;
  typeFilter?: string;
  onTypeFilterChange?: (value: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (value: string) => void;
  onRefresh?: () => void;
  onDownloadReport?: () => void;
  onCreateTemplate?: () => void;
  onRowEdit?: (row: TemplateRowData) => void;
  onRowClone?: (row: TemplateRowData) => void;
  onRowDelete?: (row: TemplateRowData) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function TemplatesHomePage({
  templates,
  activeChannel = 'whatsapp',
  onChannelChange,
  searchValue,
  onSearchChange,
  inboxFilter = 'all',
  onInboxFilterChange,
  typeFilter = 'all',
  onTypeFilterChange,
  categoryFilter = 'all',
  onCategoryFilterChange,
  onRefresh,
  onDownloadReport,
  onCreateTemplate,
  onRowEdit,
  onRowClone,
  onRowDelete,
  page = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
}: TemplatesHomePageProps) {
  const { sorted: sortedTemplates, sort, toggle: toggleSort } = useTableSort(
    templates,
    (row, key: 'name' | 'status' | 'category' | 'fallbackTemplate') =>
    key === 'status'
      ? STATUS_LABEL[row.status]
      : key === 'category' && activeChannel === 'sms'
        ? smsCategory(row.category)
        : row[key],
  );

  const pageNumbers = new Set<number>(
    [1, 2, 3, 4, 5, totalPages].filter((n) => n <= totalPages),
  );

  return (
    <div className="lc-th">
      <div className="lc-th__toolbar" data-anchor="template-toolbar">
        <div className="lc-th__search">
          <TemplateIcon name="search" className="lc-th__search-icon" />
          <input
            className="lc-th__search-input"
            type="text"
            placeholder="Search templates"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          />
        </div>

        <div className="lc-th__filters">
          <NativeSelect
            size="sm"
            wrapperClassName="lc-th__filter"
            value={inboxFilter}
            onChange={(e) => onInboxFilterChange?.(e.currentTarget.value)}
            data={[
              { value: 'all', label: 'All Inboxes' },
              { value: 'main', label: 'Main' },
              { value: 'clinikally-helpdesk', label: 'Clinikally Helpdesk' },
            ]}
          />
          {activeChannel === 'whatsapp' && (
            <NativeSelect
              size="sm"
              wrapperClassName="lc-th__filter"
              value={typeFilter}
              onChange={(e) => onTypeFilterChange?.(e.currentTarget.value)}
              data={[
                { value: 'all', label: 'All Types' },
                { value: 'text', label: 'Text' },
                { value: 'image', label: 'Image' },
                { value: 'video', label: 'Video' },
                { value: 'document', label: 'Document' },
                { value: 'carousel', label: 'Carousel' },
              ]}
            />
          )}
          {activeChannel !== 'email' && (
            <NativeSelect
              size="sm"
              wrapperClassName="lc-th__filter"
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange?.(e.currentTarget.value)}
              data={[
                { value: 'all', label: 'All Categories' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'utility', label: 'Utility' },
                { value: 'authentication', label: 'Authentication' },
              ]}
            />
          )}
          <Button
            variant="default"
            color="gray"
            size="sm"
            leftSection={<TemplateIcon name="refresh" />}
            onClick={onRefresh}
          >
            Sync
          </Button>
        </div>

        <div className="lc-th__actions">
          <Button
            variant="default"
            color="gray"
            size="sm"
            leftSection={<TemplateIcon name="download" />}
            onClick={onDownloadReport}
          >
            Report
          </Button>
          <CreateTemplateButton onCreate={onCreateTemplate} />
        </div>
      </div>

      <div className="lc-th__nav-row" data-anchor="template-tab-bar">
        <div className="lc-th__tabs" role="tablist">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              type="button"
              role="tab"
              className="lc-th__tab"
              data-active={channel.id === activeChannel || undefined}
              aria-selected={channel.id === activeChannel}
              onClick={() => onChannelChange?.(channel.id)}
            >
              {channel.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable aria-busy={loading || undefined} aria-label="Templates" data-anchor="template-table">
        <DataTableHead className="lc-th__row">
          <DataTableSortHeader className="lc-th__cell--name lc-th__cell" label="Name" sortKey="name" sort={sort} onSort={toggleSort} />
          {activeChannel !== 'email' && (
            <DataTableSortHeader className="lc-th__cell--status lc-th__cell" label="Status" sortKey="status" sort={sort} onSort={toggleSort} />
          )}
          <DataTableSortHeader className="lc-th__cell--category lc-th__cell" label="Category" sortKey="category" sort={sort} onSort={toggleSort} />
          {activeChannel === 'whatsapp' && (
            <DataTableSortHeader className="lc-th__cell--fallback lc-th__cell" label="Fallback Template" sortKey="fallbackTemplate" sort={sort} onSort={toggleSort} />
          )}
          <div role="columnheader" className="lc-th__cell--actions lc-th__cell" aria-label="Actions" />
        </DataTableHead>

        {loading ? (
          <DataTableSkeleton>
            <div className="lc-th__cell--name lc-th__cell">
              <Skeleton lines={2} />
            </div>
            {activeChannel !== 'email' && (
              <div className="lc-th__cell--status lc-th__cell">
                <Skeleton lines={2} />
              </div>
            )}
            <div className="lc-th__cell--category lc-th__cell">
              <Skeleton />
            </div>
            {activeChannel === 'whatsapp' && (
              <div className="lc-th__cell--fallback lc-th__cell">
                <Skeleton />
              </div>
            )}
            <div className="lc-th__cell--actions lc-th__cell" />
          </DataTableSkeleton>
        ) : sortedTemplates.length === 0 ? (
          <DataTableEmpty>No templates found</DataTableEmpty>
        ) : (
          sortedTemplates.map((row) => (
            <DataTableRow
              key={row.id}
              className="lc-th__row lc-th__row--body"
              data-anchor="template-row"
              data-anchor-key={row.id}
              data-status={activeChannel === 'email' ? undefined : row.status}
            >
              <div role="cell" className="lc-th__cell--name lc-th__cell">
                {activeChannel === 'whatsapp' && <TypeBadge type={row.type} />}
                <div className="lc-th__name-block">
                  <span className="lc-th__name-line">
                    <IdChip id={row.displayId} />
                    <span className="lc-th__name">{row.name}</span>
                  </span>
                  <span className="lc-th__preview">{row.preview}</span>
                </div>
              </div>
              {activeChannel !== 'email' && (
                <div role="cell" className="lc-th__cell--status lc-th__cell">
                  <span className="lc-th__status" data-status={row.status}>
                    {STATUS_LABEL[row.status]}
                  </span>
                  <span className="lc-th__meta-line">{row.language}</span>
                </div>
              )}
              <div role="cell" className="lc-th__cell--category lc-th__cell">
                <span className="lc-th__category">
                  {activeChannel === 'sms' ? smsCategory(row.category) : row.category}
                </span>
                {row.businessTag && <span className="lc-th__business-tag">{row.businessTag}</span>}
              </div>
              {activeChannel === 'whatsapp' && (
                <div role="cell" className="lc-th__cell--fallback lc-th__cell">
                  <span className="lc-th__fallback">{row.fallbackTemplate ?? 'N/A'}</span>
                </div>
              )}
              <div role="cell" className="lc-th__cell--actions lc-th__cell">
                <RowActions row={row} onEdit={onRowEdit} onClone={onRowClone} onDelete={onRowDelete} />
              </div>
            </DataTableRow>
          ))
        )}
      </DataTable>

      {totalPages > 1 && (
        <div className="lc-th__pagination" data-anchor="template-pagination">
          {Array.from(pageNumbers)
            .sort((a, b) => a - b)
            .flatMap((n, i, arr) => {
              const nodes: ReactNode[] = [];
              const prev = arr[i - 1];
              if (prev != null && n - prev > 1) {
                nodes.push(
                  <span key={`ellipsis-${n}`} className="lc-th__page-item" data-ellipsis="true">
                    <TemplateIcon name="dots" style={{ width: 14, height: 14 }} />
                  </span>,
                );
              }
              nodes.push(
                <button
                  key={n}
                  type="button"
                  className="lc-th__page-item"
                  data-active={n === page || undefined}
                  onClick={() => onPageChange?.(n)}
                >
                  {n}
                </button>,
              );
              return nodes;
            })}
        </div>
      )}
    </div>
  );
}

export default TemplatesHomePage;
