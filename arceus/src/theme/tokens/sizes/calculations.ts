import { SIZES, sizing, type InputSize } from "./sizing";

function resolveSize(size: string | undefined): InputSize {
  return SIZES.includes(size as InputSize) ? (size as InputSize) : "sm";
}

export function getInputSectionIconSizePx(size: string | undefined): number {
  return sizing.inputSectionIcon[resolveSize(size)];
}

export function getInputPaddingPx(size: string | undefined): number {
  return sizing.inputPaddingX[resolveSize(size)];
}

export function getButtonPaddingPx(size: string | undefined): number {
  return getInputPaddingPx(size);
}

/** Per-size line-height vars for Button (`--button-lh-xs` … `--button-lh-xl`). */
export function buildButtonLineHeightVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const size of SIZES) {
    vars[`--button-lh-${size}`] = `${sizing.inputLineHeight[size]}px`;
  }
  return vars;
}

/** Left/right section width: outer padding + icon + inner gap (padding) before text. */
export function getInputSectionWidthPx(size: string | undefined): number {
  const pad = getInputPaddingPx(size);
  const icon = getInputSectionIconSizePx(size);
  return pad + icon + pad;
}
