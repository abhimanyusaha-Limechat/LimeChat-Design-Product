export const predefinedRanges = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
] as const;

export const DATE_FORMAT = "yyyy/MM/dd";

export const DATE_OPTIONS = predefinedRanges.map(({ value, label }) => ({ value, label }));

export type DatePreset = (typeof predefinedRanges)[number]["value"];
