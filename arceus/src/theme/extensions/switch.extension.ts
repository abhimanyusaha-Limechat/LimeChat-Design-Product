import { Switch } from "@mantine/core";

import styles from "../../components/core/Switch/Switch.module.sass";
import { componentSizeVars } from "../tokens/sizes";

const switchSizeVars = componentSizeVars("Switch");

export default Switch.extend({
  vars: () => ({
    root: {
      ...switchSizeVars().root,
      "--switch-color": "var(--mantine-color-primary-6)",
      "--switch-disabled-color": "var(--mantine-color-gray-3)",
    },
  }),
  classNames: {
    root: styles.root ?? "",
    input: styles.input ?? "",
    track: styles.track ?? "",
  },
  styles: (_theme, props) => ({
    root: props.disabled === true ? { opacity: 0.5 } : {},
    description: { color: "var(--mantine-color-dimmed)" },
    error: { color: "var(--mantine-color-error)" },
  }),
});
