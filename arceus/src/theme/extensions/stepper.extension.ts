import { Stepper } from "@mantine/core";

import styles from "../../components/core/Stepper/Stepper.module.sass";

export default Stepper.extend({
  defaultProps: {
    color: "primary",
    orientation: "horizontal",
    iconPosition: "left",
    wrap: false,
    iconSize: 20,
    radius: "xs",
    autoContrast: false,
  },
  styles: (_, { color }) => ({
    root: {
      "--arceus-step-completed-color":
        color === undefined || color === "primary" ? "var(--mantine-color-primary-7)" : undefined,
    },
  }),
  classNames: {
    root: styles.root ?? "",
    steps: styles.steps ?? "",
    separator: styles.separator ?? "",
    verticalSeparator: styles.verticalSeparator ?? "",
    stepWrapper: styles.stepWrapper ?? "",
    step: styles.step ?? "",
    stepIcon: styles.stepIcon ?? "",
    stepBody: styles.stepBody ?? "",
    stepLabel: styles.stepLabel ?? "",
    stepDescription: styles.stepDescription ?? "",
  },
});
