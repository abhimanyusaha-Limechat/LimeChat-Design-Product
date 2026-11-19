import { DatePickerInput as MantineDatePickerInput } from "@mantine/dates";

import {
  calendarClasses,
  mantineCalendarDefaults,
} from "@/components/core/Calendar/mantineCalendarDefaults";
import SIZE_DEFAULT from "@/theme/defaults/componentSize";

const DatePickerInput = Object.assign(function DatePickerInput(
  props: React.ComponentProps<typeof MantineDatePickerInput>,
) {
  const { classNames, ...rest } = props;

  return (
    <MantineDatePickerInput
      {...SIZE_DEFAULT}
      {...mantineCalendarDefaults}
      classNames={{ ...calendarClasses, ...classNames }}
      {...rest}
    />
  );
}, MantineDatePickerInput);

export default DatePickerInput;
export { DatePickerInput };
export type { DatePickerInputProps } from "@mantine/dates";
