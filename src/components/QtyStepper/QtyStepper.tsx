import { ActionIcon, Group, Text } from 'arceus';

/** Quantity −/+ control, never below 1. `field` is the taller variant that sits beside form inputs. */
export function QtyStepper({
  value,
  onChange,
  variant = 'compact',
}: {
  value: number;
  onChange: (next: number) => void;
  variant?: 'compact' | 'field';
}) {
  const size = variant === 'field' ? 'md' : 'sm';
  return (
    <Group gap="xs" wrap="nowrap" className="lc-qty-stepper">
      <ActionIcon variant="default" size={size} aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </ActionIcon>
      <Text component="span" variant="body-2" ta="center" miw={24}>
        {value}
      </Text>
      <ActionIcon variant="default" size={size} aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        +
      </ActionIcon>
    </Group>
  );
}
