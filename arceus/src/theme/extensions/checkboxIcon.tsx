import type { CSSProperties, FC } from "react";
import { IconCheck, IconMinus } from "@tabler/icons-react";

type CheckboxIconProps = {
  indeterminate: boolean | undefined;
  className: string;
  style?: CSSProperties;
};

const ICON_STROKE = 2;

const CheckboxIcon: FC<CheckboxIconProps> = ({ indeterminate, className, style }) => {
  const Icon = indeterminate === true ? IconMinus : IconCheck;

  return <Icon aria-hidden style={style} stroke={ICON_STROKE} className={className} />;
};

export default CheckboxIcon;
