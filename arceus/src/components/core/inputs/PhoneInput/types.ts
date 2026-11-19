import type { KeyboardEventHandler, ReactNode } from "react";
import type { ComboboxProps, MantineSize } from "@mantine/core";

export type PhoneInputChangePayload = {
  /** Full digits without '+', e.g. "918278328378" */
  value: string;
  /** Calling code without '+', e.g. "91" */
  dialCode: string;
  /** National number digits only */
  raw: string;
  /** ISO 3166-1 alpha-2, e.g. "IN" */
  country: string;
};

export type PhoneInputProps = {
  value?: string;
  defaultCountry?: string;
  onChange?: (payload: PhoneInputChangePayload) => void;
  onBlur?: () => void;
  onValidityChange?: (valid: boolean) => void;
  label?: ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  size?: MantineSize;
  className?: string;
  validate?: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  comboboxProps?: ComboboxProps;
};

export type CountryOption = {
  value: string;
  label: string;
  name: string;
  dialCode: string;
  flag: string;
  searchLabel: string;
};
