import { Button } from "@mantine/core";

import SIZE_DEFAULT from "../defaults/componentSize";
import { bindActiveSizeVars, buildButtonLineHeightVars, componentSizeVars } from "../tokens/sizes";

const buttonSizeVars = componentSizeVars("Button");
const buttonLineHeightVars = buildButtonLineHeightVars();

export default Button.extend({
  defaultProps: {
    size: SIZE_DEFAULT.size,
    radius: SIZE_DEFAULT.radius,
  },
  vars: (_theme, props) => ({
    root: bindActiveSizeVars(
      {
        ...buttonSizeVars().root,
        ...buttonLineHeightVars,
      },
      ["--button-lh"],
      props.size,
    ),
  }),
  styles: {
    root: {
      fontWeight: 700,
      lineHeight: "var(--button-lh)",
    },
  },
});
