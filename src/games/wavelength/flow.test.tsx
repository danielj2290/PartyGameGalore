// @vitest-environment jsdom
import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../app/App';
import { GameAudio } from '../shared/audio';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date', 'performance'] });
  vi.spyOn(Math, 'random').mockReturnValue(.5);
  window.history.replaceState(null, '', '/');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(GameAudio.prototype, 'unlock').mockImplementation(() => {});
  vi.spyOn(GameAudio.prototype, 'play').mockImplementation(() => {});
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
const tick = async (ms: number) => { await act(async () => { vi.advanceTimersByTime(ms); }); };
const launch = () => { render(<StrictMode><App /></StrictMode>); return userEvent.setup(); };
async function settings() {
  const user = launch();
  await user.click(screen.getByRole('button', { name: 'Play Wavelength' }));
  expect(screen.getByText('Read your teammate. Find the hidden target.')).toBeTruthy();
  await user.click(screen.getByRole('link', { name: /Next: Settings/ }));
  expect((screen.getByLabelText(/^Discussion timer/) as HTMLSelectElement).value).toBe('0');
  expect((screen.getByLabelText(/^Winning score/) as HTMLSelectElement).value).toBe('10');
  await user.selectOptions(screen.getByLabelText(/^Starting team/), '1');
  return user;
}
const targetHidden = () => expect(screen.queryByTestId('wavelength-target')).toBeNull();
async function prepare(user: ReturnType<typeof userEvent.setup>, clue = 'Movie night') {
  await user.click(screen.getByRole('button', { name: /Show my target/ }));
  expect(screen.getByTestId('wavelength-target')).toBeTruthy();
  expect(within(screen.getByRole('region', { name: 'Current topic' })).getByRole('heading').textContent).toBeTruthy();
  fireEvent.change(screen.getByLabelText(/^Your clue/), { target: { value: clue } });
  await user.click(screen.getByRole('button', { name: /Hide target & pass to team/ }));
  targetHidden();
  await user.click(screen.getByRole('button', { name: /We're ready to guess/ }));
  targetHidden();
}
async function reveal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Lock our guess/ }));
  targetHidden();
  expect(screen.getByText("OTHER TEAM'S TURN")).toBeTruthy();
  expect(screen.getByText(/make your left\/right prediction\./)).toBeTruthy();
  expect(screen.queryByRole('slider')).toBeNull();
  expect((screen.getByRole('button', { name: 'Reveal target' }) as HTMLButtonElement).disabled).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Left of the needle' }));
  targetHidden();
  await user.click(screen.getByRole('button', { name: 'Reveal target' }));
  expect(screen.getByTestId('wavelength-target')).toBeTruthy();
}

