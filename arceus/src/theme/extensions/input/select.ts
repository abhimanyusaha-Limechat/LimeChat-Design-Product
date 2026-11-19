import type { MultiSelectProps, SelectProps } from "@mantine/core";
import { MultiSelect, Select } from "@mantine/core";

// Its global rules style the checked option (Mantine applies `styles` inline, which can't hold selectors).
import "../../../components/core/dropdowns/shared/Dropdown.module.sass";
import renderSelectOption from "./selectRenderOption";

const defaultCommonProps: Partial<SelectProps> & Partial<MultiSelectProps> = {
  rightSectionPointerEvents: "none",
  checkIconPosition: "right",
  renderOption: renderSelectOption,
  comboboxProps: { withinPortal: false },
};

export const selectThemeExtension = Select.extend({
  defaultProps: defaultCommonProps,
});

export const multiSelectThemeExtension = MultiSelect.extend({
  defaultProps: defaultCommonProps,
});
