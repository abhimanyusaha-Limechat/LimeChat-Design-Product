import { Divider } from "@mantine/core";

import { componentSizeVars } from "../tokens/sizes";

const dividerSizeVars = componentSizeVars("Divider");

export default Divider.extend({
  vars: () => ({
    root: {
      ...dividerSizeVars().root,
      "--divider-color": "var(--mantine-color-gray-3)",
    },
  }),
});
