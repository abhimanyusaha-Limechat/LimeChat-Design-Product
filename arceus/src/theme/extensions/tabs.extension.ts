import { Tabs } from "@mantine/core";

import styles from "../../components/core/Tabs/Tabs.module.sass";

export default Tabs.extend({
  styles: {
    root: {
      "--tab-border-color": "var(--mantine-color-gray-3)",
    },
  },
  classNames: {
    root: styles.root ?? "",
    tab: styles.tab ?? "",
  },
});
