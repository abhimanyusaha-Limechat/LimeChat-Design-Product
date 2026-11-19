import { useState, useMemo } from "react";
import type { DateRange } from "@/components/core/Calendar";

export default function useRangeSelection() {
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);
  const [hoveredDay, setHoveredDay] = useState<Date | undefined>(undefined);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const hoverRange = useMemo(() => {
    if (!isSelecting || !tempRange?.from || !hoveredDay) return undefined;

    const startTime = tempRange.from.getTime();
    const hoverTime = hoveredDay.getTime();

    if (startTime === hoverTime) {
      return { from: tempRange.from, to: tempRange.from };
    }

    return hoverTime < startTime
      ? { from: hoveredDay, to: tempRange.from }
      : { from: tempRange.from, to: hoveredDay };
  }, [hoveredDay, isSelecting, tempRange]);

  const hoverModifiers = useMemo(() => {
    if (!hoverRange) return undefined;

    return {
      hoverRange,
      hoverRangeStart: hoverRange.from,
      hoverRangeEnd: hoverRange.to,
    };
  }, [hoverRange]);

  const resetSelection = () => {
    setTempRange(undefined);
    setIsSelecting(false);
    setHoveredDay(undefined);
  };

  return {
    tempRange,
    setTempRange,
    hoveredDay,
    setHoveredDay,
    isSelecting,
    setIsSelecting,
    hoverModifiers,
    resetSelection,
  };
}
