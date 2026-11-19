export const REM_BASE_PX = 10;

function toRem(px: number): string {
  return `${px / REM_BASE_PX}rem`;
}

function mapPxToRem<const T extends Record<string, number>>(pxMap: T): Record<keyof T, string> {
  return Object.fromEntries(Object.entries(pxMap).map(([key, px]) => [key, toRem(px)])) as Record<
    keyof T,
    string
  >;
}

export default { toRem, mapPxToRem };
