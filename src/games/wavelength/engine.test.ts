import { describe, expect, it } from 'vitest';
import { confirmTurn, createMatch, currentSpectrum, defaultSettings, drawTarget, openingScore, pointsFor, reduceMatch, totalFor, turnPoints } from './engine';
import type { Match, Settings, Side } from './engine';
import { spectra } from './spectra';

const setup = (settings: Partial<Settings> = {}) => createMatch({ ...defaultSettings, startingTeam: 1, ...settings }, () => .4);
function guessing(match: Match, target = 50) {
  match = reduceMatch(match, { type: 'VIEW', target });
  match = reduceMatch(match, { type: 'CLUE', value: 'My perfect example' });
  match = reduceMatch(match, { type: 'HIDE' });
  return reduceMatch(match, { type: 'BEGIN', now: 1000 });
}
function reveal(match: Match, target = 50, guess = 50, side: Side = 'left') {
  match = guessing(match, target);
  match = reduceMatch(match, { type: 'GUESS', value: guess, now: 1001 });
  match = reduceMatch(match, { type: 'LOCK', now: 1002 });
  match = reduceMatch(match, { type: 'SIDE', side });
  return reduceMatch(match, { type: 'REVEAL' });
}
const turn = (match: Match, target = 50, guess = 50, side: Side = 'left') => confirmTurn(reveal(match, target, guess, side));

describe('Wavelength scoring', () => {
  it.each([[0, 4], [3, 4], [4, 3], [7, 3], [8, 2], [11, 2], [12, 0], [50, 0]])('distance %i earns %i, including favorable boundaries', (distance, score) => {
    expect(pointsFor(50, 50 + distance)).toBe(score);
    expect(pointsFor(50, 50 - distance)).toBe(score);
  });
  it('awards a correct left/right bonus only outside the center band', () => {
    expect(turnPoints({ target: 30, guess: 50, side: 'left' })).toEqual({ main: 0, bonus: 1 });
    expect(turnPoints({ target: 60, guess: 50, side: 'right' })).toEqual({ main: 2, bonus: 1 });
    expect(turnPoints({ target: 55, guess: 50, side: 'right' })).toEqual({ main: 3, bonus: 1 });
    expect(turnPoints({ target: 30, guess: 50, side: 'right' }).bonus).toBe(0);
    expect(turnPoints({ target: 53, guess: 50, side: 'right' })).toEqual({ main: 4, bonus: 0 });
    expect(turnPoints({ target: 50, guess: 50, side: 'left' }).bonus).toBe(0);
  });
  it('covers target extremes and clamps public input', () => {
    expect(drawTarget(() => 0)).toBe(0); expect(drawTarget(() => .999999)).toBe(100);
    expect(pointsFor(0, 3)).toBe(4); expect(pointsFor(100, 89)).toBe(2);
    const match = guessing(setup());
    expect(reduceMatch(match, { type: 'GUESS', value: -999, now: 1001 }).guess).toBe(0);
    expect(reduceMatch(match, { type: 'GUESS', value: 999, now: 1001 }).guess).toBe(100);
    expect(reduceMatch(match, { type: 'GUESS', value: NaN, now: 1001 })).toBe(match);
  });
});

