import SIZE_DEFAULT from "@/theme/defaults/componentSize";

const HINT_DEFAULT_PROPS = {
  enabled: true,
  duration: 2_500,
  openDelay: 0,
  position: "bottom" as const,
  offset: SIZE_DEFAULT.dropdownOffset,
  withArrow: true,
  withinPortal: true,
  closeOnClickOutside: false,
  trapFocus: false,
  shadow: "md" as const,
  radius: SIZE_DEFAULT.radius,
  color: "dark" as const,
  transitionProps: { transition: "fade" as const, duration: 150 },
};

export default HINT_DEFAULT_PROPS;
