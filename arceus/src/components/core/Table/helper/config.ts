import type { Column } from "@tanstack/react-table";

export const isLastLeftPinnedColumn = <T>(column: Column<T>): boolean =>
  column.getIsPinned() === "left" && column.getIsLastColumn("left");

const getBackgroundColor = (isPinned: boolean | "left" | "right", isHeader?: boolean): string =>
  isPinned === "left"
    ? isHeader === true
      ? "var(--mantine-color-secondary-0)"
      : "white"
    : "transparent";

export default function getPinnedStyles<T>(
  column: Column<T>,
  isHeader?: boolean,
): React.CSSProperties {
  const pinnedPosition = column.getIsPinned();
  const isFirstLeftPinnedColumn = pinnedPosition === "left" && column.getIsFirstColumn("left");
  const paddingAndBorder = isFirstLeftPinnedColumn ? 0 : 24 + 24 + 1;

  return {
    boxShadow: undefined,
    borderRight: undefined,
    left:
      pinnedPosition === "left"
        ? `calc(${column.getStart("left")}px + ${paddingAndBorder}px)`
        : undefined,
    right: pinnedPosition === "right" ? `${column.getAfter("right")}px` : undefined,
    position: pinnedPosition !== false ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: pinnedPosition !== false ? 1 : 0,
    background: getBackgroundColor(pinnedPosition, isHeader),
  };
}
