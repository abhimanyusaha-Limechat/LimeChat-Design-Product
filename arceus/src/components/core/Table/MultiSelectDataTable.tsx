import React, { useEffect, useState, useMemo } from "react";
import cn from "classnames";
import type { Row, Table, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import { Box } from "@mantine/core";
import Checkbox from "@/components/core/inputs/Checkbox";

import {
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  Table as TableWrapper,
} from "@/components/core/Table/helper/Table";
import DataTablePagination from "@/components/core/Table/DataTablePagination";
import type { MultiSelectDataTableProps } from "@/components/core/Table/types";
import styles from "@/components/core/Table/Table.module.sass";

function HeaderCheckbox<T>({ table }: { table: Table<T> }) {
  return (
    <Checkbox
      checked={table.getIsAllRowsSelected()}
      onChange={(e) => table.toggleAllRowsSelected(e.target.checked)}
    />
  );
}

function RowCheckbox<T>({ row }: { row: Row<T> }) {
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // stop from going to the parent
    row.toggleSelected(e.target.checked);
  };

  return <Checkbox checked={row.getIsSelected()} onChange={handleToggle} />;
}

function MultiSelectDataTable<T>({
  data,
  columns,
  cxClass = "",
  cxStyle = {},
  loading = false,
  children,
  pageSize = 10,
  onRowSelect,
  selectedIds, // Selected row IDs (array)
  renderToolbar,
  withPagination = false,
  zeroStateComponent,
  loadingStateComponent,
}: MultiSelectDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [rowSelection, setRowSelection] = useState(
    selectedIds.reduce(
      (acc, id) => {
        acc[id] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const columnVisibilityMap = useMemo(
    () =>
      columns.reduce(
        (visibilityMap, { accessorKey, isVisible }) => {
          visibilityMap[accessorKey] = isVisible as boolean;
          return visibilityMap;
        },
        {} as Record<string, boolean>,
      ),
    [columns],
  );

  const [columnVisibility, setColumnVisibility] = useState(columnVisibilityMap);

  // Add a checkbox column to the beginning of the columns
  const columnsWithCheckbox = useMemo(
    () => [
      {
        accessorKey: "checkbox",
        header: ({ table }) => <HeaderCheckbox table={table} />,
        cell: ({ row }) => <RowCheckbox row={row} />,
      },
      ...columns,
    ],
    [columns],
  );

  const table = useReactTable({
    data,
    enableRowSelection: true, // enable row selection
    onSortingChange: setSorting,
    columns: columnsWithCheckbox,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    ...(withPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
  });

  // set page size when it changes
  useEffect(() => {
    if (!pageSize) return;

    table.setPageSize(pageSize);
  }, [pageSize, table]);

  useEffect(() => {
    const selectedRowIds = Object.keys(rowSelection).filter(
      (id): boolean => rowSelection[id] ?? false,
    );
    onRowSelect?.(selectedRowIds);
  }, [onRowSelect, rowSelection]);

  const renderTableHeader = () => (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder === true
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );

  const renderTableBody = () => (
    <TableBody>
      {table.getRowModel().rows.length !== 0
        ? table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() === true && "selected"}
              className={
                row.getIsSelected() === true ? cn(styles["table-selected"], "selected") : ""
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        : null}
    </TableBody>
  );

  const renderZeroState = () =>
    !loading &&
    table.getRowModel().rows.length === 0 && (
      <Box className={cn(styles["table-zero-wrapper"])}>
        {zeroStateComponent || <span className="text-dark body-2">No results.</span>}
      </Box>
    );

  const renderLoadingState = () =>
    loading && <Box className={cn(styles["table-zero-wrapper"])}>{loadingStateComponent}</Box>;

  const renderTable = () => (
    <>
      <TableWrapper>
        {renderTableHeader()}
        {renderTableBody()}
      </TableWrapper>
      {renderZeroState()}
      {renderLoadingState()}
    </>
  );

  const renderPagination = () =>
    !loading && withPagination ? (
      <DataTablePagination table={table} loading={Boolean(loading)} />
    ) : null;

  const defaultRenderContent = () => (
    <>
      <Box
        style={cxStyle}
        className={cn(styles["table-inner-wrapper"], "lime-table-innerWrapper", cxClass)}
      >
        {renderTable()}
      </Box>
      {renderPagination()}
    </>
  );

  return (
    <Box className={cn(styles["table-wrapper"], "lime-table-wrapper")}>
      {renderToolbar &&
        renderToolbar({
          table,
          onSearch: (value) => setGlobalFilter(value),
        })}
      {typeof children === "function"
        ? children({
            table,
            loading,
            renderTable,
            renderPagination,
          })
        : defaultRenderContent()}
    </Box>
  );
}

export default MultiSelectDataTable;
