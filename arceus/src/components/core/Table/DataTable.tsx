import { useEffect, useMemo, useState } from "react";
import cn from "classnames";
import type { SortingState, VisibilityState, RowSelectionState, Row } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Box, ScrollArea } from "@mantine/core";
import Loader from "@/components/core/Loader";

import DataTablePagination from "@/components/core/Table/DataTablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/core/Table/helper/Table";
import type { DataTableProps } from "@/components/core/Table/types";
import styles from "@/components/core/Table/Table.module.sass";

function DataTable<T>({
  data,
  columns,
  cxClass = "",
  loading = false,
  className = "",
  cxStyle = {},
  children,
  onRowSelect = () => null,
  pageSize = 10,
  renderToolbar,
  selectedRowId = "",
  withPagination = false,
  zeroStateComponent,
  enableRowSelection = true,
  loadingStateComponent = <Loader />,
  variant = "default",
}: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(columnVisibilityMap);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: Boolean(enableRowSelection),
    ...(withPagination === true ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
  });

  useEffect(() => {
    if (!pageSize) return;

    table.setPageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    if (selectedRowId === "") return;

    const rowToSelect = table.getRow(selectedRowId.toString());

    if (Boolean(rowToSelect) === true) {
      // Deselect all other rows
      table.getRowModel().rows.forEach((r) => {
        if (r.id !== rowToSelect.id) r.toggleSelected(false);
      });

      // Select the passed row
      rowToSelect.toggleSelected();
    }
  }, []);

  const handleRowClick = (row: Row<T>) => {
    // Deselect all other rows
    table.getRowModel().rows.forEach((r) => {
      if (r.id !== row.id) r.toggleSelected(false);
    });

    // Toggle the clicked row's selection state
    row.toggleSelected();
    onRowSelect(row);
  };

  // table header
  const renderTableHeader = () => (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const columnDef = columns.find((col) => col.accessorKey === header.column.id);
            return (
              <TableHead
                key={header.id}
                style={columnDef?.style ?? {}}
                className={styles[columnDef?.className ?? ""] ?? ""}
              >
                {header.isPlaceholder === true
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );

  // table body
  const renderTableBody = () => (
    <TableBody>
      {table.getRowModel().rows.length !== 0
        ? table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => handleRowClick(row)}
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

  // zero state
  const renderZeroState = () =>
    !loading &&
    table.getRowModel().rows.length === 0 && (
      <Box className={cn(styles["table-zero-wrapper"])}>
        {zeroStateComponent || <span className="text-dark body-2">No results.</span>}
      </Box>
    );

  // loading state
  const renderLoadingState = () =>
    loading && (
      <Box
        className={cn(
          styles["table-zero-wrapper"],
          variant !== "default" && styles["table-loading-wrapper"],
        )}
      >
        {loadingStateComponent}
      </Box>
    );

  const renderTable = () => (
    <>
      <Table>
        {variant === "list" && !loading && table.getRowModel().rows.length === 0
          ? null
          : renderTableHeader()}
        {renderTableBody()}
      </Table>
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
        className={cn(
          styles["table-inner-wrapper"],
          styles["table-inner-wrapper-scrollArea"],
          "lime-table-innerWrapper",
          cxClass,
          className,
        )}
      >
        <ScrollArea
          className={cn(styles["table-scroll-area"])}
          type="hover"
          offsetScrollbars
          scrollbarSize={4}
        >
          <Box w="100%">{renderTable()}</Box>
        </ScrollArea>
      </Box>
      {renderPagination()}
    </>
  );

  /**
   * Renders the DataTable component.
   * The `children` prop is used in a render prop pattern.
   * If it is a function, it is invoked with an object containing the `table` instance,
   * the `loading` state, and functions `renderTable` and `renderPagination` for custom rendering.
   * This approach allows for highly customizable rendering based on the table's internal state and methods.
   *
   * If `children` is not a function, the `defaultRenderContent`
   * function is called to render the default table content,
   * which includes the table body, zero state, and loading state management,
   * along with optional pagination.
   */

  return (
    <Box
      className={cn(
        styles["table-wrapper"],
        "lime-table-wrapper",
        variant === "card" && styles["table-card"],
        variant === "list" && styles["table-list"],
      )}
    >
      {/* TODO: check the onSearch type to verify the changes */}
      {renderToolbar &&
        renderToolbar({
          table,
          onSearch: (value) => {
            setGlobalFilter(value);
            // Reset pagination to first page, if enabled and when searching
            if (withPagination) table.setPagination({ pageIndex: 0, pageSize });
          },
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

export default DataTable;
