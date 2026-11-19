type StyleVars = Record<string, string>;

export const inlineInputLabelStyles: Record<string, StyleVars> = {
  description: {
    color: "var(--mantine-color-dimmed)",
  },
  error: {
    color: "var(--mantine-color-error)",
  },
};

export const inputGroupStyles: Record<string, StyleVars> = {
  root: {
    "--input-asterisk-color": "var(--mantine-color-error)",
  },
  description: {
    color: "var(--mantine-color-dimmed)",
  },
  error: {
    color: "var(--mantine-color-error)",
  },
};