describe('Wavelength local flow', () => {
  it('keeps the target private, plays an equal-turn match, reviews clues, replays, and exits', async () => {
    const user = await settings();
    await user.selectOptions(screen.getByLabelText(/^Match style/), 'rounds');
    expect((screen.getByLabelText(/^Number of rounds/) as HTMLSelectElement).value).toBe('3');
    await user.click(screen.getByRole('button', { name: /Start game/ })); targetHidden();
    expect(screen.getByText('Everyone else, look away.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Show my target/ }));
    expect((screen.getByRole('button', { name: /Hide target & pass/ }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/^Your clue/), { target: { value: 'Birthday cake' } });
    await user.click(screen.getByRole('button', { name: 'Pause' })); targetHidden();
    expect(screen.queryByDisplayValue('Birthday cake')).toBeNull();
    await user.click(screen.getByRole('button', { name: /Resume private view/ }));
    expect(screen.getByTestId('wavelength-target')).toBeTruthy();
    expect((screen.getByLabelText(/^Your clue/) as HTMLInputElement).value).toBe('Birthday cake');
    await user.click(screen.getByRole('button', { name: /Hide target & pass to team/ })); targetHidden();
    await user.click(screen.getByRole('button', { name: /We're ready to guess/ })); targetHidden();
    expect(screen.queryByRole('timer')).toBeNull();
    const slider = screen.getByRole('slider', { name: /Move the dial/ });
    fireEvent.change(slider, { target: { value: '2' } });
    expect((slider as HTMLInputElement).value).toBe('2');
    fireEvent.change(slider, { target: { value: '5' } });
    await reveal(user);
    expect(within(screen.getByLabelText('Points this turn')).getByText('+4')).toBeTruthy();
    const beforeRows = within(screen.getByRole('table')).getAllByRole('row');
    expect(within(beforeRows[1]).getAllByRole('cell').at(-1)?.textContent).toBe('0');
    await user.click(screen.getByRole('button', { name: /Confirm & next turn/ })); targetHidden();
    expect(screen.getByText(/TEAM 2 · ROUND 1 OF 3/)).toBeTruthy();
    expect(document.querySelector('[style*="--team"]')!.getAttribute('style')).toContain('var(--blue)');
    await user.click(screen.getByRole('button', { name: 'Reset turn' }));
    await user.click(screen.getByRole('button', { name: 'Reset this turn' })); targetHidden();
    const resetRows = within(screen.getByRole('table')).getAllByRole('row');
    expect(within(resetRows[1]).getAllByRole('cell').at(-1)?.textContent).toBe('4');
    for (let i = 1; i < 6; i++) {
      await prepare(user, `Clue ${i}`); await reveal(user);
      await user.click(screen.getByRole('button', { name: i === 5 ? /Confirm & see results/ : /Confirm & next turn/ }));
    }
    expect(screen.getByRole('heading', { name: 'It’s a draw!' })).toBeTruthy();
    expect(within(screen.getByLabelText('Final scores')).getAllByText('12')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Every clue. Every close call.' })).toBeTruthy();
    expect(screen.getByText('Birthday cake')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Play again/ }));
    expect((screen.getByLabelText(/^Match style/) as HTMLSelectElement).value).toBe('rounds');
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    await user.click(screen.getByRole('button', { name: 'Exit game' }));
    await user.click(screen.getByRole('button', { name: 'Stay here' })); targetHidden();
    expect(screen.getByText('Game paused')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Exit game' }));
    await user.click(screen.getByRole('button', { name: 'Exit home' }));
    expect(screen.getByRole('button', { name: 'Play Wavelength' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^Play / }).every(button => !(button as HTMLButtonElement).disabled)).toBe(true);
  }, 15000);
  it('starts the optional clock after handoff, pauses when hidden, sounds the buzzer, and locks the last guess', async () => {
    const user = await settings();
    await user.selectOptions(screen.getByLabelText(/^Discussion timer/), '60');
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    await user.click(screen.getByRole('button', { name: /Show my target/ }));
    fireEvent.change(screen.getByLabelText(/^Your clue/), { target: { value: 'Library nap' } });
    await tick(180000);
    expect(screen.getByTestId('wavelength-target')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Hide target & pass to team/ }));
    await tick(180000);
    await user.click(screen.getByRole('button', { name: /We're ready to guess/ }));
    expect(screen.getByRole('timer').textContent).toBe('1:00');
    fireEvent.change(screen.getByRole('slider'), { target: { value: '2.5' } });
    await tick(5040); expect(screen.getByRole('timer').textContent).toBe('0:55');
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true); fireEvent(document, new Event('visibilitychange'));
    targetHidden(); expect(screen.queryByText('Library nap')).toBeNull(); expect(screen.queryByRole('slider')).toBeNull();
    await tick(90000);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false); fireEvent(document, new Event('visibilitychange'));
    expect(screen.getByText('Game paused')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Resume turn/ }));
    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('2.5');
    await tick(45000); expect(GameAudio.prototype.play).toHaveBeenCalledWith('warning');
    await tick(5000); expect(GameAudio.prototype.play).toHaveBeenCalledWith('countdown');
    await tick(5100); expect(GameAudio.prototype.play).toHaveBeenCalledWith('end');
    expect(screen.getByRole('heading', { name: 'Left or right?' })).toBeTruthy(); targetHidden();
    expect(screen.queryByRole('slider')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Right of the needle' }));
    await user.click(screen.getByRole('button', { name: 'Reveal target' }));
    expect(within(screen.getByLabelText('Points this turn')).getByText('+1')).toBeTruthy();
  });
  it('finishes a standard race and shows the winner with the starting bonus included', async () => {
    const user = await settings();
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    for (let i = 0; i < 5; i++) {
      await prepare(user); await reveal(user);
      await user.click(screen.getByRole('button', { name: i === 4 ? /Confirm & see results/ : /Confirm & next turn/ }));
    }
    expect(screen.getByRole('heading', { name: 'Team 1 takes the crown.' })).toBeTruthy();
    const scores = within(screen.getByLabelText('Final scores'));
    expect(scores.getByText('12')).toBeTruthy(); expect(scores.getByText('9')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Exit home' }));
    expect(screen.getByRole('button', { name: 'Play Wavelength' })).toBeTruthy();
  }, 15000);
  it.each(['play', 'results'])('recovers a refreshed %s URL at settings', async route => {
    window.history.replaceState(null, '', `/#/wavelength/${route}`);
    render(<App />); await act(async () => {});
    expect(screen.getByLabelText(/^Match style/)).toBeTruthy(); targetHidden();
  });
  it('covers the clue and target when the private screen loses visibility', async () => {
    const user = await settings();
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    await user.click(screen.getByRole('button', { name: /Show my target/ }));
    fireEvent.change(screen.getByLabelText(/^Your clue/), { target: { value: 'Secret idea' } });
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true); fireEvent(document, new Event('visibilitychange'));
    targetHidden(); expect(screen.queryByDisplayValue('Secret idea')).toBeNull();
    expect(screen.getByRole('button', { name: 'Resume private view' })).toBeTruthy();
  });
});
