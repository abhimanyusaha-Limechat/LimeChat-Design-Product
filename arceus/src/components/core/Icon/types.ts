import type icons from "assets/icons.json";

/** Icon size variants */
type IconSize = "tiny" | "small" | "normal" | "average" | "medium" | "large" | "larger";

/** Icon color variants */
type IconColor =
  // Semantic colours
  | "active"
  | "danger"
  | "default"
  | "inactive"
  | "primary"
  | "success"
  // Base colors (shaded)
  | "darkestgreen"
  | "darkestgrey"
  | "darkgrey"
  | "extraOrange"
  | "green"
  | "grey"
  | "lightestgrey"
  | "lightgrey"
  | "mediumred"
  | "red"
  | "semidarkgreen"
  | "sunriseYellow"
  | "textDark"
  | "textlightgrey"
  | "textyellowdark"
  | "white"
  // Stroke (outline) colors
  | "strokeBlue"
  | "strokeGreen"
  | "strokeGrey"
  | "strokeLightgrey"
  | "strokeRed"
  | "strokeSemidarkgreen"
  | "strokeTextDark"
  | "strokeWhite"
  | "strokeYellow"
  // Sroke and fill colors
  | "greenFilled"
  // Special colors
  | "instagram"
  | "facebook"
  | "whatsapp";

/** All styles for the Icon module */
type Styles = Record<IconSize | IconColor | "limeIcon" | "evenodd", string>;
type IconName = keyof typeof icons;
type IconProps = {
  name: IconName;
  cxStyle?: React.CSSProperties;
  description?: string;
  size?: IconSize;
  color?: string;
};

export type { IconProps, IconSize, IconColor, Styles as IconStyles, IconName };
