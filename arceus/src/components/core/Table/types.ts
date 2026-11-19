import type { Column, ColumnDef, Row, Table } from "@tanstack/react-table";
import type React from "react";

export type DataTableHeaderProps<T> = {
  column: Column<T>;
  title?: string;
  className?: string;
};

export type DataTableColumnDef<T> = ColumnDef<T> & {
  className?: string;
  style?: React.CSSProperties;
  isPinned?: "left" | "right";
  isVisible?: boolean;
  accessorKey: string;
};

type RenderToolbar<T> = ({
  table,
  onSearch,
}: {
  table: Table<T>;
  onSearch: (value: string) => void;
}) => React.ReactElement;

export interface VirtualizationConfig {
  enabled: boolean;
  estimateRowHeight?: number;
  overscan?: number;
  containerHeight?: string;
  measureElement?: boolean;
}

export type DataTableVariant = "default" | "card" | "list";

export interface DataTableProps<T> {
  variant?: DataTableVariant;
  columns: Array<DataTableColumnDef<T>>;
  data: Array<T>;
  zeroStateComponent?: React.ReactElement;
  loadingStateComponent?: React.ReactElement;
  onRowSelect?: (row: Row<T> | string[]) => void;
  children?:
    | React.ReactNode
    | (({
        table,
        loading,
        renderTable,
        renderPagination,
      }: {
        table: Table<T>;
        loading: boolean;
        renderTable: () => React.JSX.Element;
        renderPagination: () => React.JSX.Element | boolean | null;
      }) => React.JSX.Element);
  pageSize?: number;
  loading?: boolean;
  enableRowSelection?: boolean;
  withPagination?: boolean;
  selectedRowId?: string | number;
  className?: string;
  cxClass?: string;
  cxStyle?: React.CSSProperties;
  fetchTableData?: (params: {
    query: string;
    limit: number;
    offset: number;
    [key: string]: unknown;
  }) => void | Promise<void>;
  pageIndex?: number;
  onPageIndexChange?: (pageIndex: number) => void;
  renderToolbar?: RenderToolbar<T>;
  pageCount?: number;
  initialDataFetch?: boolean;
  externalFilters?: { [key: string]: unknown };
  virtualization?: VirtualizationConfig;
}

export type MultiSelectDataTableProps<T> = DataTableProps<T> & {
  selectedIds: Array<string | number>;
};

export type DataTablePaginationProps<T> = {
  table: Table<T>;
  loading: boolean;
};

export type { Table, Row };
