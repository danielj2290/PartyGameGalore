// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { games } from '../../games/registry';
import { GameGrid } from './GameGrid';

afterEach(cleanup);
const playButtons = () => screen.getAllByRole('button', { name: /^Play / }).map(button => button.getAttribute('aria-label'));

it('shows three games in one row and flips through the rest with the arrows, dots, and keyboard', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><GameGrid /></MemoryRouter>);
  const previous = screen.getByRole('button', { name: 'Previous games' }) as HTMLButtonElement;
  const next = screen.getByRole('button', { name: 'Next games' }) as HTMLButtonElement;
  expect(playButtons()).toEqual(games.slice(0, 3).map(game => `Play ${game.title}`));
  expect(previous.disabled).toBe(true);
  expect(screen.getByText(`Showing games 1–3 of ${games.length}`)).toBeTruthy();

  await user.click(next);
  expect(playButtons()).toEqual(games.slice(1, 4).map(game => `Play ${game.title}`));
  expect(previous.disabled).toBe(false);

  await user.click(screen.getAllByRole('button', { name: /^Show games/ }).at(-1)!);
  expect(playButtons()).toEqual(games.slice(-3).map(game => `Play ${game.title}`));
  expect(next.disabled).toBe(true);
  await user.click(next);
  expect(playButtons()).toEqual(games.slice(-3).map(game => `Play ${game.title}`));

  fireEvent.keyDown(next, { key: 'ArrowLeft' });
  expect(playButtons()).toEqual(games.slice(-4, -1).map(game => `Play ${game.title}`));
  // Off-screen cards cannot be reached with Tab.
  expect(screen.getAllByRole('group', { hidden: true }).filter(slide => slide.hasAttribute('inert'))).toHaveLength(games.length - 3);
});
