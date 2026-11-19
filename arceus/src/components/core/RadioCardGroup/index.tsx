import { forwardRef } from "react";
import cn from "classnames";
import type { RadioGroupProps, RadioCardProps } from "@mantine/core";

import Group from "@/components/core/Group";
import RadioGroup from "@/components/core/RadioGroup";
import Stack from "@/components/core/Stack";
import Text from "@/components/core/Text";
import classes from "@/components/core/RadioCardGroup/RadioCardGroup.module.sass";

export type RadioCardOption = RadioCardProps & {
  label: React.ReactNode;
  value: string;
  description?: string;
};

export type RadioCardGroupProps = Omit<RadioGroupProps, "children"> & {
  label?: string;
  description?: string;
  options: RadioCardOption[];
};

const RadioCardGroup = forwardRef<HTMLDivElement, RadioCardGroupProps>(function RadioCardGroup(
  { options, label, description, color = "primary", value = null, ...props },
  ref,
) {
  return (
    <RadioGroup
      {...props}
      color={color}
      value={value}
      ref={ref}
      label={label}
      description={description}
    >
      <Stack gap="xs" pt="sm">
        {options.map((option) => {
          const {
            label: optionLabel,
            value: optionValue,
            description: optionDescription,
            className,
            ...cardProps
          } = option;

          return (
            <RadioGroup.Card
              key={optionValue}
              value={optionValue}
              withBorder
              radius="md"
              className={cn(classes["radio-card-group--card"], className)}
              {...cardProps}
            >
              <Group wrap="nowrap" align="flex-start">
                <RadioGroup.Indicator />
                <div className={classes["radio-card-group--content"]}>
                  <Text variant="subtitle-2">{optionLabel}</Text>
                  {Boolean(optionDescription?.trim()) && (
                    <Text variant="body-3">{optionDescription}</Text>
                  )}
                </div>
              </Group>
            </RadioGroup.Card>
          );
        })}
      </Stack>
    </RadioGroup>
  );
});

RadioCardGroup.displayName = "RadioCardGroup";

export default RadioCardGroup;
export { RadioCardGroup };
