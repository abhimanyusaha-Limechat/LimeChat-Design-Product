import SIZE_DEFAULT from "../defaults/componentSize";
import SearchBox, { getSearchBoxClassNames } from "../../components/core/SearchBox";

const defaultProps = {
  variant: "subtle" as const,
  placeholder: "Search",
  size: SIZE_DEFAULT.size,
  radius: SIZE_DEFAULT.radius,
};

export default SearchBox.extend({
  defaultProps,
  classNames: (_theme, props) => getSearchBoxClassNames(props.variant, props.classNames),
});
