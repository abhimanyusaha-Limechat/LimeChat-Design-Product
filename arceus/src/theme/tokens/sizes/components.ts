import { SIZES, sizing, type SizeCategory } from "./sizing";

export const COMPONENTS = {
  Button: [
    ["--button-height", "container"],
    ["--button-height-compact", "compact"],
    ["--button-padding-x", "inputPaddingX"],
    ["--button-fz", "controlFontSize"],
  ],
  ActionIcon: [["--ai-size", "actionIcon"]],
  Input: [
    ["--input-height", "container"],
    ["--input-padding-y", "inset"],
    ["--input-padding", "inputPaddingX"],
    ["--input-padding-x", "inputPaddingX"],
    ["--input-lh", "inputLineHeight"],
    ["--input-section-icon-size", "inputSectionIcon"],
  ],
  CloseButton: [["--cb-size", "icon"]],
  ThemeIcon: [["--ti-size", "icon"]],
  Checkbox: [
    ["--checkbox-size", "control"],
    ["--checkbox-icon-size", "checkboxIcon"],
  ],
  Radio: [["--radio-size", "control"]],
  Switch: [
    ["--switch-height", "control"],
    ["--switch-thumb-size", "thumb"],
    ["--switch-width", "switchWidth"],
  ],
  Badge: [["--badge-height", "inline"]],
  Pill: [["--pill-height", "inline"]],
  Pagination: [["--pagination-control-size", "pagination"]],
  Slider: [["--slider-size", "thickness"]],
  Progress: [["--progress-size", "thickness"]],
  Divider: [["--divider-size", "thickness"]],
  Loader: [["--loader-size", "loader"]],
  Avatar: [["--avatar-size", "avatar"]],
  PasswordInput: [
    ["--psi-button-size", "container"],
    ["--psi-icon-size", "inputSectionIcon"],
  ],
  NumberInput: [["--ni-chevron-size", "inputSectionIcon"]],
} as const satisfies Record<string, [string, SizeCategory][]>;

type ComponentKey = keyof typeof COMPONENTS;

function buildComponentSizeScale(entries: [string, SizeCategory][]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [prefix, category] of entries) {
    const scale = sizing[category];
    for (const size of SIZES) {
      vars[`${prefix}-${size}`] = `${scale[size]}px`;
    }
  }
  return vars;
}

type SizeVarsReturn<S extends string> = () => Record<S, Record<string, string>>;

export function componentSizeVars<C extends ComponentKey>(
  component: C,
  selector: "wrapper",
): SizeVarsReturn<"wrapper">;

export function componentSizeVars<C extends ComponentKey>(
  component: C,
  selector?: "root",
): SizeVarsReturn<"root">;

export function componentSizeVars<C extends ComponentKey, S extends string>(
  component: C,
  selector: S,
): SizeVarsReturn<S>;

export function componentSizeVars(component: string, selector = "root"): SizeVarsReturn<string> {
  const entries = COMPONENTS[component as ComponentKey];
  if (entries === undefined) {
    return () => ({ [selector]: {} });
  }
  return () => ({ [selector]: buildComponentSizeScale(entries) });
}
