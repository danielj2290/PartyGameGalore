// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Dial } from './Dial';

const spectrum = { id: 'test', left: 'Tiny party', right: 'Huge party' };
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('supports touch/pointer arc movement and an accessible native slider', () => {
  const change = vi.fn();
  vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 640, height: 340 } as DOMRect);
  render(<Dial spectrum={spectrum} guess={50} onChange={change} />);
  const dial = screen.getByRole('img');
  const slider = screen.getByRole('slider', { name: /Move the dial/ });
  expect(slider.getAttribute('aria-valuetext')).toBe('Around the middle');
  expect(screen.queryByTestId('wavelength-target')).toBeNull();
  fireEvent.change(slider, { target: { value: 75 } }); expect(change).toHaveBeenLastCalledWith(75);
  fireEvent.pointerDown(dial, { clientX: 53, clientY: 300, pointerId: 1 }); expect(change).toHaveBeenLastCalledWith(0);
  fireEvent.pointerMove(dial, { clientX: 320, clientY: 33, pointerId: 1 }); expect(change).toHaveBeenLastCalledWith(50);
  fireEvent.pointerMove(dial, { clientX: 587, clientY: 300, pointerId: 1 }); expect(change).toHaveBeenLastCalledWith(100);
  fireEvent.pointerUp(dial, { pointerId: 1 });
  change.mockClear(); fireEvent.pointerMove(dial, { clientX: 320, clientY: 33, pointerId: 1 }); expect(change).not.toHaveBeenCalled();
});

it('removes target graphics when hidden and removes controls when a guess is locked', () => {
  const { rerender } = render(<Dial spectrum={spectrum} target={50} />);
  expect(screen.getByTestId('wavelength-target')).toBeTruthy();
  rerender(<Dial spectrum={spectrum} guess={40} />);
  expect(screen.queryByTestId('wavelength-target')).toBeNull(); expect(screen.queryByRole('slider')).toBeNull();
  expect(screen.getByRole('img').getAttribute('aria-labelledby')).toBeTruthy();
});
