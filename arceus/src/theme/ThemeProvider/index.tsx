import React from "react";
import { MantineProvider } from "@mantine/core";
import type { MantineThemeOverride } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

import { createAppTheme, resolver } from "@/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: MantineThemeOverride;
  /** App-level addition: `test` turns off transitions and portals so jsdom tests can query the DOM directly. */
  env?: "default" | "test";
}

function ThemeProvider({ children, theme: themeOverride, env }: ThemeProviderProps) {
  const theme = createAppTheme(themeOverride);

  return (
    <MantineProvider theme={theme} cssVariablesResolver={resolver} env={env}>
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  );
}

export default ThemeProvider;
