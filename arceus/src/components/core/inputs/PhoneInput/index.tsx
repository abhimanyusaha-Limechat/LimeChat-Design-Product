import { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import type { CountryCode } from "libphonenumber-js";
import type { MantineSize, OptionsFilter } from "@mantine/core";
import { Box, InputDescription } from "@mantine/core";

import Label from "@/components/core/Label";
import { Select } from "@/components/core/dropdowns/Select";
import NumberInput from "@/components/core/inputs/NumberInput";
import type { PhoneInputProps } from "@/components/core/inputs/PhoneInput/types";
import {
  buildCountryOptions,
  buildPhonePayload,
  checkPhoneValidity,
  normalizeDefaultCountry,
  parseStoredValue,
} from "@/components/core/inputs/PhoneInput/phoneUtils";
import styles from "@/components/core/inputs/PhoneInput/PhoneInput.module.sass";
import Text from "@/components/core/Text";

const COUNTRY_OPTIONS = buildCountryOptions();

const COUNTRY_SELECT_WIDTH: Record<MantineSize, number> = {
  xs: 70,
  sm: 80,
  md: 100,
  lg: 110,
  xl: 130,
};

function getCountrySelectWidth(size: MantineSize): number {
  return COUNTRY_SELECT_WIDTH[size] ?? COUNTRY_SELECT_WIDTH.sm;
}

const countryFilter: OptionsFilter = ({ options, search }) => {
  const query = search.trim().toLowerCase();
  if (!query) {
    return options;
  }

  return options.filter((option) => {
    if (typeof option !== "object" || option === null || !("value" in option)) {
      return true;
    }

    const match = COUNTRY_OPTIONS.find((item) => item.value === option.value);
    return match?.searchLabel.toLowerCase().includes(query) ?? true;
  });
};

function PhoneInput({
  value = "",
  defaultCountry = "IN",
  onChange,
  onBlur,
  onValidityChange,
  label,
  description,
  error,
  required = false,
  disabled = false,
  placeholder,
  size = "sm",
  className,
  validate = true,
  onKeyDown,
  comboboxProps,
}: PhoneInputProps) {
  const resolvedDefaultCountry = normalizeDefaultCountry(defaultCountry);

  const parsed = useMemo(
    () => parseStoredValue(value, resolvedDefaultCountry),
    [value, resolvedDefaultCountry],
  );

  const [country, setCountry] = useState<CountryCode>(parsed.country);
  const [national, setNational] = useState<string>(parsed.national);

  useEffect(() => {
    setCountry(parsed.country);
    setNational(parsed.national);
  }, [parsed.country, parsed.national]);

  const emitChange = useCallback(
    (nextCountry: CountryCode, nextNational: string) => {
      const payload = buildPhonePayload(nextCountry, nextNational);
      onChange?.(payload);

      if (validate) {
        onValidityChange?.(checkPhoneValidity(payload.value));
      }
    },
    [onChange, onValidityChange, validate],
  );

  useEffect(() => {
    if (validate) {
      onValidityChange?.(checkPhoneValidity(value));
    }
  }, [value, validate, onValidityChange]);

  const handleCountryChange = (next: string | null) => {
    if (next === null) {
      return;
    }

    const nextCountry = normalizeDefaultCountry(next);
    setCountry(nextCountry);
    emitChange(nextCountry, national);
  };

  const handleNationalChange = (next: string | number) => {
    const nextNational = String(next).replace(/\D/g, "");
    setNational(nextNational);
    emitChange(country, nextNational);
  };

  const countrySelectWidth = getCountrySelectWidth(size);
  const rootClassName = cn(styles.root, className);
  const rowClassName = styles.row ?? "";
  const countryClassName = styles.country ?? "";
  const numberClassName = styles.number ?? "";

  return (
    <Box className={rootClassName}>
      {label != null && label !== "" && <Label required={required}>{label}</Label>}
      {description != null && description !== "" && (
        <InputDescription mb="xs">{description}</InputDescription>
      )}
      <Box className={rowClassName}>
        <Select
          searchable
          disabled={disabled}
          size={size}
          data={COUNTRY_OPTIONS}
          value={country}
          filter={countryFilter}
          comboboxProps={{
            withinPortal: true,
            width: 240,
            position: "bottom-start",
            classNames: { dropdown: styles.dropdown ?? "" },
            ...comboboxProps,
          }}
          className={countryClassName}
          w={countrySelectWidth}
          onChange={handleCountryChange}
          renderOption={({ option }) => {
            const item = COUNTRY_OPTIONS.find((entry) => entry.value === option.value);
            if (!item) return option.label;

            return (
              <Text variant="body-3" truncate w={200}>
                {`(${item.label}) ${item.name}`}
              </Text>
            );
          }}
        />
        <NumberInput
          hideControls
          allowDecimal={false}
          allowNegative={false}
          disabled={disabled}
          size={size}
          value={national}
          {...(error !== undefined ? { error } : {})}
          {...(placeholder !== undefined ? { placeholder } : {})}
          className={numberClassName}
          {...(onBlur !== undefined ? { onBlur } : {})}
          {...(onKeyDown !== undefined ? { onKeyDown } : {})}
          onChange={handleNationalChange}
        />
      </Box>
    </Box>
  );
}

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
export { PhoneInput };
export type {
  PhoneInputProps,
  PhoneInputChangePayload,
} from "@/components/core/inputs/PhoneInput/types";
