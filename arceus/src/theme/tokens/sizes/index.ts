export { SIZES, sizing, type InputSize, type SizeCategory } from "./sizing";
export { COMPONENTS, componentSizeVars } from "./components";
export { default as bindActiveSizeVars } from "./activeSizeVar";
export {
  buildButtonLineHeightVars,
  getButtonPaddingPx,
  getInputPaddingPx,
  getInputSectionIconSizePx,
  getInputSectionWidthPx,
} from "./calculations";

/** @deprecated Use `componentSizeVars` from this module. */
export { componentSizeVars as sizeVars } from "./components";

/** @deprecated Use `bindActiveSizeVars` from this module. */
export { default as withActiveSizeVars } from "./activeSizeVar";
