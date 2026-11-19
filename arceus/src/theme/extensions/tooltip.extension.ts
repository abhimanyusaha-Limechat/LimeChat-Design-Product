import { Tooltip } from "@mantine/core";

export default Tooltip.extend({
  defaultProps: {
    radius: "2xs",
  },
  vars: (_theme) => ({
    tooltip: {
      "--tooltip-bg": "var(--mantine-color-dark)",
      "--tooltip-color": "var(--mantine-color-white)",
    }
  }),
});
