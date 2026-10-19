// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DiscoBall } from './DiscoBall';

vi.mock('./DiscoBallScene', () => ({ default: ({ mobile, reducedMotion, active }: { mobile: boolean; reducedMotion: boolean; active: boolean }) =>
  <div data-testid="mirror-scene" data-mobile={mobile} data-reduced-motion={reducedMotion} data-active={active} /> }));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it('keeps a decorative static tiled fallback when WebGL is unavailable', () => {
  vi.stubGlobal('WebGL2RenderingContext', undefined);
  const { container } = render(<DiscoBall />);
  expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  expect(container.querySelector('[class*="fallback"]')).toBeTruthy();
  expect(screen.queryByTestId('mirror-scene')).toBeNull();
  expect(container.querySelector('canvas')).toBeNull();
});

it('forwards mobile/reduced-motion preferences live and suspends rendering when the tab is hidden', async () => {
  vi.stubGlobal('WebGL2RenderingContext', class {});
  const media = new Map<string, EventTarget & { matches: boolean }>();
  vi.stubGlobal('matchMedia', (query: string) => {
    if (!media.has(query)) media.set(query, Object.assign(new EventTarget(), { matches: true }));
    return media.get(query);
  });
  render(<DiscoBall />);
  await act(async () => {});
  const scene = await screen.findByTestId('mirror-scene');
  expect(scene.getAttribute('data-mobile')).toBe('true');
  expect(scene.getAttribute('data-reduced-motion')).toBe('true');
  await act(async () => {
    const preference = media.get('(prefers-reduced-motion: reduce)')!;
    preference.matches = false; preference.dispatchEvent(new Event('change'));
  });
  expect(scene.getAttribute('data-reduced-motion')).toBe('false');
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
  expect(scene.getAttribute('data-active')).toBe('false');
});

it.each([
  { device: 'desktop', width: 1200, left: 535, top: 180 },
  { device: 'mobile', width: 375, left: 122.5, top: 74 },
])('anchors the chain to the ball on $device and updates it on resize/scroll', ({ width, left, top }) => {
  vi.stubGlobal('WebGL2RenderingContext', undefined);
  vi.stubGlobal('innerWidth', width);
  let bounds = { left, top, width: 130, height: 130 };
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => bounds as DOMRect);
  const { container, unmount } = render(<DiscoBall />);
  const chain = container.querySelector<HTMLElement>('[class*="chain"]')!;
  expect(chain.style.left).toBe(`${width / 2}px`);
  expect(chain.style.height).toBe(`${top / 2 + 65}px`);
  const viewport = container.querySelector<HTMLElement>('[class*="viewport"]')!;
  expect(viewport.style.transform).toBe(`translateY(-${top / 2}px)`);

  bounds = { left: 100, top: 90, width: 200, height: 200 };
  fireEvent.resize(window);
  expect(chain.style.left).toBe('200px');
  expect(chain.style.height).toBe('145px');
  expect(viewport.style.transform).toBe('translateY(-45px)');

  bounds = { ...bounds, top: -250 };
  fireEvent.scroll(window);
  expect(chain.style.height).toBe('0px');
  unmount();
});
