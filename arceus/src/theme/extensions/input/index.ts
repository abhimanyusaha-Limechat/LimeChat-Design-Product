import { Input } from "@mantine/core";

import inputSectionClasses from "../../../components/core/inputs/shared/inputSection.module.css";
import SIZE_DEFAULT from "../../defaults/componentSize";
import getInputStyles from "./styles";
import getInputVars from "./vars";

export default Input.extend({
  defaultProps: {
    size: SIZE_DEFAULT.size,
    radius: SIZE_DEFAULT.radius,
  },
  classNames: {
    section: inputSectionClasses.section ?? "",
  },
  vars: getInputVars,
  styles: getInputStyles,
});

export { default as inputWrapperThemeExtension } from "./wrapper";
export { default as passwordInputThemeExtension } from "./passwordInput";
export { default as numberInputThemeExtension } from "./numberInput";
export { selectThemeExtension, multiSelectThemeExtension } from "./select";
