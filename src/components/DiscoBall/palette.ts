// Mirror colors stay local to the component and match the original site palette.
export const palette = {
  bg: '#2A2A2F',
  text: '#FAF7FA',
  muted: '#C2BDC7',
  silver: '#C9CCD1',
  pink: '#F7A1E3',
  periwinkle: '#8FA6FF',
  lavender: '#C4B5E8',
} as const;

export function cssColor(token: keyof typeof palette): string {
  return palette[token];
}
