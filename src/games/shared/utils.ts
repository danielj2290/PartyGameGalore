export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Emit one current cue, never a burst of overdue sounds after a delayed tick.
export function cueBetween(previous: number, current: number): 'warning' | 'countdown' | 'end' | null {
  if (current === 0 && previous > 0) return 'end';
  if (current >= 1 && current <= 5 && previous > current) return 'countdown';
  if (previous > 10 && current <= 10 && current > 5) return 'warning';
  return null;
}
