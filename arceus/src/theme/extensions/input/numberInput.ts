import { NumberInput } from "@mantine/core";

import inputSectionClasses from "../../../components/core/inputs/shared/inputSection.module.css";
import { componentSizeVars } from "../../tokens/sizes";
import getInputStyles from "./styles";
import getInputVars from "./vars";

const numberInputSizeVars = componentSizeVars("NumberInput", "controls");

export default NumberInput.extend({
  classNames: {
    section: inputSectionClasses.section ?? "",
  },
  vars: (_theme, props) => ({
    controls: numberInputSizeVars().controls,
    wrapper: getInputVars(_theme, props).wrapper,
  }),
  styles: (_theme, props) => ({
    ...getInputStyles(_theme, props),
    control: {
      "& svg": {
        width: "var(--ni-chevron-size)",
        height: "var(--ni-chevron-size)",
      },
    },
  }),
});
