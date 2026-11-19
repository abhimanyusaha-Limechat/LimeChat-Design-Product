import { useMemo, useCallback } from "react";
import { differenceInDays } from "date-fns";
import type { DayMouseEventHandler } from "react-day-picker";
import type { DateRange } from "@/components/core/Calendar";
import { formatRange, resolvePreset } from "@/components/core/DateRangeSelector/utils";

interface UseDateRangeHandlersProps {
  isSelecting: boolean;
  tempRange: DateRange | undefined;
  hoveredDay: Date | undefined;
  maxRangeDays: number;
  setTempRange: (range: DateRange | undefined) => void;
  setHoveredDay: (day: Date | undefined) => void;
  setIsSelecting: (selecting: boolean) => void;
  setSelectedRange: (range: DateRange | undefined) => void;
  setOpenDatePicker: (open: boolean) => void;
  onChange: (dates: { startDate: string; endDate: string }) => void;
  setSelectedPredefinedRange: (preset: string) => void;
  setDisplayRange?: (range: DateRange | undefined) => void;
}

export default function useDateRangeHandlers({
  isSelecting,
  tempRange,
  hoveredDay,
  maxRangeDays,
  setTempRange,
  setHoveredDay,
  setIsSelecting,
  setSelectedRange,
  setOpenDatePicker,
  onChange,
  setSelectedPredefinedRange,
  setDisplayRange,
}: UseDateRangeHandlersProps) {
  const handleDayMouseEnter: DayMouseEventHandler = useCallback(
    (day, modifiers) => {
      if (!isSelecting || !tempRange?.from || modifiers.disabled) {
        if (hoveredDay !== undefined) {
          setHoveredDay(undefined);
        }
        return;
      }

      if (hoveredDay?.getTime() === day.getTime()) return;

      setHoveredDay(day);
    },
    [isSelecting, tempRange?.from, hoveredDay, setHoveredDay],
  );

  const handleDayMouseLeave: DayMouseEventHandler = useCallback(() => {
    if (!isSelecting || hoveredDay === undefined) return;
    setHoveredDay(undefined);
  }, [isSelecting, hoveredDay, setHoveredDay]);

  const handleDatePickerChange = useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from) {
        setTempRange(undefined);
        setIsSelecting(false);
        setHoveredDay(undefined);
        return;
      }

      if (!isSelecting) {
        setIsSelecting(true);
        setTempRange({ from: range.from, to: undefined });
        setHoveredDay(undefined);
        return;
      }

      if (range.to) {
        setSelectedRange(range);
        setTempRange(undefined);
        setIsSelecting(false);
        setHoveredDay(undefined);
        setDisplayRange?.(undefined);
        setOpenDatePicker(false);
        onChange(formatRange({ start: range.from, end: range.to }));
        setSelectedPredefinedRange(resolvePreset(range.from, range.to));
        return;
      }

      if (tempRange?.from && range.from.getTime() !== tempRange.from.getTime()) {
        setTempRange({ from: range.from, to: undefined });
        setHoveredDay(undefined);
        return;
      }

      setTempRange(range);
    },
    [
      isSelecting,
      tempRange,
      setTempRange,
      setHoveredDay,
      setIsSelecting,
      setSelectedRange,
      setOpenDatePicker,
      onChange,
      setSelectedPredefinedRange,
      setDisplayRange,
    ],
  );

  const getDisabledDates = useMemo(() => {
    const today = new Date();
    const basedDisabled = { after: today };

    if (isSelecting && tempRange?.from) {
      const startDate = tempRange.from;
      return (date: Date) => {
        if (date > today) return true;
        const daysDiff = Math.abs(differenceInDays(date, startDate));
        return daysDiff > maxRangeDays;
      };
    }

    return basedDisabled;
  }, [isSelecting, tempRange, maxRangeDays]);

  return {
    handleDayMouseEnter,
    handleDayMouseLeave,
    handleDatePickerChange,
    getDisabledDates,
  };
}
