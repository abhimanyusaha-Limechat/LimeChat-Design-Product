import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { Stepper as MantineStepper } from "@mantine/core";
import type { StepperProps as MantineStepperProps } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import classes from "./Stepper.module.sass";

export type { StepperProps, StepperStepProps } from "@mantine/core";

type MantineStepProps = React.ComponentPropsWithoutRef<typeof MantineStepper.Step>;

const DEFAULT_COMPLETED_ICON = <IconCheck size={12} stroke={2} />;

function StepNumberIcon({ step }: { step: number }) {
  return <>{step + 1}</>;
}

function isErrorStepColor(color: MantineStepProps["color"]): boolean {
  if (typeof color !== "string") {
    return false;
  }
  return (
    color === "red" || color === "error" || color.startsWith("red.") || color.startsWith("error.")
  );
}

function isStepperStepElement(child: ReactNode): child is ReactElement<MantineStepProps> {
  return isValidElement(child) && child.type === MantineStepper.Step;
}

function mapStepChildren(children: ReactNode): ReactNode {
  const count = Children.count(children);
  return Children.map(children, (child, index) => {
    if (!isStepperStepElement(child)) {
      return child;
    }

    const error = isErrorStepColor(child.props.color);
    return cloneElement(child, {
      style: [child.props.style, { "--arceus-step-order": count - index } as CSSProperties],
      className: [child.props.className, error && classes.error].filter(Boolean).join(" "),
      completedIcon: child.props.completedIcon ?? (error ? StepNumberIcon : undefined),
    });
  });
}

const StepperRoot = forwardRef<HTMLDivElement, MantineStepperProps>(function Stepper(
  { completedIcon = DEFAULT_COMPLETED_ICON, children, ...props },
  ref,
) {
  return (
    <MantineStepper ref={ref} {...props} completedIcon={completedIcon}>
      {mapStepChildren(children)}
    </MantineStepper>
  );
});

StepperRoot.displayName = "Stepper";

type StepperComponent = typeof StepperRoot & {
  Step: typeof MantineStepper.Step;
  Completed: typeof MantineStepper.Completed;
};

const Stepper = StepperRoot as StepperComponent;
Stepper.Step = MantineStepper.Step;
Stepper.Completed = MantineStepper.Completed;

export default Stepper;
export { Stepper };
