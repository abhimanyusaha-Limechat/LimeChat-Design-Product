import type { ComboboxItem, ComboboxLikeRenderOptionInput } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

const CHECK_ICON_SIZE = 16;
const CHECK_ICON_STROKE = 2;

export default function renderSelectOption({
  option,
  checked,
}: ComboboxLikeRenderOptionInput<ComboboxItem>) {
  return (
    <>
      <span>{option.label}</span>
      {checked === true ? <IconCheck size={CHECK_ICON_SIZE} stroke={CHECK_ICON_STROKE} /> : null}
    </>
  );
}
