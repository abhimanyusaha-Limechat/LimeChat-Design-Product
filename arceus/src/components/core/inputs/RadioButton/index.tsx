import { Radio, RadioCard, RadioGroup as MantineRadioGroup, RadioIndicator } from "@mantine/core";

export type {
  RadioProps,
  RadioCardProps,
  RadioCardProps as RadioButtonCardProps,
  RadioCardStylesNames,
  RadioIndicatorProps,
  RadioIndicatorProps as RadioButtonIndicatorProps,
  RadioIndicatorStylesNames,
} from "@mantine/core";

type RadioButtonComponent = typeof Radio & {
  Group: typeof MantineRadioGroup;
  Card: typeof RadioCard;
  Indicator: typeof RadioIndicator;
};

const RadioButton = Object.assign(Radio, {
  Group: MantineRadioGroup,
  Card: RadioCard,
  Indicator: RadioIndicator,
}) as RadioButtonComponent;

export default RadioButton;
export { RadioButton };
