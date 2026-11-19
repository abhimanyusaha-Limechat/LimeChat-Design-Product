import type { MantineThemeComponent } from "@mantine/core";

import actionIconThemeExtension from "./actionIcon.extension";
import avatarThemeExtension from "./avatar.extension";
import badgeThemeExtension from "./badge.extension";
import buttonThemeExtension from "./button.extension";
import checkboxThemeExtension from "./checkbox.extension";
import closeButtonThemeExtension from "./closeButton.extension";
import comboboxThemeExtension from "./combobox.extension";
import dividerThemeExtension from "./divider.extension";
import hintThemeExtension from "./hint.extension";
import inputThemeExtension, {
  inputWrapperThemeExtension,
  multiSelectThemeExtension,
  numberInputThemeExtension,
  passwordInputThemeExtension,
  selectThemeExtension,
} from "./input";
import loaderThemeExtension from "./loader.extension";
import menuThemeExtension, { menuSubThemeExtension } from "./menu.extension";
import modalThemeExtension from "./modal.extension";
import paginationThemeExtension from "./pagination.extension";
import pillThemeExtension from "./pill.extension";
import popoverThemeExtension from "./popover.extension";
import progressThemeExtension from "./progress.extension";
import radioThemeExtension from "./radio.extension";
import searchBoxThemeExtension from "./searchBox.extension";
import sliderThemeExtension from "./slider.extension";
import stepperThemeExtension from "./stepper.extension";
import switchThemeExtension from "./switch.extension";
import tabsThemeExtension from "./tabs.extension";
import themeIconThemeExtension from "./themeIcon.extension";
import tooltipThemeExtension from "./tooltip.extension";

const themeExtensions: Record<string, MantineThemeComponent> = {
  Modal: modalThemeExtension,
  Menu: menuThemeExtension,
  MenuSub: menuSubThemeExtension,
  Popover: popoverThemeExtension,
  Hint: hintThemeExtension,
  Combobox: comboboxThemeExtension,
  Select: selectThemeExtension,
  MultiSelect: multiSelectThemeExtension,
  PasswordInput: passwordInputThemeExtension,
  NumberInput: numberInputThemeExtension,
  Input: inputThemeExtension,
  InputWrapper: inputWrapperThemeExtension,
  SearchBox: searchBoxThemeExtension,
  Button: buttonThemeExtension,
  ActionIcon: actionIconThemeExtension,
  CloseButton: closeButtonThemeExtension,
  ThemeIcon: themeIconThemeExtension,
  Checkbox: checkboxThemeExtension,
  Radio: radioThemeExtension,
  Switch: switchThemeExtension,
  Tabs: tabsThemeExtension,
  Badge: badgeThemeExtension,
  Pill: pillThemeExtension,
  Pagination: paginationThemeExtension,
  Stepper: stepperThemeExtension,
  Slider: sliderThemeExtension,
  Progress: progressThemeExtension,
  Divider: dividerThemeExtension,
  Loader: loaderThemeExtension,
  Avatar: avatarThemeExtension,
  Tooltip: tooltipThemeExtension,
};

export default themeExtensions;
