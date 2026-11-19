export interface ChartLoaderTheme {
  primary?: string;
  secondary?: string;
  grid?: string;
  text?: string;
}

export const defaultTheme: ChartLoaderTheme = {
  primary: "var(--mantine-color-gray-4)",
  secondary: "var(--mantine-color-gray-0)",
  grid: "var(--mantine-color-gray-3)",
  text: "var(--mantine-color-gray-5)",
};

export const blueTheme: ChartLoaderTheme = {
  primary: "var(--mantine-color-blue-3)",
  secondary: "var(--mantine-color-blue-2)",
  grid: "var(--mantine-color-blue-1)",
  text: "var(--mantine-color-blue-4)",
};

export const greenTheme: ChartLoaderTheme = {
  primary: "var(--mantine-color-green-3)",
  secondary: "var(--mantine-color-green-2)",
  grid: "var(--mantine-color-green-1)",
  text: "var(--mantine-color-green-4)",
};

export const orangeTheme: ChartLoaderTheme = {
  primary: "var(--mantine-color-orange-3)",
  secondary: "var(--mantine-color-orange-2)",
  grid: "var(--mantine-color-orange-1)",
  text: "var(--mantine-color-orange-4)",
};

export const purpleTheme: ChartLoaderTheme = {
  primary: "var(--mantine-color-violet-3)",
  secondary: "var(--mantine-color-violet-2)",
  grid: "var(--mantine-color-violet-1)",
  text: "var(--mantine-color-violet-4)",
};

export const chartLoaderThemes = {
  default: defaultTheme,
  blue: blueTheme,
  green: greenTheme,
  orange: orangeTheme,
  purple: purpleTheme,
} as const;

export type ChartLoaderThemeName = keyof typeof chartLoaderThemes;

export function getChartLoaderTheme(themeName?: ChartLoaderThemeName): ChartLoaderTheme {
  return chartLoaderThemes[themeName ?? "default"];
}
