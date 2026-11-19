import { Combobox } from "@mantine/core";

import SIZE_DEFAULT from "../defaults/componentSize";

export default Combobox.extend({
  defaultProps: {
    offset: SIZE_DEFAULT.dropdownOffset,
  },
});
