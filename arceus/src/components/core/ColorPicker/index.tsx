import { useEffect, useState, type ChangeEvent } from "react";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";
import {
  ColorPicker as MantineColorPicker,
  type ColorPickerProps as MantineColorPickerProps,
} from "@mantine/core";
import { IconColorPicker, IconHash } from "@tabler/icons-react";
import classNames from "classnames";

import Box from "@/components/core/Box";
import Popover, { type PopoverProps } from "@/components/core/Popover";
import TextInput from "@/components/core/inputs/TextInput";
import UnstyledButton from "@/components/core/UnstyledButton";
import { sizing, type InputSize } from "@/theme/sizeTokens";
import styles from "@/components/core/ColorPicker/ColorPicker.module.sass";

const DEFAULT_COLOR = "var(--mantine-color-primary-6)";
const PARENT_CHANGE_DEBOUNCE_MS = 200;

const DEFAULT_POPOVER_PROPS = {
  position: "bottom-end",
  withArrow: false,
  withinPortal: true,
} as const satisfies Omit<PopoverProps, "children" | "opened">;

type PickerOwnedProps = "format" | "value" | "defaultValue" | "onChange" | "onChangeEnd";

export type ColorPickerProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: InputSize;
  popoverProps?: Omit<PopoverProps, "children" | "opened">;
} & Omit<MantineColorPickerProps, PickerOwnedProps | "size">;

/** Strip non-hex characters, uppercase, cap at 6 digits. */
export function extractHexDigits(raw: string): string {
  return raw
    .replace(/[^0-9a-f]/gi, "")
    .toUpperCase()
    .slice(0, 6);
}

/** Expand 3-digit or accept 6-digit hex into `#RRGGBB`, else null. */
export function toHexColor(digits: string): string | null {
  if (digits.length === 3) {
    const [r, g, b] = digits;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (digits.length === 6) {
    return `#${digits}`;
  }
  return null;
}

/** From a stored color value → uppercase hex digits for display (no `#`). */
export function toDigitsDisplay(value: string): string {
  return extractHexDigits(value);
}

function resolveTriggerSize(size: InputSize): number {
  return sizing.actionIcon[size];
}

function resolveIconSize(size: InputSize): number {
  return Math.max(10, Math.round(sizing.actionIcon[size] * 0.65));
}

function ColorPicker({
  value,
  defaultValue = "",
  onChange,
  size = "md",
  popoverProps = DEFAULT_POPOVER_PROPS,
  swatches,
  swatchesPerRow,
  withPicker = true,
  fullWidth = true,
  ...pickerProps
}: ColorPickerProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [localValue, setLocalValue] = useState(() => value ?? defaultValue);

  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const notifyParent = useDebouncedCallback((color: string) => {
    onChange?.(color);
  }, PARENT_CHANGE_DEBOUNCE_MS);

  const [hexDraft, setHexDraft] = useState(() => toDigitsDisplay(localValue));
  useEffect(() => {
    setHexDraft(toDigitsDisplay(localValue));
  }, [localValue]);

  const normalizedValue = toHexColor(toDigitsDisplay(localValue));
  const previewColor = normalizedValue ?? DEFAULT_COLOR;
  const pickerValue = normalizedValue ?? "#000000";
  const triggerPx = resolveTriggerSize(size);
  const iconPx = resolveIconSize(size);

  const commitHex = (next: string) => {
    const color = toHexColor(extractHexDigits(next));
    if (color !== null) {
      setLocalValue(color);
      setHexDraft(toDigitsDisplay(color));
      notifyParent(color);
    }
  };

  const handleHexInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = extractHexDigits(event.currentTarget.value);
    setHexDraft(digits);
    const color = toHexColor(digits);
    if (color !== null) {
      setLocalValue(color);
      notifyParent(color);
    }
  };

  const handleHexInputBlur = () => {
    const color = toHexColor(hexDraft);
    if (color !== null) {
      setLocalValue(color);
      setHexDraft(toDigitsDisplay(color));
      notifyParent(color);
      notifyParent.flush();
    } else {
      setHexDraft(toDigitsDisplay(localValue));
    }
  };

  const {
    onClose: popoverOnClose,
    classNames: popoverClassNames,
    ...restPopoverProps
  } = {
    ...DEFAULT_POPOVER_PROPS,
    ...popoverProps,
  };

  const popoverClassNamesObject =
    typeof popoverClassNames === "object" && popoverClassNames !== null
      ? popoverClassNames
      : undefined;

  const handlePopoverClose = () => {
    notifyParent.flush();
    close();
    popoverOnClose?.();
  };

  return (
    <Popover
      {...restPopoverProps}
      opened={opened}
      classNames={{
        ...popoverClassNamesObject,
        dropdown: classNames(styles.popoverDropdown, popoverClassNamesObject?.dropdown),
      }}
      onClose={handlePopoverClose}
    >
      <Popover.Target>
        <UnstyledButton
          type="button"
          className={classNames(styles.trigger)}
          onClick={toggle}
          style={{
            width: triggerPx,
            height: triggerPx,
            backgroundColor: previewColor,
          }}
        >
          <IconColorPicker className={styles.icon} size={iconPx} />
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown>
        <Box className={classNames(styles.dropdown)}>
          <MantineColorPicker
            {...pickerProps}
            fullWidth={fullWidth}
            format="hex"
            value={pickerValue}
            onChange={commitHex}
            withPicker={withPicker}
            {...(swatches !== undefined ? { swatches } : {})}
            {...(swatchesPerRow !== undefined ? { swatchesPerRow } : {})}
          />
          <TextInput
            size="sm"
            value={hexDraft}
            placeholder="000000"
            leftSection={<IconHash size={14} />}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
          />
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
}

ColorPicker.displayName = "ColorPicker";

export default ColorPicker;
export { ColorPicker };
