// @vitest-environment jsdom
import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../app/App';
import { GameAudio } from './audio';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date', 'performance'] });
  window.history.replaceState(null, '', '/');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(GameAudio.prototype, 'unlock').mockImplementation(() => {});
  vi.spyOn(GameAudio.prototype, 'play').mockImplementation(() => {});
  // jsdom has no top layer. Real-browser dialog layout/focus trapping needs manual QA.
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
const launch = () => {
  const user = userEvent.setup();
  render(<StrictMode><App /></StrictMode>);
  return user;
};
const tick = async (milliseconds: number) => { await act(async () => { vi.advanceTimersByTime(milliseconds); }); };

async function configure() {
  const user = launch();
  await user.click(screen.getByRole('button', { name: 'Play Charades' }));
  expect(screen.getByText('Two teams. One actor. Guess before time runs out.')).toBeTruthy();
  await user.click(screen.getByRole('link', { name: /Next: Settings/ }));
  expect((screen.getByLabelText(/^Time per turn/) as HTMLSelectElement).value).toBe('60');
  expect((screen.getByLabelText(/^Skips per turn/) as HTMLSelectElement).value).toBe('unlimited');
  expect((screen.getByLabelText(/^Number of rounds/) as HTMLSelectElement).value).toBe('3');
  expect((screen.getByLabelText(/^Word difficulty/) as HTMLSelectElement).value).toBe('medium');
  expect((screen.getByLabelText(/^Starting team/) as HTMLSelectElement).value).toBe('random');
  await user.selectOptions(screen.getByLabelText(/^Time per turn/), '30');
  await user.selectOptions(screen.getByLabelText(/^Skips per turn/), '1');
  await user.selectOptions(screen.getByLabelText(/^Number of rounds/), '1');
  await user.selectOptions(screen.getByLabelText(/^Starting team/), '1');
  await user.selectOptions(screen.getByLabelText(/^Word difficulty/), 'easy');
  await user.click(screen.getByRole('button', { name: /Start game/ }));
  return user;
}

describe('Charades screens', () => {
  it('plays a complete match, corrects outcomes, shows results, replays with settings, and exits home', async () => {
    const user = await configure();
    expect(screen.getByText(/Keep the word hidden from your team/)).toBeTruthy();
    await tick(60000);
    expect(screen.getByRole('button', { name: /Start turn/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Start turn/ }));
    const firstWord = document.querySelector('[aria-live="polite"][aria-atomic="true"]')?.textContent;
    expect(firstWord).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Correct/ }));
    await user.click(screen.getByRole('button', { name: /^Skip/ }));
    expect((screen.getByRole('button', { name: /^Skip/ }) as HTMLButtonElement).disabled).toBe(true);
    const word = document.querySelector('[aria-live="polite"][aria-atomic="true"]')!.textContent!;
    await user.click(screen.getByRole('button', { name: /Pause/ }));
    expect(screen.queryByText(word)).toBeNull();
    expect((screen.getByRole('button', { name: /Correct/ }) as HTMLButtonElement).disabled).toBe(true);
    await tick(60000);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Reset turn' }));
    await user.click(screen.getByRole('button', { name: 'Keep turn paused' }));
    await user.click(screen.getByRole('button', { name: /Resume turn/ }));
    await tick(20080);
    expect(GameAudio.prototype.play).toHaveBeenCalledWith('warning');
    await tick(5000);
    expect(GameAudio.prototype.play).toHaveBeenCalledWith('countdown');
    await tick(5000);
    expect(GameAudio.prototype.play).toHaveBeenCalledWith('end');
    const review = screen.getByRole('dialog');
    expect(document.activeElement).toBe(within(review).getByRole('heading'));
    const outcomes = within(review).getAllByRole('combobox');
    expect(outcomes).toHaveLength(3);
    await user.selectOptions(outcomes[0], 'skipped');
    await user.selectOptions(outcomes[1], 'correct');
    await user.selectOptions(outcomes[2], 'correct');
    expect(within(review).getByText('2 points')).toBeTruthy();
    fireEvent(review, new Event('cancel', { cancelable: true }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.click(within(review).getByRole('button', { name: /Confirm & next team/ }));
    expect(screen.getByText(/TEAM 2 · ROUND 1 OF 1/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Start turn/ }));
    expect((screen.getByRole('button', { name: /^Skip/ }) as HTMLButtonElement).disabled).toBe(false);
    await tick(30080);
    await user.click(screen.getByRole('button', { name: /See results/ }));
    expect(screen.getByRole('heading', { name: 'Team 1 takes the crown.' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Every word. Every round.' })).toBeTruthy();
    expect(screen.getAllByText('Round 1').length).toBeGreaterThanOrEqual(2);
    await user.click(screen.getByRole('button', { name: /Play again/ }));
    expect((screen.getByLabelText(/^Time per turn/) as HTMLSelectElement).value).toBe('30');
    expect((screen.getByLabelText(/^Number of rounds/) as HTMLSelectElement).value).toBe('1');
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    await user.click(screen.getByRole('button', { name: 'Exit game' }));
    await user.click(screen.getByRole('button', { name: 'Exit home' }));
    expect(screen.getByRole('button', { name: 'Play Charades' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Play Something to talk about' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('pauses when hidden, resumes explicitly, mutes audio, and resets only the active turn', async () => {
    const user = await configure();
    await user.click(screen.getByRole('button', { name: /Start turn/ }));
    await user.click(screen.getByRole('button', { name: /Correct/ }));
    await tick(3080);
    const remaining = screen.getByRole('timer').textContent;
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(screen.getByText('Game paused')).toBeTruthy();
    await tick(60000);
    expect(screen.getByRole('timer').textContent).toBe(remaining);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    fireEvent(document, new Event('visibilitychange'));
    expect(screen.getByText('Game paused')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Mute timer sounds/ }));
    expect(screen.getByRole('button', { name: /Unmute timer sounds/ }).getAttribute('aria-pressed')).toBe('true');
    await user.click(screen.getByRole('button', { name: /Resume turn/ }));
    await user.click(screen.getByRole('button', { name: 'Reset turn' }));
    await user.click(screen.getByRole('button', { name: 'Reset this turn' }));
    expect(screen.getByRole('button', { name: /Start turn/ })).toBeTruthy();
    expect(screen.getByRole('timer').textContent).toBe('0:30');
    await user.click(screen.getByRole('button', { name: /Start turn/ }));
    expect(screen.getByText('0 points this turn')).toBeTruthy();
    expect(screen.getByText('1 skips remaining')).toBeTruthy();
  });

  it('redirects a refreshed game URL to settings without starting a timer', async () => {
    window.history.replaceState(null, '', '/#/charades/play');
    render(<App />);
    await act(async () => {});
    expect(screen.getByLabelText(/^Time per turn/)).toBeTruthy();
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('announces a draw and returns home from the final results', async () => {
    const user = await configure();
    await user.click(screen.getByRole('button', { name: /Start turn/ }));
    await tick(30080);
    await user.click(screen.getByRole('button', { name: /Confirm & next team/ }));
    await user.click(screen.getByRole('button', { name: /Start turn/ }));
    await tick(30080);
    await user.click(screen.getByRole('button', { name: /See results/ }));
    expect(screen.getByRole('heading', { name: 'It’s a draw!' })).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Exit home' }));
    expect(screen.getByRole('button', { name: 'Play Charades' })).toBeTruthy();
  });
});
