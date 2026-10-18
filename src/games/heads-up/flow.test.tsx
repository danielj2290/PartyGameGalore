// @vitest-environment jsdom
import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../app/App';
import { GameAudio } from '../shared/audio';
import { categories, categoryItems } from './categories';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date', 'performance'] });
  window.history.replaceState(null, '', '/');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(GameAudio.prototype, 'unlock').mockImplementation(() => {});
  vi.spyOn(GameAudio.prototype, 'play').mockImplementation(() => {});
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const tick = async (ms: number) => { await act(async () => { vi.advanceTimersByTime(ms); }); };
function orientation(beta: number | null, gamma: number | null) {
  const event = new Event('deviceorientation');
  Object.defineProperties(event, { beta: { value: beta }, gamma: { value: gamma } });
  fireEvent(window, event);
}
function launch() {
  const user = userEvent.setup();
  render(<StrictMode><App /></StrictMode>);
  return user;
}
async function laptopSettings() {
  const user = launch();
  await user.click(screen.getByRole('button', { name: 'Play Heads Up' }));
  expect((screen.getByLabelText('Playing on') as HTMLSelectElement).value).toBe('keyboard');
  await user.click(screen.getByRole('link', { name: /Next: How to play/ }));
  expect(screen.getByText('One person guesses. Their people bring the clues.')).toBeTruthy();
  await user.click(screen.getByRole('link', { name: /Next: Settings/ }));
  return user;
}

describe('Heads Up laptop flow', () => {
  it('plays free-for-all with arrows, ignores held keys, hides scores until results, and replays', async () => {
    const user = await laptopSettings();
    const options = within(screen.getByLabelText(/^Category/)).getAllByRole('option');
    expect(options).toHaveLength(11);
    expect(options.every(option => !(option as HTMLOptionElement).disabled)).toBe(true);
    await user.click(screen.getByRole('radio', { name: /Free-for-all/ }));
    await user.selectOptions(screen.getByLabelText(/^Number of players/), '2');
    await user.selectOptions(screen.getByLabelText(/^Time per turn/), '30');
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    const firstColor = document.querySelector('[style*="--participant"]')!.getAttribute('style');
    expect(screen.queryByRole('table')).toBeNull(); expect(screen.queryByTestId('heads-up-word')).toBeNull();
    await user.click(screen.getByRole('button', { name: /Start turn/ }));
    expect(screen.queryByTestId('heads-up-word')).toBeNull();
    await user.keyboard('{ArrowUp}');
    await tick(3040);
    const firstWord = screen.getByTestId('heads-up-word').textContent;
    fireEvent.keyDown(window, { key: 'ArrowUp', repeat: true });
    expect(screen.getByTestId('heads-up-word').textContent).toBe(firstWord);
    await user.keyboard('{ArrowUp}');
    expect(screen.getByTestId('heads-up-word').textContent).not.toBe(firstWord);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Skipped. Fresh start.')).toBeTruthy();
    expect(screen.queryByText(/points this turn/)).toBeNull();
    await user.click(screen.getByRole('button', { name: /Pause/ }));
    expect(screen.queryByTestId('heads-up-word')).toBeNull();
    await user.keyboard('{ArrowUp}'); await tick(60000);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: /Resume turn/ }));
    await tick(30080);
    const dialog = screen.getByRole('dialog');
    const outcomes = within(dialog).getAllByRole('combobox');
    expect(outcomes).toHaveLength(3); expect((outcomes[0] as HTMLSelectElement).value).toBe('correct');
    expect((outcomes[1] as HTMLSelectElement).value).toBe('skipped');
    await user.selectOptions(outcomes[2], 'correct');
    expect(within(dialog).queryByText(/\d+ points/)).toBeNull();
    await user.click(within(dialog).getByRole('button', { name: /Confirm & next turn/ }));
    expect(document.querySelector('[style*="--participant"]')!.getAttribute('style')).not.toBe(firstColor);
    expect(screen.getByText(/PLAYER 2 · TURN 2 OF 2/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Start turn/ })); await tick(3040); await tick(30080);
    await user.click(screen.getByRole('button', { name: /See results/ }));
    expect(screen.getByRole('heading', { name: 'Player 1 takes the crown!' })).toBeTruthy();
    expect(within(screen.getByLabelText('Final scores')).getByText('2')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Play again/ }));
    expect((screen.getByLabelText(/^Number of players/) as HTMLSelectElement).value).toBe('2');
    expect((screen.getByLabelText(/^Time per turn/) as HTMLSelectElement).value).toBe('30');
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    await user.click(screen.getByRole('button', { name: 'Exit game' }));
    await user.click(screen.getByRole('button', { name: 'Exit home' }));
    expect(screen.getByRole('button', { name: 'Play Heads Up' })).toBeTruthy();
  });
  it('explains the seven-player team schedule and preserves pink/blue team colors', async () => {
    const user = await laptopSettings();
    await user.selectOptions(screen.getByLabelText(/^Number of players/), '7');
    expect(screen.getByText('4 rounds · 8 turns total')).toBeTruthy();
    expect(screen.getByText('Team 1: 4 players · Team 2: 3 players')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    expect(screen.getByText(/TEAM 1 · TURN 1 OF 8 · ROUND 1\/4/)).toBeTruthy();
    expect(document.querySelector('[style*="--participant"]')!.getAttribute('style')).toContain('#F7A1E3');
    expect(screen.queryByRole('table')).toBeNull();
  });
  it('pauses and hides words when the tab is hidden; resets and restores the full timer', async () => {
    const user = await laptopSettings();
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    await user.click(screen.getByRole('button', { name: /Start turn/ })); await tick(3040);
    await user.keyboard('{ArrowUp}'); await tick(5000);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true); fireEvent(document, new Event('visibilitychange'));
    expect(screen.queryByTestId('heads-up-word')).toBeNull();
    expect(screen.getByText('Game paused')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Reset turn' }));
    await user.click(screen.getByRole('button', { name: 'Reset this turn' }));
    expect(screen.getByRole('button', { name: /Start turn/ })).toBeTruthy();
    expect(screen.getByRole('timer').textContent).toBe('1:00');
  });
  it('recovers a refreshed play URL at settings without revealing a word', async () => {
    window.history.replaceState(null, '', '/#/heads-up/play'); render(<App />); await act(async () => {});
    expect(screen.getByLabelText(/^Number of players/)).toBeTruthy(); expect(screen.queryByTestId('heads-up-word')).toBeNull();
  });
});