describe('Wavelength match', () => {
  it('defaults to an untimed race to ten and gives the second team one starting point', () => {
    expect(defaultSettings).toEqual({ mode: 'points', goal: 10, rounds: 3, seconds: 0, startingTeam: 'random' });
    const match = setup();
    expect(match.phase).toBe('ready'); expect(match.target).toBeNull();
    expect(totalFor(match, 1)).toBe(0); expect(totalFor(match, 2)).toBe(1);
    const swapped = setup({ startingTeam: 2 });
    expect(openingScore(swapped, 1)).toBe(1); expect(openingScore(swapped, 2)).toBe(0);
    expect(createMatch(defaultSettings, () => .1).startingTeam).toBe(1);
    expect(createMatch(defaultSettings, () => .9).startingTeam).toBe(2);
  });
  it('requires private viewing, a nonempty clue, handoff, lock, and opposing prediction in order', () => {
    let match = setup();
    expect(reduceMatch(match, { type: 'REVEAL' })).toBe(match);
    expect(reduceMatch(match, { type: 'BEGIN', now: 1 })).toBe(match);
    expect(reduceMatch(match, { type: 'VIEW', target: NaN })).toBe(match);
    match = reduceMatch(match, { type: 'VIEW', target: 50 });
    match = reduceMatch(match, { type: 'CLUE', value: '   ' });
    expect(reduceMatch(match, { type: 'HIDE' })).toBe(match);
    match = reduceMatch(match, { type: 'CLUE', value: '  Library nap  ' });
    match = reduceMatch(match, { type: 'HIDE' });
    expect(match.phase).toBe('handoff'); expect(match.clue).toBe('Library nap');
    expect(reduceMatch(match, { type: 'GUESS', value: 70, now: 1 })).toBe(match);
    match = reduceMatch(match, { type: 'BEGIN', now: 1 });
    match = reduceMatch(match, { type: 'LOCK', now: 2 });
    expect(reduceMatch(match, { type: 'GUESS', value: 70, now: 3 })).toBe(match);
    expect(reduceMatch(match, { type: 'REVEAL' })).toBe(match);
    expect(reduceMatch(match, { type: 'CONFIRM' })).toBe(match);
    match = reduceMatch(match, { type: 'SIDE', side: 'left' });
    match = reduceMatch(match, { type: 'REVEAL' });
    expect(totalFor(match, 1)).toBe(0);
    match = reduceMatch(match, { type: 'CONFIRM' });
    expect(totalFor(match, 1)).toBe(4);
    expect(match.target).toBeNull(); expect(match.clue).toBe('');
    expect(reduceMatch(match, { type: 'CONFIRM' })).toBe(match);
  });
  it('finishes a standard race immediately when one team wins', () => {
    let match = setup();
    for (let i = 0; i < 5; i++) match = turn(match);
    expect(match.phase).toBe('finished');
    expect(totalFor(match, 1)).toBe(12); expect(totalFor(match, 2)).toBe(9);
    expect(reduceMatch(match, { type: 'RESET' })).toBe(match);
  });
  it('lets the opposing team reach the winning score from a prediction', () => {
    let match = setup();
    match = turn(match, 50, 0, 'left'); match = turn(match);
    match = turn(match, 50, 0, 'left'); match = turn(match);
    expect(totalFor(match, 2)).toBe(9);
    match = turn(match, 50, 0, 'right');
    expect(match.phase).toBe('finished'); expect(totalFor(match, 2)).toBe(10);
  });
  it('grants a catch-up turn only for a center hit that still leaves the team behind', () => {
    let match = turn(setup(), 50, 0, 'left');
    match = turn(match);
    match = turn(match);
    expect(totalFor(match, 1)).toBe(4); expect(totalFor(match, 2)).toBe(5);
    expect(match.team).toBe(1);
    match = turn(match);
    expect(match.team).toBe(2);
    let tied = turn(setup(), 50, 0, 'left');
    tied = turn(tied, 50, 45, 'left'); tied = turn(tied);
    expect(totalFor(tied, 1)).toBe(totalFor(tied, 2)); expect(tied.team).toBe(2);
  });
  it('plays full pairs of tiebreak turns, repeating tied pairs and ignoring the goal mid-pair', () => {
    let match = setup();
    for (let i = 0; i < 4; i++) match = turn(match);
    match = turn(match, 50, 42, 'right');
    expect(totalFor(match, 1)).toBe(10); expect(totalFor(match, 2)).toBe(10);
    expect(match.overtimeTurns).toBe(0); expect(match.team).toBe(2);
    match = turn(match); expect(match.phase).toBe('ready'); expect(match.overtimeTurns).toBe(1);
    match = turn(match); expect(match.phase).toBe('ready'); expect(match.overtimeTurns).toBe(0);
    match = turn(match, 50, 0, 'left'); expect(match.phase).toBe('ready');
    match = turn(match, 50, 42, 'left');
    expect(match.phase).toBe('finished'); expect(totalFor(match, 1)).toBe(16); expect(totalFor(match, 2)).toBe(14);
    expect(match.completed.slice(-4).every(item => item.overtime)).toBe(true);
  });
  it('gives fixed-round teams equal turns, no head start, no catch-up, and allows a draw', () => {
    let match = setup({ mode: 'rounds' });
    expect(totalFor(match, 2)).toBe(0);
    for (let i = 0; i < 6; i++) match = turn(match);
    expect(match.phase).toBe('finished'); expect(totalFor(match, 1)).toBe(12); expect(totalFor(match, 2)).toBe(12);
    match = setup({ mode: 'rounds' });
    match = turn(match, 50, 0, 'left'); match = turn(match);
    match = turn(match, 50, 0, 'left'); match = turn(match); match = turn(match);
    expect(match.team).toBe(2); expect(match.completed).toHaveLength(5);
  });
  it('preserves confirmed turns on reset and creates a clean replay', () => {
    let match = turn(setup());
    match = reveal(match, 40, 55, 'left');
    match = reduceMatch(match, { type: 'RESET' });
    expect(match.completed).toHaveLength(1); expect(match.target).toBeNull(); expect(match.clue).toBe(''); expect(match.phase).toBe('ready');
    const replay = createMatch(match.settings);
    expect(replay.completed).toEqual([]); expect(replay.settings).toEqual(match.settings);
  });
  it('does not mutate earlier state while guessing or committing scores', () => {
    const original = guessing(setup()); const snapshot = structuredClone(original);
    const changed = reduceMatch(original, { type: 'GUESS', value: 60, now: 1001 });
    expect(changed.guess).toBe(60); expect(original).toEqual(snapshot);
    const revealed = reveal(setup()); const saved = structuredClone(revealed);
    confirmTurn(revealed); expect(revealed).toEqual(saved);
  });
  it('uses each original spectrum before repeating the deck', () => {
    expect(spectra).toHaveLength(80);
    expect(new Set(spectra.map(item => `${item.left}|${item.right}`)).size).toBe(80);
    let match = setup({ mode: 'rounds', rounds: 100 });
    const seen = new Set<string>();
    for (let i = 0; i < spectra.length; i++) { seen.add(currentSpectrum(match).id); match = turn(match, 50, 0, 'left'); }
    expect(seen.size).toBe(spectra.length);
    expect(currentSpectrum(match).id).toBe(match.deck[0].id);
  });
});

