import { Radio } from "@mantine/core";

import styles from "../../components/core/inputs/RadioButton/RadioButton.module.sass";
import { componentSizeVars } from "../tokens/sizes";
import radioClasses from "./radio.module.css";

export default Radio.extend({
  classNames: {
    root: styles.root ?? "",
    radio: radioClasses.radio ?? "",
  },
  vars: componentSizeVars("Radio"),
  styles: {
    description: { color: "var(--mantine-color-dimmed)" },
    error: { color: "var(--mantine-color-error)" },
  },
});
