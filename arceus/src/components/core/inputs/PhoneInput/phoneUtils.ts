import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

import type {
  CountryOption,
  PhoneInputChangePayload,
} from "@/components/core/inputs/PhoneInput/types";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryIsoToFlag(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function buildCountryOptions(): CountryOption[] {
  return getCountries()
    .map((iso2) => {
      const dialCode = getCountryCallingCode(iso2);
      const name = regionNames.of(iso2) ?? iso2;

      return {
        value: iso2,
        label: `+${dialCode}`,
        name,
        dialCode,
        flag: countryIsoToFlag(iso2),
        searchLabel: `${name} +${dialCode} ${iso2}`,
      };
    })
    .sort((a, b) => a.searchLabel.localeCompare(b.searchLabel));
}

export function normalizeDefaultCountry(country?: string): CountryCode {
  const upper = (country ?? "IN").toUpperCase();
  const countries = getCountries();
  if (countries.includes(upper as CountryCode)) {
    return upper as CountryCode;
  }
  return "IN";
}

export function parseStoredValue(
  value: string | undefined,
  defaultCountry: CountryCode,
): { country: CountryCode; national: string } {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) {
    return { country: defaultCountry, national: "" };
  }

  const parsed = parsePhoneNumberFromString(`+${digits}`);
  if (parsed?.country != null && parsed.nationalNumber !== "") {
    return { country: parsed.country, national: parsed.nationalNumber };
  }

  const options = buildCountryOptions();
  const byDialLength = [...options].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const matched = byDialLength.find((option) => digits.startsWith(option.dialCode));
  if (matched) {
    return {
      country: matched.value as CountryCode,
      national: digits.slice(matched.dialCode.length),
    };
  }

  return { country: defaultCountry, national: digits };
}

export function buildPhonePayload(country: CountryCode, national: string): PhoneInputChangePayload {
  const dialCode = getCountryCallingCode(country);
  const raw = national.replace(/\D/g, "");

  return {
    country,
    dialCode,
    raw,
    value: raw ? `${dialCode}${raw}` : "",
  };
}

export function checkPhoneValidity(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return true;
  }

  try {
    return isValidPhoneNumber(`+${digits}`);
  } catch {
    return false;
  }
}
