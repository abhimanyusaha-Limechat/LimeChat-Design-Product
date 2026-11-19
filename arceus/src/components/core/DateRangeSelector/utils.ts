import { format, parse, isValid, isSameDay, subDays } from "date-fns";
import { DATE_FORMAT } from "@/components/core/DateRangeSelector/constants";

export const formatRange = (range: { start: Date; end: Date }) => ({
  startDate: format(range.start, DATE_FORMAT),
  endDate: format(range.end, DATE_FORMAT),
});

export const resolvePreset = (start?: Date | null, end?: Date | null): string => {
  if (!start || !end) return "custom";

  const today = new Date();

  if (isSameDay(start, today) && isSameDay(end, today)) return "today";

  const yesterday = subDays(today, 1);
  if (isSameDay(start, yesterday) && isSameDay(end, yesterday)) return "yesterday";

  const last7Start = subDays(today, 6);
  if (isSameDay(start, last7Start) && isSameDay(end, today)) return "last7days";

  const last30Start = subDays(today, 29);
  if (isSameDay(start, last30Start) && isSameDay(end, today)) return "last30days";

  return "custom";
};

export const getPresetRange = (preset: string): { start: Date; end: Date } | null => {
  const today = new Date();

  switch (preset) {
    case "today":
      return { start: today, end: today };
    case "yesterday": {
      const value = subDays(today, 1);
      return { start: value, end: value };
    }
    case "last7days":
      return { start: subDays(today, 6), end: today };
    case "last30days":
      return { start: subDays(today, 29), end: today };
    default:
      return null;
  }
};

export const parseDate = (value?: string): Date | null => {
  if (value === undefined || value === "") return null;
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : null;
};
