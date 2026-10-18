// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { FittedWord } from './FittedWord';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('fits the complete title into a shrinking card and recalculates for shorter words', () => {
  let width = 500;
  let height = 130;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width, height }) as DOMRect);
  // jsdom cannot lay out fonts. Model wrapping to exercise the measuring search.
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => Math.round(width));
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
    const font = parseFloat(this.style.fontSize) || 1;
    const lines = Math.ceil((this.textContent?.length || 1) * font * .55 / width);
    return Math.ceil(lines * font * 1.04);
  });
  const title = 'The Chronicles of Narnia: The Lion, the Witch and the Wardrobe';
  const { rerender } = render(<FittedWord text={title} fit />);
  const word = screen.getByTestId('heads-up-word');
  const originalSize = parseFloat(word.style.fontSize);
  expect(word.textContent).toBe(title);
  expect(word.scrollHeight).toBeLessThanOrEqual(height);
  expect(originalSize).toBeGreaterThan(20);
  height = 60; width = 460.75;
  window.dispatchEvent(new Event('resize'));
  expect(parseFloat(word.style.fontSize)).toBeLessThan(originalSize);
  expect(word.scrollHeight).toBeLessThanOrEqual(height);
  expect(word.textContent).toBe(title);
  const longSize = parseFloat(word.style.fontSize);
  expect(longSize).toBeGreaterThan(10);
  rerender(<FittedWord text="Cat" fit />);
  expect(parseFloat(word.style.fontSize)).toBeGreaterThan(longSize);
  expect(word.scrollHeight).toBeLessThanOrEqual(height);
});
