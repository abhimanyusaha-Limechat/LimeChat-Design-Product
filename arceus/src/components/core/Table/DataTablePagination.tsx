

import cn from "classnames";
import Pagination from "@/components/core/Pagination";

import type { DataTablePaginationProps } from "@/components/core/Table/types";
import styles from "@/components/core/Table/Table.module.sass";

function DataTablePagination<T>({ table, loading = false }: DataTablePaginationProps<T>) {
  const pageCount = Math.max(1, table.getPageCount());
  const currentPage = Math.min(table.getState().pagination.pageIndex + 1, pageCount);

  return (
    <footer className={cn(styles["table-pagination-footer"])}>
      <Pagination
        total={pageCount}
        value={currentPage}
        onChange={(page) => table.setPageIndex(page - 1)}
        disabled={loading}
        color="primary"
        size="sm"
      />
    </footer>
  );
}

export default DataTablePagination;