describe('Heads Up phone setup and input', () => {
  function phoneEnvironment(permission: 'granted' | 'denied' = 'granted') {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone');
    vi.stubGlobal('innerWidth', 844); vi.stubGlobal('innerHeight', 390); vi.stubGlobal('isSecureContext', true);
    const request = vi.fn().mockResolvedValue(permission);
    vi.stubGlobal('DeviceOrientationEvent', class { static requestPermission = request; });
    return request;
  }
  it('detects a phone, practices both tilts, scores one word per gesture, and pauses on lost sensor data', async () => {
    const request = phoneEnvironment();
    const user = launch(); await user.click(screen.getByRole('button', { name: 'Play Heads Up' }));
    expect((screen.getByLabelText('Playing on') as HTMLSelectElement).value).toBe('phone');
    expect((screen.getByRole('button', { name: /Next: How to play/ }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Enable motion' })); expect(request).toHaveBeenCalledOnce();
    orientation(0, 90); await tick(240); orientation(0, 90);
    orientation(0, 30); await tick(200); orientation(0, 30);
    expect(screen.getByText(/Up tilt checked/)).toBeTruthy();
    orientation(0, 90); await tick(720); orientation(0, 90);
    orientation(180, 30); await tick(200); orientation(180, 30);
    expect(screen.getByText(/Down tilt checked/)).toBeTruthy();
    orientation(0, 90);
    await user.click(screen.getByRole('link', { name: /Next: How to play/ }));
    await user.click(screen.getByRole('link', { name: /Next: Settings/ }));
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    await user.click(screen.getByRole('button', { name: /Start turn/ }));
    await tick(1520); orientation(0, 90); await tick(1520); orientation(0, 90);
    expect(screen.getByTestId('heads-up-word')).toBeTruthy();
    await tick(240); orientation(0, 90);
    const first = screen.getByTestId('heads-up-word').textContent;
    orientation(0, 30); await tick(200); orientation(0, 30);
    const second = screen.getByTestId('heads-up-word').textContent; expect(second).not.toBe(first);
    await tick(720); orientation(0, 30); expect(screen.getByTestId('heads-up-word').textContent).toBe(second);
    await tick(3600);
    expect(screen.getByText('Game paused')).toBeTruthy(); expect(screen.queryByTestId('heads-up-word')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Use Assisted play' }));
    await user.click(screen.getByRole('button', { name: /Resume turn/ }));
    expect(screen.getByTestId('heads-up-word').textContent).toBe(second);
  });
  it('handles permission denial and offers button play without blocking the game', async () => {
    const request = phoneEnvironment('denied');
    const user = launch(); await user.click(screen.getByRole('button', { name: 'Play Heads Up' }));
    await user.click(screen.getByRole('button', { name: 'Enable motion' })); expect(request).toHaveBeenCalledOnce();
    expect(screen.getByText(/Motion access was not allowed/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Use Assisted play instead' }));
    expect(screen.getByRole('link', { name: /Next: How to play/ })).toBeTruthy();
  });
  it('rejects missing sensor values, times out gracefully, and pauses when rotated to portrait', async () => {
    phoneEnvironment();
    const user = launch(); await user.click(screen.getByRole('button', { name: 'Play Heads Up' }));
    await user.click(screen.getByRole('button', { name: 'Enable motion' })); orientation(null, null); await tick(3500);
    expect(screen.getByText(/No usable motion data is arriving/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Use Assisted play instead' }));
    await user.click(screen.getByRole('link', { name: /Next: How to play/ })); await user.click(screen.getByRole('link', { name: /Next: Settings/ }));
    await user.click(screen.getByRole('button', { name: /Start game/ })); await user.click(screen.getByRole('button', { name: /Start turn/ })); await tick(3040);
    expect(screen.getByTestId('heads-up-word')).toBeTruthy();
    vi.stubGlobal('innerWidth', 390); vi.stubGlobal('innerHeight', 844); fireEvent(window, new Event('resize'));
    expect(screen.getByText('Game paused')).toBeTruthy(); expect(screen.queryByTestId('heads-up-word')).toBeNull();
    expect((screen.getByRole('button', { name: /Resume turn/ }) as HTMLButtonElement).disabled).toBe(true);
    vi.stubGlobal('innerWidth', 844); vi.stubGlobal('innerHeight', 390); fireEvent(window, new Event('resize'));
    expect(screen.getByText('Game paused')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Resume turn/ }) as HTMLButtonElement).disabled).toBe(false);
  });
  it('explains HTTPS requirements without asking for motion on an insecure page', async () => {
    const request = phoneEnvironment(); vi.stubGlobal('isSecureContext', false);
    const user = launch(); await user.click(screen.getByRole('button', { name: 'Play Heads Up' }));
    await user.click(screen.getByRole('button', { name: 'Enable motion' }));
    expect(request).not.toHaveBeenCalled(); expect(screen.getByText(/Motion needs a secure connection/)).toBeTruthy();
  });
});

describe('enabled Heads Up category selector', () => {
  it.each(categories.filter(category => category.id !== 'starter'))('$label can be selected, started, played, and reset', async ({ id, label }) => {
    const user = await laptopSettings();
    const selector = screen.getByLabelText(/^Category/);
    await user.selectOptions(selector, id);
    expect((selector as HTMLSelectElement).value).toBe(id);
    expect((within(selector).getByRole('option', { name: label }) as HTMLOptionElement).disabled).toBe(false);
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    expect(screen.getByText(new RegExp(label))).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Start turn/ }));
    await tick(3040);
    const firstWord = screen.getByTestId('heads-up-word').textContent!;
    expect(categoryItems[id]).toContain(firstWord);
    await user.keyboard('{ArrowUp}');
    const secondWord = screen.getByTestId('heads-up-word').textContent!;
    expect(categoryItems[id]).toContain(secondWord); expect(secondWord).not.toBe(firstWord);
    await user.keyboard('{ArrowDown}');
    expect(categoryItems[id]).toContain(screen.getByTestId('heads-up-word').textContent!);
    await user.click(screen.getByRole('button', { name: 'Reset turn' }));
    await user.click(screen.getByRole('button', { name: 'Reset this turn' }));
    await user.click(screen.getByRole('button', { name: /Start turn/ })); await tick(3040);
    expect(categoryItems[id]).toContain(screen.getByTestId('heads-up-word').textContent!);
  });
  it('makes on-screen controls optional through the Assisted play setting', async () => {
    const user = await laptopSettings();
    const assisted = screen.getByRole('checkbox', { name: /Assisted play/ });
    expect((assisted as HTMLInputElement).checked).toBe(false);
    await user.click(assisted);
    await user.click(screen.getByRole('button', { name: /Start game/ }));
    await user.click(screen.getByRole('button', { name: /Start turn/ })); await tick(3040);
    const firstWord = screen.getByTestId('heads-up-word').textContent;
    await user.click(screen.getByRole('button', { name: 'Correct' }));
    expect(screen.getByTestId('heads-up-word').textContent).not.toBe(firstWord);
    expect(screen.getByRole('button', { name: 'Skip' })).toBeTruthy();
  });
});
