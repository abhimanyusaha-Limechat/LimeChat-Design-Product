import { IconSearch } from "@tabler/icons-react";
import type { MantineSize } from "@mantine/core";

const SEARCH_ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const satisfies Record<string, number>;

const DEFAULT_SEARCH_ICON_SIZE = SEARCH_ICON_SIZES.sm;

type SearchIconProps = {
  size?: MantineSize | (string & {});
};

function SearchIcon({ size = "sm" }: SearchIconProps) {
  const iconSize =
    size in SEARCH_ICON_SIZES
      ? SEARCH_ICON_SIZES[size as keyof typeof SEARCH_ICON_SIZES]
      : DEFAULT_SEARCH_ICON_SIZE;

  return <IconSearch size={iconSize} stroke={1.5} color="var(--mantine-color-dimmed)" />;
}

export default SearchIcon;
