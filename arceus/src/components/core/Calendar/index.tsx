import * as React from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import cn from "classnames";

import styles from "@/components/core/Calendar/DayPicker.module.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export { default as dayPickerStyles } from "@/components/core/Calendar/DayPicker.module.css";

const mapModuleClassNames = (moduleStyles: Record<string, string>, keys: Record<string, string>) =>
  Object.fromEntries(Object.entries(keys).map(([key, value]) => [key, cn(moduleStyles[value])]));

const CLASS_NAMES = {
  months: "calendar-months",
  month: "calendar-month",
  caption: "calendar-caption",
  caption_label: "calendar-caption-label",
  nav: "calendar-nav",
  nav_button: "calendar-nav-button",
  nav_button_previous: "calendar-nav-button--previous",
  nav_button_next: "calendar-nav-button--next",
  table: "calendar-table",
  head_row: "calendar-head-row",
  head_cell: "calendar-head-cell",
  row: "calendar-row",
  cell: "calendar-cell",
  day: "calendar-day",
  day_range_end: "calendar-day--range-end",
  day_range_start: "calendar-day--range-start",
  day_selected: "calendar-day--selected",
  day_today: "calendar-day--today",
  day_outside: "calendar-day--outside",
  day_disabled: "calendar-day--disabled",
  day_range_middle: "calendar-day--range-middle",
  day_hidden: "calendar-day-hidden",
};

const MODIFIER_CLASS_NAMES = {
  hoverRange: "calendar-day--hover-range",
  hoverRangeStart: "calendar-day--hover-range-start",
  hoverRangeEnd: "calendar-day--hover-range-end",
};

function IconLeft() {
  return <IconChevronLeft className={styles["calendar-icon"]} size={16} />;
}
function IconRight() {
  return <IconChevronRight className={styles["calendar-icon"]} size={16} />;
}

function Calendar({
  className,
  classNames,
  modifiersClassNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(styles.calendar, className)}
      classNames={{
        ...mapModuleClassNames(styles, CLASS_NAMES),
        ...classNames,
      }}
      modifiersClassNames={{
        ...mapModuleClassNames(styles, MODIFIER_CLASS_NAMES),
        ...(modifiersClassNames ?? {}),
      }}
      components={{
        IconLeft,
        IconRight,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export default Calendar;
export { Calendar };
export type { DateRange };
