import { Menu } from "@mantine/core";
import type { MantineThemeComponent } from "@mantine/core";

import SIZE_DEFAULT from "../defaults/componentSize";

const menuThemeExtension: MantineThemeComponent = Menu.extend({
  defaultProps: {
    shadow: "lg",
    offset: SIZE_DEFAULT.dropdownOffset,
  },
});

export const menuSubThemeExtension: MantineThemeComponent = Menu.Sub.extend({
  defaultProps: {
    offset: SIZE_DEFAULT.dropdownOffset,
  },
});

export default menuThemeExtension;
