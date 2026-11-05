// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../app/App';

beforeEach(() => { window.history.replaceState(null, '', '/'); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('rules-only games', () => {
  it.each([
    ['Chain Link', '/chain-link/rules', 'GOLF'],
    ['Imposter', '/imposter/rules', 'Ruleset shown:'],
    ["Liar's UNO", '/liars-uno/rules', "7's Swap"],
  ])('Play %s opens its rules page with gameplay marked coming soon', async (title, path, marker) => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: `Play ${title}` }));
    expect(window.location.hash).toBe(`#${path}`);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(title);
    expect(screen.getAllByText(new RegExp(marker)).length).toBeGreaterThan(0);
    for (const heading of ['Setup', 'How to play', 'How to win']) expect(screen.getByRole('heading', { level: 2, name: heading })).toBeTruthy();
    expect((screen.getByRole('button', { name: /Start game/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Coming soon/)).toBeTruthy();
    await user.click(screen.getAllByRole('link', { name: /Back to home/ })[0]);
    expect(screen.getByRole('button', { name: `Play ${title}` })).toBeTruthy();
  });
});
