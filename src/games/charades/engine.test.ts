import { describe, expect, it } from 'vitest';
import { activeTeam, createMatch, cueBetween, defaultSettings, reduceMatch, roundNumber, score, totalFor } from './engine';
import type { Match, Settings } from './engine';
import { words } from './words';

const setup = (settings: Partial<Settings> = {}) => createMatch({ ...defaultSettings, startingTeam: 1, ...settings }, () => .3);
const start = (match: Match, now = 0) => reduceMatch(match, { type: 'START', now });
const finish = (match: Match) => reduceMatch(match, { type: 'TICK', now: match.deadline! });
const confirm = (match: Match) => reduceMatch(finish(match), { type: 'CONFIRM' });

describe('Charades match', () => {
  it('defaults to 60 seconds, unlimited skips, medium words, three rounds, and a random starter', () => {
    expect(defaultSettings).toEqual({ seconds: 60, skips: null, difficulty: 'medium', rounds: 3, startingTeam: 'random' });
    expect(createMatch(defaultSettings, () => .1).startingTeam).toBe(1);
    expect(createMatch(defaultSettings, () => .9).startingTeam).toBe(2);
  });
  it('keeps words hidden and the timer stopped until Start', () => {
    const ready = setup();
    expect(ready.entries).toEqual([]);
    expect(ready.deadline).toBeNull();
    expect(reduceMatch(ready, { type: 'TICK', now: 999999 }).phase).toBe('ready');
    const playing = start(ready, 500);
    expect(playing.entries).toHaveLength(1);
    expect(playing.entries[0].outcome).toBe('unanswered');
    expect(playing.deadline).toBe(60500);
  });
  it('measures elapsed time rather than counting callbacks, and rejects answers at or after the buzzer', () => {
    let match = start(setup(), 1000);
    match = reduceMatch(match, { type: 'TICK', now: 22567 });
    expect(match.remainingMs).toBe(38433);
    match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 61000 });
    expect(match.phase).toBe('reviewing');
    expect(score(match.entries)).toBe(0);
    expect(match.entries).toHaveLength(1);
    expect(reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 62000 })).toBe(match);
  });
  it('allows a last answer just before timeout and leaves the next word unanswered', () => {
    const match = reduceMatch(start(setup()), { type: 'RECORD', outcome: 'correct', now: 59999 });
    expect(score(finish(match).entries)).toBe(1);
    expect(match.entries.at(-1)?.outcome).toBe('unanswered');
  });
  it('counts skip limits per turn, preserves the clock between words, and allows zero skips', () => {
    let match = start(setup({ skips: 1 }));
    match = reduceMatch(match, { type: 'RECORD', outcome: 'skipped', now: 2000 });
    expect(match.deadline).toBe(60000);
    expect(match.entries).toHaveLength(2);
    match = reduceMatch(match, { type: 'RECORD', outcome: 'skipped', now: 3000 });
    expect(match.entries).toHaveLength(2);
    match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 4000 });
    expect(score(match.entries)).toBe(1);
    match = start(confirm(match), 100000);
    match = reduceMatch(match, { type: 'RECORD', outcome: 'skipped', now: 101000 });
    expect(match.entries).toHaveLength(2);
    const noSkip = reduceMatch(start(setup({ skips: 0 })), { type: 'RECORD', outcome: 'skipped', now: 1 });
    expect(noSkip.entries).toHaveLength(1);
  });
  it('freezes on pause, ignores paused actions, and resumes with precisely the remaining time', () => {
    let match = reduceMatch(start(setup(), 1000), { type: 'PAUSE', now: 15500 });
    expect(match.remainingMs).toBe(45500);
    expect(match.phase).toBe('paused');
    expect(match.deadline).toBeNull();
    expect(reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 20000 })).toBe(match);
    match = reduceMatch(match, { type: 'RESUME', now: 100000 });
    expect(match.deadline).toBe(145500);
    expect(reduceMatch(match, { type: 'TICK', now: 145500 }).phase).toBe('reviewing');
  });
  it('does not let a pause extend an already expired turn', () => {
    expect(reduceMatch(start(setup()), { type: 'PAUSE', now: 60001 }).phase).toBe('reviewing');
  });
  it('corrects every outcome in review and derives scores without double counting', () => {
    let match = start(setup());
    match = reduceMatch(match, { type: 'RECORD', outcome: 'skipped', now: 100 });
    match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 200 });
    match = finish(match);
    match = reduceMatch(match, { type: 'CORRECT', index: 0, outcome: 'correct' });
    match = reduceMatch(match, { type: 'CORRECT', index: 1, outcome: 'skipped' });
    match = reduceMatch(match, { type: 'CORRECT', index: 2, outcome: 'correct' });
    expect(score(match.entries)).toBe(2);
    match = reduceMatch(match, { type: 'CONFIRM' });
    expect(totalFor(match, 1)).toBe(2);
    expect(reduceMatch(match, { type: 'CONFIRM' })).toBe(match);
    expect(reduceMatch(match, { type: 'CORRECT', index: 0, outcome: 'skipped' })).toBe(match);
  });
  it('resets only the active turn, restores its skips/clock, and returns discarded words to the pool', () => {
    let match = start(setup({ skips: 1 }));
    match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 50 });
    match = start(confirm(match), 100000);
    match = reduceMatch(match, { type: 'RECORD', outcome: 'skipped', now: 101000 });
    const discardedIds = match.entries.map(entry => entry.word.id);
    const completed = match.completed;
    match = reduceMatch(match, { type: 'RESET' });
    expect(match.phase).toBe('ready'); expect(match.entries).toEqual([]);
    expect(match.remainingMs).toBe(60000); expect(match.deadline).toBeNull();
    expect(match.completed).toBe(completed); expect(totalFor(match, 1)).toBe(1);
    expect(activeTeam(match)).toBe(2);
    expect(discardedIds.every(id => match.deck.some(word => word.id === id))).toBe(true);
    expect(match.deck.some(word => completed[0].entries.some(entry => entry.word.id === word.id))).toBe(false);
  });
  it.each([1, 2] as const)('gives both teams three turns when Team %s starts', starter => {
    let match = setup({ startingTeam: starter });
    const order = [];
    for (let i = 0; i < 6; i++) {
      order.push([activeTeam(match), roundNumber(match)]);
      match = confirm(start(match, i * 100000));
    }
    expect(order).toEqual([1, 2, 3].flatMap(round => [[starter, round], [starter === 1 ? 2 : 1, round]]));
    expect(match.phase).toBe('finished'); expect(match.completed).toHaveLength(6);
    expect(totalFor(match, 1)).toBe(totalFor(match, 2));
    expect(reduceMatch(match, { type: 'START', now: 0 })).toBe(match);
  });
  it('handles a one-round game and clean replay with retained settings', () => {
    let match = setup({ rounds: 1, seconds: 90, skips: 3, difficulty: 'hard', startingTeam: 2 });
    match = confirm(start(match)); match = confirm(start(match, 100000));
    expect(match.phase).toBe('finished');
    const replay = createMatch(match.settings);
    expect(replay.settings).toEqual(match.settings);
    expect(replay.completed).toEqual([]); expect(replay.entries).toEqual([]);
    expect(replay.remainingMs).toBe(90000);
  });
  it('has 100 unique words per difficulty and avoids repeats until exhaustion', () => {
    expect(new Set(words.map(word => word.id)).size).toBe(words.length);
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(words.filter(word => word.difficulty === difficulty)).toHaveLength(100);
      let match = start(setup({ difficulty }));
      for (let index = 0; index < 99; index++) match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: index + 1 });
      expect(new Set(match.entries.map(entry => entry.word.id)).size).toBe(100);
      const previous = match.entries.at(-1)!.word.id;
      match = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 200 });
      expect(match.entries).toHaveLength(101); expect(match.phase).toBe('playing');
      expect(match.entries.at(-1)!.word.id).not.toBe(previous);
    }
  });
  it('does not mutate the prior match when recording, correcting, or committing', () => {
    const match = start(setup());
    const snapshot = structuredClone(match);
    const changed = reduceMatch(match, { type: 'RECORD', outcome: 'correct', now: 1 });
    const review = finish(changed);
    reduceMatch(review, { type: 'CORRECT', index: 0, outcome: 'skipped' });
    reduceMatch(review, { type: 'CONFIRM' });
    expect(match).toEqual(snapshot);
    expect(review.entries[0].outcome).toBe('correct');
  });
});

describe('audio cue thresholds', () => {
  it('warns at ten seconds, counts down the final five, and ends distinctly', () => {
    expect(cueBetween(11, 10)).toBe('warning');
    expect(cueBetween(10, 10)).toBeNull();
    for (const second of [5, 4, 3, 2, 1]) expect(cueBetween(second + 1, second)).toBe('countdown');
    expect(cueBetween(1, 0)).toBe('end'); expect(cueBetween(0, 0)).toBeNull();
  });
  it('emits one current cue instead of a backlog after delayed callbacks', () => {
    expect(cueBetween(12, 4)).toBe('countdown');
    expect(cueBetween(12, 0)).toBe('end');
    expect(cueBetween(11, 8)).toBe('warning');
  });
});