describe('optional discussion clock and privacy pause', () => {
  it('starts only after the handoff, freezes on pause, and locks at the deadline', () => {
    let match = reduceMatch(setup({ seconds: 60 }), { type: 'VIEW', target: 50 });
    expect(reduceMatch(match, { type: 'TICK', now: 999999 }).remainingMs).toBe(60000);
    match = guessing(setup({ seconds: 60 }));
    match = reduceMatch(match, { type: 'TICK', now: 11000 }); expect(match.remainingMs).toBe(50000);
    match = reduceMatch(match, { type: 'PAUSE', now: 16000 }); expect(match.remainingMs).toBe(45000);
    expect(reduceMatch(match, { type: 'GUESS', value: 80, now: 20000 })).toBe(match);
    expect(reduceMatch(match, { type: 'TICK', now: 900000 })).toBe(match);
    match = reduceMatch(match, { type: 'RESUME', now: 100000 }); expect(match.deadline).toBe(145000);
    match = reduceMatch(match, { type: 'GUESS', value: 80, now: 145000 });
    expect(match.phase).toBe('opponent'); expect(match.guess).toBe(50); expect(match.deadline).toBeNull();
  });
  it('cannot extend an expired turn by pausing and does not time untimed discussion', () => {
    const timed = guessing(setup({ seconds: 60 }));
    expect(reduceMatch(timed, { type: 'PAUSE', now: 61000 }).phase).toBe('opponent');
    const untimed = guessing(setup());
    expect(untimed.deadline).toBeNull(); expect(reduceMatch(untimed, { type: 'TICK', now: 999999 })).toBe(untimed);
  });
  it('can cover and explicitly resume a private clue without losing it', () => {
    let match = reduceMatch(setup(), { type: 'VIEW', target: 23 });
    match = reduceMatch(match, { type: 'CLUE', value: 'Surprise party' });
    match = reduceMatch(match, { type: 'PAUSE', now: 0 });
    expect(match.phase).toBe('paused'); expect(match.pausedFrom).toBe('clue');
    match = reduceMatch(match, { type: 'RESUME', now: 500 });
    expect(match.phase).toBe('clue'); expect(match.target).toBe(23); expect(match.clue).toBe('Surprise party');
  });
});
