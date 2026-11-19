import { forwardRef } from "react";
import { Pagination as MantinePagination } from "@mantine/core";
import type { PaginationProps } from "@mantine/core";

const Pagination = forwardRef<HTMLDivElement, PaginationProps>(function Pagination(
  { withEdges = false, ...props },
  ref,
) {
  return <MantinePagination ref={ref} withEdges={withEdges} {...props} />;
});

Pagination.displayName = "Pagination";

export default Pagination;
export { Pagination };

export type { PaginationProps };
