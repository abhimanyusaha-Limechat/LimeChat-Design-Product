import { PasswordInput } from "@mantine/core";

import inputSectionClasses from "../../../components/core/inputs/shared/inputSection.module.css";
import { componentSizeVars } from "../../tokens/sizes";
import getInputStyles from "./styles";
import getInputVars from "./vars";

const passwordInputSizeVars = componentSizeVars("PasswordInput");

export default PasswordInput.extend({
  classNames: {
    section: inputSectionClasses.section ?? "",
  },
  vars: (_theme, props) => ({
    root: passwordInputSizeVars().root,
    wrapper: getInputVars(_theme, props).wrapper,
  }),
  styles: (_theme, props) => ({
    ...getInputStyles(_theme, props),
  }),
});
