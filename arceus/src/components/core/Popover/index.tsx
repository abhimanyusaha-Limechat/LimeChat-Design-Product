import { Popover as MantinePopover } from "@mantine/core";
import type { PopoverProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";

/**
 * Mantine controlled Popovers require `onChange` to close on outside click.
 * When only `opened` + `onClose` are provided, wire `onChange` to `onClose`.
 */
function Popover({
  opened,
  onChange,
  onClose,
  offset = SIZE_DEFAULT.dropdownOffset,
  ...rest
}: PopoverProps) {
  const handleChange: PopoverProps["onChange"] =
    onChange ??
    (opened !== undefined && onClose
      ? (nextOpened) => {
          if (!nextOpened) onClose();
        }
      : undefined);

  return (
    <MantinePopover
      {...rest}
      offset={offset}
      {...(opened !== undefined ? { opened } : {})}
      {...(handleChange !== undefined ? { onChange: handleChange } : {})}
      {...(onClose !== undefined ? { onClose } : {})}
    />
  );
}

Popover.Target = MantinePopover.Target;
Popover.Dropdown = MantinePopover.Dropdown;
Popover.displayName = MantinePopover.displayName;

export default Popover;
export { Popover };
export type { PopoverProps };
