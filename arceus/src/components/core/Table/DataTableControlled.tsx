import React, { useEffect, useMemo, useState, useRef } from "react";
import cn from "classnames";
import { useShallowEffect } from "@mantine/hooks";
import type {
  Row,
  SortingState,
  PaginationState,
  VisibilityState,
  RowSelectionState,
  ColumnFiltersState,
  ColumnPinningState,
  Column,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";

import { Box, ScrollArea } from "@mantine/core";
import Loader from "@/components/core/Loader";

import getPinnedStyles, { isLastLeftPinnedColumn } from "@/components/core/Table/helper/config";
import type { DataTableProps, DataTableColumnDef } from "@/components/core/Table/types";
import DataTablePagination from "@/components/core/Table/DataTablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/core/Table/helper/Table";
import styles from "@/components/core/Table/Table.module.sass";

function DataTableControlled<T>({
  columns,
  data,
  selectedRowId = "",
  onRowSelect = () => null,
  loading = false,
  renderToolbar,
  loadingStateComponent = <Loader />,
  zeroStateComponent,
  pageSize = 10,
  withPagination = false,
  cxClass = "",
  cxStyle = {},
  enableRowSelection = true,
  fetchTableData,
  pageCount = 0,
  pageIndex: controlledPageIndex = undefined,
  onPageIndexChange,
  children,
  initialDataFetch = true,
  externalFilters = {},
  virtualization,
}: DataTableProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const virtualizationConfig = useMemo(
    () => ({
      enabled: virtualization?.enabled ?? false,
      estimateRowHeight: virtualization?.estimateRowHeight ?? 33,
      overscan: virtualization?.overscan ?? 5,
      containerHeight: virtualization?.containerHeight ?? "600px",
      measureElement:
        virtualization?.measureElement ??
        (typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1),
    }),
    [virtualization],
  );

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [paginationState, setPaginationState] = useState<PaginationState>(() => ({
    pageIndex: typeof controlledPageIndex === "number" ? controlledPageIndex : 0,
    pageSize,
  }));
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ left: [], right: [] });

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

  useMemo(() => {
    const leftPinnedColumns = columns
      .filter((column) => column.isPinned === "left")
      .map((column) => column.id as string);
    const rightPinnerColumns = columns
      .filter((column) => column.isPinned === "right")
      .map((column) => column.id as string);

    setColumnPinning({ left: leftPinnedColumns, right: rightPinnerColumns });
  }, [columns]);

  const pagination = React.useMemo(
    () => ({
      pageIndex: paginationState.pageIndex,
      pageSize: paginationState.pageSize,
    }),
    [paginationState.pageIndex, paginationState.pageSize],
  );

  const handlePaginationChange = React.useCallback(
    (updater: PaginationState | ((previousState: PaginationState) => PaginationState)) => {
      setPaginationState((prev) => {
        const previousState = {
          pageIndex: prev.pageIndex,
          pageSize: prev.pageSize,
        };

        const nextState = typeof updater === "function" ? updater(previousState) : updater;

        const normalisedState: PaginationState = {
          pageIndex: nextState.pageIndex,

          pageSize: nextState.pageSize,
        };

        if (
          typeof onPageIndexChange === "function" &&
          normalisedState.pageIndex !== previousState.pageIndex
        ) {
          onPageIndexChange(normalisedState.pageIndex);
        }

        return normalisedState;
      });
    },
    [onPageIndexChange],
  );

  const resetToFirstPage = React.useCallback(() => {
    if (!withPagination) return;

    setPaginationState((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [withPagination]);

  const handleGlobalFilterChange = React.useCallback(
    (value: string) => {
      setGlobalFilter(value);
      resetToFirstPage();
    },
    [resetToFirstPage],
  );

  const handleColumnFiltersChange = React.useCallback(
    (updater: ColumnFiltersState | ((previousState: ColumnFiltersState) => ColumnFiltersState)) => {
      setColumnFilters(updater);
      resetToFirstPage();
    },
    [resetToFirstPage],
  );

  const table = useReactTable({
    data,
    columns,
    enableGlobalFilter: true,
    pageCount,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: handleGlobalFilterChange,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: handleColumnFiltersChange,
    manualPagination: withPagination,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    enableRowSelection,
    ...(withPagination ? { onPaginationChange: handlePaginationChange } : {}),
    state: {
      sorting,
      columnPinning,
      columnFilters,
      pagination,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    initialState: {
      columnPinning,
    },
  });

  useEffect(() => {
    setPaginationState((prev) => {
      if (prev.pageSize === pageSize) {
        return prev;
      }
      return {
        ...prev,
        pageSize,
      };
    });
  }, [pageSize]);

  useEffect(() => {
    if (typeof controlledPageIndex !== "number") return;

    setPaginationState((prev) => {
      if (prev.pageIndex === controlledPageIndex) {
        return prev;
      }
      return {
        ...prev,
        pageIndex: controlledPageIndex,
      };
    });
  }, [controlledPageIndex]);

  useEffect(() => {
    if (!pagination.pageSize) return;

    table.setPageSize(pagination.pageSize);
  }, [pagination.pageSize, table]);

  useShallowEffect(() => {
    if (!initialDataFetch) return;

    const offset = pagination.pageIndex * pagination.pageSize;
    const filters = columnFilters.reduce<Record<string, unknown>>((acc, filter) => {
      acc[filter.id] = filter.value;
      return acc;
    }, {});

    const params = {
      query: globalFilter,
      limit: pagination.pageSize,
      offset,
      ...filters,
      ...externalFilters,
    };

    if (fetchTableData) fetchTableData(params);
  }, [pagination, globalFilter, columnFilters, initialDataFetch, externalFilters]);

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

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => virtualizationConfig.estimateRowHeight,
    ...(virtualizationConfig.measureElement
      ? { measureElement: (element: Element) => element.getBoundingClientRect().height }
      : {}),
    overscan: virtualizationConfig.overscan,
    enabled: virtualizationConfig.enabled,
  });

  const getPinnedColumnClassName = (column: Column<T>) =>
    isLastLeftPinnedColumn(column) ? (styles["table-sticky-left-edge"] ?? "") : "";

  // table header
  const renderTableHeader = () => (
    <TableHeader
      {...(virtualizationConfig.enabled
        ? {
            style: {
              display: "grid",
              position: "sticky",
              top: 0,
              zIndex: 1,
            },
          }
        : {})}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          {...(virtualizationConfig.enabled
            ? {
                style: { display: "flex", width: "100%" },
              }
            : {})}
        >
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              className={cn(
                (header.column.columnDef as DataTableColumnDef<T>).className ?? "",
                getPinnedColumnClassName(header.column),
              )}
              style={{
                ...(header.column.columnDef as DataTableColumnDef<T>).style,
                ...getPinnedStyles(header.column, true),
                ...(virtualizationConfig.enabled
                  ? { display: "flex", flex: `${header.column.getSize()} 0 0px` }
                  : {
                      width: `${header.column.getSize()}px`,
                      minWidth: `${header.column.getSize()}px`,
                      maxWidth: `${header.column.getSize()}px`,
                    }),
              }}
            >
              {header.isPlaceholder === true
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );

  const renderVirtualizedTableBody = () => {
    const virtualItems = rowVirtualizer.getVirtualItems();

    return (
      <TableBody
        style={{
          display: "grid",
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
          borderBottom: "1px solid var(--mantine-color-secondary-0)",
        }}
      >
        {!loading && virtualItems.length > 0
          ? virtualItems.map((virtualRow: VirtualItem) => {
              const row = rows[virtualRow.index];
              if (!row) return null;
              return (
                <TableRow
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={(node) => rowVirtualizer.measureElement(node as Element)}
                  data-state={row.getIsSelected() === true && "selected"}
                  className={
                    row.getIsSelected() === true ? cn(styles["table-selected"], "selected") : ""
                  }
                  onClick={() => handleRowClick(row)}
                  style={{
                    display: "flex",
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`,
                    width: "100%",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={getPinnedColumnClassName(cell.column)}
                      style={{
                        display: "flex",
                        border: "none",
                        ...getPinnedStyles(cell.column),
                        flex: `${cell.column.getSize()} 0 0px`,
                      }}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          : null}
      </TableBody>
    );
  };

  // non-virtualized table body
  const renderNonVirtualizedTableBody = () => (
    <TableBody style={{ borderBottom: "1px solid var(--mantine-color-white)" }}>
      {!loading && table.getRowModel().rows.length !== 0
        ? table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() === true && "selected"}
              className={
                row.getIsSelected() === true ? cn(styles["table-selected"], "selected") : ""
              }
              onClick={() => handleRowClick(row)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  className={getPinnedColumnClassName(cell.column)}
                  style={{
                    border: "none",
                    ...getPinnedStyles(cell.column),
                    width: `${cell.column.getSize()}px`,
                    minWidth: `${cell.column.getSize()}px`,
                    maxWidth: `${cell.column.getSize()}px`,
                  }}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        : null}
    </TableBody>
  );

  const renderTableBody = () =>
    virtualizationConfig.enabled ? renderVirtualizedTableBody() : renderNonVirtualizedTableBody();

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
    loading && <Box className={cn(styles["table-zero-wrapper"])}>{loadingStateComponent}</Box>;

  const renderTableContent = () => (
    <Table {...(virtualizationConfig.enabled ? { style: { display: "grid" } } : {})}>
      {renderTableHeader()}
      {renderTableBody()}
    </Table>
  );

  const renderTable = () => (
    <>
      {renderTableContent()}
      {renderZeroState()}
      {renderLoadingState()}
    </>
  );

  const renderScrollableTable = () => {
    if (virtualizationConfig.enabled) {
      return (
        <>
          <ScrollArea
            viewportRef={tableContainerRef}
            className={cn(styles["table-scroll-area"])}
            type="hover"
            offsetScrollbars
            scrollbarSize={4}
            style={{
              position: "relative",
              height: virtualizationConfig.containerHeight,
            }}
          >
            <Box w="100%">{renderTableContent()}</Box>
          </ScrollArea>
          {renderZeroState()}
          {renderLoadingState()}
        </>
      );
    }

    return (
      <ScrollArea
        className={cn(styles["table-scroll-area"])}
        type="hover"
        offsetScrollbars
        scrollbarSize={4}
      >
        <Box w="100%">{renderTable()}</Box>
      </ScrollArea>
    );
  };

  const renderPagination = () =>
    withPagination && <DataTablePagination table={table} loading={Boolean(loading)} />;

  const defaultRenderContent = () => (
    <>
      <Box
        style={cxStyle}
        className={cn(
          styles["table-inner-wrapper"],
          styles["table-inner-wrapper-scrollArea"],
          "lime-table-innerWrapper",
          cxClass,
        )}
      >
        {renderScrollableTable()}
      </Box>
      {renderPagination()}
    </>
  );

  return (
    <Box className={cn(styles["table-wrapper"], "lime-table-wrapper")}>
      {renderToolbar &&
        renderToolbar({
          table,
          onSearch: (value) => {
            setGlobalFilter(value);
            // Reset pagination to first page, if enabled and when searching
            if (withPagination) {
              setPaginationState((prev) => {
                if (prev.pageIndex === 0) {
                  return prev;
                }
                return {
                  ...prev,
                  pageIndex: 0,
                };
              });
              if (typeof onPageIndexChange === "function") {
                onPageIndexChange(0);
              }
            }
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

export default DataTableControlled;
