import { format } from "date-fns";
import { IconCalendar } from "@tabler/icons-react";
import { forwardRef, useEffect, useMemo, useState } from "react";
import Popover from "@/components/core/Popover";
import Card from "@/components/core/Card";
import Container from "@/components/core/Container";
import { Select } from "@/components/core/dropdowns/Select";
import { Calendar, dayPickerStyles } from "@/components/core/Calendar";
import type { DateRange } from "@/components/core/Calendar";
import { DATE_OPTIONS } from "@/components/core/DateRangeSelector/constants";
import {
  parseDate,
  formatRange,
  resolvePreset,
  getPresetRange,
} from "@/components/core/DateRangeSelector/utils";
import { useRangeSelection, useDateRangeHandlers } from "@/components/core/DateRangeSelector/hooks";
import type { DateRangeSelectorProps } from "@/components/core/DateRangeSelector/types";
type DateRangeSelectItem = {
  value: string;
  label: string;
  className?: string;
  dropdownLabel?: string;
};

const DateRangeOption = forwardRef<HTMLDivElement, DateRangeSelectItem>(
  ({ label, dropdownLabel, className = "", value: _value, ...others }, ref) => (
    <Container {...others} ref={ref} className={`mantine-Select-item ${className}`.trim()}>
      {dropdownLabel ?? label}
    </Container>
  ),
);

DateRangeOption.displayName = "DateRangeOption";

function DateRangeSelector({
  startDate,
  endDate,
  onChange,
  className = "",
  size = "sm",
  maxRangeDays = 90,
  minWidth,
  maxWidth,
  withinPortal,
  floatingStrategy,
  portalProps,
}: DateRangeSelectorProps) {
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [selectedPredefinedRange, setSelectedPredefinedRange] = useState<string>("custom");
  const [displayRange, setDisplayRange] = useState<DateRange | undefined>(undefined);

  const {
    tempRange,
    setTempRange,
    hoveredDay,
    setHoveredDay,
    isSelecting,
    setIsSelecting,
    hoverModifiers,
    resetSelection,
  } = useRangeSelection();

  useEffect(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const range =
      start && end
        ? {
            from: start,
            to: end,
          }
        : undefined;

    setSelectedRange(range);
    setSelectedPredefinedRange(resolvePreset(start, end));
  }, [startDate, endDate]);

  const handleClose = () => {
    setOpenDatePicker(false);
    resetSelection();
  };

  const openCustomRangeCalendar = () => {
    resetSelection();
    setDisplayRange(selectedRange);
    requestAnimationFrame(() => setOpenDatePicker(true));
  };

  const handleRangeChange = (selected: string | null) => {
    const nextValue = selected ?? "custom";
    setSelectedPredefinedRange(nextValue);

    if (nextValue === "custom") {
      openCustomRangeCalendar();
      return;
    }

    const presetRange = getPresetRange(nextValue);
    if (presetRange === null) return;

    const range = { from: presetRange.start, to: presetRange.end };
    setOpenDatePicker(false);
    setSelectedRange(range);
    resetSelection();
    onChange(formatRange(presetRange));
  };

  const hasCustomRange = useMemo(() => {
    if (selectedPredefinedRange !== "custom" || selectedRange == null) {
      return false;
    }

    return selectedRange.from != null && selectedRange.to != null;
  }, [selectedPredefinedRange, selectedRange]);

  const formattedDates = useMemo(() => {
    if (selectedRange == null || selectedRange.from == null || selectedRange.to == null) {
      return { from: "", to: "" };
    }

    return {
      from: format(selectedRange.from, "MMM dd, yyyy"),
      to: format(selectedRange.to, "MMM dd, yyyy"),
    };
  }, [selectedRange]);

  const customRangeLabel = hasCustomRange
    ? `${formattedDates.from} - ${formattedDates.to}`
    : "Custom range";

  const selectorOptions = useMemo<DateRangeSelectItem[]>(
    () =>
      DATE_OPTIONS.map((option) =>
        option.value === "custom"
          ? {
              ...option,
              label: customRangeLabel,
              dropdownLabel: option.label,
            }
          : option,
      ),
    [customRangeLabel],
  );

  const { handleDayMouseEnter, handleDayMouseLeave, handleDatePickerChange, getDisabledDates } =
    useDateRangeHandlers({
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
    });

  return (
    <Card p={0} className="date-range-picker" style={{ overflow: "visible" }}>
      <Popover
        opened={openDatePicker}
        onChange={(opened) => {
          if (!opened) handleClose();
        }}
        position="bottom-start"
        {...(withinPortal !== undefined ? { withinPortal } : {})}
        {...(floatingStrategy !== undefined ? { floatingStrategy } : {})}
        {...(portalProps !== undefined ? { portalProps } : {})}
      >
        <Popover.Target>
          <Container style={{ width: "100%" }}>
            <Select
              value={selectedPredefinedRange}
              className={`filter-selector ${className}`.trim()}
              placeholder="Select date range"
              leftSection={<IconCalendar size={14} />}
              data={selectorOptions}
              onChange={handleRangeChange}
              onOptionSubmit={(value) => {
                if (value === "custom" && selectedPredefinedRange === "custom") {
                  openCustomRangeCalendar();
                }
              }}
              comboboxProps={{
                ...(withinPortal !== undefined ? { withinPortal } : {}),
                ...(floatingStrategy !== undefined ? { floatingStrategy } : {}),
                ...(portalProps !== undefined ? { portalProps } : {}),
              }}
              size={size}
              renderOption={({ option }) => <DateRangeOption {...option} />}
              style={{
                width: "100%",
                ...(minWidth !== undefined ? { minWidth } : {}),
                ...(maxWidth !== undefined ? { maxWidth } : {}),
              }}
            />
          </Container>
        </Popover.Target>
        <Popover.Dropdown p={0}>
          <Card className="date-range-picker__dropdown">
            <Calendar
              mode="range"
              defaultMonth={tempRange?.from ?? selectedRange?.from ?? new Date()}
              selected={tempRange}
              onSelect={handleDatePickerChange}
              numberOfMonths={2}
              disabled={getDisabledDates}
              onDayMouseEnter={handleDayMouseEnter}
              onDayMouseLeave={handleDayMouseLeave}
              modifiers={{
                ...(hoverModifiers || {}),
                ...(!isSelecting && displayRange?.from && displayRange.to
                  ? {
                      displayRangeStart: displayRange.from,
                      displayRangeEnd: displayRange.to,
                      displayRangeMiddle: (date: Date) => {
                        const time = date.getTime();
                        const from = displayRange.from!;
                        const to = displayRange.to!;
                        return time > from.getTime() && time < to.getTime();
                      },
                    }
                  : {}),
              }}
              modifiersClassNames={{
                displayRangeStart: dayPickerStyles["calendar-day--display-range-start"] ?? "",
                displayRangeEnd: dayPickerStyles["calendar-day--display-range-end"] ?? "",
                displayRangeMiddle: dayPickerStyles["calendar-day--display-range-middle"] ?? "",
              }}
            />
          </Card>
        </Popover.Dropdown>
      </Popover>
    </Card>
  );
}

export default DateRangeSelector;
export { DateRangeSelector };
export type { DateRangeSelectorProps } from "@/components/core/DateRangeSelector/types";
