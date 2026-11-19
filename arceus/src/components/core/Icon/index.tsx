

import icons from "assets/icons.json";
import styles from "@/components/core/Icon/Icon.module.sass";
import type { IconStyles, IconColor, IconProps } from "@/components/core/Icon/types";

const typedStyles = styles as IconStyles;

function Icon(props: IconProps): JSX.Element {
  const { name, cxStyle, size = "normal", color = "default", description } = props;

  const iconClass = () => {
    let iconStyle = color.split(" ");
    iconStyle = iconStyle.map((val) => typedStyles[val as IconColor]);
    iconStyle.push(typedStyles[size]);
    return iconStyle.join(" ");
  };

  return (
    <span className={styles["lime-icon"]}>
      <svg
        textAnchor="middle"
        style={cxStyle}
        viewBox="0 0 24 24"
        className={iconClass()}
        role="img"
      >
        <desc>{description}</desc>
        <path d={icons[name]} />
      </svg>
    </span>
  );
}

Icon.displayName = "Icon";

export default Icon;
export { Icon };
export type {
  IconProps,
  IconSize,
  IconColor,
  IconStyles,
  IconName,
} from "@/components/core/Icon/types";
