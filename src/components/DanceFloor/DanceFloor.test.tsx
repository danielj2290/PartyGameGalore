// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DanceFloor } from './DanceFloor';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function setUpCanvas(matches: (query: string) => boolean) {
  const frames: FrameRequestCallback[] = [];
  const fillRect = vi.fn();
  vi.stubGlobal('CanvasRenderingContext2D', class {});
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('matchMedia', (query: string) => Object.assign(new EventTarget(), { matches: matches(query) }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect } as unknown as RenderingContext);
  const runFrame = (time: number) => frames.splice(0).forEach(callback => callback(time));
  return { frames, fillRect, runFrame };
}

it('keeps animating on desktop', () => {
  const { frames, fillRect, runFrame } = setUpCanvas(() => false);
  render(<DanceFloor />);
  runFrame(100);
  expect(fillRect).toHaveBeenCalled();
  expect(frames).toHaveLength(1);
});

it.each(['(max-width: 700px)', '(pointer: coarse)', '(prefers-reduced-motion: reduce)'])('paints once and stops for %s', condition => {
  const { frames, fillRect, runFrame } = setUpCanvas(query => query.includes(condition));
  render(<DanceFloor />);
  runFrame(100);
  expect(fillRect).toHaveBeenCalled();
  expect(frames).toHaveLength(0);
});
