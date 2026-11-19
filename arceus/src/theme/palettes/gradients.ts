import COLOR_PALETTES from "@/theme/palettes/colors";

const AI_GRADIENT = {
  from: "primary",
  to: "secondary",
  deg: 135,
} as const;

const AI_GRADIENT_CSS = `linear-gradient(${AI_GRADIENT.deg}deg, ${COLOR_PALETTES.primary[6]} 0%, ${COLOR_PALETTES.secondary[6]} 100%)`;

const WHATSAPP_GRADIENT_CSS = `linear-gradient(90deg, ${COLOR_PALETTES.whatsapp[6]} 0%, ${COLOR_PALETTES.whatsapp[7]} 100%)`;

const INSTAGRAM_GRADIENT_CSS = `linear-gradient(90deg, ${COLOR_PALETTES.instagram[6]} 0%, ${COLOR_PALETTES.instagram[7]} 100%)`;

export { AI_GRADIENT, AI_GRADIENT_CSS, WHATSAPP_GRADIENT_CSS, INSTAGRAM_GRADIENT_CSS };
