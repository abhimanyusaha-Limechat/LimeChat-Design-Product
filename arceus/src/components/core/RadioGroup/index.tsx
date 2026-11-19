import { RadioCard, RadioGroup as MantineRadioGroup, RadioIndicator } from "@mantine/core";

export type {
  RadioGroupProps,
  RadioGroupStylesNames,
  RadioCardProps,
  RadioCardStylesNames,
  RadioIndicatorProps,
  RadioIndicatorStylesNames,
} from "@mantine/core";

export { RadioCard, RadioIndicator };

type RadioGroupComponent = typeof MantineRadioGroup & {
  Card: typeof RadioCard;
  Indicator: typeof RadioIndicator;
};

const RadioGroup = Object.assign(MantineRadioGroup, {
  Card: RadioCard,
  Indicator: RadioIndicator,
}) as RadioGroupComponent;

export default RadioGroup;
export { RadioGroup };
