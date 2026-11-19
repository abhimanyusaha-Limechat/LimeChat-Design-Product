import { DatePicker as MantineDatePicker } from "@mantine/dates";
import type { DatePickerProps, DatePickerType } from "@mantine/dates";
import cn from "classnames";

import {
  calendarClasses,
  mantineCalendarDefaults,
} from "@/components/core/Calendar/mantineCalendarDefaults";

export function DatePicker<Type extends DatePickerType = "default">({
  classNames,
  className,
  ...props
}: DatePickerProps<Type>) {
  return (
    <MantineDatePicker
      {...mantineCalendarDefaults}
      className={cn(className)}
      classNames={{ ...calendarClasses, ...classNames }}
      {...props}
    />
  );
}

export type { DatePickerProps };
