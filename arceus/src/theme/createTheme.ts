import {
  createTheme,
  DEFAULT_THEME as MANTINE_DEFAULT_THEME,
  mergeMantineTheme,
} from "@mantine/core";
import type { MantineTheme, MantineThemeOverride } from "@mantine/core";

import defaultThemeOverride from "@/theme/defaults/theme";
import themeExtensions from "@/theme/extensions";

const baseTheme = createTheme({
  ...defaultThemeOverride,
  components: themeExtensions,
});

export const DEFAULT_THEME = mergeMantineTheme(MANTINE_DEFAULT_THEME, baseTheme);

export function createAppTheme(override?: MantineThemeOverride): MantineTheme {
  if (!override) {
    return DEFAULT_THEME;
  }
  return mergeMantineTheme(DEFAULT_THEME, override);
}
