import FONT_COLORS from "@/theme/palettes/fonts";
import { colorsTuple, type MantineColorsTuple } from "@mantine/core";

const GREEN_PALETTE = [
  "#FAFDF6",
  "#E5F7CF",
  "#CDF0A2",
  "#B6EA76",
  "#9EE34A",
  "#86D822",
  "#6BAC1B",
  "#508014",
  "#34540D",
  "#192806",
] as const satisfies MantineColorsTuple;

const PRIMARY_PALETTE = [...GREEN_PALETTE] as const satisfies MantineColorsTuple;

const BLUE_PALETTE = [
  "#EEF9FF",
  "#CBE4F1",
  "#A7CFE4",
  "#83BAD6",
  "#5FA5C6",
  "#3B90B6",
  "#097BA3",
  "#005A7D",
  "#003B56",
  "#001F32",
] as const satisfies MantineColorsTuple;

const SECONDARY_PALETTE = [...BLUE_PALETTE] as const satisfies MantineColorsTuple;

const GRAY_PALETTE = [
  "#FAFAFA",
  "#F5F5F5",
  "#F0F0F0",
  "#D9D9D9",
  "#BFBFBF",
  "#8C8C8C",
  "#595959",
  "#434343",
  "#262626",
  "#1F1F1F",
] as const satisfies MantineColorsTuple;

const SUCCESS_PALETTE = [
  "#EDFBEF",
  "#CDEED2",
  "#ACE0B4",
  "#8AD297",
  "#67C37B",
  "#44B462",
  "#16A34A",
  "#007729",
  "#004C0D",
  "#002500",
] as const satisfies MantineColorsTuple;

const RED_PALETTE = [
  "#FCF3F3",
  "#F9E2E2",
  "#F5C7C8",
  "#F0A3A5",
  "#EB7A7E",
  "#E85E63",
  "#E5484D",
  "#DA1B21",
  "#A1171C",
  "#570F12",
] as const satisfies MantineColorsTuple;

const ERROR_PALETTE = [...RED_PALETTE] as const satisfies MantineColorsTuple;

const YELLOW_PALETTE = [
  "#FCF9F3",
  "#FAEFDB",
  "#F6E0B6",
  "#F2CF8C",
  "#EEBB5D",
  "#EBAE3D",
  "#E8A325",
  "#C68610",
  "#8B5F0E",
  "#47320A",
] as const satisfies MantineColorsTuple;

const WARNING_PALETTE = [...YELLOW_PALETTE] as const satisfies MantineColorsTuple;

const INFO_PALETTE = [
  "#EDF7FF",
  "#C9E0FF",
  "#A4C8FF",
  "#81B0FF",
  "#6096FF",
  "#417DFA",
  "#2563EB",
  "#0E44BA",
  "#012886",
  "#000E53",
] as const satisfies MantineColorsTuple;

const WHATSAPP_PALETTE = [
  "#EEFAF7",
  "#CCE8E2",
  "#AAD6CE",
  "#87C4B9",
  "#64B2A5",
  "#409F91",
  "#128C7E",
  "#00675B",
  "#00443B",
  "#00231D",
] as const satisfies MantineColorsTuple;

const INSTAGRAM_PALETTE = [
  "#FFF0F9",
  "#FFD1E5",
  "#F8B2D2",
  "#EF92BE",
  "#E373AB",
  "#D45498",
  "#C13584",
  "#941661",
  "#660040",
  "#3B0021",
] as const satisfies MantineColorsTuple;

const FACEBOOK_PALETTE = [
  "#ECF8FF",
  "#C9E4FF",
  "#A5CFFF",
  "#82BAFF",
  "#5FA4FF",
  "#3D8DFF",
  "#1877F2",
  "#0052BD",
  "#003185",
  "#00124F",
] as const satisfies MantineColorsTuple;

const VIOLET_PALETTE = [
  "#FCF2FF",
  "#E9D1FF",
  "#D7B0FF",
  "#C58DFF",
  "#B36AF8",
  "#A045EC",
  "#8C10DA",
  "#6C00AE",
  "#4A007C",
  "#2A004B",
] as const satisfies MantineColorsTuple;

const ORANGE_PALETTE = [
  "#FFF4E6",
  "#FFE8CC",
  "#FFD8A8",
  "#FFC078",
  "#FFA94D",
  "#FF922B",
  "#FD7E14",
  "#F76707",
  "#E8590C",
  "#D9480F",
] as const satisfies MantineColorsTuple;

const DARK_PALETTE = colorsTuple(FONT_COLORS.DARK);
const LIGHT_PALETTE = colorsTuple(FONT_COLORS.LIGHT);

const COLOR_PALETTES = {
  primary: PRIMARY_PALETTE,
  secondary: SECONDARY_PALETTE,
  green: GREEN_PALETTE,
  blue: BLUE_PALETTE,
  gray: GRAY_PALETTE,
  success: SUCCESS_PALETTE,
  red: RED_PALETTE,
  error: ERROR_PALETTE,
  yellow: YELLOW_PALETTE,
  warning: WARNING_PALETTE,
  info: INFO_PALETTE,
  whatsapp: WHATSAPP_PALETTE,
  instagram: INSTAGRAM_PALETTE,
  facebook: FACEBOOK_PALETTE,
  violet: VIOLET_PALETTE,
  orange: ORANGE_PALETTE,
  dark: DARK_PALETTE,
  light: LIGHT_PALETTE,
} as const satisfies Record<string, MantineColorsTuple>;

export type PaletteColorKeys = keyof typeof COLOR_PALETTES;

export default COLOR_PALETTES;
