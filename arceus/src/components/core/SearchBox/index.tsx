import { TextInput as MantineTextInput, factory, useProps } from "@mantine/core";
import type { Factory, InputVariant, TextInputProps } from "@mantine/core";

import SIZE_DEFAULT from "@/theme/defaults/componentSize";
import SearchIcon from "@/components/core/SearchBox/SearchIcon";
import { getSearchBoxClassNames } from "@/components/core/SearchBox/searchBoxClassNames";
import styles from "@/components/core/SearchBox/SearchBox.module.sass";

export type SearchBoxStylesNames = "input";
export type SearchBoxProps = TextInputProps;

export type SearchBoxFactory = Factory<{
  props: SearchBoxProps;
  ref: HTMLInputElement;
  stylesNames: SearchBoxStylesNames;
  variant: InputVariant;
}>;

const defaultProps = {
  variant: "subtle",
  placeholder: "Search",
  size: SIZE_DEFAULT.size,
  radius: SIZE_DEFAULT.radius,
} satisfies Partial<SearchBoxProps>;

function resolveInputClassNames(
  variant: TextInputProps["variant"],
  classNames: TextInputProps["classNames"],
): NonNullable<TextInputProps["classNames"]> {
  if (typeof classNames === "function") {
    return classNames;
  }

  return getSearchBoxClassNames(variant, classNames);
}

export const SearchBox = factory<SearchBoxFactory>((_props, ref) => {
  const props = useProps("SearchBox", defaultProps, _props);
  const { size, variant, leftSection, classNames, ...others } = props;

  const mergedClassNames = resolveInputClassNames(variant, classNames);
  const hasCustomClassNames =
    variant === "subtle" || variant === "unstyled" || classNames !== undefined;

  return (
    <MantineTextInput
      ref={ref}
      size={size}
      variant={variant}
      leftSection={leftSection ?? <SearchIcon size={size} />}
      {...(hasCustomClassNames ? { classNames: mergedClassNames } : {})}
      {...others}
    />
  );
});

SearchBox.displayName = "SearchBox";
SearchBox.classes = { input: styles.input ?? "" };

export default SearchBox;
export { getSearchBoxClassNames } from "@/components/core/SearchBox/searchBoxClassNames";
