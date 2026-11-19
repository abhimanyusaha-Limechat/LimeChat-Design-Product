
import cn from "classnames";
import { IconChevronDown, IconChevronUp, IconSelector } from "@tabler/icons-react";

import { Box } from "@mantine/core";
import ActionIcon from "@/components/core/ActionIcon";
import UnstyledButton from "@/components/core/UnstyledButton";

import type { DataTableHeaderProps } from "@/components/core/Table/types";
import styles from "@/components/core/Table/Table.module.sass";

const SORT_ICON_SIZE = 12;

function DataTableHeader<T>({ column, title = "", className = "" }: DataTableHeaderProps<T>) {
  const sorted = column.getIsSorted();

  if (column.getCanSort() === false) {
    return <Box className={cn(className)}>{title}</Box>;
  }

  const renderSortIcon = () => {
    if (sorted === "asc") {
      return <IconChevronUp size={SORT_ICON_SIZE} />;
    }
    if (sorted === "desc") {
      return <IconChevronDown size={SORT_ICON_SIZE} />;
    }
    return <IconSelector size={SORT_ICON_SIZE} />;
  };

  return (
    <UnstyledButton
      onClick={() => column.toggleSorting()}
      className={cn(styles["table-header-sort"], className)}
      aria-label={`Sort by ${title}`}
    >
      <span className={cn(styles["table-header-row-cell"], "table-header")}>{title}</span>
      <ActionIcon
        size="xs"
        color="secondary"
        tabIndex={-1}
        variant={sorted !== false ? "filled" : "outline"}
      >
        {renderSortIcon()}
      </ActionIcon>
    </UnstyledButton>
  );
}

export default DataTableHeader;
