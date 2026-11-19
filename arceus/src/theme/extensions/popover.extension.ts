import { Popover } from "@mantine/core";
import type { MantineThemeComponent } from "@mantine/core";

import SIZE_DEFAULT from "../defaults/componentSize";

const popoverThemeExtension: MantineThemeComponent = Popover.extend({
  defaultProps: {
    shadow: "lg",
    closeOnClickOutside: true,
    offset: SIZE_DEFAULT.dropdownOffset,
  },
});

export default popoverThemeExtension;
