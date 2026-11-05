import { expect, it } from 'vitest';
import { createFramePacer } from './framePacer';

it.each([
  { fps: 30, refresh: 60 },
  { fps: 30, refresh: 144 },
  { fps: 20, refresh: 60 },
  { fps: 20, refresh: 144 },
])('holds $fps fps on a $refresh Hz display', ({ fps, refresh }) => {
  const due = createFramePacer(fps);
  const seconds = 10;
  let drawn = 0;
  for (let frame = 1; frame <= refresh * seconds; frame++) {
    if (due(frame * 1000 / refresh)) drawn++;
  }
  expect(Math.abs(drawn - fps * seconds)).toBeLessThanOrEqual(1);
});

it('draws every frame on a display slower than the target rate', () => {
  const due = createFramePacer(30);
  const results = [50, 100, 150].map(due);
  expect(results).toEqual([true, true, true]);
});
