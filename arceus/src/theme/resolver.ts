import { defaultCssVariablesResolver } from "@mantine/core";
import type { CSSVariablesResolver, MantineTheme } from "@mantine/core";

import {
  AI_GRADIENT_CSS,
  INSTAGRAM_GRADIENT_CSS,
  WHATSAPP_GRADIENT_CSS,
} from "@/theme/palettes/gradients";
import FONT_COLORS from "@/theme/palettes/fonts";
import { SIZES, sizing } from "@/theme/tokens/sizes";

function buildOtherCssVariables(theme: MantineTheme): Record<string, string> {
  const entries = Object.entries(theme.other ?? {}) as [string, string][];
  return Object.fromEntries(entries.map(([key, value]) => [`--mantine-other-${key}`, value]));
}

function getGradientCssVariables(): Record<string, string> {
  return {
    "--mantine-ai-gradient": AI_GRADIENT_CSS,
    "--mantine-whatsapp-gradient": WHATSAPP_GRADIENT_CSS,
    "--mantine-instagram-gradient": INSTAGRAM_GRADIENT_CSS,
  };
}

function getFontColorCssVariables(): Record<string, string> {
  return {
    "--mantine-color-dark": FONT_COLORS.DARK,
    "--mantine-color-light": FONT_COLORS.LIGHT,
    "--mantine-color-dark-text": FONT_COLORS.DARK,
    "--mantine-color-light-text": FONT_COLORS.LIGHT,
    "--mantine-color-text": "var(--mantine-color-dark)",
    "--mantine-color-dimmed": "var(--mantine-color-light)",
    "--mantine-color-placeholder": FONT_COLORS.PLACEHOLDER,
  };
}

function getDisabledCssVariables(): Record<string, string> {
  return {
    "--mantine-color-disabled": "var(--mantine-color-gray-0)",
    "--mantine-color-disabled-color": "var(--mantine-color-gray-6)",
    "--mantine-color-disabled-border": "var(--mantine-color-gray-3)",
  };
}

// App-level (not upstream): expose the control-height scale globally so bespoke
// controls can match arceus inputs without being an arceus Input.
function getInputHeightCssVariables(): Record<string, string> {
  return Object.fromEntries(SIZES.map((size) => [`--input-height-${size}`, `${sizing.container[size]}px`]));
}

const resolver: CSSVariablesResolver = (theme) => {
  const base = defaultCssVariablesResolver(theme);
  return {
    variables: {
      ...base.variables,
      ...getGradientCssVariables(),
      ...getInputHeightCssVariables(),
      ...buildOtherCssVariables(theme),
    },
    light: {
      ...base.light,
      ...getFontColorCssVariables(),
      ...getDisabledCssVariables(),
    },
    dark: base.dark,
  };
};

export default resolver;
